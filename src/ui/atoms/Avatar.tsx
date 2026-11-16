import styles from './Avatar.module.css';

function initials(name: string): string {
  const [first = '?', second] = name.match(/\p{L}[\p{L}\p{M}'.-]*/gu) ?? [];
  const letters = second ? [...first][0] + [...second][0] : [...first].slice(0, 2).join('');
  return letters.toUpperCase();
}

export function Avatar({ name, size = 40 }: { name: string; size?: 32 | 40 | 56 }) {
  return (
    <span className={styles.avatar} style={{ width: size, height: size, fontSize: size * 0.36 }} aria-hidden>
      {initials(name)}
    </span>
  );
}
