import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';

/** Hand-written interface, not `z.infer<>` — see README.md "Type conventions". */
interface ContactSubmission {
  name: string;
  email: string;
  company: string;
  moduleInterest: string;
  message: string;
}

const contactSubmissionSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  company: z.string().min(1),
  moduleInterest: z.string(),
  message: z.string().min(10),
  // Honeypot — real clients always submit this empty (see
  // ContactForm's own comment). Optional here since it's not part of
  // ContactSubmission's real shape, only a bot-detection signal.
  website: z.string().optional(),
});

/**
 * Real delivery via Resend — gated entirely on `RESEND_API_KEY` being
 * set. The Resend SDK's own constructor throws synchronously
 * ("Missing API key...") when no key is available anywhere, confirmed
 * by reading the installed package's own source
 * (`node_modules/resend/dist/index.mjs`), not assumed — so `resend`
 * is only ever constructed after checking the env var ourselves, and
 * only once, here at module scope (route handler modules are
 * long-lived per server process, so this is the normal place to
 * construct a reused API client, not a per-request cost). A machine
 * with no Resend account configured yet gets `resend === null` and
 * keeps the exact original validate-and-log behavior — nothing about
 * this file can start throwing just because it was added.
 */
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

/**
 * This still validates and logs every real submission server-side
 * first, unconditionally — delivery is additive, never a replacement
 * for that guarantee. Honeypot is still checked server-side too, so a
 * bot posting directly to this route (bypassing the client entirely)
 * is still caught before any of this runs.
 */
export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const parsed = contactSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid submission.' }, { status: 400 });
  }

  if (parsed.data.website) {
    // Honeypot tripped — respond as if it succeeded, do nothing further.
    return NextResponse.json({ ok: true });
  }

  const submission: ContactSubmission = {
    name: parsed.data.name,
    email: parsed.data.email,
    company: parsed.data.company,
    moduleInterest: parsed.data.moduleInterest,
    message: parsed.data.message,
  };

  console.warn('[contact] submission received', {
    company: submission.company,
    moduleInterest: submission.moduleInterest || 'unspecified',
  });

  if (resend) {
    const from = process.env.CONTACT_FORM_FROM_EMAIL;
    const to = process.env.CONTACT_FORM_TO_EMAIL;
    if (from && to) {
      try {
        const result = await resend.emails.send({
          from,
          to,
          replyTo: submission.email,
          subject: `New contact form submission — ${submission.company}`,
          text: [
            `Name: ${submission.name}`,
            `Email: ${submission.email}`,
            `Company: ${submission.company}`,
            `Module interest: ${submission.moduleInterest || 'unspecified'}`,
            '',
            submission.message,
          ].join('\n'),
        });
        // Resend's SDK returns API-level failures as `{ error }`
        // rather than throwing (confirmed from its own `Response<T>`
        // type — a discriminated `{ data, error: null } | { data:
        // null, error }` union) — an invalid/unverified `from` domain
        // or a bad API key surfaces here, not in the catch block below.
        if (result.error) {
          console.error('[contact] Resend delivery failed', result.error);
        }
      } catch (error) {
        // A network-level failure (DNS, timeout, etc.), the other
        // half of how this can fail. Either way, delivery failing
        // must never fail the request: the submission was already
        // validated and logged above, so nothing is silently lost
        // even when this throws.
        console.error('[contact] Resend request threw', error);
      }
    } else {
      console.warn(
        '[contact] RESEND_API_KEY is set but CONTACT_FORM_FROM_EMAIL/CONTACT_FORM_TO_EMAIL are not — skipping delivery',
      );
    }
  }

  return NextResponse.json({ ok: true });
}
