import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalDocument, LegalSection } from '@/components/marketing/legal-document';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'The cookies OnboardOS uses, and the ones it doesn’t.',
  alternates: { canonical: '/legal/cookies' },
  openGraph: { url: '/legal/cookies' },
  robots: { index: true, follow: true },
};

export default function CookiePolicyPage() {
  return (
    <LegalDocument title="Cookie Policy" lastUpdated="October 2026">
      <LegalSection heading="1. What cookies are">
        <p>
          Cookies are small text files a site stores in your browser. This policy covers what
          OnboardOS actually sets — it’s short, because we don’t use very many.
        </p>
      </LegalSection>

      <LegalSection heading="2. The cookies we use">
        <p>OnboardOS sets two essential cookies, both required for the Service to work:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <span className="text-foreground font-medium">Session cookie</span> — an{' '}
            <span className="text-foreground font-medium">httpOnly</span> cookie used to keep you
            signed in. Set for every signed-in user.
          </li>
          <li>
            <span className="text-foreground font-medium">Impersonation marker</span> — an{' '}
            <span className="text-foreground font-medium">httpOnly</span> cookie set only during a
            support session where an authorized OnboardOS team member is temporarily accessing a
            tenant user’s account (see our{' '}
            <Link href="/legal/privacy" className="text-brand hover:underline">
              Privacy Policy
            </Link>
            ). It carries no personal data — just a marker confirming such a session is active — and
            expires automatically when that session ends.
          </li>
        </ul>
        <p className="mt-3">
          Neither is accessible to page scripts, and neither is used for advertising or cross-site
          tracking.
        </p>
      </LegalSection>

      <LegalSection heading="3. What we don’t use cookies for">
        <p>
          We don’t use third-party advertising or tracking cookies. Your theme preference (light,
          dark, or system) is stored in your browser’s local storage, not a cookie, and never leaves
          your device.
        </p>
      </LegalSection>

      <LegalSection heading="4. Managing cookies">
        <p>
          Most browsers let you view and delete cookies through their settings. Because the session
          cookie is required to stay signed in, removing it will simply sign you out.
        </p>
      </LegalSection>

      <LegalSection heading="5. Changes to this policy">
        <p>
          If what we set ever changes, we’ll update this page and the “Last updated” date above. For
          more on how we handle information generally, see our{' '}
          <Link href="/legal/privacy" className="text-brand hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
