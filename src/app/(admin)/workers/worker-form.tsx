"use client";

import Link from "next/link";
import { Field } from "@/components/field";
import { PasswordField } from "@/components/password-field";
import type { ActionState } from "@/lib/action-state";
import { useServerForm } from "@/lib/use-server-form";

export type WorkerDefaults = { name: string; username: string; siteId: string; hourlyWage: string };

export function WorkerForm({
  action,
  sites,
  defaults,
  withPassword,
  submitLabel,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  sites: { id: string; name: string }[];
  defaults: WorkerDefaults;
  withPassword: boolean;
  submitLabel: string;
}) {
  const { state, pending, onSubmit } = useServerForm(action);
  const fe = state.fieldErrors ?? {};

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-4" noValidate>
      <Field id="name" label="Full name" error={fe.name}>
        <input id="name" name="name" defaultValue={defaults.name} className="input" required />
      </Field>
      <Field
        id="username"
        label="Username"
        error={fe.username}
        hint="The worker signs in to the phone app with this. Letters, numbers, dot, dash, underscore."
      >
        <input
          id="username"
          name="username"
          defaultValue={defaults.username}
          className="input"
          autoCapitalize="none"
          autoComplete="off"
          required
        />
      </Field>
      {withPassword && <PasswordField error={fe.password} />}
      <Field id="siteId" label="Site" error={fe.siteId} hint="The site whose location and hours this worker checks in against.">
        <select id="siteId" name="siteId" defaultValue={defaults.siteId} className="input">
          <option value="">No site yet</option>
          {sites.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </Field>
      <Field
        id="hourlyWage"
        label="Hourly wage"
        error={fe.hourlyWage}
        hint="Used to work out what late arrivals cost. Leave 0 if you do not need cost reports."
      >
        <input id="hourlyWage" name="hourlyWage" type="number" min={0} step="0.01" defaultValue={defaults.hourlyWage} className="input" />
      </Field>

      {state.error && (
        <p role="alert" className="field-error">
          {state.error}
        </p>
      )}
      <div className="flex gap-3">
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? "Saving…" : submitLabel}
        </button>
        <Link href="/workers" className="btn-secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}
