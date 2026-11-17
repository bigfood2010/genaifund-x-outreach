export type ReviewStatus = 'needs_review' | 'approved' | 'rejected' | 'no_fit' | 'do_not_contact';
export type SendState = 'sending' | 'sent' | 'failed' | 'unknown';
export type Bucket = 'review' | 'approved' | 'sent' | 'replied' | 'attention' | 'skipped';

export type Reason = { claim: string; source_id: string; quote: string };
export type Post = { id: string; text: string; created_at?: string };

export type SendInfo = { state: SendState; repliedAt: string | null; late: boolean };

const HOUR = 3_600_000;

export function isLate(sentAt: string | null, noReplyHours: number, now = Date.now()): boolean {
  return Boolean(sentAt) && now - Date.parse(sentAt!) > noReplyHours * HOUR;
}

export function bucketOf(status: ReviewStatus, send: SendInfo | null): Bucket {
  if (send?.repliedAt) return 'replied';
  if (send?.state === 'sent') return send.late ? 'attention' : 'sent';
  if (send) return 'attention';
  if (status === 'needs_review') return 'review';
  if (status === 'approved') return 'approved';
  return 'skipped';
}

const NEXT: Record<ReviewStatus, ReviewStatus[]> = {
  needs_review: ['approved', 'rejected', 'do_not_contact'],
  approved: ['approved', 'needs_review', 'rejected', 'do_not_contact'],
  rejected: ['needs_review', 'do_not_contact'],
  no_fit: ['needs_review', 'do_not_contact'],
  do_not_contact: [],
};

export const canTransition = (from: ReviewStatus, to: ReviewStatus): boolean => NEXT[from].includes(to);

// Test mode is the default: without LIVE_SENDING only TEST_RECIPIENTS can be messaged, so a reviewer cannot DM strangers by accident.
export function testModeRefusal(cfg: { liveSending: boolean; testRecipients: string[] }, username: string): string | null {
  if (cfg.liveSending || cfg.testRecipients.includes(username.toLowerCase())) return null;
  return `Test mode: sends only to ${cfg.testRecipients.length ? cfg.testRecipients.map((r) => '@' + r).join(', ') : 'no one'}`;
}
