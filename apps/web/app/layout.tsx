import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EmoTrav — Travel how you feel',
  description: 'Adaptive travel planning shaped by your emotional state.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
