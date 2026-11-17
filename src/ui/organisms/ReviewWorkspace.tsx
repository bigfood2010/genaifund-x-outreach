'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { bucketOf, type Bucket, type ReviewStatus } from '@/server/domain/prospect.ts';
import { doNotContact, review, saveDraft, send, syncReplies, type ActionResult } from '@/server/web/actions.ts';
import type { ProspectView } from '@/server/web/views.ts';
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

const STATUS_AFTER = { approve: 'approved', reject: 'rejected', restore: 'needs_review', stop: 'do_not_contact' } as const satisfies Record<string, ReviewStatus>;

export function ReviewWorkspace({ items }: { items: ProspectView[] }) {
  const [overrides, setOverrides] = useState<Record<string, Partial<ProspectView>>>({});
  const view = useMemo(() => items.map((p) => ({ ...p, ...overrides[p.id] })), [items, overrides]);
  const counts = useMemo(() => {
    const c = Object.fromEntries(TABS.map((t) => [t.id, 0])) as Record<Bucket, number>;
    for (const p of view) c[p.bucket]++;
    return c;
  }, [view]);

  const [tab, setTab] = useState<Bucket>(() => TABS.find((t) => counts[t.id])?.id ?? 'review');
  const [kept, setKept] = useState<Set<string>>(new Set());
  const list = view.filter((p) => p.bucket === tab || kept.has(p.id));
  const [selectedId, setSelectedId] = useState<string | null>(list[0]?.id ?? null);
  const selected = view.find((p) => p.id === selectedId) ?? list[0] ?? null;

  const [pending, setPending] = useState<{ id: string; kind: string } | null>(null);
  const [justSent, setJustSent] = useState<string | null>(null);
  const [message, setMessageState] = useState({ text: '', n: 0 });
  const setMessage = (text: string) => setMessageState((m) => ({ text, n: m.n + 1 }));
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
    setKept(new Set());
    setSelectedId(view.find((p) => p.bucket === b)?.id ?? null);
  }

  function run(id: string, kind: string, task: () => Promise<ActionResult>, optimistic?: Partial<ProspectView>) {
    setPending({ id, kind });
    if (optimistic) {
      setOverrides((o) => ({ ...o, [id]: { ...o[id], ...optimistic } }));
      const waiting = list.filter((p) => p.id !== id && p.bucket === tab);
      const at = list.findIndex((q) => q.id === id);
      const next = waiting.find((p) => list.indexOf(p) > at) ?? waiting[0];
      if (optimistic.bucket !== tab) {
        setKept((k) => new Set(k).add(id));
        setSelectedId(next?.id ?? id);
      }
    }
    startTransition(async () => {
      const r = await task();
      setPending(null);
      setMessage(r.message);
      if (!r.ok && optimistic) setOverrides((o) => ({ ...o, [id]: {} }));
      if (r.ok && kind === 'send') setJustSent(id);
    });
  }

  const moveTo = (id: string, kind: keyof typeof STATUS_AFTER, draft?: string): Partial<ProspectView> => {
    const status = STATUS_AFTER[kind];
    return { status, bucket: bucketOf(status, view.find((p) => p.id === id)?.send ?? null), ...(draft ? { draft } : {}) };
  };

  const actions: DetailActions = {
    decide: (id, d, draft) => run(id, d, () => review(id, d, draft), moveTo(id, d, draft)),
    save: (id, draft) => { setOverrides((o) => ({ ...o, [id]: { ...o[id], draft } })); saveDraft(id, draft); },
    send: (id) => run(id, 'send', () => send(id)),
    stop: (id) => run(id, 'stop', () => doNotContact(id), moveTo(id, 'stop')),
  };

  return (
    <div className={styles.workspace}>
      <div className={styles.head}>
        <h1>Review</h1>
        <div className={styles.tools}>
          {message.text && <p className={styles.message} key={message.n} aria-hidden>{message.text}</p>}
          <Button variant="ghost" className={styles.sync} pending={pending?.kind === 'sync'}
            onClick={() => run('', 'sync', syncReplies)}>{pending?.kind === 'sync' ? 'Checking' : 'Check replies'}</Button>
        </div>
      </div>

      <StatusTabs value={tab} counts={counts} onChange={changeTab} />
      <p className="visually-hidden" aria-live="polite">{message.text}</p>

      <div className={styles.split}>
        {list.length ? (
          <ul className={`${styles.list} plain-list`}>
            {list.map((p) => <ProspectRow key={p.id} p={p} selected={p.id === selected?.id} onSelect={() => setSelectedId(p.id)} />)}
          </ul>
        ) : (
          <div className={styles.empty}>
            <p>{EMPTY[tab]}</p>
            {tab === 'review' && <Link href="/find" className={`${styles.emptyLink} link`}>Find people</Link>}
          </div>
        )}
        {selected && (
          <ProspectDetail key={selected.id} p={selected} actions={actions}
            pending={pending?.id === selected.id ? pending.kind : null} justSent={justSent === selected.id} sendBlocked={selected.sendBlocked} />
        )}
      </div>
    </div>
  );
}
