'use client';

import { Button } from '@/ui/atoms/Button.tsx';
import styles from './layout.module.css';

export default function AppError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className={styles.notice} role="alert">
      <h1>Something went wrong</h1>
      <p className="muted">The page could not load. Nothing was sent. Try again.</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
