import { createHash, randomBytes } from 'node:crypto';
import type { Config } from './config.ts';
import { decrypt, encrypt } from './crypto.ts';
import type { Store } from './db.ts';

const API = 'https://api.x.com';
const SCOPES = 'tweet.read users.read dm.read dm.write follows.read list.read offline.access';

export class XApiError extends Error {
  readonly status: number;
  readonly type: string;
  constructor(status: number, type: string, message: string) {
    super(message);
    this.status = status;
    this.type = type;
  }

  get explanation(): string {
    if (this.status === 402) return 'X API credits are used up. Buy credits or raise the spend cap at console.x.com.';
    if (this.status === 429) return 'X rate limit reached. Wait for the window to reset and try again.';
    if (this.status === 401) return 'The X connection expired or was revoked. Connect the account again.';
    if (this.type.includes('dm-')) return `X refused this DM (${this.type.split('/').pop()}). The person may not accept DMs from you.`;
    return this.message;
  }
}

export type XUser = {
  id: string; username: string; name: string; description?: string; protected?: boolean; receives_your_dm?: boolean;
};

export function authorizeUrl(cfg: Config) {
  const verifier = randomBytes(48).toString('base64url');
  const state = randomBytes(16).toString('base64url');
  const challenge = createHash('sha256').update(verifier).digest('base64url');
  const url = 'https://x.com/i/oauth2/authorize?' + new URLSearchParams({
    response_type: 'code', client_id: cfg.x.clientId, redirect_uri: `${cfg.baseUrl}/callback`, scope: SCOPES,
    state, code_challenge: challenge, code_challenge_method: 'S256',
  });
  return { url, verifier, state };
}

export class XClient {
  private refreshing: Promise<string> | null = null;
  private readonly cfg: Config;
  private readonly store: Store;

  constructor(cfg: Config, store: Store) {
    this.cfg = cfg;
    this.store = store;
  }

  private async tokenRequest(body: Record<string, string>) {
    const basic = Buffer.from(`${this.cfg.x.clientId}:${this.cfg.x.clientSecret}`).toString('base64');
    const r = await fetch(`${API}/2/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: `Basic ${basic}` },
      body: new URLSearchParams(body),
    });
    const j: any = await r.json().catch(() => ({}));
    if (!r.ok) throw new XApiError(r.status, j.error ?? 'oauth', `Token request failed: ${j.error_description ?? r.status}`);
    return j as { access_token: string; refresh_token: string; expires_in: number };
  }

  private persist(t: { access_token: string; refresh_token: string; expires_in: number }, user: { id: string; username: string }) {
    const key = this.cfg.tokenKey;
    this.store.saveAccount({
      x_user_id: user.id, username: user.username,
      access_token: encrypt(key, t.access_token), refresh_token: encrypt(key, t.refresh_token),
      expires_at: Date.now() + t.expires_in * 1000,
    });
  }

  async connect(code: string, verifier: string): Promise<{ id: string; username: string } | null> {
    const t = await this.tokenRequest({ code, grant_type: 'authorization_code', redirect_uri: `${this.cfg.baseUrl}/callback`, code_verifier: verifier });
    const me = await this.call<{ data: { id: string; username: string } }>('GET', '/2/users/me', undefined, t.access_token);
    const allowed = this.cfg.allowedOperators;
    if (allowed.length && !allowed.includes(me.data.username.toLowerCase())) return null;
    this.persist(t, me.data);
    return me.data;
  }

  // One sender account per install. Multi-account needs a sender_id column on account.
  private async accessToken(): Promise<string> {
    const a = this.store.getAccount();
    if (!a) throw new XApiError(401, 'not-connected', 'No X account connected.');
    if (a.expires_at - Date.now() > 60_000) return decrypt(this.cfg.tokenKey, a.access_token);
    this.refreshing ??= (async () => {
      try {
        const t = await this.tokenRequest({ grant_type: 'refresh_token', refresh_token: decrypt(this.cfg.tokenKey, a.refresh_token) });
        this.persist(t, { id: a.x_user_id, username: a.username });
        return t.access_token;
      } finally {
        this.refreshing = null;
      }
    })();
    return this.refreshing;
  }

  async call<T>(method: 'GET' | 'POST', path: string, body?: unknown, token?: string): Promise<T> {
    const r = await fetch(API + path, {
      method,
      headers: { Authorization: `Bearer ${token ?? (await this.accessToken())}`, 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const j: any = await r.json().catch(() => null);
    if (!r.ok) throw new XApiError(r.status, j?.type ?? j?.errors?.[0]?.type ?? 'http', j?.detail ?? j?.title ?? j?.errors?.[0]?.message ?? `HTTP ${r.status}`);
    return j as T;
  }

  get senderId(): string | undefined {
    return this.store.getAccount()?.x_user_id;
  }

  userByUsername(username: string) {
    return this.call<{ data?: XUser }>('GET', `/2/users/by/username/${encodeURIComponent(username)}?user.fields=description,protected,receives_your_dm`);
  }

  following(userId: string, max: number) {
    return this.call<{ data?: XUser[] }>('GET', `/2/users/${userId}/following?max_results=${max}&user.fields=description,protected,receives_your_dm`);
  }

  searchRecent(query: string, max: number) {
    const q = new URLSearchParams({
      query, max_results: String(Math.max(10, Math.min(max, 100))),
      expansions: 'author_id', 'user.fields': 'description,protected,receives_your_dm', 'tweet.fields': 'created_at',
    });
    return this.call<{ data?: Array<{ id: string; text: string; author_id: string }>; includes?: { users?: XUser[] } }>('GET', `/2/tweets/search/recent?${q}`);
  }

  recentPosts(userId: string) {
    return this.call<{ data?: Array<{ id: string; text: string; created_at: string }> }>(
      'GET', `/2/users/${userId}/tweets?max_results=5&exclude=retweets,replies&tweet.fields=created_at`);
  }

  sendDm(recipientId: string, text: string) {
    return this.call<{ data: { dm_conversation_id: string; dm_event_id: string } }>('POST', `/2/dm_conversations/with/${recipientId}/messages`, { text });
  }

  chatConversations() {
    return this.call<{ data?: Array<{ id: string; type: string; newest_event_id?: string; unread?: boolean; participant_ids?: string[] }> }>(
      'GET', '/2/chat/conversations?max_results=50&chat_conversation.fields=unread,newest_event_id&expansions=participant_ids');
  }
}

export function snowflakeTime(id: string): Date {
  return new Date(Number((BigInt(id) >> 22n) + 1288834974657n));
}
