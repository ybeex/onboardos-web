'use client';

import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { CheckCircle2 } from 'lucide-react';
import { Field, Input, Textarea } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { MODULES } from '@/lib/marketing/modules';
import { fieldError } from '@/lib/utils';

/** Hand-written interface, not `z.infer<typeof contactFormSchema>` — see README.md "Type conventions". */
interface ContactFormValues {
  name: string;
  email: string;
  company: string;
  moduleInterest: string;
  message: string;
}

const contactFormSchema = z.object({
  name: z.string().min(1, 'Enter your name'),
  email: z.email('Enter a valid email address'),
  company: z.string().min(1, 'Enter your company'),
  moduleInterest: z.string(),
  message: z.string().min(10, 'Tell us a bit more — at least 10 characters'),
});

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  // Honeypot — deliberately outside react-hook-form's typed model (see
  // the input's own comment below) rather than a registered field, so
  // it never has to line up with ContactFormValues/contactFormSchema.
  const honeypotRef = useRef<HTMLInputElement>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { name: '', email: '', company: '', moduleInterest: '', message: '' },
  });

  async function onSubmit(data: ContactFormValues): Promise<void> {
    const website = honeypotRef.current?.value ?? '';
    if (website) {
      // Tripped — behave as if it succeeded, send nothing.
      setSubmitted(true);
      return;
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, website }),
      });

      if (!response.ok) throw new Error('Request failed');

      setSubmitted(true);
    } catch {
      toast.error('Something went wrong sending your message. Please try again.');
    }
  }

  if (submitted) {
    return (
      <div className="border-border bg-card shadow-soft-sm flex flex-col items-center rounded-xl border p-10 text-center">
        <CheckCircle2 aria-hidden="true" className="text-success h-10 w-10" />
        <h3 className="font-display text-foreground mt-4 text-lg font-semibold">Message sent</h3>
        <p className="text-muted-foreground mt-1.5">
          Thanks for reaching out — we&rsquo;ll get back to you shortly.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        void handleSubmit(onSubmit)(event);
      }}
      noValidate
      className="border-border bg-card shadow-soft-sm space-y-5 rounded-xl border p-6 sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" htmlFor="contact-name" required {...fieldError(errors.name?.message)}>
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              aria-describedby={describedBy}
              aria-invalid={invalid}
              {...register('name')}
            />
          )}
        </Field>
        <Field
          label="Work email"
          htmlFor="contact-email"
          required
          {...fieldError(errors.email?.message)}
        >
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              type="email"
              aria-describedby={describedBy}
              aria-invalid={invalid}
              {...register('email')}
            />
          )}
        </Field>
      </div>

      <Field
        label="Company"
        htmlFor="contact-company"
        required
        {...fieldError(errors.company?.message)}
      >
        {({ id, describedBy, invalid }) => (
          <Input
            id={id}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            {...register('company')}
          />
        )}
      </Field>

      <Field label="Which module are you interested in?" htmlFor="contact-module">
        {({ id, describedBy, invalid }) => (
          <Select
            id={id}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            {...register('moduleInterest')}
          >
            <option value="">Not sure yet</option>
            {MODULES.map((moduleDefinition) => (
              <option key={moduleDefinition.slug} value={moduleDefinition.slug}>
                {moduleDefinition.name}
              </option>
            ))}
          </Select>
        )}
      </Field>

      <Field
        label="Message"
        htmlFor="contact-message"
        required
        {...fieldError(errors.message?.message)}
      >
        {({ id, describedBy, invalid }) => (
          <Textarea
            id={id}
            rows={4}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            {...register('message')}
          />
        )}
      </Field>

      {/* Honeypot — visually and semantically hidden from real visitors. */}
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="contact-website">Leave this field empty</label>
        <input
          id="contact-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          ref={honeypotRef}
        />
      </div>

      <Button type="submit" size="lg" isLoading={isSubmitting} className="w-full sm:w-auto">
        Send message
      </Button>
    </form>
  );
}
