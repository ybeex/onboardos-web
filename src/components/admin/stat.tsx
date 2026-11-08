export interface StatProps {
  label: string;
  value: number;
}

/**
 * A single labeled count. Shared by the tenant list row's four counts
 * and the tenant detail page's own header, which show the identical
 * `userCount`/`flowCount`/`entityCount`/`activeEnrollmentCount` fields
 * from the same `TenantHealthSummary` shape — extracted rather than
 * defined twice so the two presentations can't quietly drift apart.
 */
export function Stat({ label, value }: StatProps) {
  return (
    <div className="text-center">
      <p className="text-foreground font-display text-sm font-semibold">{value}</p>
      <p className="text-muted-foreground text-[11px] tracking-wide uppercase">{label}</p>
    </div>
  );
}
