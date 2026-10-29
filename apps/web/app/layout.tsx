import type { Metadata } from 'next';
import { Source_Serif_4, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const serif = Source_Serif_4({
  variable: '--font-serif',
  subsets: ['latin'],
  display: 'swap',
});

const sans = IBM_Plex_Sans({
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

const mono = IBM_Plex_Mono({
  variable: '--font-mono',
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Airlock — Pre-execution Gateway for AI Agents',
  description: 'Deterministic policy inspection, script gating, and immutable audit logs for MCP tools.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${mono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-[#fbfaf8] text-[#1c1917] selection:bg-[#fde68a]">
        {children}
      </body>
    </html>
  );
}
