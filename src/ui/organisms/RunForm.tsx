'use client';

import { useActionState, useState } from 'react';
import { MAX_SOURCE, MAX_TARGET } from '@/server/domain/limits.ts';
import { MAX_SEEDS } from '@/server/domain/pricing.ts';
import { startRun, type ActionResult } from '@/server/web/actions.ts';
import { Button } from '../atoms/Button.tsx';
import { Segmented } from '../molecules/Segmented.tsx';
import styles from './RunForm.module.css';

type Mode = 'search' | 'seeds';

const SOURCE: Record<Mode, { label: string; placeholder: string; help: string }> = {
  search: {
    label: 'Search words',
    placeholder: '"embodied AI" OR robotics founder lang:en',
    help: 'Searches posts from the last 7 days, then looks at who wrote them. Reposts and replies are left out.',
  },
  seeds: {
    label: 'Seed accounts',
    placeholder: '@karpathy, @drjimfan',
    help: `Looks at who these accounts follow. Up to ${MAX_SEEDS} accounts.`,
  },
};

export function RunForm({ defaultTarget, maxPerRun, costCeiling }: { defaultTarget: string; maxPerRun: number; costCeiling: Record<Mode, string> }) {
  const [mode, setMode] = useState<Mode>('search');
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(startRun, null);
  const src = SOURCE[mode];

  return (
    <form action={action} className={styles.form}>
      <div className={styles.field}>
        <label htmlFor="target" className={styles.label}>Who you want to reach</label>
        <textarea id="target" name="target" defaultValue={defaultTarget} rows={4} className={styles.input} maxLength={MAX_TARGET} />
      </div>

      <div className={styles.field}>
        <span className={styles.label} id="mode-label">Where to look</span>
        <Segmented name="mode" value={mode} onChange={setMode}
          options={[{ value: 'search', label: 'Recent posts' }, { value: 'seeds', label: 'Seed accounts' }]} />
      </div>

      <div className={styles.field}>
        <label htmlFor="source" className={styles.label}>{src.label}</label>
        <input id="source" name="source" key={mode} placeholder={src.placeholder} className={styles.input} maxLength={MAX_SOURCE} autoComplete="off" required />
        <p className={styles.help}>{src.help}</p>
      </div>

      <div className={styles.footer}>
        <Button pending={pending}>{pending ? 'Starting' : 'Find people'}</Button>
        <p className={styles.help}>Checks up to {maxPerRun} new people. At most {costCeiling[mode]} in X API reads.</p>
      </div>
      {state && !state.ok && <p className="error" role="alert">{state.message}</p>}
    </form>
  );
}
