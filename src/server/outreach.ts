import type { Config } from './config.ts';
import type { Post, Store } from './db.ts';
import { assess } from './llm.ts';
import { snowflakeTime, XApiError, type XClient, type XUser } from './x.ts';

export const DEFAULT_TARGET = 'AI and robotics builders, founders and researchers: people working on AI models, applications, developer tools, infrastructure, robotics or embodied AI. Relevant individuals, not companies or news accounts.';

const PRICE = { post: 0.005, user: 0.01 };
const POSTS_PER_PERSON = 5;
const MAX_SEEDS = 5;

export function runCostCeiling(mode: 'search' | 'seeds', max: number): number {
  const perPerson = POSTS_PER_PERSON * PRICE.post;
  const discovery = mode === 'search'
    ? Math.max(10, max * 2) * (PRICE.post + PRICE.user)
    : MAX_SEEDS * PRICE.user + max * PRICE.user;
  return discovery + max * perPerson;
}

export type RunRequest = { target: string; mode: 'search' | 'seeds'; source: string };

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
      (e) => this.store.finishRun(runId, 'failed', e instanceof XApiError ? e.explanation : String(e.message ?? e)),
    );
    return runId;
  }

  private async candidates(req: RunRequest): Promise<XUser[]> {
    const max = this.cfg.maxProspectsPerRun;
    if (req.mode === 'search') {
      const query = /-is:retweet/.test(req.source) ? req.source : `${req.source} -is:retweet -is:reply`;
      const res = await this.x.searchRecent(query, max * 2);
      return res.includes?.users ?? [];
    }
    const seeds = req.source.split(/[\s,]+/).map((s) => s.replace(/^@/, '').replace(/^https?:\/\/(x|twitter)\.com\//, '')).filter(Boolean);
    const out: XUser[] = [];
    for (const seed of seeds.slice(0, 5)) {
      const user = (await this.x.userByUsername(seed)).data;
      if (!user) continue;
      out.push(...((await this.x.following(user.id, Math.max(1, Math.ceil(max / seeds.length)))).data ?? []));
    }
    return out;
  }

  private async discover(runId: number, req: RunRequest): Promise<string> {
    const senderId = this.x.senderId;
    const fresh = (await this.candidates(req))
      .filter((u, i, all) => all.findIndex((v) => v.id === u.id) === i)
      .filter((u) => u.id !== senderId && !u.protected && !this.store.knownProspect(u.id))
      .slice(0, this.cfg.maxProspectsPerRun);
    let drafted = 0;
    let skipped = 0;
    for (const u of fresh) {
      const base = { x_user_id: u.id, username: u.username, name: u.name, bio: u.description ?? '', run_id: runId, receives_dm: u.receives_your_dm === undefined ? null : Number(u.receives_your_dm) };
      if (u.receives_your_dm === false) {
        this.store.insertProspect({ ...base, posts_json: '[]', fit: null, reasons_json: '[]', draft: '', status: 'not_dm_able', note: 'X reports this person does not accept DMs from your account.' });
        skipped++;
        continue;
      }
      const posts: Post[] = ((await this.x.recentPosts(u.id)).data ?? []).map((p) => ({ id: p.id, text: p.text, created_at: p.created_at }));
      const a = await assess(this.cfg, req.target, this.cfg.senderDescription, { bio: base.bio, posts });
      const fits = a.fit !== 'none';
      if (fits) drafted++;
      this.store.insertProspect({
        ...base, posts_json: JSON.stringify(posts), fit: a.fit, reasons_json: JSON.stringify(a.reasons),
        draft: a.draft, status: fits ? 'needs_review' : 'no_fit',
      });
    }
    return `${fresh.length} new people checked, ${drafted} drafts ready for review, ${skipped} do not accept DMs.`;
  }

  async send(recipientId: string, text: string): Promise<void> {
    const p = this.store.prospect(recipientId);
    const senderId = this.x.senderId;
    if (!p || !senderId) throw new SendRefused('Unknown person or no connected X account.');
    if (p.status !== 'approved') throw new SendRefused('Only approved drafts can be sent.');
    if (!text.replace(/[\s​-‍⁠﻿]/g, '')) throw new SendRefused('The message is empty.');
    if (!this.cfg.liveSending && !this.cfg.testRecipients.includes(p.username.toLowerCase())) {
      throw new SendRefused(`Test mode: sending is limited to TEST_RECIPIENTS. @${p.username} is not on that list.`);
    }
    const id = this.store.claimSend(senderId, recipientId, text);
    if (id === null) throw new SendRefused(`Already messaged @${p.username}. The tool never sends a second message.`);
    try {
      const res = await this.x.sendDm(recipientId, text);
      this.store.markSent(id, res.data.dm_event_id, res.data.dm_conversation_id);
    } catch (e) {
      const known = e instanceof XApiError && e.status >= 400 && e.status < 500;
      this.store.markSendFailed(id, known ? 'failed' : 'unknown', e instanceof XApiError ? e.explanation : String(e));
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
      if (BigInt(newest) <= BigInt(m.dm_event_id!)) continue;
      this.store.markReplied(other!, snowflakeTime(newest).toISOString());
      found++;
    }
    return found;
  }
}
