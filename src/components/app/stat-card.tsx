import type { LucideIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | undefined;
  isLoading: boolean;
  isError: boolean;
}

export function StatCard({ icon: Icon, label, value, isLoading, isError }: StatCardProps) {
  return (
    <div className="border-border bg-card shadow-soft-sm rounded-lg border p-6">
      <div className="flex items-center gap-3">
        <span className="bg-accent text-accent-foreground inline-flex h-10 w-10 items-center justify-center rounded-md">
          <Icon aria-hidden="true" className="h-5 w-5" />
        </span>
        <p className="text-muted-foreground text-sm font-medium">{label}</p>
      </div>
      <div className="mt-4">
        {isLoading ? (
          <Skeleton className="h-9 w-16" />
        ) : isError ? (
          <p className="text-destructive text-sm">Couldn&rsquo;t load</p>
        ) : (
          <p className="font-display text-foreground text-3xl font-bold">{value}</p>
        )}
      </div>
    </div>
  );
}
