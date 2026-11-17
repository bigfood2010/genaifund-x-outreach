import { randomBytes } from 'node:crypto';
import type { ReviewStatus } from '../src/server/domain/prospect.ts';
import type { Config } from '../src/server/infra/config.ts';
import { encrypt } from '../src/server/infra/crypto.ts';
import { Store } from '../src/server/infra/db.ts';
import { XClient } from '../src/server/infra/x.ts';
import { Outreach } from '../src/server/outreach.ts';

export const baseCfg = { liveSending: false, testRecipients: ['friend'], maxProspectsPerRun: 10, noReplyHours: 72, senderDescription: 's' };
export const cfg = baseCfg as unknown as Config;

export const okDm = async () => ({ data: { dm_event_id: '1', dm_conversation_id: 'c' } });
export const rows = (store: Store, sql: string) => store.db.prepare(sql).all() as any[];

export function addProspect(store: Store, run: number, id: string, username: string, status: ReviewStatus = 'approved') {
  store.insertProspect({ x_user_id: id, username, name: username, bio: '', receives_dm: 1, posts_json: '[]', fit: 'strong', reasons_json: '[]', draft: 'hi', status, run_id: run });
}

export function setup(sendDm: (id: string, text: string) => Promise<any>, c: Config = cfg, chat?: () => Promise<any>) {
  const store = new Store(':memory:');
  const x = { senderId: 'me', sendDm, chatConversations: chat } as unknown as XClient;
  const run = store.createRun('search', '{}');
  const add = (id: string, username: string, status: ReviewStatus = 'approved') => addProspect(store, run, id, username, status);
  return { store, run, outreach: new Outreach(c, store, x), add };
}

export function realClient() {
  const key = randomBytes(32);
  const store = new Store(':memory:');
  const xcfg = { ...baseCfg, tokenKey: key } as unknown as Config;
  store.saveAccount({ x_user_id: 'me', username: 'me', access_token: encrypt(key, 'tok'), refresh_token: encrypt(key, 'ref'), expires_at: Date.now() + 3_600_000 });
  addProspect(store, store.createRun('s', '{}'), 'u1', 'friend');
  return { store, outreach: new Outreach(xcfg, store, new XClient(xcfg, store)) };
}
