import type { XApiError } from './infra/x.ts';

export function explainXError(e: XApiError): string {
  if (e.status === 402) return 'X API credits are used up. Buy credits or raise the spend cap at console.x.com.';
  if (e.status === 429) return 'X rate limit reached. Wait for the window to reset and try again.';
  if (e.status === 401) return 'The X connection expired or was revoked. Connect the account again.';
  if (e.type.includes('dm-')) return `X refused this DM (${e.type.split('/').pop()}). The person may not accept DMs from you.`;
  return e.message;
}
