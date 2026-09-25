"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check } from "@phosphor-icons/react";
import { site } from "@/lib/content";
import { contactFields, contactRules, PRIVACY_NOTICE_VERSION, validateContact, validateContactField, type ContactErrors, type ContactField, type ContactValues } from "@/lib/contact-validation";
import styles from "./ContactForm.module.css";

const EMPTY_VALUES: ContactValues = { name: "", email: "", organisation: "", message: "" };
const labels = { name: "Your name", email: "Email address", organisation: "Organisation", message: "What would you like to move forward?" };
const placeholders = { name: "Full name", email: "you@organisation.com", organisation: "Organisation name", message: "Tell us a little about your business priorities or leadership challenge." };
type Session = { readyAt: number; error?: string };
class ContactSubmissionError extends Error {}

async function prepareSession(signal: AbortSignal): Promise<Session> {
  const response = await fetch("/api/contact", { credentials: "same-origin", cache: "no-store", signal });
  const data = await response.json();
  if (!response.ok) return { readyAt: 0, error: data.message || "The contact form is temporarily unavailable. Please try again later." };
  return { readyAt: Date.now() + Math.min(2000, Math.max(0, Number(data.readyAfterMs) || 0)) };
}

export function ContactForm() {
  const [values, setValues] = useState<ContactValues>(EMPTY_VALUES);
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<ContactErrors>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [complete, setComplete] = useState(false);
  const inFlight = useRef(false);
  const submissionId = useRef<string | null>(null);
  const submission = useRef<AbortController | null>(null);
  const successPanel = useRef<HTMLDivElement>(null);

  useEffect(() => () => submission.current?.abort(), []);
  useEffect(() => { if (complete) successPanel.current?.focus(); }, [complete]);

  function onChange(field: ContactField, value: string) {
    setValues(previous => ({ ...previous, [field]: value }));
    submissionId.current = null;
    if (errors[field]) setErrors(previous => ({ ...previous, [field]: validateContactField(field, value) }));
  }

  function showFieldErrors(next: ContactErrors) {
    setErrors(next);
    const firstBad = [...contactFields, "consent" as const].find(field => next[field]);
    if (firstBad) document.getElementById(`f-${firstBad}`)?.focus();
    return Boolean(firstBad);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    setError(null);
    const next = validateContact(values);
    if (!consent) next.consent = "Please give your consent so we can respond to your enquiry.";
    if (showFieldErrors(next)) return;
    inFlight.current = true;
    setBusy(true);
    const controller = new AbortController();
    submission.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 25_000);
    try {
      submissionId.current ||= crypto.randomUUID();
      const prepared = await prepareSession(controller.signal);
      if (prepared.error) throw new ContactSubmissionError(prepared.error);
      const wait = prepared.readyAt - Date.now();
      if (wait > 0) await new Promise(resolve => window.setTimeout(resolve, wait));
      controller.signal.throwIfAborted();
      const response = await fetch("/api/contact", {
        method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, website, id: submissionId.current, consent: true, privacyNoticeVersion: PRIVACY_NOTICE_VERSION }),
        signal: controller.signal,
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.errors) showFieldErrors(data.errors);
        throw new ContactSubmissionError(data.message || "Your enquiry could not be received. Please try again later.");
      }
      setErrors({});
      setComplete(true);
    } catch (failure) {
      if (!controller.signal.aborted || submission.current === controller) {
        setError(failure instanceof ContactSubmissionError ? failure.message : "We could not confirm receipt. Your details are still here; check your connection before trying again.");
      }
    } finally {
      window.clearTimeout(timeout);
      inFlight.current = false;
      setBusy(false);
    }
  }

  function reset() {
    setValues(EMPTY_VALUES);
    setConsent(false);
    setWebsite("");
    setErrors({});
    setError(null);
    submissionId.current = null;
    setComplete(false);
    requestAnimationFrame(() => document.getElementById("f-name")?.focus());
  }

  if (complete) return (
    <div ref={successPanel} role="status" tabIndex={-1} className={styles.success}>
      <span className={styles.check} aria-hidden="true"><Check size={28} /></span>
      <p className={styles.eyebrow}>Enquiry received</p>
      <h2>Thank you for<br />starting the conversation.</h2>
      <p>Your enquiry has been received by WOY Consulting. We look forward to understanding your priorities.</p>
      <button type="button" onClick={reset} className={styles.reset}>Send another enquiry</button>
    </div>
  );

  return (
    <form method="post" action="/api/contact" onSubmit={onSubmit} aria-busy={busy} className={styles.form}>
      <noscript><p className={styles.error}>Please enable JavaScript to use this form, or email <a href={`mailto:${site.email}`}>{site.email}</a>.</p></noscript>
      <div className={styles.fields}>
        {contactFields.map(field => {
          const common = {
            id: `f-${field}`, name: field, required: field !== "organisation", readOnly: busy,
            maxLength: contactRules[field].maxLength, value: values[field],
            placeholder: placeholders[field], onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(field, event.target.value),
            onBlur: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => setErrors(previous => ({ ...previous, [field]: validateContactField(field, event.target.value) })),
            "aria-invalid": errors[field] ? true as const : undefined,
            "aria-describedby": errors[field] ? `err-${field}` : undefined,
            className: styles.input,
          };
          return <div key={field} className={`${styles.field} ${field === "organisation" || field === "message" ? styles.full : ""}`}>
            <label htmlFor={`f-${field}`}>{labels[field]} {field === "organisation" ? <span className={styles.optional}>(optional)</span> : <span className={styles.required}>*</span>}</label>
            {field === "message" ? <textarea {...common} minLength={10} rows={5} /> : <input {...common} type={field === "email" ? "email" : "text"} autoComplete={field === "name" ? "name" : field === "email" ? "email" : "organization"} />}
            {errors[field] && <p id={`err-${field}`} className={styles.fieldError}>{errors[field]}</p>}
          </div>;
        })}
      </div>
      <div className={styles.honeypot} aria-hidden="true" inert>
        <label htmlFor="f-website">Leave this field empty</label>
        <input id="f-website" name="website" type="text" tabIndex={-1} autoComplete="off" maxLength={200} value={website} onChange={event => setWebsite(event.target.value)} />
      </div>
      <p className={styles.privacy}>Please avoid sensitive personal information or confidential business details. Read our <Link href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy (review draft)<span className="sr-only"> (opens in a new tab)</span></Link>, including the current retention and privacy-contact arrangements.</p>
      <div className={styles.consent}>
        <input id="f-consent" name="consent" type="checkbox" required checked={consent} disabled={busy} onChange={event => { setConsent(event.target.checked); submissionId.current = null; setErrors(previous => ({ ...previous, consent: undefined })); }} aria-invalid={errors.consent ? true : undefined} aria-describedby={errors.consent ? "err-consent" : undefined} />
        <label htmlFor="f-consent">I consent to WOY Consulting using my name, email address, organisation (if provided) and message to respond to this enquiry. <span className={styles.required}>*</span></label>
        {errors.consent && <p id="err-consent" className={styles.fieldError}>{errors.consent}</p>}
      </div>
      {error && <p role="alert" className={styles.error}>{error}</p>}
      <button type="submit" disabled={busy} className={styles.submit}><span>{busy ? "Sending your enquiry…" : "Send enquiry"}</span><ArrowUpRight size={20} aria-hidden="true" /></button>
    </form>
  );
}
