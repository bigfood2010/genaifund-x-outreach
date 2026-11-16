import { NextResponse, type NextRequest } from 'next/server';
import { container } from '@/server/web/container.ts';
import { clearPkce, readPkce, startSession } from '@/server/web/session.ts';

function back(error: string) {
  const res = NextResponse.redirect(new URL(`/connect?error=${encodeURIComponent(error)}`, container().cfg.baseUrl));
  clearPkce(res);
  return res;
}

export async function GET(req: NextRequest) {
  const { cfg, x } = container();
  const q = req.nextUrl.searchParams;
  if (q.get('error')) return back('denied');
  const saved = readPkce(req);
  const code = q.get('code');
  if (!saved || saved.state !== q.get('state') || !code) return back('state');
  try {
    const me = await x.connect(code, saved.verifier);
    if (!me) return back('not-allowed');
    await startSession(me.id);
  } catch {
    return back('exchange');
  }
  const res = NextResponse.redirect(new URL('/', cfg.baseUrl));
  clearPkce(res);
  return res;
}
