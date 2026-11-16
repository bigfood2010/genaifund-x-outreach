import { container } from '@/server/container.ts';
import { requireOperator } from '@/server/session.ts';
import { AppHeader } from '@/ui/organisms/AppHeader.tsx';
import styles from './layout.module.css';

export const dynamic = 'force-dynamic';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const op = await requireOperator();
  return (
    <div className={styles.page}>
      <AppHeader username={op.username} liveSending={container().cfg.liveSending} />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
