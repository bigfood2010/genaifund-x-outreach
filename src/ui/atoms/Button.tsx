import type { ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'filled' | 'ghost' | 'text'; pending?: boolean };

export function Button({ variant = 'filled', pending = false, className, disabled, children, ...rest }: Props) {
  return (
    <button
      {...rest}
      className={[styles.button, styles[variant], className].filter(Boolean).join(' ')}
      disabled={disabled || pending}
      aria-busy={pending || undefined}
      data-pending={pending || undefined}
    >
      {children}
    </button>
  );
}
