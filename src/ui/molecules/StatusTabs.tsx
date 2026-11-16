'use client';

import type { Bucket } from '@/server/views.ts';
import styles from './StatusTabs.module.css';

export const TABS: Array<{ id: Bucket; label: string }> = [
  { id: 'review', label: 'To review' },
  { id: 'approved', label: 'Approved' },
  { id: 'sent', label: 'Sent' },
  { id: 'replied', label: 'Replied' },
  { id: 'attention', label: 'Needs attention' },
  { id: 'skipped', label: 'Skipped' },
];

export function StatusTabs({ value, counts, onChange }: { value: Bucket; counts: Record<Bucket, number>; onChange: (b: Bucket) => void }) {
  return (
    <div className={styles.tabs} role="tablist" aria-label="Status">
      {TABS.map((t) => (
        <button key={t.id} role="tab" aria-selected={value === t.id} className={styles.tab} onClick={() => onChange(t.id)}>
          {t.label}
          {counts[t.id] > 0 && <span className={styles.count}>{counts[t.id]}</span>}
        </button>
      ))}
    </div>
  );
}
