"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/lib/content";
import styles from "./ContactForm.module.css";

type TurnstileOptions = {
  sitekey: string;
  action: string;
  theme: "light" | "dark";
  size: "flexible" | "compact";
  retry: "never";
  "response-field": false;
  "refresh-expired": "manual";
  "refresh-timeout": "manual";
  callback: (token: string) => void;
  "error-callback": () => boolean;
  "expired-callback": () => void;
  "timeout-callback": () => void;
  "unsupported-callback": () => void;
};
type TurnstileAPI = {
  render: (container: HTMLElement, options: TurnstileOptions) => string;
  remove: (widgetId: string) => void;
};
declare global { interface Window { turnstile?: TurnstileAPI } }

const SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let scriptRequest: Promise<TurnstileAPI> | undefined;

// Share one script across client navigations. A failed load is removed so a retry
// can use the same official URL without losing the visitor's form entries.
function loadTurnstile(nonce?: string): Promise<TurnstileAPI> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (scriptRequest) return scriptRequest;
  scriptRequest = new Promise<TurnstileAPI>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.dataset.woyTurnstile = "true";
    if (nonce) script.nonce = nonce;
    const timeout = window.setTimeout(() => fail(), 12_000);
    function cleanup() {
      window.clearTimeout(timeout);
      script.onload = null;
      script.onerror = null;
    }
    function fail() {
      cleanup();
      script.remove();
      reject(new Error("Security check unavailable"));
    }
    script.onload = () => {
      if (!window.turnstile) return fail();
      cleanup();
      resolve(window.turnstile);
    };
    script.onerror = fail;
    document.head.appendChild(script);
  }).catch(error => {
    scriptRequest = undefined;
    throw error;
  });
  return scriptRequest;
}

type Status = "loading" | "ready" | "verified" | "expired" | "error";
type Props = { siteKey: string; nonce?: string; resetKey: number; onToken: (token: string) => void };

export function TurnstileCheck({ siteKey, nonce, resetKey, onToken }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const [retry, setRetry] = useState(0);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    let active = true;
    let api: TurnstileAPI | undefined;
    let widgetId: string | undefined;
    let generation = 0;
    let configuration = "";
    let resize: ResizeObserver | undefined;
    let theme: MutationObserver | undefined;
    onToken("");

    function render() {
      if (!active || !api || !element) return;
      const appearance = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
      const size = element.getBoundingClientRect().width < 300 ? "compact" : "flexible";
      const nextConfiguration = `${appearance}/${size}`;
      if (widgetId !== undefined && configuration === nextConfiguration) return;
      configuration = nextConfiguration;
      const current = ++generation;
      if (widgetId !== undefined) api.remove(widgetId);
      onToken("");
      setStatus("ready");
      const update = (next: Status, token = "") => {
        if (!active || current !== generation) return;
        onToken(token);
        setStatus(next);
      };
      try {
        widgetId = api.render(element, {
          sitekey: siteKey, action: "contact", theme: appearance, size,
          retry: "never", "response-field": false,
          "refresh-expired": "manual", "refresh-timeout": "manual",
          callback: token => update("verified", token),
          "error-callback": () => { update("error"); return true; },
          "expired-callback": () => update("expired"),
          "timeout-callback": () => update("expired"),
          "unsupported-callback": () => update("error"),
        });
      } catch {
        update("error");
      }
    }

    loadTurnstile(nonce).then(loaded => {
      if (!active) return;
      api = loaded;
      render();
      resize = new ResizeObserver(render);
      resize.observe(element);
      theme = new MutationObserver(render);
      theme.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    }).catch(() => { if (active) setStatus("error"); });

    return () => {
      active = false;
      generation += 1;
      resize?.disconnect();
      theme?.disconnect();
      if (widgetId !== undefined) api?.remove(widgetId);
    };
  }, [siteKey, nonce, resetKey, retry, onToken]);

  const needsRetry = status === "error" || status === "expired";
  return (
    <div id="f-security" tabIndex={-1} className={styles.security} aria-label="Security check" aria-describedby="security-status">
      <div ref={container} className={styles.securityWidget} />
      <p id="security-status" role="status" className={styles.securityStatus}>
        {status === "loading" && "Loading security check…"}
        {status === "ready" && "Please complete the security check."}
        {status === "verified" && "Security check complete."}
        {status === "expired" && "Your security check has expired. Please try it again before sending."}
        {status === "error" && <>The security check could not load. Please retry or email <a href={`mailto:${site.email}`}>{site.email}</a>.</>}
      </p>
      {needsRetry && <button className={styles.securityRetry} type="button" onClick={() => { setStatus("loading"); setRetry(previous => previous + 1); requestAnimationFrame(() => document.getElementById("f-security")?.focus()); }}>Retry security check</button>}
      <p className={styles.securityNotice}>Protected by Cloudflare Turnstile. <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer">Privacy<span className="sr-only"> (opens in a new tab)</span></a> and <a href="https://www.cloudflare.com/website-terms/" target="_blank" rel="noopener noreferrer">Terms<span className="sr-only"> (opens in a new tab)</span></a>.</p>
    </div>
  );
}
