"use client";

import type { ActionState } from "@/lib/action-state";
import { useServerForm } from "@/lib/use-server-form";

/** A button that runs one server action, with an optional confirm prompt and inline result. */
export function ActionButton({
  action,
  children,
  confirmText,
  className = "btn-secondary",
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  children: React.ReactNode;
  confirmText?: string;
  className?: string;
}) {
  const { state, pending, onSubmit } = useServerForm(action);
  return (
    <form
      onSubmit={(e) => {
        if (confirmText && !window.confirm(confirmText)) {
          e.preventDefault();
          return;
        }
        onSubmit(e);
      }}
    >
      <button type="submit" disabled={pending} className={className}>
        {pending ? "Working…" : children}
      </button>
      {state.error && (
        <p role="alert" className="field-error">
          {state.error}
        </p>
      )}
      {state.message && (
        <p role="status" className="mt-1 text-sm text-ok">
          {state.message}
        </p>
      )}
    </form>
  );
}
