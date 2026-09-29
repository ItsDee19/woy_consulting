import "server-only";
import { PRIVACY_NOTICE_VERSION, validateContactField, type ContactValues } from "../contact-validation";

const EMAIL_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type DeliveryConfiguration = { apiKey: string; from: string; to: string };

export function getContactDeliveryConfiguration(): DeliveryConfiguration | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.CONTACT_FROM_EMAIL;
  const to = process.env.CONTACT_TO_EMAIL;
  // Only one bare mailbox is accepted for each server-configured address.
  // Display names and recipient lists cannot change the fixed delivery envelope.
  const mailbox = (value: string | undefined): value is string =>
    typeof value === "string" && !validateContactField("email", value) && !/[,;:"()[\]\\]/.test(value);
  if (!apiKey || apiKey.length > 256 || !/^re_[A-Za-z0-9_-]+$/.test(apiKey) || !mailbox(from) || !mailbox(to)) return null;
  return { apiKey, from: from.trim(), to: to.trim() };
}

export async function sendContactEnquiry(
  config: DeliveryConfiguration,
  values: ContactValues,
  id: string,
  signal: AbortSignal,
): Promise<boolean> {
  // Keep every field deterministic so an uncertain retry uses exactly the same
  // request with the same Resend idempotency key. Never use the visitor as sender.
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      "Idempotency-Key": `contact/${id}`,
    },
    body: JSON.stringify({
      from: `WOY Consulting <${config.from}>`,
      to: [config.to],
      reply_to: values.email,
      subject: "New website enquiry | WOY Consulting",
      text: [
        "New website enquiry", "",
        `Name: ${values.name}`,
        `Email: ${values.email}`,
        `Organisation: ${values.organisation || "Not provided"}`,
        "", "Message:", values.message, "",
        `Enquiry ID: ${id}`,
        "Consent to be contacted: Yes",
        `Privacy notice version: ${PRIVACY_NOTICE_VERSION}`,
      ].join("\n"),
    }),
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.any([signal, AbortSignal.timeout(15_000)]),
  });
  if (!response.ok) {
    // Provider error bodies may contain private configuration or submitted data.
    void response.body?.cancel().catch(() => {});
    return false;
  }
  const result: unknown = await response.json();
  if (!result || typeof result !== "object" || !("id" in result) ||
      typeof result.id !== "string" || !EMAIL_ID.test(result.id)) {
    // A malformed acknowledgement is uncertain, never proof of successful sending.
    throw new Error("Email acceptance could not be confirmed");
  }
  return true;
}
