import 'server-only';
import { loadConfig, type Config } from './config.ts';
import { Store } from './db.ts';
import { Outreach } from './outreach.ts';
import { XClient } from './x.ts';

type Container = { cfg: Config; store: Store; x: XClient; outreach: Outreach };

const g = globalThis as typeof globalThis & { __outreach?: Container };

export function container(): Container {
  if (!g.__outreach) {
    const cfg = loadConfig();
    const store = new Store(cfg.dbPath);
    const x = new XClient(cfg, store);
    g.__outreach = { cfg, store, x, outreach: new Outreach(cfg, store, x) };
  }
  return g.__outreach;
}
