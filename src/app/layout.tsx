import type { ReactNode } from 'react';
import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Space_Grotesk } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { PageTransition } from '@/components/page-transition';
import { AuthProvider } from '@/lib/auth/auth-provider';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001';

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'OnboardOS — Onboarding, unified',
    template: '%s | OnboardOS',
  },
  description:
    'One platform for every onboarding journey — employees, product signups, client implementations, and identity verification. Describe a flow in plain English and OnboardOS builds it.',
  openGraph: {
    type: 'website',
    siteName: 'OnboardOS',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
  },
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/apple-icon.png',
  },
};

/**
 * The one deliberate exception to this project's zero-hardcoded-color
 * rule: `viewport.themeColor` is read by the OS browser chrome (the
 * Android status bar, some iOS contexts) as a `<meta>` tag, before any
 * of the app's own CSS has necessarily loaded — it cannot reference a
 * CSS custom property, since there is no guarantee the stylesheet
 * defining that property has been parsed yet at the point the OS reads
 * this tag. These two values are kept in manual sync with
 * globals.css's `--background` token (light: `--palette-white`, dark:
 * `--palette-navy-950`) — update both places together if that token
 * ever changes.
 */
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0d1220' },
  ],
};

export interface RootLayoutProps {
  children: ReactNode;
}

/**
 * `suppressHydrationWarning` on `<html>` is required by next-themes, not
 * optional — next-themes' own blocking inline script sets the `class`
 * attribute on `<html>` before React hydrates (specifically to avoid a
 * flash of the wrong theme), which would otherwise trigger a hydration
 * mismatch warning for a change React didn't make itself.
 */
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable} ${spaceGrotesk.variable}`}
    >
      <body className="font-sans antialiased">
        <ThemeProvider>
          <AuthProvider>
            <PageTransition>{children}</PageTransition>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
