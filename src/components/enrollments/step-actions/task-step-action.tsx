'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, Textarea } from '@/components/ui/input';
import type { TaskStepConfig } from '@/types/flow';

const ASSIGNEE_ROLE_LABEL: Record<NonNullable<TaskStepConfig['assigneeRole']>, string> = {
  MANAGER: 'Manager',
  BUDDY: 'Buddy',
  IT: 'IT',
  HR: 'HR',
  OWNER: 'Owner',
  ADMIN: 'Admin',
};

export interface TaskStepActionProps {
  config: TaskStepConfig;
  isSubmitting: boolean;
  onSubmit: (output: Record<string, unknown>) => void;
}

export function TaskStepAction({ config, isSubmitting, onSubmit }: TaskStepActionProps) {
  const [notes, setNotes] = useState('');

  return (
    <div className="space-y-3">
      {config.assigneeRole ? (
        <p className="text-muted-foreground text-sm">
          Assigned to:{' '}
          <span className="text-foreground font-medium">
            {ASSIGNEE_ROLE_LABEL[config.assigneeRole]}
          </span>
        </p>
      ) : null}
      {config.instructions ? (
        <p className="text-foreground text-sm whitespace-pre-wrap">{config.instructions}</p>
      ) : null}
      <Field label="Notes (optional)" htmlFor="task-notes">
        {({ id }) => (
          <Textarea
            id={id}
            rows={3}
            value={notes}
            onChange={(event) => {
              setNotes(event.target.value);
            }}
          />
        )}
      </Field>
      <Button
        size="sm"
        isLoading={isSubmitting}
        onClick={() => {
          onSubmit(notes.trim() ? { notes: notes.trim() } : {});
        }}
      >
        Mark complete
      </Button>
    </div>
  );
}
