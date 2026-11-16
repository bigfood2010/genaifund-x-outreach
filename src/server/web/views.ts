import { bucketOf, isLate, testModeRefusal, type Bucket, type Post, type Reason, type ReviewStatus, type SendState } from '../domain/prospect.ts';
import type { Config } from '../infra/config.ts';
import type { Store } from '../infra/db.ts';

export type ProspectView = {
  id: string; username: string; name: string; bio: string; fit: string | null; status: ReviewStatus;
  reasons: Reason[]; posts: Post[]; draft: string; bucket: Bucket; sendBlocked: string | null;
  send: { state: SendState; text: string; error: string | null; sentAt: string | null; repliedAt: string | null; late: boolean } | null;
  updatedAt: string;
};

const utc = (sqlite: string | null) => (sqlite ? `${sqlite.replace(' ', 'T')}Z` : null);

export function prospectViews(store: Store, cfg: Config, now = Date.now()): ProspectView[] {
  return store.prospects().map((p) => {
    const sentAt = utc(p.sent_at ?? null);
    const repliedAt = p.replied_at ?? null;
    const late = p.state === 'sent' && isLate(sentAt, cfg.noReplyHours, now);
    const send = p.state ? { state: p.state, text: p.sent_text ?? '', error: p.error ?? null, sentAt, repliedAt, late } : null;
    return {
      id: p.x_user_id, username: p.username, name: p.name, bio: p.bio, fit: p.fit, status: p.status,
      reasons: JSON.parse(p.reasons_json), posts: JSON.parse(p.posts_json), draft: p.draft,
      bucket: bucketOf(p.status, send), sendBlocked: testModeRefusal(cfg, p.username), send,
      updatedAt: utc(p.updated_at)!,
    };
  });
}

export type RunView = { id: number; mode: string; source: string; status: string; note: string | null; createdAt: string; found: number };

export function runViews(store: Store): RunView[] {
  const counts = new Map<number, number>();
  for (const p of store.prospects()) counts.set(p.run_id, (counts.get(p.run_id) ?? 0) + 1);
  return store.runs().map((r) => {
    const input = JSON.parse(r.input) as { mode: string; source: string };
    return { id: r.id, mode: input.mode, source: input.source, status: r.status, note: r.note, createdAt: utc(r.created_at)!, found: counts.get(r.id) ?? 0 };
  });
}
