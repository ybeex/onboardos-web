import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Container, Section } from '@/components/marketing/container';
import { SectionHeading } from '@/components/marketing/section-heading';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'About',
  description: "Why OnboardOS exists, and the principles behind how it's built.",
  alternates: { canonical: '/about' },
  openGraph: { url: '/about' },
};

const PRINCIPLES = [
  {
    title: 'One data model, not four products',
    description:
      "Employee, Product, Client, and Identity onboarding look different on the surface, but they're the same underlying problem: get an entity through a sequence of steps, reliably. We built one engine for that, not four disconnected tools wearing the same logo.",
  },
  {
    title: 'AI should draft, not decide',
    description:
      "AI flow generation gets you a fast, complete first draft — it doesn't publish anything on your behalf. Every flow is reviewable and editable before it ever runs, whether it started from a sentence or from a blank canvas.",
  },
  {
    title: "No-code shouldn't mean low-power",
    description:
      "Branches, cross-module triggers, manual review queues — the visual builder gets the same capability the underlying engine has. We'd rather build the power into the no-code layer than force you into custom code to get it.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Section className="pt-16 pb-12 sm:pt-20">
        <Container size="narrow">
          <p className="font-display text-brand text-sm font-semibold tracking-widest uppercase">
            About
          </p>
          <h1 className="font-display text-foreground mt-4 text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            Onboarding kept getting rebuilt. We think that&rsquo;s the wrong problem to solve four
            times.
          </h1>
        </Container>
      </Section>

      <Section className="pt-0">
        <Container size="narrow">
          <div className="text-muted-foreground space-y-6 text-lg">
            <p>
              Most companies end up building onboarding four separate times — once for new hires,
              once for new product accounts, once for client implementations, and once again
              wherever identity verification shows up. Each version reinvents the same things: a
              sequence of steps, a form here, an approval there, someone waiting on someone else.
            </p>
            <p>
              OnboardOS started from a simpler premise: those are the same problem wearing different
              clothes. One flow engine, one data model, and a single place to build, run, and watch
              every kind of onboarding your organization has — with AI to get the first draft of any
              flow done in minutes instead of a planning meeting.
            </p>
          </div>
        </Container>
      </Section>

      <Section variant="muted">
        <Container size="narrow">
          <SectionHeading eyebrow="How we build" heading="A few things we hold to" />
          <div className="mt-12 space-y-10">
            {PRINCIPLES.map((principle) => (
              <div key={principle.title}>
                <h3 className="font-display text-foreground text-xl font-semibold">
                  {principle.title}
                </h3>
                <p className="text-muted-foreground mt-2">{principle.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container size="narrow" className="text-center">
          <h2 className="font-display text-foreground text-2xl font-bold tracking-tight text-balance sm:text-3xl">
            Questions about where we&rsquo;re headed?
          </h2>
          <Link
            href="/contact"
            className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'mt-6')}
          >
            Get in touch
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </Container>
      </Section>
    </>
  );
}
