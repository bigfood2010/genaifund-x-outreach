export type Segment = { text: string; quote: string | null };

export function segment(text: string, quotes: string[]): Segment[] {
  const ranges: Array<{ start: number; end: number; quote: string }> = [];
  for (const quote of new Set(quotes.filter((q) => q.trim()))) {
    const start = text.indexOf(quote);
    if (start < 0) continue;
    const end = start + quote.length;
    if (ranges.some((r) => start < r.end && end > r.start)) continue;
    ranges.push({ start, end, quote });
  }
  ranges.sort((a, b) => a.start - b.start);
  const out: Segment[] = [];
  let at = 0;
  for (const r of ranges) {
    if (r.start > at) out.push({ text: text.slice(at, r.start), quote: null });
    out.push({ text: text.slice(r.start, r.end), quote: r.quote });
    at = r.end;
  }
  if (at < text.length) out.push({ text: text.slice(at), quote: null });
  return out;
}
