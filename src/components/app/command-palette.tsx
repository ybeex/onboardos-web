'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import type { LucideIcon } from 'lucide-react';
import {
  Search,
  LayoutDashboard,
  Users,
  Workflow,
  ListChecks,
  ShieldCheck,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Command {
  id: string;
  label: string;
  href: Route;
  icon: LucideIcon;
}

/** Deliberately the same six destinations as Sidebar's SIDEBAR_LINKS — a command palette that can't reach everywhere the sidebar can would be a confusing subset, not a shortcut. */
const COMMANDS: Command[] = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { id: 'entities', label: 'Entities', href: '/entities', icon: Users },
  { id: 'flows', label: 'Flows', href: '/flows', icon: Workflow },
  { id: 'enrollments', label: 'Enrollments', href: '/enrollments', icon: ListChecks },
  { id: 'verification', label: 'Verification', href: '/verification', icon: ShieldCheck },
  { id: 'settings', label: 'Settings', href: '/settings', icon: Settings },
];

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Hand-built, not a dedicated command-palette library — none is in
 * this project's dependency list (checked before writing this), and a
 * six-item, non-fuzzy, non-virtualized list doesn't need one. Global
 * Cmd+K/Ctrl+K listener lives here rather than in a parent, so
 * anywhere this component is mounted "just works" without the parent
 * needing to wire up its own keydown handling.
 */
export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  // Whatever had focus right before the palette opened — almost always
  // the element the global Cmd+K listener below fired on, since that
  // listener never moves focus itself. Restored on close in the effect
  // further down so closing the palette doesn't strand focus at the
  // top of <body>, the same bug class as a modal with no focus return.
  const triggerElementRef = useRef<HTMLElement | null>(null);
  const router = useRouter();

  // Stable per-mount id namespace for the combobox/listbox wiring
  // below (aria-controls, aria-activedescendant) — useId rather than a
  // hardcoded string so two palettes could in principle mount without
  // colliding ids, and so it stays SSR-safe.
  const baseId = useId();
  const listboxId = `${baseId}-listbox`;
  function optionId(commandId: string): string {
    return `${baseId}-option-${commandId}`;
  }

  const filtered = COMMANDS.filter((command) =>
    command.label.toLowerCase().includes(query.toLowerCase()),
  );
  const activeCommand = filtered[activeIndex];

  useEffect(() => {
    function handleGlobalKeyDown(event: KeyboardEvent): void {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        onOpenChange(!open);
      }
    }
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [open, onOpenChange]);

  // Resets search state when the palette closes. Adjusted directly
  // during render (React's own documented pattern for "reset state
  // when a value changes") rather than in a useEffect — same reasoning
  // as SiteHeader's mobile-nav-close-on-navigation (see that file's
  // comment): an effect here would be the actual setState-in-effect
  // anti-pattern the linter flags, not a false positive.
  const [lastOpen, setLastOpen] = useState(open);
  if (open !== lastOpen) {
    setLastOpen(open);
    if (!open) {
      setQuery('');
      setActiveIndex(0);
    }
  }

  // Focusing the input (and, in the else branch, restoring focus to
  // whatever had it beforehand) is a genuine imperative DOM action,
  // not a state adjustment — this one correctly belongs in an effect.
  // Capturing document.activeElement has to happen before the
  // inputRef.current?.focus() call below it, since that call is itself
  // what changes document.activeElement — read it first, then move it.
  useEffect(() => {
    if (open) {
      triggerElementRef.current = document.activeElement as HTMLElement | null;
      inputRef.current?.focus();
    } else {
      triggerElementRef.current?.focus();
      triggerElementRef.current = null;
    }
  }, [open]);

  function handleSelect(command: Command): void {
    router.push(command.href);
    onOpenChange(false);
  }

  function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.key === 'Escape') {
      onOpenChange(false);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, filtered.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === 'Enter') {
      if (activeCommand) handleSelect(activeCommand);
    } else if (event.key === 'Tab') {
      // The results below are non-focusable role="option" elements
      // (arrow keys move aria-activedescendant, not real DOM focus —
      // see the listbox markup), which makes the input the only
      // focusable element left inside this role="dialog"
      // aria-modal="true" surface. A full first-to-last-element focus
      // trap would have nothing to cycle between, so just keep Tab
      // from leaking focus out to whatever's behind the overlay.
      event.preventDefault();
    }
  }

  if (!open) return null;

  return (
    <div
      className="bg-inverse/40 fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      onClick={() => {
        onOpenChange(false);
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="border-border bg-card shadow-soft-lg w-full max-w-lg overflow-hidden rounded-xl border"
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <div className="border-border flex items-center gap-3 border-b px-4 py-3">
          <Search aria-hidden="true" className="text-muted-foreground h-4 w-4 shrink-0" />
          <input
            ref={inputRef}
            role="combobox"
            aria-expanded="true"
            aria-haspopup="listbox"
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={activeCommand ? optionId(activeCommand.id) : undefined}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder="Search or jump to…"
            className="text-foreground placeholder:text-muted-foreground flex-1 bg-transparent text-sm outline-none"
          />
        </div>
        {/*
          role="option" sits directly on each li, not a nested element —
          the ARIA listbox pattern just needs listbox children exposed
          as options, and an li can carry that role itself. None of
          these are real DOM buttons/focusable elements: selection is
          driven entirely from the input's keydown handler above via
          aria-activedescendant, matching the APG combobox-with-listbox
          pattern, not a roving-tabindex one.
        */}
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Commands"
          className="max-h-80 overflow-y-auto p-2"
        >
          {filtered.length === 0 ? (
            <li role="presentation" className="text-muted-foreground px-3 py-6 text-center text-sm">
              No results
            </li>
          ) : (
            filtered.map((command, index) => (
              <li
                key={command.id}
                id={optionId(command.id)}
                role="option"
                aria-selected={index === activeIndex}
                onClick={() => {
                  handleSelect(command);
                }}
                onMouseEnter={() => {
                  setActiveIndex(index);
                }}
                className={cn(
                  'flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-left text-sm',
                  index === activeIndex
                    ? 'bg-accent text-accent-foreground'
                    : 'text-foreground hover:bg-muted',
                )}
              >
                <command.icon aria-hidden="true" className="h-4 w-4" />
                {command.label}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
