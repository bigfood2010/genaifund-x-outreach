'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './NavLink.module.css';

export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const active = usePathname() === href;
  return <Link href={href} className={styles.link} aria-current={active ? 'page' : undefined}>{children}</Link>;
}
