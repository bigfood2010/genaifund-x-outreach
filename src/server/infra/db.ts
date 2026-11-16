import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import type { ReviewStatus, SendState } from '../domain/prospect.ts';

type Prospect = {
  x_user_id: string; username: string; name: string; bio: string; receives_dm: number | null;
  posts_json: string; fit: string | null; reasons_json: string; draft: string; status: ReviewStatus;
  run_id: number; created_at: string; updated_at: string;
};

type Message = {
  id: number; sender_id: string; recipient_id: string; text: string; state: SendState;
  dm_event_id: string | null; conversation_id: string | null; error: string | null;
  created_at: string; sent_at: string | null; replied_at: string | null;
};

type ProspectRow = Prospect & Partial<Pick<Message, 'state' | 'error' | 'sent_at' | 'replied_at' | 'dm_event_id'>> & { sent_text?: string };

type Run = { id: number; kind: string; input: string; status: string; note: string | null; created_at: string };

type Account = { x_user_id: string; username: string; access_token: string; refresh_token: string; expires_at: number };

const SCHEMA = `
create table if not exists account (
  id integer primary key check (id = 1),
  x_user_id text not null, username text not null,
  access_token text not null, refresh_token text not null, expires_at integer not null
);
create table if not exists run (
  id integer primary key, kind text not null, input text not null,
  status text not null default 'running', note text, created_at text not null default (datetime('now'))
);
create table if not exists prospect (
  x_user_id text primary key, username text not null, name text not null, bio text not null,
  receives_dm integer, posts_json text not null default '[]', fit text, reasons_json text not null default '[]',
  draft text not null default '', status text not null, note text, run_id integer not null references run(id),
  created_at text not null default (datetime('now')), updated_at text not null default (datetime('now'))
);
create table if not exists message (
  id integer primary key, sender_id text not null, recipient_id text not null, text text not null,
  state text not null, dm_event_id text, conversation_id text, error text,
  created_at text not null default (datetime('now')), sent_at text, replied_at text,
  unique (sender_id, recipient_id)
);
`;

export class Store {
  readonly db: DatabaseSync;

  constructor(path: string) {
    if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
    this.db = new DatabaseSync(path);
    this.db.exec('pragma journal_mode = wal; pragma foreign_keys = on;');
    this.db.exec(SCHEMA);
  }

  getAccount(): Account | undefined {
    return this.db.prepare('select x_user_id, username, access_token, refresh_token, expires_at from account where id = 1').get() as Account | undefined;
  }

  saveAccount(a: Account): void {
    this.db.prepare(`insert into account (id, x_user_id, username, access_token, refresh_token, expires_at) values (1, ?, ?, ?, ?, ?)
      on conflict(id) do update set x_user_id = excluded.x_user_id, username = excluded.username,
      access_token = excluded.access_token, refresh_token = excluded.refresh_token, expires_at = excluded.expires_at`)
      .run(a.x_user_id, a.username, a.access_token, a.refresh_token, a.expires_at);
  }

  createRun(kind: string, input: string): number {
    return Number(this.db.prepare('insert into run (kind, input) values (?, ?)').run(kind, input).lastInsertRowid);
  }

  finishRun(id: number, status: 'done' | 'failed', note: string): void {
    this.db.prepare('update run set status = ?, note = ? where id = ?').run(status, note, id);
  }

  runs(): Run[] {
    return this.db.prepare('select * from run order by id desc limit 20').all() as Run[];
  }

  knownProspect(xUserId: string): boolean {
    return Boolean(this.db.prepare('select 1 from prospect where x_user_id = ?').get(xUserId));
  }

  insertProspect(p: Omit<Prospect, 'created_at' | 'updated_at'>): void {
    this.db.prepare(`insert or ignore into prospect (x_user_id, username, name, bio, receives_dm, posts_json, fit, reasons_json, draft, status, run_id)
      values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(p.x_user_id, p.username, p.name, p.bio, p.receives_dm, p.posts_json, p.fit, p.reasons_json, p.draft, p.status, p.run_id);
  }

  prospect(xUserId: string): Prospect | undefined {
    return this.db.prepare('select * from prospect where x_user_id = ?').get(xUserId) as Prospect | undefined;
  }

  hasMessage(xUserId: string): boolean {
    return Boolean(this.db.prepare('select 1 from message where recipient_id = ?').get(xUserId));
  }

  prospects(): ProspectRow[] {
    return this.db.prepare(`select p.*, m.state, m.text as sent_text, m.error, m.sent_at, m.replied_at, m.dm_event_id
      from prospect p left join message m on m.recipient_id = p.x_user_id
      order by p.updated_at desc`).all() as unknown as ProspectRow[];
  }

  review(xUserId: string, status: ReviewStatus, draft?: string): void {
    this.db.prepare(`update prospect set status = ?, draft = coalesce(?, draft), updated_at = datetime('now') where x_user_id = ?`)
      .run(status, draft ?? null, xUserId);
  }

  saveDraft(xUserId: string, draft: string): void {
    this.db.prepare(`update prospect set draft = ?, updated_at = datetime('now') where x_user_id = ?`).run(draft, xUserId);
  }

  // Returns null on UNIQUE violation so the caller can refuse, any other error is a real failure and is rethrown.
  claimSend(senderId: string, recipientId: string, text: string): number | null {
    try {
      return Number(this.db.prepare(`insert into message (sender_id, recipient_id, text, state) values (?, ?, ?, 'sending')`)
        .run(senderId, recipientId, text).lastInsertRowid);
    } catch (e) {
      if (e instanceof Error && e.message.includes('UNIQUE')) return null;
      throw e;
    }
  }

  markSent(id: number, dmEventId: string, conversationId: string): void {
    this.db.prepare(`update message set state = 'sent', dm_event_id = ?, conversation_id = ?, sent_at = datetime('now') where id = ?`)
      .run(dmEventId, conversationId, id);
  }

  markSendFailed(id: number, state: 'failed' | 'unknown', error: string): void {
    this.db.prepare('update message set state = ?, error = ? where id = ?').run(state, error, id);
  }

  markReplied(recipientId: string, repliedAt: string): void {
    this.db.prepare(`update message set replied_at = ? where recipient_id = ? and state = 'sent' and replied_at is null`).run(repliedAt, recipientId);
  }

  sentMessages(): Message[] {
    return this.db.prepare(`select * from message where state = 'sent'`).all() as Message[];
  }
}
