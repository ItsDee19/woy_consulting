import { contactFields, validateContact } from "../../../lib/contact-validation";
import {
  beginDelivery, CHALLENGE_LIFETIME_MS, consumeRateLimit, CONTACT_COOKIE,
  ContactBodyError, createChallenge, fingerprint, finishDelivery, getContactSecret,
  isSameOrigin, MIN_FORM_TIME_MS, rateLimitIdentity, readChallengeCookie,
  readContactBody, verifyChallenge,
} from "../../../lib/server/contact-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UNAVAILABLE = "The contact form is temporarily unavailable. Your details have not been sent. Please try again later.";
const SUCCESS = "Thank you. Your request has been sent to WOY Consulting.";

function json(body: Record<string, unknown>, status = 200, headers: Record<string, string> = {}) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", ...headers } });
}

function configuration() {
  const secret = getContactSecret();
  try {
    const endpoint = new URL(process.env.CONTACT_ENDPOINT || "");
    if (!secret || endpoint.protocol !== "https:" || endpoint.username || endpoint.password || endpoint.hash) return null;
    return { secret, endpoint };
  } catch { return null; }
}

export async function GET(request: Request) {
  if (!isSameOrigin(request, false)) return json({ message: "Please open the contact form on this website." }, 403);
  const config = configuration();
  if (!config) return json({ message: UNAVAILABLE }, 503);
  const previousToken = readChallengeCookie(request);
  const previous = verifyChallenge(previousToken, config.secret);
  const token = previous ? previousToken! : createChallenge(config.secret);
  const challenge = previous || verifyChallenge(token, config.secret)!;
  const secure = process.env.NODE_ENV === "production" || new URL(request.url).protocol === "https:";
  const remainingSeconds = Math.max(1, Math.floor((CHALLENGE_LIFETIME_MS - (Date.now() - challenge.issued)) / 1000));
  return json({ readyAfterMs: Math.max(0, MIN_FORM_TIME_MS - (Date.now() - challenge.issued)) }, 200, {
    "Set-Cookie": `${CONTACT_COOKIE}=${token}; Path=/api/contact; Max-Age=${remainingSeconds}; HttpOnly; SameSite=Strict${secure ? "; Secure" : ""}`,
  });
}

export async function POST(request: Request) {
  if (!isSameOrigin(request, true)) return json({ message: "Please send your request from the contact form on this website." }, 403);
  const config = configuration();
  if (!config) return json({ message: UNAVAILABLE }, 503);
  const challenge = verifyChallenge(readChallengeCookie(request), config.secret);
  if (!challenge) return json({ message: "Your form session expired. Please try again to start a new secure session." }, 403);
  if (Date.now() - challenge.issued < MIN_FORM_TIME_MS) {
    return json({ message: "Please wait a moment before sending your request." }, 429, { "Retry-After": "2" });
  }
  const retryAfter = consumeRateLimit(`sender:${rateLimitIdentity(request, challenge, config.secret)}`, 5);
  if (retryAfter) return json({ message: "Too many requests. Please try again in 15 minutes." }, 429, { "Retry-After": String(retryAfter) });
  let body: Record<string, unknown>;
  try {
    body = await readContactBody(request);
  } catch (error) {
    return json({ message: "We could not read your request. Please check your details and try again." }, error instanceof ContactBodyError ? error.status : 400);
  }
  if (typeof body.website !== "string" || body.website !== "" || Object.keys(body).some((key) => ![...contactFields, "website"].includes(key))) {
    return json({ message: "We could not verify your request. Please reload the page and try again." }, 400);
  }
  const errors = validateContact(body);
  if (Object.keys(errors).length) return json({ message: "Please correct the highlighted fields.", errors }, 422);
  const values = contactFields.map((field) => [field, (body[field] as string).trim()] as const);
  const deliveryKey = fingerprint(JSON.stringify([challenge.id, values]), config.secret);
  const delivery = beginDelivery(deliveryKey);
  if (delivery === "sent") return json({ message: SUCCESS });
  if (delivery === "pending") return json({ message: "Your request is already being sent. Please wait before trying again." }, 409);
  if (delivery === "full") return json({ message: UNAVAILABLE }, 503);
  // A global circuit breaker caps delivery even when bots repeatedly clear cookies.
  const globalRetry = consumeRateLimit("all-deliveries", 100);
  if (globalRetry) {
    finishDelivery(deliveryKey, false);
    return json({ message: "The contact form is busy. Please try again in 15 minutes." }, 429, { "Retry-After": String(globalRetry) });
  }
  let sent = false;
  try {
    const form = new FormData();
    for (const [key, value] of values) form.append(key, value);
    const headers: Record<string, string> = { Accept: "application/json" };
    if (process.env.CONTACT_ENDPOINT_TOKEN) headers.Authorization = `Bearer ${process.env.CONTACT_ENDPOINT_TOKEN}`;
    const upstream = await fetch(config.endpoint, {
      method: "POST", body: form, headers, cache: "no-store", redirect: "error", signal: AbortSignal.timeout(15_000),
    });
    sent = upstream.ok;
    await upstream.body?.cancel();
    if (!sent) return json({ message: "Your request could not be sent. Your details are still here; please try again later." }, 502);
    return json({ message: SUCCESS });
  } catch {
    return json({ message: "We could not confirm delivery. Your details are still here; please wait a moment before trying again." }, 502);
  } finally {
    finishDelivery(deliveryKey, sent);
  }
}
