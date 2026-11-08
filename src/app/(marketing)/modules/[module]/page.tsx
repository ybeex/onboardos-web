import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Check } from 'lucide-react';
import { Container, Section } from '@/components/marketing/container';
import { StepBadgeList } from '@/components/marketing/step-badge-list';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MODULES, getModuleBySlug } from '@/lib/marketing/modules';
import { cn } from '@/lib/utils';

export function generateStaticParams(): { module: string }[] {
  return MODULES.map((moduleDefinition) => ({ module: moduleDefinition.slug }));
}

// A fixed set of four modules, not user-generated content — any slug
// outside generateStaticParams should 404 cleanly, not attempt a
// dynamic render.
export const dynamicParams = false;

interface ModulePageParams {
  module: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<ModulePageParams>;
}): Promise<Metadata> {
  const { module: slug } = await params;
  const moduleDefinition = getModuleBySlug(slug);
  if (!moduleDefinition) return {};

  return {
    title: moduleDefinition.name,
    description: moduleDefinition.description,
    alternates: { canonical: `/modules/${moduleDefinition.slug}` },
    openGraph: { url: `/modules/${moduleDefinition.slug}` },
  };
}

export default async function ModuleDetailPage({ params }: { params: Promise<ModulePageParams> }) {
  const { module: slug } = await params;
  const moduleDefinition = getModuleBySlug(slug);
  if (!moduleDefinition) notFound();

  const otherModules = MODULES.filter((candidate) => candidate.slug !== moduleDefinition.slug);
  const Icon = moduleDefinition.icon;

  return (
    <>
      <Section className="pt-16 pb-12 sm:pt-20">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-start lg:gap-16">
            <div>
              <span className="bg-accent text-accent-foreground inline-flex h-12 w-12 items-center justify-center rounded-md">
                <Icon aria-hidden="true" className="h-6 w-6" />
              </span>
              <p className="font-display text-brand mt-4 text-sm font-semibold tracking-widest uppercase">
                {moduleDefinition.name} module
              </p>
              <h1 className="font-display text-foreground mt-2 text-4xl font-bold tracking-tight text-balance sm:text-5xl">
                {moduleDefinition.tagline}
              </h1>
              <p className="text-muted-foreground mt-6 text-lg">{moduleDefinition.description}</p>

              <ul className="mt-8 space-y-3">
                {moduleDefinition.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-3">
                    <Check aria-hidden="true" className="text-brand mt-0.5 h-5 w-5 shrink-0" />
                    <span className="text-foreground">{highlight}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/signup"
                  className={cn(buttonVariants({ variant: 'primary', size: 'lg' }))}
                >
                  Start free
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
                <Link
                  href="/pricing"
                  className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}
                >
                  See pricing
                </Link>
              </div>
            </div>

            <div className="border-border bg-card shadow-soft-lg overflow-hidden rounded-xl border">
              <div className="border-border bg-muted/60 flex items-center justify-between border-b px-4 py-3">
                <span className="font-display text-muted-foreground text-xs font-semibold">
                  Example flow
                </span>
                <Badge variant="neutral">
                  Enrolls: {moduleDefinition.entityType === 'PERSON' ? 'People' : 'Accounts'}
                </Badge>
              </div>
              <div className="p-5 sm:p-6">
                <StepBadgeList steps={moduleDefinition.exampleSteps} />
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section variant="muted">
        <Container>
          <p className="font-display text-brand text-sm font-semibold tracking-widest uppercase">
            Other modules
          </p>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {otherModules.map((candidate) => (
              <Link
                key={candidate.slug}
                href={`/modules/${candidate.slug}`}
                className="group border-border bg-card shadow-soft-sm ease-soft hover:shadow-soft-md flex items-center gap-3 rounded-lg border p-5 transition-all duration-150 hover:-translate-y-0.5"
              >
                <span className="bg-accent text-accent-foreground inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md">
                  <candidate.icon aria-hidden="true" className="h-5 w-5" />
                </span>
                <span>
                  <span className="font-display text-foreground block text-sm font-semibold">
                    {candidate.name}
                  </span>
                  <span className="text-brand mt-0.5 flex items-center gap-1 text-xs font-medium">
                    Explore
                    <ArrowRight
                      aria-hidden="true"
                      className="ease-soft h-3 w-3 transition-transform duration-150 group-hover:translate-x-0.5"
                    />
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      <Section variant="inverse">
        <Container className="text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Start with {moduleDefinition.name}
          </h2>
          <p className="text-inverse-muted-foreground mx-auto mt-4 max-w-xl text-balance">
            Activate one module today and add the rest whenever you need them.
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
