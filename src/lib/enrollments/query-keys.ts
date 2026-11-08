/** One key per flow's enrollment list, and one per enrollment's own detail — kept separate since completing a step invalidates only the detail, not every flow's list. */
export const flowEnrollmentsQueryKey = (flowId: string) =>
  ['enrollments', 'by-flow', flowId] as const;

export const enrollmentDetailQueryKey = (enrollmentId: string) =>
  ['enrollments', 'detail', enrollmentId] as const;
