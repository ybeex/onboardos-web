import type { Metadata } from 'next';
import { Container, Section } from '@/components/marketing/container';
import { ContactForm } from '@/components/marketing/contact-form';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Talk to us about modules, pricing, or a custom Enterprise rollout.',
  alternates: { canonical: '/contact' },
  openGraph: { url: '/contact' },
};

export default function ContactPage() {
  return (
    <Section className="pt-16 pb-24 sm:pt-20">
      <Container>
        <div className="grid gap-12 lg:grid-cols-5 lg:gap-16">
          <div className="lg:col-span-2">
            <p className="font-display text-brand text-sm font-semibold tracking-widest uppercase">
              Contact
            </p>
            <h1 className="font-display text-foreground mt-4 text-4xl font-bold tracking-tight text-balance sm:text-5xl">
              Let&rsquo;s talk about your onboarding
            </h1>
            <p className="text-muted-foreground mt-6 text-lg">
              Whether you&rsquo;re comparing modules, sizing an Enterprise rollout, or just have a
              question that isn&rsquo;t in the FAQ — tell us a bit about it and we&rsquo;ll get back
              to you.
            </p>
          </div>
          <div className="lg:col-span-3">
            <ContactForm />
          </div>
        </div>
      </Container>
    </Section>
  );
}
