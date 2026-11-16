import styles from './Avatar.module.css';

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts.at(-1)![0] : (parts[0] ?? '?').slice(0, 2);
  return letters.toUpperCase();
}

export function Avatar({ name, size = 40 }: { name: string; size?: 32 | 40 | 56 }) {
  return (
    <span className={styles.avatar} style={{ width: size, height: size, fontSize: size * 0.36 }} aria-hidden>
      {initials(name)}
    </span>
  );
}
