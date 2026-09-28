import { contactFields, PRIVACY_NOTICE_VERSION, validateContact } from "../../../lib/contact-validation";
import {
  CHALLENGE_LIFETIME_MS, CONTACT_COOKIE, ContactBodyError, createChallenge, fingerprint,
  getContactSecret, isSameOrigin, MIN_FORM_TIME_MS, rateLimitIdentity,
  readChallengeCookie, readContactBody, verifyChallenge,
} from "../../../lib/server/contact-security";
import { getContactStore } from "../../../lib/server/contact-store";
import { hasTurnstileConfiguration, verifyTurnstile } from "../../../lib/server/contact-turnstile";
import { contactResponder } from "../../../lib/server/contact-telemetry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 45;

const UNAVAILABLE = "The contact form is temporarily unavailable. Your details have not been sent. Please try again later.";
const UNCONFIRMED = "We could not confirm delivery. Your details are still here; please wait a moment before trying again.";
const SUCCESS = "Your enquiry has been received by WOY Consulting.";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function configuration() {
  const secret = getContactSecret(), store = getContactStore();
  try {
    const endpoint = new URL(process.env.CONTACT_ENDPOINT || "");
    if (!secret || !store || endpoint.protocol !== "https:" || endpoint.username || endpoint.password || endpoint.hash ||
        (process.env.NODE_ENV === "production" && !hasTurnstileConfiguration())) return null;
    return { secret, endpoint, store };
  } catch { return null; }
}

export async function GET(request: Request) {
  const respond = contactResponder();
  if (!isSameOrigin(request, false)) return respond("origin_rejected", { message: "Please open the contact form on this website." }, 403);
  const config = configuration();
  if (!config) return respond("configuration_unavailable", { message: UNAVAILABLE }, 503);
  const identity = rateLimitIdentity(request, config.secret);
  if (!identity) return respond("identity_unavailable", { message: UNAVAILABLE }, 503);
  try {
    const retryAfter = await config.store.consumeRateLimit(`challenge:${identity}`, 20);
    if (retryAfter) return respond("rate_limited", { message: "Too many requests. Please try again later." }, 429, { "Retry-After": String(retryAfter) });
    const previousToken = readChallengeCookie(request);
    const previous = verifyChallenge(previousToken, config.secret);
    const token = previous ? previousToken! : createChallenge(config.secret);
    const challenge = previous || verifyChallenge(token, config.secret)!;
    const secure = process.env.NODE_ENV === "production" || new URL(request.url).protocol === "https:";
    const remainingSeconds = Math.max(1, Math.floor((CHALLENGE_LIFETIME_MS - (Date.now() - challenge.issued)) / 1000));
    return respond("challenge_issued", { readyAfterMs: Math.max(0, MIN_FORM_TIME_MS - (Date.now() - challenge.issued)) }, 200, {
      "Set-Cookie": `${CONTACT_COOKIE}=${token}; Path=/api/contact; Max-Age=${remainingSeconds}; HttpOnly; SameSite=Strict${secure ? "; Secure" : ""}`,
    });
  } catch { return respond("storage_unavailable", { message: UNAVAILABLE }, 503); }
}

