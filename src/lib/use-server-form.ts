"use client";
import { startTransition, useActionState, type FormEvent } from "react";
import type { ActionState } from "@/lib/action-state";

type Action = (prev: ActionState, formData: FormData) => Promise<ActionState>;

/**
 * Wraps a server action for a form. React 19 clears uncontrolled inputs after an
 * action finishes; submitting through onSubmit keeps what the admin typed when
 * validation fails.
 */
export function useServerForm(action: Action) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, {});
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => formAction(data));
  };
  return { state, pending, onSubmit };
}
