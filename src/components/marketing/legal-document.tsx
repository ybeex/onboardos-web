import type { ReactNode } from 'react';
import { Container, Section } from '@/components/marketing/container';

export interface LegalDocumentProps {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}

export function LegalDocument({ title, lastUpdated, children }: LegalDocumentProps) {
  return (
    <Section className="pt-16 pb-24 sm:pt-20">
      <Container size="narrow">
        <h1 className="font-display text-foreground text-4xl font-bold tracking-tight sm:text-5xl">
          {title}
        </h1>
        <p className="text-muted-foreground mt-3 text-sm">Last updated: {lastUpdated}</p>
        <div className="mt-10 space-y-8">{children}</div>
      </Container>
    </Section>
  );
}

export interface LegalSectionProps {
  heading: string;
  children: ReactNode;
}

export function LegalSection({ heading, children }: LegalSectionProps) {
  return (
    <section>
      <h2 className="font-display text-foreground text-xl font-semibold">{heading}</h2>
      <div className="text-muted-foreground mt-3 space-y-3">{children}</div>
    </section>
  );
}
