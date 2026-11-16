import type { ProspectView } from '@/server/web/views.ts';
import { Avatar } from '../atoms/Avatar.tsx';
import { relative } from '../lib/time.ts';
import styles from './ProspectRow.module.css';

function meta(p: ProspectView): string {
  if (p.send?.repliedAt) return `Replied ${relative(p.send.repliedAt)}`;
  if (p.send?.state === 'sent' && p.send.sentAt) return `Sent ${relative(p.send.sentAt)}`;
  if (p.send?.state === 'unknown') return 'Not confirmed';
  if (p.send?.state === 'failed') return 'Refused by X';
  if (p.status === 'no_fit') return 'Not a fit';
  if (p.status === 'do_not_contact') return 'Do not contact';
  if (p.status === 'rejected') return 'Skipped';
  if (p.status === 'approved') return 'Approved';
  return p.fit === 'strong' ? 'Strong fit' : 'Possible fit';
}

export function ProspectRow({ p, selected, onSelect }: { p: ProspectView; selected: boolean; onSelect: () => void }) {
  return (
    <li>
      <button className={`${styles.row} arrive`} aria-current={selected || undefined} onClick={onSelect}>
        <Avatar name={p.name} />
        <span className={styles.body}>
          <span className={styles.top}>
            <span className={styles.name}>{p.name}</span>
            <span className={`${styles.meta} caption`}>{meta(p)}</span>
          </span>
          <span className={styles.line}>{p.reasons[0]?.claim || p.bio || `@${p.username}`}</span>
        </span>
      </button>
    </li>
  );
}
