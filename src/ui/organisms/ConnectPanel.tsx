'use client';

import { useState } from 'react';
import styles from './ConnectPanel.module.css';

const STEPS = [
  'Reads public profiles and recent posts of the people you look for.',
  'Drafts a short message for each good fit, quoting their own words.',
  'Sends only messages you approve, one at a time, from this account. Never a follow-up.',
  'Checks your X chats to show who replied.',
];

export function ConnectPanel({ error }: { error: string | null }) {
  const [agreed, setAgreed] = useState(false);
  return (
    <main className={styles.page}>
      <div className={styles.panel}>
        <span className={styles.mark}>Outreach</span>
        <h1 className={styles.title}>Connect the X account you send from</h1>
        <ol className={styles.steps}>
          {STEPS.map((s) => <li key={s}>{s}</li>)}
        </ol>
        <label className={styles.consent}>
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
          <span>I own this account and agree to these actions on it</span>
        </label>
        <div className={styles.actions}>
          <a href={agreed ? '/login' : undefined} aria-disabled={!agreed} className={styles.connect}
            onClick={(e) => !agreed && e.preventDefault()}>Connect X</a>
          {error && <p className={styles.error} role="alert">{error}</p>}
        </div>
      </div>
    </main>
  );
}
