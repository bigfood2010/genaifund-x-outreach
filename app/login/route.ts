import { NextResponse } from 'next/server';
import { container } from '@/server/container.ts';
import { sign } from '@/server/crypto.ts';
import { authorizeUrl } from '@/server/x.ts';

export async function GET() {
  const { cfg } = container();
  const { url, verifier, state } = authorizeUrl(cfg);
  const res = NextResponse.redirect(url);
  res.cookies.set('pkce', sign(cfg.sessionSecret, `${state}.${verifier}`), {
    httpOnly: true, sameSite: 'lax', secure: cfg.baseUrl.startsWith('https'), path: '/callback', maxAge: 600,
  });
  return res;
}
