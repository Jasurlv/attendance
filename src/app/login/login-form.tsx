"use client";

import { login } from "./actions";
import { Field } from "@/components/field";
import { useServerForm } from "@/lib/use-server-form";

export function LoginForm() {
  const { state, pending, onSubmit } = useServerForm(login);
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field id="username" label="Username">
        <input id="username" name="username" className="input" autoComplete="username" autoFocus required />
      </Field>
      <Field id="password" label="Password">
        <input
          id="password"
          name="password"
          type="password"
          className="input"
          autoComplete="current-password"
          required
        />
      </Field>
      {state.error && (
        <p role="alert" className="field-error">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
