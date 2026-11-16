'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { MAX_DRAFT, MAX_SOURCE, MAX_TARGET } from '../domain/limits.ts';
import { canTransition, type ReviewStatus } from '../domain/prospect.ts';
import { XApiError } from '../infra/x.ts';
import { DEFAULT_TARGET, SendRefused } from '../outreach.ts';
import { container } from './container.ts';
import { explainXError } from './errors.ts';
import { endSession, requireOperator } from './session.ts';

export type ActionResult = { ok: boolean; message: string };

const DECISIONS = { approve: 'approved', reject: 'rejected', restore: 'needs_review' } as const satisfies Record<string, ReviewStatus>;
type Decision = keyof typeof DECISIONS;

const invalid = (): ActionResult => ({ ok: false, message: 'That request was not valid.' });
const validId = (id: unknown): id is string => typeof id === 'string' && id.length > 0;

function fail(e: unknown): ActionResult {
  if (e instanceof SendRefused) return { ok: false, message: e.message };
  if (e instanceof XApiError) return { ok: false, message: explainXError(e) };
  console.error(e);
  return { ok: false, message: 'Something went wrong. Nothing was sent. Try again.' };
}

function cleanDraft(text: unknown): string {
  return String(text ?? '').replace(/\r\n/g, '\n').trim().slice(0, MAX_DRAFT);
}

export async function startRun(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  await requireOperator();
  const mode = form.get('mode') === 'seeds' ? 'seeds' : 'search';
  const source = String(form.get('source') ?? '').trim().slice(0, MAX_SOURCE);
  const target = String(form.get('target') ?? '').trim().slice(0, MAX_TARGET) || DEFAULT_TARGET;
  if (!source) return { ok: false, message: mode === 'search' ? 'Add search words first.' : 'Add at least one account.' };
  container().outreach.startRun({ mode, source, target });
  revalidatePath('/find');
  return { ok: true, message: 'Run started.' };
}

export async function review(id: string, decision: Decision, draft?: string): Promise<ActionResult> {
  await requireOperator();
  if (!validId(id) || !Object.hasOwn(DECISIONS, decision)) return invalid();
  const { store } = container();
  const p = store.prospect(id);
  if (!p) return { ok: false, message: 'This person is no longer in the list.' };
  if (store.hasMessage(id)) return { ok: false, message: 'A message was already sent to this person.' };
  const to = DECISIONS[decision];
  if (!canTransition(p.status, to)) return { ok: false, message: 'That change is not allowed for this person.' };
  if (decision === 'approve') {
    const text = cleanDraft(draft ?? p.draft);
    if (!text) return { ok: false, message: 'The draft is empty.' };
    store.review(id, to, text);
  } else {
    store.review(id, to);
  }
  revalidatePath('/');
  return { ok: true, message: decision === 'approve' ? 'Approved' : decision === 'reject' ? 'Skipped' : 'Back in review' };
}

export async function saveDraft(id: string, draft: string): Promise<ActionResult> {
  await requireOperator();
  if (!validId(id)) return invalid();
  const { store } = container();
  if (!store.prospect(id)) return { ok: false, message: 'This person is no longer in the list.' };
  if (store.hasMessage(id)) return { ok: false, message: 'A message was already sent to this person.' };
  store.saveDraft(id, cleanDraft(draft));
  return { ok: true, message: 'Saved' };
}

export async function send(id: string): Promise<ActionResult> {
  await requireOperator();
  if (!validId(id)) return invalid();
  const { store, outreach } = container();
  try {
    await outreach.send(id, store.prospect(id)?.draft ?? '');
    return { ok: true, message: 'Sent' };
  } catch (e) {
    return fail(e);
  } finally {
    revalidatePath('/');
  }
}

export async function doNotContact(id: string): Promise<ActionResult> {
  await requireOperator();
  if (!validId(id)) return invalid();
  const { store } = container();
  const p = store.prospect(id);
  if (!p) return { ok: false, message: 'This person is no longer in the list.' };
  if (canTransition(p.status, 'do_not_contact')) store.review(id, 'do_not_contact');
  revalidatePath('/');
  return { ok: true, message: 'Marked do not contact' };
}

export async function syncReplies(): Promise<ActionResult> {
  await requireOperator();
  try {
    const n = await container().outreach.syncReplies();
    revalidatePath('/');
    return { ok: true, message: n ? `${n} new ${n === 1 ? 'reply' : 'replies'}` : 'No new replies' };
  } catch (e) {
    return fail(e);
  }
}

export async function signOut() {
  await endSession();
  redirect('/connect');
}
