import Link from 'next/link';
import type { Route } from 'next';
import { Logo } from '@/components/ui/logo';
import { Container } from '@/components/marketing/container';

interface FooterLink {
  href: Route;
  label: string;
}

interface FooterColumn {
  heading: string;
  links: FooterLink[];
}

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    heading: 'Product',
    links: [
      { href: '/how-it-works', label: 'How it works' },
      { href: '/modules', label: 'Modules' },
      { href: '/pricing', label: 'Pricing' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { href: '/about', label: 'About' },
      { href: '/faq', label: 'FAQ' },
      { href: '/contact', label: 'Contact' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { href: '/legal/privacy', label: 'Privacy policy' },
      { href: '/legal/terms', label: 'Terms of service' },
      { href: '/legal/cookies', label: 'Cookie policy' },
    ],
  },
];

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-border border-t">
      <Container className="py-16">
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-5">
          <div className="col-span-2">
            <Logo />
            <p className="text-muted-foreground mt-4 max-w-xs text-sm">
              One platform for every onboarding journey — employee, product, client, and identity —
              unified under a single, AI-assisted flow engine.
            </p>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <div key={column.heading}>
              <p className="font-display text-foreground text-sm font-semibold">{column.heading}</p>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground ease-soft hover:text-foreground text-sm transition-colors duration-150"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-border mt-16 flex flex-col gap-4 border-t pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground text-sm">
            © {currentYear} OnboardOS. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
