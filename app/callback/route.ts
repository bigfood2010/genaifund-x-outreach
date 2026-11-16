import { NextResponse, type NextRequest } from 'next/server';
import { container } from '@/server/container.ts';
import { unsign } from '@/server/crypto.ts';
import { startSession } from '@/server/session.ts';

function back(req: NextRequest, error: string) {
  const res = NextResponse.redirect(new URL(`/connect?error=${encodeURIComponent(error)}`, container().cfg.baseUrl));
  res.cookies.delete('pkce');
  return res;
}

export async function GET(req: NextRequest) {
  const { cfg, x } = container();
  const q = req.nextUrl.searchParams;
  if (q.get('error')) return back(req, 'denied');
  const saved = unsign(cfg.sessionSecret, req.cookies.get('pkce')?.value);
  const dot = saved?.indexOf('.') ?? -1;
  if (!saved || dot < 0 || saved.slice(0, dot) !== q.get('state') || !q.get('code')) return back(req, 'state');
  try {
    const me = await x.connect(q.get('code')!, saved.slice(dot + 1));
    if (!me) return back(req, 'not-allowed');
    await startSession(me.id);
  } catch {
    return back(req, 'exchange');
  }
  const res = NextResponse.redirect(new URL('/', cfg.baseUrl));
  res.cookies.delete('pkce');
  return res;
}
