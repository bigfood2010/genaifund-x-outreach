'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { doNotContact, review, saveDraft, send, syncReplies } from '@/server/actions.ts';
import type { Bucket, ProspectView } from '@/server/views.ts';
import { Button } from '../atoms/Button.tsx';
import { ProspectRow } from '../molecules/ProspectRow.tsx';
import { StatusTabs, TABS } from '../molecules/StatusTabs.tsx';
import { ProspectDetail, type DetailActions } from './ProspectDetail.tsx';
import styles from './ReviewWorkspace.module.css';

const EMPTY: Record<Bucket, string> = {
  review: 'Nothing waiting for review.',
  approved: 'No approved messages waiting to send.',
  sent: 'No messages waiting for a reply.',
  replied: 'No replies yet.',
  attention: 'Nothing needs your attention.',
  skipped: 'No skipped people.',
};

const MOVE: Record<string, Partial<ProspectView>> = {
  approve: { status: 'approved', bucket: 'approved' },
  reject: { status: 'rejected', bucket: 'skipped' },
  restore: { status: 'needs_review', bucket: 'review' },
  stop: { status: 'do_not_contact', bucket: 'skipped' },
};

export function ReviewWorkspace({ items, liveSending, testRecipients, noReplyHours }: {
  items: ProspectView[]; liveSending: boolean; testRecipients: string[]; noReplyHours: number;
}) {
  const [overrides, setOverrides] = useState<Record<string, Partial<ProspectView>>>({});
  const view = useMemo(() => items.map((p) => ({ ...p, ...overrides[p.id] })), [items, overrides]);
  const counts = useMemo(() => {
    const c = Object.fromEntries(TABS.map((t) => [t.id, 0])) as Record<Bucket, number>;
    for (const p of view) c[p.bucket]++;
    return c;
  }, [view]);

  const [tab, setTab] = useState<Bucket>(() => TABS.find((t) => counts[t.id])?.id ?? 'review');
  const list = view.filter((p) => p.bucket === tab);
  const [selectedId, setSelectedId] = useState<string | null>(list[0]?.id ?? null);
  const selected = view.find((p) => p.id === selectedId) ?? list[0] ?? null;

  const [pending, setPending] = useState<{ id: string; kind: string } | null>(null);
  const [justSent, setJustSent] = useState<string | null>(null);
  const [message, setNote] = useState({ text: '', n: 0 });
  const setMessage = (text: string) => setNote((m) => ({ text, n: m.n + 1 }));
  const [, startTransition] = useTransition();
  const synced = useRef(false);

  useEffect(() => setOverrides({}), [items]);

  useEffect(() => {
    if (synced.current) return;
    synced.current = true;
    syncReplies().then((r) => !r.ok && setMessage(r.message));
  }, []);

  function changeTab(b: Bucket) {
    setTab(b);
    setSelectedId(view.find((p) => p.bucket === b)?.id ?? null);
  }

  function run(id: string, kind: string, task: () => Promise<{ ok: boolean; message: string }>, optimistic?: Partial<ProspectView>) {
    setPending({ id, kind });
    if (optimistic) {
      setOverrides((o) => ({ ...o, [id]: { ...o[id], ...optimistic } }));
      const next = list.find((p) => p.id !== id && list.indexOf(p) > list.findIndex((q) => q.id === id)) ?? list.find((p) => p.id !== id);
      if (optimistic.bucket !== tab) setSelectedId(next?.id ?? id);
    }
    startTransition(async () => {
      const r = await task();
      setPending(null);
      setMessage(r.message);
      if (!r.ok && optimistic) setOverrides((o) => ({ ...o, [id]: {} }));
      if (r.ok && kind === 'send') setJustSent(id);
    });
  }

  const actions: DetailActions = {
    decide: (id, d, draft) => run(id, d, () => review(id, d, draft), { ...MOVE[d], ...(draft ? { draft } : {}) }),
    save: (id, draft) => { setOverrides((o) => ({ ...o, [id]: { ...o[id], draft } })); saveDraft(id, draft); },
    send: (id) => run(id, 'send', () => send(id)),
    stop: (id) => run(id, 'stop', () => doNotContact(id), MOVE.stop),
  };

  const sendBlocked = (p: ProspectView) =>
    !liveSending && !testRecipients.includes(p.username.toLowerCase())
      ? `Test mode: sends only to ${testRecipients.length ? testRecipients.map((r) => '@' + r).join(', ') : 'no one'}`
      : null;

  return (
    <div className={styles.workspace}>
      <div className={styles.head}>
        <h1 className={styles.title}>Review</h1>
        <Button variant="ghost" pending={pending?.kind === 'sync'}
          onClick={() => run('', 'sync', syncReplies)}>{pending?.kind === 'sync' ? 'Checking' : 'Check replies'}</Button>
      </div>

      <StatusTabs value={tab} counts={counts} onChange={changeTab} />
      <p className="visually-hidden" aria-live="polite">{message.text}</p>
      {message.text && <p className={styles.message} key={message.n} aria-hidden>{message.text}</p>}

      <div className={styles.split}>
        {list.length ? (
          <ul className={styles.list}>
            {list.map((p) => <ProspectRow key={p.id} p={p} selected={p.id === selected?.id} onSelect={() => setSelectedId(p.id)} />)}
          </ul>
        ) : (
          <div className={styles.empty}>
            <p>{EMPTY[tab]}</p>
            {tab === 'review' && <Link href="/find" className={styles.emptyLink}>Find people →</Link>}
          </div>
        )}
        {selected && (
          <ProspectDetail key={selected.id} p={selected} actions={actions} noReplyHours={noReplyHours}
            pending={pending?.id === selected.id ? pending.kind : null} justSent={justSent === selected.id} sendBlocked={sendBlocked(selected)} />
        )}
      </div>
    </div>
  );
}
