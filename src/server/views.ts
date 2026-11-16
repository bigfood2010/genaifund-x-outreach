import type { Config } from './config.ts';
import type { Post, Reason, Store } from './db.ts';

export type Bucket = 'review' | 'approved' | 'sent' | 'replied' | 'attention' | 'skipped';

export type ProspectView = {
  id: string; username: string; name: string; bio: string; fit: string | null; status: string;
  reasons: Reason[]; posts: Post[]; draft: string; note: string | null; bucket: Bucket;
  send: { state: string; error: string | null; sentAt: string | null; repliedAt: string | null } | null;
  updatedAt: string;
};

const utc = (sqlite: string | null) => (sqlite ? `${sqlite.replace(' ', 'T')}Z` : null);

export function bucketOf(status: string, state: string | null | undefined, sentAt: string | null, repliedAt: string | null, noReplyHours: number, now = Date.now()): Bucket {
  if (repliedAt) return 'replied';
  if (state === 'unknown' || state === 'failed' || state === 'sending') return 'attention';
  if (state === 'sent') return sentAt && now - Date.parse(sentAt) > noReplyHours * 3_600_000 ? 'attention' : 'sent';
  if (status === 'needs_review') return 'review';
  if (status === 'approved') return 'approved';
  return 'skipped';
}

export function prospectViews(store: Store, cfg: Config): ProspectView[] {
  return store.prospects().map((p) => {
    const sentAt = utc(p.sent_at ?? null);
    const repliedAt = p.replied_at ?? null;
    return {
      id: p.x_user_id, username: p.username, name: p.name, bio: p.bio, fit: p.fit, status: p.status,
      reasons: JSON.parse(p.reasons_json), posts: JSON.parse(p.posts_json), draft: p.draft, note: p.note,
      bucket: bucketOf(p.status, p.state, sentAt, repliedAt, cfg.noReplyHours),
      send: p.state ? { state: p.state, error: p.error ?? null, sentAt, repliedAt } : null,
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
