/**
 * Client-generated `key` for a new step before it's ever sent to the
 * server. The backend requires every step to carry a `key: string`
 * (see @/types/flow's BaseStep), used by condition paths and AI-draft
 * step references — it is never assigned by the server, so the
 * builder must mint one locally the moment a step is created.
 */
export function generateKey(prefix: string): string {
  const suffix = crypto.randomUUID().replace(/-/g, '').slice(0, 8);
  return `${prefix.toLowerCase()}_${suffix}`;
}
