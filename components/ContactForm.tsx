"use client";

import { useState } from "react";
import { CircleNotch } from "@phosphor-icons/react";
import { site } from "@/lib/content";

/* To go live, set NEXT_PUBLIC_CONTACT_ENDPOINT to a handler that accepts a
   POST of FormData and returns 2xx (a Formspree endpoint works as is).
   Without it the form validates and reports success without sending. */
const ENDPOINT = process.env.NEXT_PUBLIC_CONTACT_ENDPOINT ?? "";

type Field = "name" | "mobile" | "email";
type Errors = Partial<Record<Field, string>>;

const RULES: Record<Field, { label: string; test: (v: string) => boolean; msg: string }> = {
  name: {
    label: "Full name",
    test: (v) => v.trim().length >= 2,
    msg: "Please enter your full name.",
  },
  mobile: {
    label: "Mobile number",
    test: (v) => {
      const digits = v.replace(/\D/g, "");
      return /^[+\d][\d\s\-().]*$/.test(v.trim()) && digits.length >= 7 && digits.length <= 15;
    },
    msg: "Please enter a valid mobile number.",
  },
  email: {
    label: "Email address",
    test: (v) => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v.trim()),
    msg: "Please enter a valid email address.",
  },
};

const ORDER: Field[] = ["name", "mobile", "email"];

export function ContactForm() {
  const [values, setValues] = useState<Record<Field, string>>({
    name: "",
    mobile: "",
    email: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ kind: "ok" | "bad"; msg: string } | null>(null);

  function validate(field: Field, value: string): string | undefined {
    return RULES[field].test(value) ? undefined : RULES[field].msg;
  }

  function onChange(field: Field, value: string) {
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) {
      setErrors((e) => ({ ...e, [field]: validate(field, value) }));
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus(null);

    const next: Errors = {};
    ORDER.forEach((f) => {
      const err = validate(f, values[f]);
      if (err) next[f] = err;
    });
    setErrors(next);

    const firstBad = ORDER.find((f) => next[f]);
    if (firstBad) {
      document.getElementById(`f-${firstBad}`)?.focus();
      setStatus({ kind: "bad", msg: "Please correct the highlighted fields." });
      return;
    }

    setBusy(true);
    try {
      if (ENDPOINT) {
        const body = new FormData();
        ORDER.forEach((f) => body.append(f, values[f]));
        const res = await fetch(ENDPOINT, { method: "POST", headers: { Accept: "application/json" }, body });
        if (!res.ok) throw new Error("bad response");
      } else {
        console.warn("[WOY] NEXT_PUBLIC_CONTACT_ENDPOINT is not set. Running in demo mode.");
        await new Promise((r) => setTimeout(r, 700));
      }
      setValues({ name: "", mobile: "", email: "" });
      setStatus({ kind: "ok", msg: "Thank you. A partner will be in touch shortly." });
    } catch {
      setStatus({
        kind: "bad",
        msg: "Something went wrong. Please try again, or email us directly.",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5">
      {ORDER.map((field) => (
        <div key={field} className="grid gap-2">
          <label htmlFor={`f-${field}`} className="text-sm font-medium text-ink">
            {RULES[field].label}
          </label>
          <input
            id={`f-${field}`}
            name={field}
            type={field === "email" ? "email" : field === "mobile" ? "tel" : "text"}
            inputMode={field === "mobile" ? "tel" : undefined}
            autoComplete={field === "email" ? "email" : field === "mobile" ? "tel" : "name"}
            value={values[field]}
            onChange={(e) => onChange(field, e.target.value)}
            onBlur={(e) => setErrors((x) => ({ ...x, [field]: validate(field, e.target.value) }))}
            aria-invalid={errors[field] ? true : undefined}
            aria-describedby={errors[field] ? `err-${field}` : undefined}
            className={`w-full rounded-[2px] border bg-raised px-4 py-3 text-base text-ink transition-all placeholder:text-ink3 focus:outline-none focus:ring-[3px] ${
              errors[field]
                ? "border-red focus:ring-red/20"
                : "border-line2 hover:border-ink3 focus:border-red focus:ring-red/20"
            }`}
          />
          {errors[field] && (
            <p id={`err-${field}`} role="alert" className="text-sm font-medium text-reddeep">
              {errors[field]}
            </p>
          )}
        </div>
      ))}

      <button
        type="submit"
        disabled={busy}
        className="mt-1 inline-flex items-center justify-center gap-2.5 rounded-[2px] bg-red px-7 py-4 text-base font-medium text-white transition-all duration-300 hover:bg-reddeep hover:shadow-[0_10px_26px_-12px_rgba(205,20,33,.7)] active:translate-y-px disabled:opacity-70"
      >
        {site.cta}
        {busy && <CircleNotch size={19} className="animate-spin" aria-hidden />}
      </button>

      {status && (
        <p
          role="status"
          aria-live="polite"
          className={`rounded-[2px] border px-4 py-3 text-sm font-medium ${
            status.kind === "ok"
              ? "border-red/35 bg-red/[0.06] text-ink"
              : "border-red text-reddeep"
          }`}
        >
          {status.msg}
        </p>
      )}
    </form>
  );
}
