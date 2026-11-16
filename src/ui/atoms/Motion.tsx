'use client';

import { LottieSvg } from 'lottie-react';
import { useSyncExternalStore } from 'react';
import check from '../lottie/check.json';
import scan from '../lottie/scan.json';

const ANIMATIONS = { check, scan } as const;

const REDUCED = '(prefers-reduced-motion: reduce)';
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(REDUCED);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
};

export function Motion({ name, size, label }: { name: keyof typeof ANIMATIONS; size: [number, number]; label?: string }) {
  const reduced = useSyncExternalStore(subscribe, () => window.matchMedia(REDUCED).matches, () => true);
  if (reduced) return null;
  return (
    <LottieSvg src={ANIMATIONS[name]} loop={name === 'scan'} autoplay
      role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}
      style={{ width: size[0], height: size[1], flex: 'none' }} />
  );
}
