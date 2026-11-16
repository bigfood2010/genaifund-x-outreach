'use client';

import styles from './Segmented.module.css';

export function Segmented<T extends string>({ name, value, options, onChange }: {
  name: string; value: T; options: Array<{ value: T; label: string }>; onChange: (v: T) => void;
}) {
  const index = options.findIndex((o) => o.value === value);
  return (
    <div className={styles.group} role="radiogroup" style={{ '--count': options.length, '--index': index } as React.CSSProperties}>
      <span className={styles.thumb} aria-hidden />
      {options.map((o) => (
        <label key={o.value} className={styles.option}>
          <input type="radio" name={name} value={o.value} checked={o.value === value} onChange={() => onChange(o.value)} className={styles.input} />
          {o.label}
        </label>
      ))}
    </div>
  );
}
