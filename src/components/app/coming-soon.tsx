import type { LucideIcon } from 'lucide-react';

export interface ComingSoonProps {
  icon: LucideIcon;
  title: string;
  description: string;
  /** Omit when no specific milestone is assigned yet (e.g. Settings isn't numbered anywhere in BUILD_PLAN.md's roadmap) — shows generic phrasing instead of a fabricated number. */
  milestone?: string;
}

/**
 * Shared by every `(app)` route the sidebar/command palette link to
 * but no milestone has built the real content for yet — same role M2
 * and M3's individual placeholder pages played for their own routes,
 * consolidated into one component since there are five of these at
 * once. Each page using this says which milestone replaces it in its
 * own file, not just here, so the reason is visible from either side.
 */
export function ComingSoon({ icon: Icon, title, description, milestone }: ComingSoonProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <span className="bg-accent text-accent-foreground inline-flex h-14 w-14 items-center justify-center rounded-full">
        <Icon aria-hidden="true" className="h-7 w-7" />
      </span>
      <h1 className="font-display text-foreground mt-6 text-2xl font-bold">{title}</h1>
      <p className="text-muted-foreground mt-2 max-w-md">{description}</p>
      <p className="text-muted-foreground mt-4 text-sm">
        {milestone ? `Coming in ${milestone}.` : 'More coming soon.'}
      </p>
    </div>
  );
}
