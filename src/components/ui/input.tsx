import type {
  InputHTMLAttributes,
  LabelHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from 'react';
import { cn } from '@/lib/utils';

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'border-input bg-background text-foreground placeholder:text-muted-foreground ease-soft h-10 w-full rounded-md border px-3.5 text-sm transition-colors duration-150',
        'focus-visible:border-ring focus-visible:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'aria-invalid:border-destructive',
        className,
      )}
      {...props}
    />
  );
}

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        'border-input bg-background text-foreground placeholder:text-muted-foreground ease-soft min-h-24 w-full rounded-md border px-3.5 py-2.5 text-sm transition-colors duration-150',
        'focus-visible:border-ring focus-visible:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'aria-invalid:border-destructive',
        className,
      )}
      {...props}
    />
  );
}

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement>;

export function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={cn('text-foreground mb-1.5 block text-sm font-medium', className)}
      {...props}
    />
  );
}

export interface FieldRenderProps {
  /** Pass this to the input's `id` prop. */
  id: string;
  /** Pass this to the input's `aria-describedby` prop — resolves to the error id, the hint id, or undefined, so the input is always correctly wired to whichever text is actually showing. */
  describedBy: string | undefined;
  /** Pass this to the input's `aria-invalid` prop. */
  invalid: boolean;
}

export interface FieldProps {
  label: string;
  htmlFor: string;
  /** Rendered under the field in the destructive color — pass the message from react-hook-form's fieldState.error?.message. */
  error?: string;
  /** Rendered under the field in muted text when there's no error. */
  hint?: string;
  required?: boolean;
  /**
   * Render-prop, not a plain node — a Field cannot safely inject
   * `aria-describedby`/`aria-invalid` onto an arbitrary child element
   * without an unsafe cast, so it hands the caller the computed values
   * instead and the caller wires them onto their own Input/Textarea/etc.
   * explicitly. More verbose than a plain `children` prop; the
   * alternative is either unsafe or silently drops the a11y wiring.
   */
  children: (props: FieldRenderProps) => ReactNode;
}

/**
 * The standard field wrapper every form in the app uses — computes the
 * label/error/hint association so no individual form has to re-derive
 * this accessibility wiring by hand, without ever reaching for an
 * unsafely-typed prop injection to do it.
 */
export function Field({ label, htmlFor, error, hint, required, children }: FieldProps) {
  const describedBy = error ? `${htmlFor}-error` : hint ? `${htmlFor}-hint` : undefined;

  return (
    <div>
      <Label htmlFor={htmlFor}>
        {label}
        {required ? <span className="text-destructive ml-0.5">*</span> : null}
      </Label>
      {children({ id: htmlFor, describedBy, invalid: Boolean(error) })}
      {error ? (
        <p id={`${htmlFor}-error`} className="text-destructive mt-1.5 text-sm">
          {error}
        </p>
      ) : hint ? (
        <p id={`${htmlFor}-hint`} className="text-muted-foreground mt-1.5 text-sm">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
