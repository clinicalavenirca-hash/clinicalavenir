import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import { Inter, Plus_Jakarta_Sans, Instrument_Serif } from 'next/font/google';
import './globals.css';
import { ToastHost } from '@/components/ui/Toast';
import { RouteProgress } from '@/components/ui/RouteProgress';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap'
});
const display = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
  display: 'swap'
});
const serif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'Avenir — Career programs for pharmacy & life-sciences graduates',
  description: 'Avenir runs career programs in Pharmacovigilance, Regulatory Affairs, Clinical Research, and Clinical Data Management for graduates entering the Canadian market.',
  icons: { icon: '/favicon.jpg' }
};

export const viewport: Viewport = {
  themeColor: '#05070D',
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${display.variable} ${serif.variable}`}>
      <body>
        <Suspense fallback={null}>
          <RouteProgress />
        </Suspense>
        {children}
        <ToastHost />
      </body>
    </html>
  );
}
