import { NextResponse } from 'next/server';
import { container } from '@/server/web/container.ts';
import { setPkce } from '@/server/web/session.ts';
import { authorizeUrl } from '@/server/infra/x.ts';

export async function GET() {
  const { url, verifier, state } = authorizeUrl(container().cfg);
  const res = NextResponse.redirect(url);
  setPkce(res, state, verifier);
  return res;
}
