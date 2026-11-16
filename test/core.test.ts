import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { test } from 'node:test';
import type { Config } from '../src/server/config.ts';
import { decrypt, encrypt, sign, unsign } from '../src/server/crypto.ts';
import { Store } from '../src/server/db.ts';
import { finalize } from '../src/server/llm.ts';
import { Outreach, SendRefused } from '../src/server/outreach.ts';
import { bucketOf } from '../src/server/views.ts';
import { snowflakeTime, XApiError, type XClient } from '../src/server/x.ts';
import { segment } from '../src/ui/lib/highlight.ts';

const cfg = { liveSending: false, testRecipients: ['friend'], maxProspectsPerRun: 10, noReplyHours: 72, senderDescription: 's' } as unknown as Config;

function setup(sendDm: (id: string, text: string) => Promise<any>) {
  const store = new Store(':memory:');
  const x = { senderId: 'me', sendDm } as unknown as XClient;
  const run = store.createRun('search', '{}');
  const add = (id: string, username: string, status: 'approved' | 'needs_review' = 'approved') =>
    store.insertProspect({ x_user_id: id, username, name: username, bio: '', receives_dm: 1, posts_json: '[]', fit: 'strong', reasons_json: '[]', draft: 'hi', status, run_id: run });
  return { store, outreach: new Outreach(cfg, store, x), add };
}

test('quotes must be verbatim and at least two to keep a draft', () => {
  const profile = { bio: 'Robotics founder in Hanoi', posts: [{ id: 'p1', text: 'Shipping our gripper today' }] };
  const kept = finalize(profile, { fit: 'strong', draft: 'Hello', reasons: [
    { claim: 'a', source_id: 'bio', quote: 'Robotics founder' },
    { claim: 'b', source_id: 'p1', quote: 'our gripper' },
    { claim: 'c', source_id: 'p1', quote: 'invented quote' },
  ] });
  assert.equal(kept.reasons.length, 2);
  assert.equal(kept.draft, 'Hello');
  const dropped = finalize(profile, { fit: 'strong', draft: 'Hello', reasons: [{ claim: 'a', source_id: 'bio', quote: 'Robotics founder' }] });
  assert.deepEqual([dropped.fit, dropped.draft], ['none', '']);
});

test('send happens once, then the database refuses a second message', async () => {
  let calls = 0;
  const { outreach, add } = setup(async () => (calls++, { data: { dm_event_id: '1', dm_conversation_id: 'c' } }));
  add('u1', 'friend');
  await outreach.send('u1', 'hi');
  await assert.rejects(outreach.send('u1', 'hi'), SendRefused);
  assert.equal(calls, 1);
});

test('test mode blocks recipients not on the list, unapproved drafts are blocked', async () => {
  const { outreach, add } = setup(async () => assert.fail('must not call X'));
  add('u2', 'stranger');
  add('u3', 'friend', 'needs_review');
  await assert.rejects(outreach.send('u2', 'hi'), /Test mode/);
  await assert.rejects(outreach.send('u3', 'hi'), /approved/);
});

test('a 5xx leaves the message unknown and never retried, a 4xx marks it failed', async () => {
  const a = setup(async () => { throw new XApiError(503, 'http', 'down'); });
  a.add('u1', 'friend');
  await assert.rejects(a.outreach.send('u1', 'hi'));
  assert.equal(a.store.db.prepare('select state from message').get()!.state, 'unknown');
  await assert.rejects(a.outreach.send('u1', 'hi'), SendRefused);

  const b = setup(async () => { throw new XApiError(403, 'https://api.x.com/2/problems/dm-sender-declined-dms', 'no'); });
  b.add('u1', 'friend');
  await assert.rejects(b.outreach.send('u1', 'hi'));
  assert.equal(b.store.db.prepare('select state from message').get()!.state, 'failed');
});

test('buckets follow send state and the no-reply window', () => {
  const now = Date.parse('2026-11-17T00:00:00Z');
  assert.equal(bucketOf('approved', 'sent', '2026-11-16T23:00:00Z', null, 72, now), 'sent');
  assert.equal(bucketOf('approved', 'sent', '2026-11-13T00:00:00Z', null, 72, now), 'attention');
  assert.equal(bucketOf('approved', 'sent', '2026-11-16T23:00:00Z', '2026-11-16T23:01:00Z', 72, now), 'replied');
  assert.equal(bucketOf('approved', 'unknown', null, null, 72, now), 'attention');
  assert.equal(bucketOf('needs_review', null, null, null, 72, now), 'review');
  assert.equal(bucketOf('no_fit', null, null, null, 72, now), 'skipped');
});

test('snowflake ids decode to the live-observed reply time', () => {
  assert.equal(snowflakeTime('2122375930647846912').toISOString(), '2026-11-16T17:07:08.361Z');
});

test('tokens round-trip encrypted, signed cookies reject tampering', () => {
  const key = randomBytes(32);
  assert.equal(decrypt(key, encrypt(key, 'secret-token')), 'secret-token');
  const s = sign('k', 'user:1');
  assert.equal(unsign('k', s), 'user:1');
  assert.equal(unsign('k', s.replace('user', 'admin')), null);
  assert.equal(unsign('other', s), null);
});

test('highlight segments keep the text intact and mark only real quotes', () => {
  const parts = segment('We build robots in Manila', ['robots', 'missing', 'build robots']);
  assert.equal(parts.map((p) => p.text).join(''), 'We build robots in Manila');
  assert.deepEqual(parts.filter((p) => p.quote).map((p) => p.text), ['robots']);
});
