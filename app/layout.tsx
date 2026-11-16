import type { Metadata } from 'next';
import { Inter, Source_Serif_4 } from 'next/font/google';
import './globals.css';

const serif = Source_Serif_4({ subsets: ['latin', 'vietnamese'], variable: '--font-serif', display: 'swap' });
const sans = Inter({ subsets: ['latin', 'vietnamese'], variable: '--font-sans', display: 'swap' });

export const metadata: Metadata = { title: 'Outreach', robots: { index: false, follow: false } };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
