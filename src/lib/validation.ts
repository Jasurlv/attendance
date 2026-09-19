import { z } from "zod";
import type { ActionState } from "@/lib/action-state";

/** Number field that treats an empty input as "missing" instead of 0. */
export const num = (msg: string, min: number, max: number, int = false) => {
  let n = z.number({ required_error: msg, invalid_type_error: msg }).min(min, msg).max(max, msg);
  if (int) n = n.int(msg);
  return z.preprocess((v) => (v === "" || v == null ? undefined : Number(v)), n);
};

export const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use the format HH:MM");

export const timezone = z.string().refine((v) => {
  try {
    new Intl.DateTimeFormat("en", { timeZone: v });
    return true;
  } catch {
    return false;
  }
}, "Unknown timezone, for example Europe/Riga");

/** First error message per field, ready to show under each input. */
export function fieldErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export function invalid(err: z.ZodError): ActionState {
  return { error: "Please fix the highlighted fields.", fieldErrors: fieldErrors(err) };
}
