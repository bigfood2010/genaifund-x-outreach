'use client';

import { useState } from 'react';
import type { Post, Reason } from '@/server/db.ts';
import { Highlighted } from '../atoms/Highlighted.tsx';
import { relative } from '../lib/time.ts';
import styles from './Evidence.module.css';

type Source = { id: string; label: string; text: string; quotes: string[] };

function sources(bio: string, posts: Post[], reasons: Reason[]): Source[] {
  const quotesFor = (id: string) => reasons.filter((r) => r.source_id === id).map((r) => r.quote);
  const all: Source[] = [{ id: 'bio', label: 'Bio', text: bio, quotes: quotesFor('bio') }];
  for (const p of posts) all.push({ id: p.id, label: p.created_at ? `Post, ${relative(p.created_at)}` : 'Post', text: p.text, quotes: quotesFor(p.id) });
  return all.filter((s) => s.quotes.length);
}

export function Evidence({ bio, posts, reasons }: { bio: string; posts: Post[]; reasons: Reason[] }) {
  const [active, setActive] = useState<string | null>(null);
  return (
    <div className={styles.evidence}>
      <ol className={styles.reasons}>
        {reasons.map((r) => (
          <li key={r.quote} onMouseEnter={() => setActive(r.quote)} onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(r.quote)} onBlur={() => setActive(null)} tabIndex={0} className={styles.reason}>
            {r.claim}
          </li>
        ))}
      </ol>
      <div className={styles.sources}>
        {sources(bio, posts, reasons).map((s) => (
          <figure key={s.id} className={styles.source}>
            <figcaption className={styles.label}>{s.label}</figcaption>
            <blockquote className={styles.text}><Highlighted text={s.text} quotes={s.quotes} active={active} /></blockquote>
          </figure>
        ))}
      </div>
    </div>
  );
}
