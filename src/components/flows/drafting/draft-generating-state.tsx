'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Sparkles } from 'lucide-react';

export interface DraftGeneratingStateProps {
  kind: 'generate' | 'refine';
}

const COPY: Record<DraftGeneratingStateProps['kind'], { heading: string; verb: string }> = {
  generate: { heading: 'Generating your flow…', verb: 'generating' },
  refine: { heading: 'Refining your flow…', verb: 'refining' },
};

/**
 * The UI/UX doc is explicit that a generic spinner is disallowed here:
 * "builder users need to know whether it's safe to navigate away." This
 * says so directly, ticks a real elapsed-time counter (an honest
 * progress signal — this app doesn't fake a determinate progress bar
 * for a job whose real duration it doesn't know), and reuses the app's
 * own soft, ambient motion language (see `lib/motion.ts`) instead of a
 * spinning ring. "Your draft will be here when you come back" is a
 * real guarantee, not just reassurance copy — `/flows/generate` keeps
 * the active job id in the URL, so a refresh or a back-navigation
 * resumes polling the same job rather than losing it.
 */
export function DraftGeneratingState({ kind }: DraftGeneratingStateProps) {
  const prefersReducedMotion = useReducedMotion();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  const copy = COPY[kind];

  return (
    <div
      role="status"
      className="border-border bg-card shadow-soft-sm flex flex-col items-center rounded-lg border p-10 text-center"
    >
      {prefersReducedMotion ? (
        <div className="bg-accent text-accent-foreground flex h-12 w-12 items-center justify-center rounded-full">
          <Sparkles aria-hidden="true" className="h-6 w-6" />
        </div>
      ) : (
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="bg-accent text-accent-foreground flex h-12 w-12 items-center justify-center rounded-full"
        >
          <Sparkles aria-hidden="true" className="h-6 w-6" />
        </motion.div>
      )}

      <h2 className="font-display text-foreground mt-4 text-lg font-semibold">{copy.heading}</h2>
      <p className="text-muted-foreground mt-2 max-w-sm text-sm">
        This usually takes under a minute. It&rsquo;s safe to leave this page — we&rsquo;ll keep{' '}
        {copy.verb} in the background, and your draft will be here when you come back.
      </p>
      <p className="text-muted-foreground mt-3 text-xs tabular-nums">{elapsedSeconds}s elapsed</p>
    </div>
  );
}
