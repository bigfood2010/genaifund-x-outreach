import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { container } from './container.ts';
import { sign, unsign } from './crypto.ts';

const SESSION = 'session';
const MAX_AGE = 60 * 60 * 12;

export async function startSession(xUserId: string) {
  const { cfg } = container();
  (await cookies()).set(SESSION, sign(cfg.sessionSecret, `${xUserId}:${Date.now() + MAX_AGE * 1000}`), {
    httpOnly: true, sameSite: 'lax', secure: cfg.baseUrl.startsWith('https'), path: '/', maxAge: MAX_AGE,
  });
}

export async function endSession() {
  (await cookies()).delete(SESSION);
}

export async function currentOperator(): Promise<{ id: string; username: string } | null> {
  const { cfg, store } = container();
  const value = unsign(cfg.sessionSecret, (await cookies()).get(SESSION)?.value);
  const [id, expires] = value?.split(':') ?? [];
  const account = store.getAccount();
  if (!id || Number(expires) < Date.now() || !account || account.x_user_id !== id) return null;
  return { id, username: account.username };
}

export async function requireOperator() {
  const op = await currentOperator();
  if (!op) redirect('/connect');
  return op;
}