export async function POST(request: Request) {
  const respond = contactResponder();
  if (!isSameOrigin(request, true)) return respond("origin_rejected", { message: "Please send your request from the contact form on this website." }, 403);
  const config = configuration();
  if (!config) return respond("configuration_unavailable", { message: UNAVAILABLE }, 503);
  const identity = rateLimitIdentity(request, config.secret);
  if (!identity) return respond("identity_unavailable", { message: UNAVAILABLE }, 503);
  try {
    // Stable edge identity is checked before cookies/body/token work. Rotating the
    // signed cookie, submission UUID or Turnstile token cannot reset this budget.
    const retryAfter = await config.store.consumeRateLimit(`sender:${identity}`, 5);
    if (retryAfter) return respond("rate_limited", { message: "Too many requests. Please try again in 15 minutes." }, 429, { "Retry-After": String(retryAfter) });
    const challenge = verifyChallenge(readChallengeCookie(request), config.secret);
    if (!challenge) return respond("invalid_session", { message: "Your form session expired. Please try again to start a new secure session." }, 403);
    if (Date.now() - challenge.issued < MIN_FORM_TIME_MS) {
      return respond("rate_limited", { message: "Please wait a moment before sending your request." }, 429, { "Retry-After": "2" });
    }
    let body: Record<string, unknown>;
    try { body = await readContactBody(request); }
    catch (error) {
      return respond("invalid_body", { message: "We could not read your request. Please check your details and try again." }, error instanceof ContactBodyError ? error.status : 400);
    }
    if (typeof body.website !== "string" || body.website !== "" || Object.keys(body).some((key) => ![...contactFields, "website", "id", "consent", "privacyNoticeVersion", "turnstileToken"].includes(key))) {
      return respond("validation_rejected", { message: "We could not verify your request. Please reload the page and try again." }, 400);
    }
    if (typeof body.id !== "string" || !UUID.test(body.id) || body.privacyNoticeVersion !== PRIVACY_NOTICE_VERSION) {
      return respond("validation_rejected", { message: "Your form is out of date or could not be verified. Please reload the page and try again." }, 400);
    }
    const errors = validateContact(body);
    if (body.consent !== true) errors.consent = "Please consent to WOY Consulting using your details to respond to this enquiry.";
    if (Object.keys(errors).length) return respond("validation_rejected", { message: "Please correct the highlighted fields.", errors }, 422);
    const botCheck = await verifyTurnstile(request, body.turnstileToken);
    if (botCheck === "unavailable") return respond("bot_unavailable", { message: UNAVAILABLE }, 503);
    if (botCheck !== "valid") return respond("bot_rejected", { message: "Please complete the security check again and retry." }, 422);
    const values = contactFields.map((field) => [field, (body[field] as string).trim()] as const);
    const id = body.id.toLowerCase();
    const deliveryKey = fingerprint(`enquiry:${id}`, config.secret);
    const payload = fingerprint(JSON.stringify([values, true, PRIVACY_NOTICE_VERSION]), config.secret);
    const delivery = await config.store.beginDelivery(deliveryKey, payload);
    if (delivery.state === "conflict") return respond("delivery_conflict", { message: "This enquiry ID was already used with different details. Please start a new enquiry." }, 409);
    if (delivery.state === "sent") return respond("already_sent", { message: SUCCESS });
    if (delivery.state === "pending") return respond("delivery_pending", { message: "Your request is already being sent. Please wait before trying again." }, 409);
    if (delivery.state === "full") return respond("storage_unavailable", { message: UNAVAILABLE }, 503);
    const globalRetry = await config.store.consumeRateLimit("all-deliveries", 100);
    if (globalRetry) {
      await config.store.finishDelivery(deliveryKey, delivery.lease, false);
      return respond("rate_limited", { message: "The contact form is busy. Please try again in 15 minutes." }, 429, { "Retry-After": String(globalRetry) });
    }
    let sent = false;
    try {
      const form = new FormData();
      for (const [key, value] of values) form.append(key, value);
      form.append("id", id);
      form.append("consent", "true");
      form.append("privacyNoticeVersion", PRIVACY_NOTICE_VERSION);
      const headers: Record<string, string> = { Accept: "application/json", "Idempotency-Key": id };
      if (process.env.CONTACT_ENDPOINT_TOKEN) headers.Authorization = `Bearer ${process.env.CONTACT_ENDPOINT_TOKEN}`;
      const upstream = await fetch(config.endpoint, {
        method: "POST", body: form, headers, cache: "no-store", redirect: "error",
        signal: AbortSignal.any([request.signal, AbortSignal.timeout(15_000)]),
      });
      sent = upstream.ok;
      void upstream.body?.cancel().catch(() => {});
    } catch {
      try { await config.store.finishDelivery(deliveryKey, delivery.lease, false); }
      catch { return respond("storage_unavailable", { message: UNCONFIRMED }, 503); }
      return respond("delivery_unconfirmed", { message: UNCONFIRMED }, 502);
    }
    try { await config.store.finishDelivery(deliveryKey, delivery.lease, sent); }
    catch { return respond("storage_unavailable", { message: UNCONFIRMED }, 503); }
    if (!sent) return respond("delivery_failed", { message: "Your request could not be sent. Your details are still here; please try again later." }, 502);
    return respond("delivery_sent", { message: SUCCESS });
  } catch { return respond("storage_unavailable", { message: UNAVAILABLE }, 503); }
}
