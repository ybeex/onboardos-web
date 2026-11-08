'use client';

import { useEffect, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { STEP_TYPE_ICON, STEP_TYPE_LABEL, ALL_STEP_TYPES } from '@/lib/flows/step-type-display';
import type { Step } from '@/types/flow';

export interface AddStepMenuProps {
  onAdd: (type: Step['type']) => void;
  isAdding: boolean;
}

/** Hand-built, matching AppTopbar's user-menu pattern — no generic dropdown/menu primitive exists yet in this codebase. */
export function AddStepMenu({ onAdd, isAdding }: AddStepMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent): void {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={menuRef} className="relative">
      <Button
        variant="outline"
        size="sm"
        isLoading={isAdding}
        onClick={() => {
          setOpen((isOpen) => !isOpen);
        }}
        aria-expanded={open}
      >
        <Plus aria-hidden="true" className="h-4 w-4" />
        Add step
      </Button>

      {open ? (
        <div className="border-border bg-card shadow-soft-lg absolute top-full left-0 z-10 mt-2 w-56 rounded-lg border p-1">
          {ALL_STEP_TYPES.map((type) => {
            const Icon = STEP_TYPE_ICON[type];
            return (
              <button
                key={type}
                type="button"
                onClick={() => {
                  onAdd(type);
                  setOpen(false);
                }}
                className="text-foreground hover:bg-muted flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm"
              >
                <Icon aria-hidden="true" className="text-muted-foreground h-4 w-4" />
                {STEP_TYPE_LABEL[type]}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
