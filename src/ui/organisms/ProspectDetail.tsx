'use client';

import { useEffect, useState } from 'react';
import type { ProspectView } from '@/server/views.ts';
import { Button } from '../atoms/Button.tsx';
import { Motion } from '../atoms/Motion.tsx';
import { DraftEditor } from '../molecules/DraftEditor.tsx';
import { Evidence } from '../molecules/Evidence.tsx';
import { SendControl } from '../molecules/SendControl.tsx';
import { gap, relative } from '../lib/time.ts';
import styles from './ProspectDetail.module.css';

export type DetailActions = {
  decide: (id: string, d: 'approve' | 'reject' | 'restore', draft?: string) => void;
  save: (id: string, draft: string) => void;
  send: (id: string) => void;
  stop: (id: string) => void;
};

const SKIP_NOTE: Record<string, string> = {
  no_fit: 'Fewer than two real quotes supported a fit, so no message was drafted.',
  rejected: 'You skipped this person.',
  do_not_contact: 'Marked do not contact. The tool will never message this person.',
};

function Delivery({ p, justSent, noReplyHours }: { p: ProspectView; justSent: boolean; noReplyHours: number }) {
  const s = p.send!;
  const x = `https://x.com/${p.username}`;
  let title = '';
  let body = '';
  if (s.repliedAt && s.sentAt) {
    title = `Replied ${gap(s.sentAt, s.repliedAt)} after your message`;
    body = 'X encrypts chat replies, so the reply itself is only readable in X.';
  } else if (s.state === 'sent') {
    const late = s.sentAt && Date.now() - Date.parse(s.sentAt) > noReplyHours * 3_600_000;
    title = late ? `No reply after ${noReplyHours} hours` : `Sent ${relative(s.sentAt!)}`;
    body = late ? 'X rules do not allow a follow-up without their permission. Leave it here or mark do not contact.' : 'Waiting for a reply. Replies are checked when this page opens.';
  } else if (s.state === 'unknown') {
    title = 'X did not confirm this message';
    body = 'It may or may not have arrived. Check the chat in X. The tool will not try again.';
  } else {
    title = 'X refused this message';
    body = s.error ?? 'No reason was given.';
  }
  return (
    <section className={styles.delivery} aria-live="polite">
      <div className={styles.deliveryHead}>
        {justSent && <Motion name="check" size={[32, 32]} label="Sent" />}
        <h3 className={styles.deliveryTitle}>{title}</h3>
      </div>
      <p className={styles.muted}>{body}</p>
      <blockquote className={styles.sent}>{p.draft}</blockquote>
      <a className={styles.link} href={x} target="_blank" rel="noreferrer">Open @{p.username} on X →</a>
    </section>
  );
}

export function ProspectDetail({ p, actions, pending, justSent, sendBlocked, noReplyHours }: {
  p: ProspectView; actions: DetailActions; pending: string | null; justSent: boolean; sendBlocked: string | null; noReplyHours: number;
}) {
  const [draft, setDraft] = useState(p.draft);
  useEffect(() => setDraft(p.draft), [p.id, p.draft]);

  const editable = p.bucket === 'review' || p.bucket === 'approved';

  return (
    <article className={styles.detail} key={p.id}>
      <header className={styles.header}>
        <div className={styles.who}>
          <h2 className={styles.name}>{p.name}</h2>
          <p className={styles.muted}>
            <a className={styles.handle} href={`https://x.com/${p.username}`} target="_blank" rel="noreferrer">@{p.username}</a>
          </p>
        </div>
      </header>

      {p.send && <Delivery p={p} justSent={justSent} noReplyHours={noReplyHours} />}

      {p.bucket === 'skipped' && (
        <section className={styles.section}>
          <p className={styles.muted}>{p.note ?? SKIP_NOTE[p.status] ?? ''}</p>
          {(p.status === 'rejected' || p.status === 'no_fit') && (
            <Button variant="ghost" onClick={() => actions.decide(p.id, 'restore')} pending={pending === 'restore'}>Move to review</Button>
          )}
        </section>
      )}

      {p.reasons.length > 0 && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Why they fit</h3>
          <Evidence bio={p.bio} posts={p.posts} reasons={p.reasons} />
        </section>
      )}

      {editable && (
        <section className={styles.section}>
          <DraftEditor value={draft} onChange={setDraft} onBlur={() => draft !== p.draft && actions.save(p.id, draft)} />
          <div className={styles.actions} data-split={p.bucket === 'approved' || undefined}>
            {p.bucket === 'review' ? (
              <>
                <Button onClick={() => actions.decide(p.id, 'approve', draft)} pending={pending === 'approve'} disabled={!draft.trim()}>Approve</Button>
                <Button variant="ghost" onClick={() => actions.decide(p.id, 'reject')} pending={pending === 'reject'}>Skip</Button>
              </>
            ) : (
              <>
                <SendControl handle={p.username} pending={pending === 'send'} blockedReason={sendBlocked} onSend={() => actions.send(p.id)} />
                <Button variant="text" onClick={() => actions.decide(p.id, 'restore')}>Back to review</Button>
              </>
            )}
          </div>
        </section>
      )}

      {p.send && p.status !== 'do_not_contact' && (
        <Button variant="text" className={styles.stop} onClick={() => actions.stop(p.id)}>Mark do not contact</Button>
      )}
    </article>
  );
}
