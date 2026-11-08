import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalDocument, LegalSection } from '@/components/marketing/legal-document';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms that govern use of the OnboardOS platform.',
  alternates: { canonical: '/legal/terms' },
  openGraph: { url: '/legal/terms' },
  robots: { index: true, follow: true },
};

export default function TermsOfServicePage() {
  return (
    <LegalDocument title="Terms of Service" lastUpdated="August 2026">
      <LegalSection heading="1. Acceptance of terms">
        <p>
          These Terms of Service (“Terms”) govern access to and use of OnboardOS (the “Service”). By
          creating a tenant account or otherwise using the Service, you agree to these Terms on
          behalf of yourself and, if applicable, the organization you represent.
        </p>
      </LegalSection>

      <LegalSection heading="2. Description of service">
        <p>
          OnboardOS is a multi-tenant onboarding platform that lets a tenant build, run, and track
          onboarding flows across the Employee, Product, Client, and Identity modules, including
          flows generated with the assistance of AI and edited through a visual builder.
        </p>
      </LegalSection>

      <LegalSection heading="3. Accounts and tenants">
        <p>
          A “tenant” is an isolated organization account. Tenant administrators are responsible for
          the accuracy of information they configure, for the conduct of users they invite into
          their tenant, and for the accounts and content within their tenant. You’re responsible for
          maintaining the confidentiality of your credentials and for activity under your account.
        </p>
      </LegalSection>

      <LegalSection heading="4. Acceptable use">
        <p>You agree not to use the Service to:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Violate applicable law, or the rights of any third party;</li>
          <li>Upload or process data you don’t have the right to process;</li>
          <li>Attempt to access another tenant’s data, or circumvent tenant isolation;</li>
          <li>Interfere with or disrupt the integrity or performance of the Service; or</li>
          <li>Reverse-engineer the Service except where applicable law permits it.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="5. Fees and billing">
        <p>
          Fees depend on the plan and modules a tenant selects, as described on our{' '}
          <Link href="/pricing" className="text-brand hover:underline">
            Pricing page
          </Link>
          . We may change our fees, with notice, for future billing periods. Fees are non-refundable
          except where required by law or expressly stated otherwise.
        </p>
      </LegalSection>

      <LegalSection heading="6. Intellectual property">
        <p>
          OnboardOS retains all rights in the Service itself, including its software, design, and
          branding. These Terms don’t grant you any rights to our intellectual property beyond the
          right to use the Service as permitted here.
        </p>
      </LegalSection>

      <LegalSection heading="7. Your data">
        <p>
          As between you and OnboardOS, a tenant retains ownership of the onboarding data it
          configures and collects through the Service. We process that data to provide the Service,
          as described in our{' '}
          <Link href="/legal/privacy" className="text-brand hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection heading="8. Third-party services">
        <p>
          Certain features rely on third-party providers — for example, identity verification
          through Persona or Veriff when the Identity module is active. Use of those features is
          also subject to the applicable provider’s own terms.
        </p>
      </LegalSection>

      <LegalSection heading="9. Disclaimers and limitation of liability">
        <p>
          The Service is provided “as is” without warranties of any kind, to the extent permitted by
          law. To the maximum extent permitted by applicable law, OnboardOS will not be liable for
          indirect, incidental, or consequential damages arising from use of the Service.
        </p>
      </LegalSection>

      <LegalSection heading="10. Termination">
        <p>
          You may stop using the Service and close your tenant account at any time. We may suspend
          or terminate access for a material breach of these Terms, with notice where reasonably
          practicable.
        </p>
      </LegalSection>

      <LegalSection heading="11. Governing law">
        <p>
          These Terms are governed by the laws of [Governing Law / Jurisdiction — to be finalized].
        </p>
      </LegalSection>

      <LegalSection heading="12. Changes to these terms">
        <p>
          We may update these Terms from time to time. If we make material changes, we’ll update the
          “Last updated” date above and, where appropriate, provide additional notice.
        </p>
      </LegalSection>

      <LegalSection heading="13. Contact">
        <p>
          Questions about these Terms can be sent through our{' '}
          <Link href="/contact" className="text-brand hover:underline">
            Contact page
          </Link>
          .
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
