import { requireOperator } from '@/server/web/session.ts';
import { container } from '@/server/web/container.ts';
import { prospectViews } from '@/server/web/views.ts';
import { ReviewWorkspace } from '@/ui/organisms/ReviewWorkspace.tsx';

export default async function ReviewPage() {
  await requireOperator();
  const { store, cfg } = container();
  return (
    <ReviewWorkspace items={prospectViews(store, cfg)} />
  );
}
