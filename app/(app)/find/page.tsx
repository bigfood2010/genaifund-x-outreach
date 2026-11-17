import { requireOperator } from '@/server/web/session.ts';
import { container } from '@/server/web/container.ts';
import { runCostCeiling } from '@/server/domain/pricing.ts';
import { DEFAULT_TARGET } from '@/server/outreach.ts';
import { runViews } from '@/server/web/views.ts';
import { RunForm } from '@/ui/organisms/RunForm.tsx';
import { RunHistory } from '@/ui/organisms/RunHistory.tsx';
import styles from './page.module.css';

const usd = (n: number) => `$${n.toFixed(2)}`;

export default async function FindPage() {
  await requireOperator();
  const { store, cfg } = container();
  const max = cfg.maxProspectsPerRun;
  return (
    <div className={styles.page}>
      <h1>Find people</h1>
      <div className={styles.grid}>
        <RunForm defaultTarget={DEFAULT_TARGET} maxPerRun={max}
          costCeiling={{ search: usd(runCostCeiling('search', max)), seeds: usd(runCostCeiling('seeds', max)) }} />
        <section className={styles.history} aria-labelledby="runs-title">
          <h2 id="runs-title" className="subhead">Runs</h2>
          <RunHistory runs={runViews(store)} />
        </section>
      </div>
    </div>
  );
}
