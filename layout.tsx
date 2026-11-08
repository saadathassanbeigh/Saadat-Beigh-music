import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SADAT BEIGH | Music',
  description: 'Official music and releases by Sadat Beigh.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
