'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { RunView } from '@/server/views.ts';
import { Motion } from '../atoms/Motion.tsx';
import { relative } from '../lib/time.ts';
import styles from './RunHistory.module.css';

export function RunHistory({ runs }: { runs: RunView[] }) {
  const router = useRouter();
  const running = runs.some((r) => r.status === 'running');

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => router.refresh(), 1500);
    return () => clearInterval(t);
  }, [running, router]);

  if (!runs.length) return <p className={styles.empty}>Runs you start show up here.</p>;

  return (
    <ol className={styles.runs} aria-live="polite">
      {runs.map((r) => (
        <li key={r.id} className={styles.run}>
          <div className={styles.top}>
            <span className={styles.source}>{r.mode === 'search' ? 'Posts' : 'Following of'} · {r.source}</span>
            <span className={styles.time}>{relative(r.createdAt)}</span>
          </div>
          {r.status === 'running' ? (
            <div className={styles.progress}>
              <Motion name="scan" size={[64, 16]} />
              <span>Reading profiles · {r.found} checked</span>
            </div>
          ) : (
            <p className={r.status === 'failed' ? styles.failed : styles.note}>
              {r.note}{r.status === 'done' && r.found > 0 && <> <Link href="/" className={styles.link}>Review →</Link></>}
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}
