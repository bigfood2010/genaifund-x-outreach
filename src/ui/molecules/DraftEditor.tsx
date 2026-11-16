'use client';

import styles from './DraftEditor.module.css';

const SOFT_LIMIT = 400;

export function DraftEditor({ value, onChange, onBlur, readOnly }: {
  value: string; onChange: (v: string) => void; onBlur?: () => void; readOnly?: boolean;
}) {
  const over = value.length > SOFT_LIMIT;
  return (
    <div className={styles.editor}>
      <div className={styles.head}>
        <label htmlFor="draft" className={styles.label}>Message</label>
        {value.length > SOFT_LIMIT * 0.9 && (
          <span className={styles.count} data-over={over || undefined} aria-live="polite">{value.length} / {SOFT_LIMIT}</span>
        )}
      </div>
      <textarea id="draft" className={styles.field} value={value} readOnly={readOnly} maxLength={1000}
        onChange={(e) => onChange(e.target.value)} onBlur={onBlur} rows={5} spellCheck />
    </div>
  );
}
