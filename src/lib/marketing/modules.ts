import type { LucideIcon } from 'lucide-react';
import { UserPlus, Package, Handshake, ShieldCheck } from 'lucide-react';

/**
 * Marketing-content mirror of the backend's `Module` enum (see
 * BUILD_PLAN.md Section 4) — deliberately a separate, hand-authored
 * type rather than importing anything backend-shaped. This is
 * presentation copy for the public site, not a runtime contract; when
 * M4's real typed API client is built, `src/types/` will define its
 * own `Module` type independently, exactly as this project's
 * type-conventions rule intends (see README "Type conventions").
 */
export type ModuleSlug = 'employee' | 'product' | 'client' | 'identity';

export interface ModuleStepExample {
  /** A real backend StepType label, kept short and title-cased for display (e.g. "Form", "Approval"). */
  stepType: string;
  title: string;
}

export interface ModuleDefinition {
  slug: ModuleSlug;
  /** The exact backend `Module` enum value this maps to. */
  backendValue: 'EMPLOYEE' | 'PRODUCT' | 'CLIENT' | 'IDENTITY';
  name: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  /** The backend `EntityType` this module's flows typically enroll. */
  entityType: 'PERSON' | 'ACCOUNT';
  highlights: string[];
  exampleSteps: ModuleStepExample[];
}

export const MODULES: readonly ModuleDefinition[] = [
  {
    slug: 'employee',
    backendValue: 'EMPLOYEE',
    name: 'Employee',
    tagline: 'New hires, set up right from day one.',
    description:
      'Every new hire moves through the same scattered handoffs — a welcome email here, a paper form there, a Slack message to IT that gets missed. The Employee module puts the whole path in one flow: paperwork, provisioning, and the manager check-ins that usually fall through the cracks.',
    icon: UserPlus,
    entityType: 'PERSON',
    highlights: [
      'Tax and emergency-contact forms collected digitally, once',
      'IT provisioning tasks routed to the right team automatically',
      'Manager and buddy check-ins that fire on a schedule, not a memory',
      'A 30 and 90-day approval step so nothing closes out silently',
    ],
    exampleSteps: [
      { stepType: 'Content', title: 'Welcome to the team' },
      { stepType: 'Form', title: 'Emergency contact & tax details' },
      { stepType: 'Task', title: 'Provision laptop & accounts' },
      { stepType: 'Approval', title: '30-day manager check-in' },
    ],
  },
  {
    slug: 'product',
    backendValue: 'PRODUCT',
    name: 'Product',
    tagline: 'Turn a signup into an activated account.',
    description:
      "A signup isn't a customer — an activated account is. The Product module carries a new account from first login through the setup steps and integrations that actually predict retention, adapting to plan tier without a separate flow for every pricing page.",
    icon: Package,
    entityType: 'ACCOUNT',
    highlights: [
      'A setup wizard that adapts to plan tier automatically',
      'API key and integration steps that unblock real usage',
      'Milestone-based nudges instead of a single onboarding email',
      'Self-serve today, sales-assisted tomorrow — same flow underneath',
    ],
    exampleSteps: [
      { stepType: 'Content', title: 'Welcome & product tour' },
      { stepType: 'Form', title: 'Workspace setup' },
      { stepType: 'Task', title: 'Connect your first integration' },
      { stepType: 'Content', title: "You're live" },
    ],
  },
  {
    slug: 'client',
    backendValue: 'CLIENT',
    name: 'Client',
    tagline: "Implementations that don't stall in email.",
    description:
      'Client implementations die in email threads and forgotten attachments. The Client module gives kickoff-to-launch a single source of truth — requirements, sign-off, and the statement of work — and can hand a client straight into their first Product flow the moment onboarding completes.',
    icon: Handshake,
    entityType: 'ACCOUNT',
    highlights: [
      'One shared view of where every implementation actually stands',
      'Requirements intake that replaces the kickoff spreadsheet',
      'Sign-off built in, so launch has a real approval behind it',
      'Auto-enrolls a client into their first Product flow on completion',
    ],
    exampleSteps: [
      { stepType: 'Content', title: 'Kickoff' },
      { stepType: 'Form', title: 'Requirements intake' },
      { stepType: 'Esign', title: 'Statement of work' },
      { stepType: 'Approval', title: 'Launch sign-off' },
    ],
  },
  {
    slug: 'identity',
    backendValue: 'IDENTITY',
    name: 'Identity',
    tagline: 'Verify who someone is, without slowing them down.',
    description:
      'Identity verification is the one onboarding step people actually worry about. The Identity module runs real-time checks through a provider you choose, routes anything uncertain to a human instead of a dead end, and gives someone who was wrongly rejected a real path to try again.',
    icon: ShieldCheck,
    entityType: 'PERSON',
    highlights: [
      'Real-time checks through Persona, Veriff, or a mock provider for testing',
      'A manual review queue for the cases that need a human',
      'One action to request re-verification after a false rejection',
      'Every decision — automated or manual — kept on the record',
    ],
    exampleSteps: [
      { stepType: 'Content', title: 'Before you start' },
      { stepType: 'Verification', title: 'Identity check' },
      { stepType: 'Approval', title: 'Compliance review' },
    ],
  },
];

export function getModuleBySlug(slug: string): ModuleDefinition | undefined {
  return MODULES.find((moduleDefinition) => moduleDefinition.slug === slug);
}
