import { requireOperator } from '@/server/session.ts';
import { container } from '@/server/container.ts';
import { prospectViews } from '@/server/views.ts';
import { ReviewWorkspace } from '@/ui/organisms/ReviewWorkspace.tsx';

export default async function ReviewPage() {
  await requireOperator();
  const { store, cfg } = container();
  return (
    <ReviewWorkspace items={prospectViews(store, cfg)} liveSending={cfg.liveSending}
      testRecipients={cfg.testRecipients} noReplyHours={cfg.noReplyHours} />
  );
}
