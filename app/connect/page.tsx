import { redirect } from 'next/navigation';
import { currentOperator } from '@/server/web/session.ts';
import { ConnectPanel } from '@/ui/organisms/ConnectPanel.tsx';

export const dynamic = 'force-dynamic';

const ERRORS: Record<string, string> = {
  denied: 'X access was not granted. Nothing was connected.',
  state: 'The sign-in link expired or was opened twice. Start again.',
  exchange: 'X did not finish the sign-in. Check the app keys and callback URL, then start again.',
  'not-allowed': 'This X account is not on the operator list (ALLOWED_OPERATORS).',
};

export default async function ConnectPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await currentOperator()) redirect('/');
  const { error } = await searchParams;
  return <ConnectPanel error={error ? ERRORS[error] ?? 'Sign-in failed. Start again.' : null} />;
}
