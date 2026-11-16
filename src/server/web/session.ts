import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { NextRequest, NextResponse } from 'next/server';
import { sign, unsign } from '../infra/crypto.ts';
import { container } from './container.ts';

const SESSION = 'session';
const PKCE = 'pkce';
const MAX_AGE = 60 * 60 * 12;
const PKCE_PATH = '/callback';

function cookieOptions(path: string, maxAge: number) {
  return { httpOnly: true, sameSite: 'lax' as const, secure: container().cfg.baseUrl.startsWith('https'), path, maxAge };
}

export function setPkce(res: NextResponse, state: string, verifier: string) {
  res.cookies.set(PKCE, sign(container().cfg.sessionSecret, `${state}.${verifier}`), cookieOptions(PKCE_PATH, 600));
}

export function readPkce(req: NextRequest): { state: string; verifier: string } | null {
  const saved = unsign(container().cfg.sessionSecret, req.cookies.get(PKCE)?.value);
  const dot = saved?.indexOf('.') ?? -1;
  return saved && dot >= 0 ? { state: saved.slice(0, dot), verifier: saved.slice(dot + 1) } : null;
}

export function clearPkce(res: NextResponse) {
  res.cookies.delete({ name: PKCE, path: PKCE_PATH });
}

export async function startSession(xUserId: string) {
  const { cfg } = container();
  (await cookies()).set(SESSION, sign(cfg.sessionSecret, `${xUserId}:${Date.now() + MAX_AGE * 1000}`), cookieOptions('/', MAX_AGE));
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
