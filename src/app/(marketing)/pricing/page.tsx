import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { Container, Section } from '@/components/marketing/container';
import { SectionHeading } from '@/components/marketing/section-heading';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Simple, module-based pricing — start with one module or activate all four. No setup fees.',
  alternates: { canonical: '/pricing' },
  openGraph: { url: '/pricing' },
};

interface PricingTier {
  name: string;
  price: string;
  cadence?: string;
  description: string;
  features: string[];
  cta: { label: string; href: '/signup' | '/contact' };
  featured?: boolean;
}

const TIERS: PricingTier[] = [
  {
    name: 'Starter',
    price: '$99',
    cadence: '/month',
    description: 'For one team getting a single onboarding process off spreadsheets and email.',
    features: [
      '1 module of your choice',
      'Up to 100 active enrollments/month',
      'AI flow generation & the visual flow builder',
      'Content, Form, Task, and Approval steps',
      'Email support',
    ],
    cta: { label: 'Start free', href: '/signup' },
  },
  {
    name: 'Growth',
    price: '$349',
    cadence: '/month',
    description: 'For teams running onboarding across more than one part of the business.',
    features: [
      'Everything in Starter',
      'All 4 modules — Employee, Product, Client, Identity',
      'Unlimited active enrollments',
      'Cross-module triggers',
      'Identity verification (Persona, Veriff, or a mock provider)',
      'Priority support',
    ],
    cta: { label: 'Start free', href: '/signup' },
    featured: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For organizations that need platform-level control and a dedicated relationship.',
    features: [
      'Everything in Growth',
      'Super Admin dashboard & tenant management',
      'Custom SSO',
      'Custom identity-verification integrations',
      'Dedicated onboarding, support, and SLA',
    ],
    cta: { label: 'Contact sales', href: '/contact' },
  },
];

const QUICK_FAQ = [
  {
    question: 'Can I add or switch modules later?',
    answer:
      'Yes — modules can be activated or changed at any time from your plan settings, without a new contract.',
  },
  {
    question: 'What counts as an active enrollment?',
    answer:
      'One person or account currently moving through a flow, from enrollment until the flow completes or is withdrawn.',
  },
  {
    question: 'Is there a free trial?',
    answer:
      'Starter starts free for your first onboarding flow — no card required to see it working end to end.',
  },
];

export default function PricingPage() {
  return (
    <>
      <Section className="pt-16 pb-12 sm:pt-20">
        <Container size="narrow" className="text-center">
          <p className="font-display text-brand text-sm font-semibold tracking-widest uppercase">
            Pricing
          </p>
          <h1 className="font-display text-foreground mt-4 text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            Pricing that scales with your modules, not your headaches
          </h1>
          <p className="text-muted-foreground mx-auto mt-6 max-w-xl text-lg">
            Start with the one module you need today. No setup fees, no charge for seats — just the
            modules and volume you&rsquo;re actually using.
          </p>
        </Container>
      </Section>

      <Section className="pt-0">
        <Container>
          <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={cn(
                  'shadow-soft-sm flex flex-col rounded-xl border p-8',
                  tier.featured
                    ? 'border-brand bg-card shadow-soft-lg lg:-my-4 lg:py-12'
                    : 'border-border bg-card',
                )}
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-foreground text-xl font-semibold">
                    {tier.name}
                  </h2>
                  {tier.featured ? <Badge variant="brand">Most popular</Badge> : null}
                </div>
                <p className="text-muted-foreground mt-2 text-sm">{tier.description}</p>
                <p className="mt-6">
                  <span className="font-display text-foreground text-4xl font-bold tracking-tight">
                    {tier.price}
                  </span>
                  {tier.cadence ? (
                    <span className="text-muted-foreground">{tier.cadence}</span>
                  ) : null}
                </p>
                <Link
                  href={tier.cta.href}
                  className={cn(
                    buttonVariants({ variant: tier.featured ? 'primary' : 'outline', size: 'lg' }),
                    'mt-6 w-full',
                  )}
                >
                  {tier.cta.label}
                </Link>
                <ul className="mt-8 space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <Check aria-hidden="true" className="text-brand mt-0.5 h-4 w-4 shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="text-muted-foreground mt-6 text-center text-xs">
            Pricing shown is illustrative while we finalize our rates —{' '}
            <Link href="/contact" className="underline hover:no-underline">
              contact us
            </Link>{' '}
            for current numbers.
          </p>
        </Container>
      </Section>

      <Section variant="muted">
        <Container size="narrow">
          <SectionHeading heading="A few quick questions" align="center" />
          <dl className="mt-10 space-y-8">
            {QUICK_FAQ.map((item) => (
              <div key={item.question}>
                <dt className="font-display text-foreground text-base font-semibold">
                  {item.question}
                </dt>
                <dd className="text-muted-foreground mt-1.5">{item.answer}</dd>
              </div>
            ))}
          </dl>
          <Link
            href="/faq"
            className="text-brand mt-8 flex items-center justify-center gap-1.5 text-sm font-medium hover:underline"
          >
            Read the full FAQ
            <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
          </Link>
        </Container>
      </Section>

      <Section variant="inverse">
        <Container className="text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Still deciding which tier fits?
          </h2>
          <p className="text-inverse-muted-foreground mx-auto mt-4 max-w-xl text-balance">
            Start free on one module — you can always add more, or talk to us about Growth or
            Enterprise.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/signup" className={cn(buttonVariants({ variant: 'primary', size: 'lg' }))}>
              Start free
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'lg' }),
                'border-inverse-border text-inverse-foreground hover:bg-inverse-foreground/10',
              )}
            >
              Contact sales
            </Link>
          </div>
        </Container>
      </Section>
    </>
  );
}
