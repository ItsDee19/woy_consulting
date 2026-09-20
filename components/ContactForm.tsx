"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CircleNotch } from "@phosphor-icons/react";
import { site } from "@/lib/content";
import { contactFields, contactRules, validateContact, validateContactField, type ContactErrors, type ContactField, type ContactValues } from "@/lib/contact-validation";

const EMPTY_VALUES: ContactValues = { name: "", mobile: "", email: "" };
type Session = { readyAt: number; error?: string };
class ContactSubmissionError extends Error {}

async function prepareSession(signal: AbortSignal): Promise<Session> {
  try {
    const response = await fetch("/api/contact", { credentials: "same-origin", cache: "no-store", signal });
    const data = await response.json();
    if (!response.ok) return { readyAt: 0, error: data.message || "The contact form is temporarily unavailable. Please try again later." };
    return { readyAt: Date.now() + Math.min(2000, Math.max(0, Number(data.readyAfterMs) || 0)) };
  } catch {
    return { readyAt: 0, error: "We could not connect. Check your connection and try again." };
  }
}

export function ContactForm() {
  const [values, setValues] = useState<ContactValues>(EMPTY_VALUES);
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<ContactErrors>({});
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ kind: "ok" | "bad"; msg: string } | null>(null);
  const inFlight = useRef(false);
  const session = useRef<Promise<Session> | null>(null);
  const submission = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10_000);
    session.current = prepareSession(controller.signal);
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
      submission.current?.abort();
    };
  }, []);

  function onChange(field: ContactField, value: string) {
    setValues((previous) => ({ ...previous, [field]: value }));
    if (errors[field]) setErrors((previous) => ({ ...previous, [field]: validateContactField(field, value) }));
    if (status?.kind === "ok") setStatus(null);
  }

  function showFieldErrors(next: ContactErrors) {
    setErrors(next);
    const firstBad = contactFields.find((field) => next[field]);
    if (firstBad) document.getElementById(`f-${firstBad}`)?.focus();
    return Boolean(firstBad);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    setStatus(null);
    if (showFieldErrors(validateContact(values))) {
      setStatus({ kind: "bad", msg: "Please correct the highlighted fields." });
      return;
    }
    inFlight.current = true;
    setBusy(true);
    const controller = new AbortController();
    submission.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 25_000);
    try {
      const prepared = await (session.current || prepareSession(controller.signal));
      if (prepared.error) throw new ContactSubmissionError(prepared.error);
      const wait = prepared.readyAt - Date.now();
      if (wait > 0) await new Promise((resolve) => window.setTimeout(resolve, wait));
      const response = await fetch("/api/contact", {
        method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, website }), signal: controller.signal,
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.errors) showFieldErrors(data.errors);
        throw new ContactSubmissionError(data.message || "Your request could not be sent. Please try again later.");
      }
      setValues(EMPTY_VALUES);
      setErrors({});
      setStatus({ kind: "ok", msg: "Thank you. Your request has been sent to WOY Consulting." });
    } catch (error) {
      setStatus({ kind: "bad", msg: error instanceof ContactSubmissionError
        ? error.message
        : "We could not confirm delivery. Your details are still here; check your connection before trying again." });
    } finally {
      window.clearTimeout(timeout);
      session.current = null;
      inFlight.current = false;
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate aria-busy={busy} className="grid gap-5">
      <p className="text-sm text-ink2">All fields are required.</p>
      {contactFields.map((field) => (
        <div key={field} className="grid gap-2">
          <label htmlFor={`f-${field}`} className="text-sm font-medium text-ink">{contactRules[field].label}</label>
          <input
            id={`f-${field}`} name={field} required readOnly={busy}
            type={field === "email" ? "email" : field === "mobile" ? "tel" : "text"}
            inputMode={field === "mobile" ? "tel" : undefined}
            autoComplete={field === "email" ? "email" : field === "mobile" ? "tel" : "name"}
            maxLength={contactRules[field].maxLength}
            value={values[field]}
            onChange={(event) => onChange(field, event.target.value)}
            onBlur={(event) => setErrors((previous) => ({ ...previous, [field]: validateContactField(field, event.target.value) }))}
            aria-invalid={errors[field] ? true : undefined}
            aria-describedby={`err-${field}`}
            className={`w-full rounded-[2px] border bg-raised px-4 py-3 text-base text-ink transition-colors placeholder:text-ink3 focus:outline-none focus:ring-[3px] ${errors[field] ? "border-danger focus:ring-danger/20" : "border-control hover:border-ink3 focus:border-action focus:ring-action/20"}`}
          />
          <p id={`err-${field}`} className="min-h-5 text-sm font-medium text-danger">{errors[field] || ""}</p>
        </div>
      ))}

      <div className="absolute h-px w-px overflow-hidden opacity-0" aria-hidden="true" inert>
        <label htmlFor="f-website">Leave this field empty</label>
        <input id="f-website" name="website" type="text" tabIndex={-1} autoComplete="off" maxLength={200} value={website} onChange={(event) => setWebsite(event.target.value)} />
      </div>

      <p className="text-sm leading-relaxed text-ink2">
        By sending this form, you ask WOY Consulting to contact you about your enquiry. Read our{" "}
        <Link href="/privacy-policy" className="text-ink underline decoration-line2 underline-offset-4 transition-colors hover:text-red focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-action">Privacy Policy</Link>{" "}
        to learn how we handle your details.
      </p>

      <button type="submit" disabled={busy} className="relative mt-1 inline-flex min-h-14 cursor-pointer items-center justify-center rounded-[2px] bg-action px-10 py-4 text-base font-medium text-white transition-[background-color,box-shadow,transform] duration-200 hover:bg-action-hover hover:shadow-[0_10px_26px_-12px_rgba(205,20,33,.7)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-action active:translate-y-px disabled:cursor-wait disabled:opacity-70">
        {site.cta}
        <span className="absolute right-4 flex w-5 justify-center" aria-hidden="true">{busy && <CircleNotch size={19} className="animate-spin" />}</span>
      </button>

      <div role="status" aria-live="polite" aria-atomic="true" className="min-h-12">
        {busy ? <p className="text-sm text-ink2">Sending your request…</p> : status && (
          <p className={`rounded-[2px] border px-4 py-3 text-sm font-medium ${status.kind === "ok" ? "border-line2 bg-sunken text-ink" : "border-danger text-danger"}`}>{status.msg}</p>
        )}
      </div>
    </form>
  );
}
