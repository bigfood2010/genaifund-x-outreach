const UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ['day', 86_400_000], ['hour', 3_600_000], ['minute', 60_000], ['second', 1000],
];

const fmt = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

export function relative(iso: string, now = Date.now()): string {
  const diff = Date.parse(iso) - now;
  if (Number.isNaN(diff)) return '';
  for (const [unit, ms] of UNITS) {
    if (Math.abs(diff) >= ms || unit === 'second') return fmt.format(Math.round(diff / ms), unit);
  }
  return '';
}

export function gap(fromIso: string, toIso: string): string {
  const ms = Date.parse(toIso) - Date.parse(fromIso);
  if (Number.isNaN(ms)) return '';
  const s = Math.max(0, Math.floor(ms / 1000));
  const [n, unit] = s < 60 ? [s, 'second'] : s < 3600 ? [Math.floor(s / 60), 'minute'] : s < 86_400 ? [Math.floor(s / 3600), 'hour'] : [Math.floor(s / 86_400), 'day'];
  return `${n} ${unit}${n === 1 ? '' : 's'}`;
}
