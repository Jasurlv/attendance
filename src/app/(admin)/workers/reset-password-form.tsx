"use client";

import { PasswordField } from "@/components/password-field";
import type { ActionState } from "@/lib/action-state";
import { useServerForm } from "@/lib/use-server-form";

export function ResetPasswordForm({
  action,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const { state, pending, onSubmit } = useServerForm(action);
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <PasswordField label="New password" />
      {state.error && (
        <p role="alert" className="field-error">
          {state.error}
        </p>
      )}
      {state.message && (
        <p role="status" className="text-sm text-ok">
          {state.message}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn-secondary">
        {pending ? "Saving…" : "Change password"}
      </button>
    </form>
  );
}
