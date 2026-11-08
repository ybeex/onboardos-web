import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { LogoMark } from '@/components/ui/logo-mark';

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <LogoMark className="text-brand h-12 w-12" decorative={false} />
      <div className="space-y-2">
        <p className="font-display text-muted-foreground text-sm font-semibold tracking-widest uppercase">
          404
        </p>
        <h1 className="font-display text-foreground text-3xl font-bold sm:text-4xl">
          This step doesn&apos;t exist
        </h1>
        <p className="text-muted-foreground max-w-md">
          The page you&apos;re looking for was moved, renamed, or never existed. Let&apos;s get you
          back on track.
        </p>
      </div>
      <Link href="/" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
        Back to home
      </Link>
    </div>
  );
}
