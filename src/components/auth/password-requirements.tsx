import { Check, X } from 'lucide-react';
import { PASSWORD_RULES } from '@/lib/auth/password-policy';
import { cn } from '@/lib/utils';

export interface PasswordRequirementsProps {
  password: string;
}

export function PasswordRequirements({ password }: PasswordRequirementsProps) {
  return (
    <ul className="mt-2 space-y-1">
      {PASSWORD_RULES.map((rule) => {
        const met = rule.test(password);
        return (
          <li
            key={rule.label}
            className={cn(
              'flex items-center gap-1.5 text-xs',
              met ? 'text-success' : 'text-muted-foreground',
            )}
          >
            {met ? (
              <Check aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <X aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
            )}
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}
