'use client';

import { useEffect, useState } from 'react';
import { Button } from '../atoms/Button.tsx';
import styles from './SendControl.module.css';

export function SendControl({ handle, pending, blockedReason, onSend }: {
  handle: string; pending: boolean; blockedReason: string | null; onSend: () => void;
}) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 5000);
    return () => clearTimeout(t);
  }, [armed]);

  if (blockedReason) return <p className="muted">{blockedReason}</p>;

  return (
    <div className={styles.control}>
      <Button pending={pending} onClick={() => (armed ? (setArmed(false), onSend()) : setArmed(true))}>
        {pending ? 'Sending' : armed ? `Send to @${handle}` : 'Send'}
      </Button>
      {armed && !pending && (
        <Button variant="text" onClick={() => setArmed(false)} className={styles.cancel}>Cancel</Button>
      )}
    </div>
  );
}
