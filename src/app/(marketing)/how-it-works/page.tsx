import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Container, Section } from '@/components/marketing/container';
import { SectionHeading } from '@/components/marketing/section-heading';
import { StepTracker } from '@/components/marketing/step-tracker';
import { FlowGenerationShowcase } from '@/components/marketing/flow-generation-showcase';
import { buttonVariants } from '@/components/ui/button';
import { MODULES } from '@/lib/marketing/modules';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'How it works',
  description:
    'From a plain-English description to a published, enrollable flow — the full OnboardOS lifecycle: describe, review, refine, materialize, customize, publish.',
  alternates: { canonical: '/how-it-works' },
  openGraph: { url: '/how-it-works' },
};

const LIFECYCLE_STEPS = [
  {
    title: 'Describe your flow in plain English',
    description:
      "Pick a module and describe the onboarding you want, the way you'd explain it to someone on your team. No flowchart or step-by-step spec required to get started.",
  },
  {
    title: 'Review what comes back',
    description:
      'OnboardOS returns a complete, structured draft — real step types, real branches, nothing hand-waved. If the first pass needs a fix, it repairs itself automatically, and tells you when it did.',
  },
  {
    title: 'Refine it conversationally',
    description:
      'Not quite right? Say what to change and get back a new, complete version. No draft is precious — every refinement replaces the last one rather than patching around it.',
  },
  {
    title: 'Materialize it as a real flow',
    description:
      "When it's ready, one action turns the draft into an actual flow in your account — reviewable and editable, nothing left behind in a sandbox.",
  },
  {
    title: 'Adjust anything by hand',
    description:
      "Drop into the visual builder to reorder steps, edit a form's fields, or rewrite a branch condition — the same no-code editor whether a flow started from AI or from scratch.",
  },
  {
    title: 'Publish and enroll',
    description:
      "Publish when it's ready. Every person or account you enroll after that moves through the exact flow you built, with progress you can watch as it happens.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <Section className="pt-16 pb-12 sm:pt-20">
        <Container size="narrow">
          <p className="font-display text-brand text-sm font-semibold tracking-widest uppercase">
            How it works
          </p>
          <h1 className="font-display text-foreground mt-4 text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            From a sentence to a flow your team can run
          </h1>
          <p className="text-muted-foreground mt-6 text-lg">
            Every flow in OnboardOS — however it started — ends up in the same place: a real,
            versioned, editable sequence of steps. Here&rsquo;s the full path from a plain-English
            description to something people actually move through.
          </p>
        </Container>
      </Section>

      <Section className="pt-0">
        <Container size="narrow">
          <StepTracker steps={LIFECYCLE_STEPS} />
        </Container>
      </Section>

      <Section variant="muted">
        <Container>
          <SectionHeading
            eyebrow="See it in action"
            heading="The same generator, right here"
            description="This is the exact drafting step from above — a plain-English description in, a structured flow out."
          />
          <div className="mx-auto mt-12 max-w-xl">
            <FlowGenerationShowcase />
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
            <div>
              <SectionHeading
                eyebrow="One engine, four contexts"
                heading="Employee, Product, Client, and Identity aren't four products"
                description="They're the same flow engine and the same data model, pointed at four different contexts. A branch condition, a form field, a manual review queue — every capability works identically no matter which module it's activated in."
              />
              <Link
                href="/modules"
                className="text-brand mt-6 inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
              >
                Explore the four modules
                <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {MODULES.map((moduleDefinition) => (
                <Link
                  key={moduleDefinition.slug}
                  href={`/modules/${moduleDefinition.slug}`}
                  className="border-border bg-card shadow-soft-sm ease-soft hover:shadow-soft-md flex flex-col items-start gap-3 rounded-lg border p-5 transition-all duration-150 hover:-translate-y-0.5"
                >
                  <span className="bg-accent text-accent-foreground inline-flex h-10 w-10 items-center justify-center rounded-md">
                    <moduleDefinition.icon aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <span className="font-display text-foreground text-sm font-semibold">
                    {moduleDefinition.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <Section variant="inverse">
        <Container className="text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            See it with your own onboarding
          </h2>
          <p className="text-inverse-muted-foreground mx-auto mt-4 max-w-xl text-balance">
            Start free and describe the first flow you actually need — no sample data required.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/signup" className={cn(buttonVariants({ variant: 'primary', size: 'lg' }))}>
              Start free
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </Container>
      </Section>
    </>
  );
}
