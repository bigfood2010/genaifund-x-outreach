import styles from './Avatar.module.css';

function initials(name: string): string {
  const [first = '?', second] = name.match(/\p{L}[\p{L}\p{M}'.-]*/gu) ?? [];
  const letters = second ? [...first][0] + [...second][0] : [...first].slice(0, 2).join('');
  return letters.toUpperCase();
}

const SIZE = 40;

export function Avatar({ name }: { name: string }) {
  return (
    <span className={styles.avatar} style={{ width: SIZE, height: SIZE, fontSize: SIZE * 0.36 }} aria-hidden>
      {initials(name)}
    </span>
  );
}
