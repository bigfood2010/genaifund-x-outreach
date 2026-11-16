'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { container } from './container.ts';
import { DEFAULT_TARGET, SendRefused } from './outreach.ts';
import { endSession, requireOperator } from './session.ts';
import { XApiError } from './x.ts';

export type ActionResult = { ok: boolean; message: string };

const MAX_DRAFT = 1000;

function fail(e: unknown): ActionResult {
  if (e instanceof SendRefused) return { ok: false, message: e.message };
  if (e instanceof XApiError) return { ok: false, message: e.explanation };
  console.error(e);
  return { ok: false, message: 'Something went wrong. Nothing was sent. Try again.' };
}

function cleanDraft(text: unknown): string {
  return String(text ?? '').replace(/\r\n/g, '\n').trim().slice(0, MAX_DRAFT);
}

export async function startRun(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  await requireOperator();
  const mode = form.get('mode') === 'seeds' ? 'seeds' : 'search';
  const source = String(form.get('source') ?? '').trim().slice(0, 500);
  const target = String(form.get('target') ?? '').trim().slice(0, 1000) || DEFAULT_TARGET;
  if (!source) return { ok: false, message: mode === 'search' ? 'Add search words first.' : 'Add at least one account.' };
  container().outreach.startRun({ mode, source, target });
  revalidatePath('/find');
  return { ok: true, message: 'Run started.' };
}

export async function review(id: string, decision: 'approve' | 'reject' | 'restore', draft?: string): Promise<ActionResult> {
  await requireOperator();
  const { store } = container();
  const p = store.prospect(id);
  if (!p) return { ok: false, message: 'This person is no longer in the list.' };
  if (decision === 'approve') {
    const text = cleanDraft(draft ?? p.draft);
    if (!text) return { ok: false, message: 'The draft is empty.' };
    store.review(id, 'approved', text);
  } else {
    store.review(id, decision === 'reject' ? 'rejected' : 'needs_review');
  }
  revalidatePath('/');
  return { ok: true, message: decision === 'approve' ? 'Approved' : decision === 'reject' ? 'Skipped' : 'Back in review' };
}

export async function saveDraft(id: string, draft: string): Promise<ActionResult> {
  await requireOperator();
  container().store.review(id, container().store.prospect(id)?.status ?? 'needs_review', cleanDraft(draft));
  return { ok: true, message: 'Saved' };
}

export async function send(id: string): Promise<ActionResult> {
  await requireOperator();
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
  container().store.review(id, 'do_not_contact');
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
