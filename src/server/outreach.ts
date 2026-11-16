import { MAX_SEEDS, POSTS_PER_PERSON, searchSize, seedFollowSize } from './domain/pricing.ts';
import { testModeRefusal, type Post } from './domain/prospect.ts';
import type { Config } from './infra/config.ts';
import type { Store } from './infra/db.ts';
import { assess } from './infra/llm.ts';
import { snowflakeTime, XApiError, type XClient, type XUser } from './infra/x.ts';
import { explainXError } from './web/errors.ts';

export const DEFAULT_TARGET = 'AI and robotics builders, founders and researchers: people working on AI models, applications, developer tools, infrastructure, robotics or embodied AI. Relevant individuals, not companies or news accounts.';

type RunRequest = { target: string; mode: 'search' | 'seeds'; source: string };

export class SendRefused extends Error {}

export class Outreach {
  private readonly cfg: Config;
  private readonly store: Store;
  private readonly x: XClient;

  constructor(cfg: Config, store: Store, x: XClient) {
    this.cfg = cfg;
    this.store = store;
    this.x = x;
  }

  startRun(req: RunRequest): number {
    const runId = this.store.createRun(req.mode, JSON.stringify(req));
    this.discover(runId, req).then(
      (note) => this.store.finishRun(runId, 'done', note),
      (e) => this.store.finishRun(runId, 'failed', e instanceof XApiError ? explainXError(e) : String(e.message ?? e)),
    );
    return runId;
  }

  private async candidates(req: RunRequest): Promise<XUser[]> {
    const max = this.cfg.maxProspectsPerRun;
    if (req.mode === 'search') {
      const query = /-is:retweet/.test(req.source) ? req.source : `${req.source} -is:retweet -is:reply`;
      const res = await this.x.searchRecent(query, searchSize(max));
      return res.includes?.users ?? [];
    }
    const seeds = req.source.split(/[\s,]+/).map((s) => s.replace(/^@/, '').replace(/^https?:\/\/(x|twitter)\.com\//, '')).filter(Boolean);
    const out: XUser[] = [];
    for (const seed of seeds.slice(0, MAX_SEEDS)) {
      const user = (await this.x.userByUsername(seed)).data;
      if (!user) continue;
      out.push(...((await this.x.following(user.id, seedFollowSize(max, seeds.length))).data ?? []));
    }
    return out;
  }

  private async discover(runId: number, req: RunRequest): Promise<string> {
    const senderId = this.x.senderId;
    const all = (await this.candidates(req))
      .filter((u, i, list) => list.findIndex((v) => v.id === u.id) === i)
      .filter((u) => u.id !== senderId && !u.protected && !this.store.knownProspect(u.id));
    const closed = all.filter((u) => u.receives_your_dm === false).length;
    const open = all.filter((u) => u.receives_your_dm !== false).slice(0, this.cfg.maxProspectsPerRun);
    let drafted = 0;
    for (const u of open) {
      const posts: Post[] = ((await this.x.recentPosts(u.id, POSTS_PER_PERSON)).data ?? []).map((p) => ({ id: p.id, text: p.text, created_at: p.created_at }));
      const bio = u.description ?? '';
      const a = await assess(this.cfg, req.target, this.cfg.senderDescription, { bio, posts });
      if (a.fit !== 'none') drafted++;
      this.store.insertProspect({
        x_user_id: u.id, username: u.username, name: u.name, bio, run_id: runId,
        receives_dm: u.receives_your_dm === undefined ? null : Number(u.receives_your_dm),
        posts_json: JSON.stringify(posts), fit: a.fit, reasons_json: JSON.stringify(a.reasons),
        draft: a.draft, status: a.fit !== 'none' ? 'needs_review' : 'no_fit',
      });
    }
    const skipped = closed ? ` ${closed} more do not accept DMs from your account and were left out.` : '';
    return `${open.length} people checked, ${drafted} drafts ready for review.${skipped}`;
  }

  async send(recipientId: string, text: string): Promise<void> {
    const p = this.store.prospect(recipientId);
    const senderId = this.x.senderId;
    if (!p || !senderId) throw new SendRefused('Unknown person or no connected X account.');
    if (p.status !== 'approved') throw new SendRefused('Only approved drafts can be sent.');
    if (!text.replace(/[\s\u200B-\u200D\u2060\uFEFF]/g, '')) throw new SendRefused('The message is empty.');
    const blocked = testModeRefusal(this.cfg, p.username);
    if (blocked) throw new SendRefused(blocked);
    // The UNIQUE(sender, recipient) insert is the send-once lock. It must happen before the X call so a crash or retry can never double send.
    const id = this.store.claimSend(senderId, recipientId, text);
    if (id === null) throw new SendRefused(`Already messaged @${p.username}. The tool never sends a second message.`);
    try {
      const res = await this.x.sendDm(recipientId, text);
      this.store.markSent(id, res.data.dm_event_id, res.data.dm_conversation_id);
    } catch (e) {
      // A 4xx means X refused the DM (failed). Timeouts and 5xx may have been delivered, so they are stored as unknown. Neither is ever retried.
      const known = e instanceof XApiError && e.status >= 400 && e.status < 500;
      this.store.markSendFailed(id, known ? 'failed' : 'unknown', e instanceof XApiError ? explainXError(e) : String(e));
      throw e;
    }
  }

  async syncReplies(): Promise<number> {
    const ours = new Map(this.store.sentMessages().filter((m) => m.dm_event_id).map((m) => [m.recipient_id, m]));
    const sentIds = new Set([...ours.values()].map((m) => m.dm_event_id));
    let found = 0;
    for (const c of (await this.x.chatConversations()).data ?? []) {
      const other = c.type === 'direct' ? c.participant_ids?.[0] : undefined;
      const m = other ? ours.get(other) : undefined;
      const newest = c.newest_event_id ?? '';
      if (!m || !/^\d+$/.test(newest) || m.replied_at || sentIds.has(newest)) continue;
      // XChat replies are encrypted and the API returns no text, so a reply is detected as a newer event id from the other person, not as message content.
      if (BigInt(newest) <= BigInt(m.dm_event_id!)) continue;
      this.store.markReplied(other!, snowflakeTime(newest).toISOString());
      found++;
    }
    return found;
  }
}
