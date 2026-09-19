"use client";

import { useState } from "react";
import { Field } from "@/components/field";

// No 0/O, 1/l/I: easier to read out loud or copy from a message.
const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

function generate(length = 8) {
  const bytes = crypto.getRandomValues(new Uint32Array(length));
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

export function PasswordField({ label = "Password", error }: { label?: string; error?: string }) {
  const [value, setValue] = useState("");
  return (
    <Field
      id="password"
      label={label}
      error={error}
      hint="Shown here so you can pass it to the worker. It is stored encrypted and cannot be viewed later."
    >
      <div className="flex gap-2">
        <input
          id="password"
          name="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoComplete="off"
          className="input font-mono"
        />
        <button type="button" onClick={() => setValue(generate())} className="btn-secondary shrink-0">
          Generate
        </button>
      </div>
    </Field>
  );
}
