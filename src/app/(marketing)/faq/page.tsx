import type { Metadata } from 'next';
import { ChevronDown } from 'lucide-react';
import { Container, Section } from '@/components/marketing/container';

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    'Answers to common questions about modules, AI flow generation, identity verification, and pricing.',
  alternates: { canonical: '/faq' },
  openGraph: { url: '/faq' },
};

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqCategory {
  name: string;
  items: FaqItem[];
}

const FAQ_CATEGORIES: FaqCategory[] = [
  {
    name: 'General',
    items: [
      {
        question: 'What is OnboardOS?',
        answer:
          'A single platform for building and running onboarding flows across four contexts — Employee, Product, Client, and Identity — on one underlying workflow engine.',
      },
      {
        question: 'Who is OnboardOS for?',
        answer:
          'Teams responsible for getting people or accounts through a repeatable process: HR and People teams for new hires, Product and Customer Success teams for account activation and client implementations, and Compliance teams for identity verification.',
      },
      {
        question: 'Do I need to use all four modules?',
        answer:
          'No. Modules are activated independently — most teams start with the one they need most and add others later, from the same account.',
      },
    ],
  },
  {
    name: 'AI flow generation',
    items: [
      {
        question: 'How does the AI flow generator work?',
        answer:
          'Describe the onboarding you want in plain English. OnboardOS returns a complete, structured draft — real step types and branches — that you can refine conversationally before turning it into an actual flow.',
      },
      {
        question: "What happens if the AI draft isn't quite right?",
        answer:
          "Say what to change and it generates a new, complete version — no draft is precious, so there's nothing to manually patch around. If a draft comes back malformed, it repairs itself automatically and tells you when it did.",
      },
      {
        question: 'Does AI generation replace the visual flow builder?',
        answer:
          "No — it's a fast starting point. Every flow, generated or hand-built, ends up in the same visual builder where you can reorder steps, edit forms, or rewrite branch conditions.",
      },
    ],
  },
  {
    name: 'Modules & flows',
    items: [
      {
        question: "What's the difference between a flow and a step?",
        answer:
          'A flow is the whole sequence — the full onboarding path an entity moves through. A step is one part of it: a piece of content, a form, a task, an approval, an identity check, and so on.',
      },
      {
        question: 'Can a flow trigger another flow?',
        answer:
          'Yes. Cross-module triggers can enroll an entity into a second flow automatically when the first one completes — for example, moving a client straight into their first Product flow at the end of implementation.',
      },
      {
        question: 'What step types are available?',
        answer:
          'Content, Form, Task, Approval, Identity Verification, E-sign, and conditional branches, with more being added — every module draws from the same set.',
      },
    ],
  },
  {
    name: 'Identity & security',
    items: [
      {
        question: 'How is tenant data isolated?',
        answer:
          'OnboardOS is multi-tenant by design — every request is scoped to a single tenant, and data never crosses tenant boundaries.',
      },
      {
        question: 'Which identity verification providers do you support?',
        answer:
          'Persona and Veriff today, plus a mock provider for testing flows before you go live with a real provider.',
      },
      {
        question: 'What happens if someone fails identity verification?',
        answer:
          'Uncertain results route to a manual review queue for a human decision rather than a dead end, and a reviewer can request re-verification with one action if the result was wrong.',
      },
    ],
  },
  {
    name: 'Pricing & plans',
    items: [
      {
        question: 'Is there a free trial?',
        answer:
          'Starter starts free for your first onboarding flow — no card required to see it working end to end.',
      },
      {
        question: 'Can I change modules later?',
        answer: 'Yes, modules can be activated or changed at any time from your plan settings.',
      },
      {
        question: 'Do you offer custom or enterprise plans?',
        answer:
          'Yes — Enterprise plans cover custom SSO, dedicated support, and custom identity-verification integrations. See the Pricing page or contact us.',
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <>
      <Section className="pt-16 pb-8 sm:pt-20">
        <Container size="narrow">
          <p className="font-display text-brand text-sm font-semibold tracking-widest uppercase">
            FAQ
          </p>
          <h1 className="font-display text-foreground mt-4 text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            Frequently asked questions
          </h1>
        </Container>
      </Section>

      <Section className="pt-0">
        <Container size="narrow">
          <div className="space-y-12">
            {FAQ_CATEGORIES.map((category) => (
              <div key={category.name}>
                <h2 className="font-display text-foreground text-lg font-semibold">
                  {category.name}
                </h2>
                <div className="divide-border border-border mt-2 divide-y border-t">
                  {category.items.map((item) => (
                    <details key={item.question} className="group py-5">
                      <summary className="font-display text-foreground flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium [&::-webkit-details-marker]:hidden">
                        {item.question}
                        <ChevronDown
                          aria-hidden="true"
                          className="text-muted-foreground ease-soft h-4 w-4 shrink-0 transition-transform duration-150 group-open:rotate-180"
                        />
                      </summary>
                      <p className="text-muted-foreground mt-3">{item.answer}</p>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
