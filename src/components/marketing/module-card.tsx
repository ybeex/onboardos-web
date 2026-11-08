import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { ModuleDefinition } from '@/lib/marketing/modules';

export interface ModuleCardProps {
  module: ModuleDefinition;
}

export function ModuleCard({ module: moduleDefinition }: ModuleCardProps) {
  const Icon = moduleDefinition.icon;

  return (
    <Link
      href={`/modules/${moduleDefinition.slug}`}
      className="group border-border bg-card shadow-soft-sm ease-soft hover:shadow-soft-md flex flex-col rounded-lg border p-6 transition-all duration-150 hover:-translate-y-0.5"
    >
      <span className="bg-accent text-accent-foreground inline-flex h-11 w-11 items-center justify-center rounded-md">
        <Icon aria-hidden="true" className="h-5 w-5" />
      </span>
      <h3 className="font-display text-foreground mt-4 text-lg font-semibold">
        {moduleDefinition.name}
      </h3>
      <p className="text-muted-foreground mt-1.5 flex-1 text-sm">{moduleDefinition.tagline}</p>
      <span className="text-brand mt-4 inline-flex items-center gap-1 text-sm font-medium">
        Explore {moduleDefinition.name.toLowerCase()}
        <ArrowRight
          aria-hidden="true"
          className="ease-soft h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5"
        />
      </span>
    </Link>
  );
}
