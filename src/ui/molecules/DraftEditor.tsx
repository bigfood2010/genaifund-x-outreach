'use client';

import { MAX_DRAFT, SOFT_DRAFT } from '@/server/domain/limits.ts';
import styles from './DraftEditor.module.css';

export function DraftEditor({ value, onChange, onBlur }: { value: string; onChange: (v: string) => void; onBlur?: () => void }) {
  const over = value.length > SOFT_DRAFT;
  return (
    <div className={styles.editor}>
      <div className={styles.head}>
        <label htmlFor="draft" className="subhead">Message</label>
        {value.length > SOFT_DRAFT * 0.9 && (
          <span className={`${styles.count} caption`} data-over={over || undefined} aria-live="polite">{value.length} / {SOFT_DRAFT}</span>
        )}
      </div>
      <textarea id="draft" className={styles.field} value={value} maxLength={MAX_DRAFT}
        onChange={(e) => onChange(e.target.value)} onBlur={onBlur} rows={5} spellCheck />
    </div>
  );
}
