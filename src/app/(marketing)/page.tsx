import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Fingerprint, GitBranch, Workflow } from 'lucide-react';
import { Container, Section } from '@/components/marketing/container';
import { SectionHeading } from '@/components/marketing/section-heading';
import { ModuleCard } from '@/components/marketing/module-card';
import { StepTracker } from '@/components/marketing/step-tracker';
import { FlowGenerationShowcase } from '@/components/marketing/flow-generation-showcase';
import { buttonVariants } from '@/components/ui/button';
import { MODULES } from '@/lib/marketing/modules';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  openGraph: {
    url: '/',
  },
};

const HOW_IT_WORKS_TEASER = [
  {
    title: 'Describe it',
    description:
      'Tell OnboardOS what the onboarding should do, in plain English — no flowchart required to start.',
  },
  {
    title: 'Review the draft',
    description:
      'A real, structured flow comes back. Refine it conversationally until the shape is right.',
  },
  {
    title: 'Publish and enroll',
    description:
      'Materialize it as an editable flow, adjust anything by hand, then publish and start enrolling people.',
  },
];

const FEATURES = [
  {
    icon: GitBranch,
    title: 'Branches without code',
    description:
      'Conditional paths render as plain-language rows — "if Plan is Enterprise" — never a JSON box your team has to learn to read.',
  },
  {
    icon: Workflow,
    title: 'Flows that trigger flows',
    description:
      "When a client's onboarding completes, automatically enroll them in their first Product flow. No middleware, no cron job.",
  },
  {
    icon: Fingerprint,
    title: 'Verification that knows when to ask a human',
    description:
      'Real-time identity checks handle the clear cases. Anything uncertain lands in a manual review queue instead of a dead end.',
  },
];

export default function HomePage() {
  return (
    <>
      <Section as="div" className="pt-16 pb-16 sm:pt-20 sm:pb-20 lg:pt-28">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="font-display text-brand text-sm font-semibold tracking-widest uppercase">
                AI-assisted onboarding
              </p>
              <h1 className="font-display text-foreground mt-4 text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                Describe the onboarding you want. Watch it become a real flow.
              </h1>
              <p className="text-muted-foreground mt-6 max-w-xl text-lg">
                Employee, product, client, and identity onboarding — unified under one engine.
                Describe a flow in plain English, review what OnboardOS drafts, and publish
                something your team can actually run.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/signup"
                  className={cn(buttonVariants({ variant: 'primary', size: 'lg' }))}
                >
                  Start free
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
                <Link
                  href="/how-it-works"
                  className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}
                >
                  See how it works
                </Link>
              </div>
            </div>

            <div className="relative">
              <div
                aria-hidden="true"
                className="bg-brand/10 absolute -inset-8 -z-10 rounded-full blur-3xl"
              />
              <FlowGenerationShowcase />
            </div>
          </div>
        </Container>
      </Section>

      <Section variant="muted">
        <Container>
          <SectionHeading
            eyebrow="Modules"
            heading="Built for every kind of onboarding"
            description="One data model, one workflow engine, four contexts — activate only the modules your team actually needs."
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {MODULES.map((moduleDefinition) => (
              <ModuleCard key={moduleDefinition.slug} module={moduleDefinition} />
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container size="narrow">
          <SectionHeading
            eyebrow="How it works"
            heading="From a sentence to a working flow"
            description="The full lifecycle — drafting, refining, publishing, enrolling — covers a lot more ground than this. Here's the shortest version."
          />
          <div className="mt-12">
            <StepTracker steps={HOW_IT_WORKS_TEASER} />
          </div>
          <Link
            href="/how-it-works"
            className="text-brand mt-2 inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
          >
            See the full lifecycle
            <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
          </Link>
        </Container>
      </Section>

      <Section variant="muted">
        <Container>
          <SectionHeading
            eyebrow="Beyond the AI draft"
            heading="A no-code promise that actually holds up"
            description="AI-generated flows are a fast start, not the whole story — the underlying engine is built to be edited, branched, and connected by hand too."
          />
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {FEATURES.map((feature) => (
              <div key={feature.title}>
                <span className="bg-accent text-accent-foreground inline-flex h-11 w-11 items-center justify-center rounded-md">
                  <feature.icon aria-hidden="true" className="h-5 w-5" />
                </span>
                <h3 className="font-display text-foreground mt-4 text-lg font-semibold">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground mt-2 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section variant="inverse">
        <Container className="text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Ready to unify onboarding?
          </h2>
          <p className="text-inverse-muted-foreground mx-auto mt-4 max-w-xl text-balance">
            Start free with one module, or talk to us about rolling out all four across your
            organization.
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
