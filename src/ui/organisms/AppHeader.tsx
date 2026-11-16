import { signOut } from '@/server/web/actions.ts';
import { Button } from '../atoms/Button.tsx';
import { NavLink } from '../molecules/NavLink.tsx';
import styles from './AppHeader.module.css';

export function AppHeader({ username, liveSending }: { username: string; liveSending: boolean }) {
  return (
    <header className={styles.header}>
      <span className={styles.mark}>Outreach</span>
      <nav className={styles.nav} aria-label="Main">
        <NavLink href="/">Review</NavLink>
        <NavLink href="/find">Find</NavLink>
      </nav>
      <div className={styles.account}>
        {!liveSending && <span className={styles.mode}>Test mode</span>}
        <span className={styles.handle}>@{username}</span>
        <form action={signOut}><Button variant="text">Sign out</Button></form>
      </div>
    </header>
  );
}
