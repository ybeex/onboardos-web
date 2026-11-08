import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Container, Section } from '@/components/marketing/container';
import { ModuleCard } from '@/components/marketing/module-card';
import { buttonVariants } from '@/components/ui/button';
import { MODULES } from '@/lib/marketing/modules';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Modules',
  description:
    'Employee, Product, Client, and Identity — four onboarding contexts on one flow engine. Activate only what your team needs.',
  alternates: { canonical: '/modules' },
  openGraph: { url: '/modules' },
};

export default function ModulesPage() {
  return (
    <>
      <Section className="pt-16 pb-12 sm:pt-20">
        <Container size="narrow">
          <p className="font-display text-brand text-sm font-semibold tracking-widest uppercase">
            Modules
          </p>
          <h1 className="font-display text-foreground mt-4 text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            Four onboarding contexts. One flow engine.
          </h1>
          <p className="text-muted-foreground mt-6 text-lg">
            Every module runs on the same underlying data model — entities, flows, steps,
            enrollments. Activate one to start, or all four to give every team the same tools.
          </p>
        </Container>
      </Section>

      <Section className="pt-0">
        <Container>
          <div className="grid gap-6 sm:grid-cols-2">
            {MODULES.map((moduleDefinition) => (
              <ModuleCard key={moduleDefinition.slug} module={moduleDefinition} />
            ))}
          </div>
        </Container>
      </Section>

      <Section variant="inverse">
        <Container className="text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Not sure which modules you need?
          </h2>
          <p className="text-inverse-muted-foreground mx-auto mt-4 max-w-xl text-balance">
            Most teams start with one and add the rest as new onboarding needs show up.
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
              Talk it through with us
            </Link>
          </div>
        </Container>
      </Section>
    </>
  );
}
