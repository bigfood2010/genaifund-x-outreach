import { segment } from '../lib/highlight.ts';
import styles from './Highlighted.module.css';

export function Highlighted({ text, quotes, active }: { text: string; quotes: string[]; active?: string | null }) {
  return (
    <>
      {segment(text, quotes).map((s, i) =>
        s.quote === null ? (
          <span key={i}>{s.text}</span>
        ) : (
          <mark key={i} className={styles.mark} data-active={s.quote === active || undefined}>{s.text}</mark>
        ),
      )}
    </>
  );
}
