import { MAX_DRAFT } from './limits.ts';
import type { Post, Reason } from './prospect.ts';

export type Assessment = { fit: 'strong' | 'weak' | 'none'; reasons: Reason[]; draft: string };
type ProfileInput = { bio: string; posts: Post[] };

const MIN_QUOTES = 2;

export function verifyReasons(profile: ProfileInput, reasons: Reason[]): Reason[] {
  const source = (id: string) => (id === 'bio' ? profile.bio : profile.posts.find((p) => p.id === id)?.text ?? '');
  const kept: Reason[] = [];
  const valid = reasons
    .filter((r) => r.quote.trim().length > 0 && source(r.source_id).includes(r.quote))
    .sort((a, b) => b.quote.length - a.quote.length);
  for (const r of valid) {
    if (kept.some((k) => k.source_id === r.source_id && k.quote.includes(r.quote))) continue;
    kept.push(r);
  }
  return reasons.filter((r) => kept.includes(r));
}

function isAssessment(raw: unknown): raw is Assessment {
  const a = raw as Partial<Assessment> | null;
  return typeof a === 'object' && a !== null && typeof a.fit === 'string' && typeof a.draft === 'string' && Array.isArray(a.reasons)
    && a.reasons.every((r) => r && typeof r.claim === 'string' && typeof r.source_id === 'string' && typeof r.quote === 'string');
}

export function finalize(profile: ProfileInput, raw: unknown): Assessment {
  if (!isAssessment(raw)) return { fit: 'none', reasons: [], draft: '' };
  const reasons = verifyReasons(profile, raw.reasons);
  if ((raw.fit !== 'strong' && raw.fit !== 'weak') || reasons.length < MIN_QUOTES) return { fit: 'none', reasons, draft: '' };
  return { fit: raw.fit, reasons, draft: raw.draft.trim().slice(0, MAX_DRAFT) };
}
