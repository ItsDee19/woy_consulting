export const PRIVACY_NOTICE_VERSION = "2026-09-25";

export const contactFields = ["name", "email", "organisation", "message"] as const;
export type ContactField = (typeof contactFields)[number];
export type ContactValues = Record<ContactField, string>;
export type ContactErrors = Partial<Record<ContactField | "consent", string>>;

export const contactRules = {
  name: { label: "Your name", maxLength: 120 },
  email: { label: "Email address", maxLength: 254 },
  organisation: { label: "Organisation", maxLength: 200 },
  message: { label: "What would you like to move forward?", maxLength: 4000 },
} satisfies Record<ContactField, { label: string; maxLength: number }>;

export function validateContactField(field: ContactField, value: unknown): string | undefined {
  // A message may contain line breaks and tabs, but single-line fields may not.
  const controls = field === "message" ? /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u : /[\u0000-\u001f\u007f]/u;
  if (typeof value !== "string" || value.length > contactRules[field].maxLength || controls.test(value)) {
    const label = field === "name" || field === "message" ? field : contactRules[field].label.toLowerCase();
    return `Please enter a valid ${label} (up to ${contactRules[field].maxLength} characters).`;
  }
  const trimmed = value.trim();
  if (field === "name" && (trimmed.length < 2 || !/\p{L}/u.test(trimmed))) {
    return "Please enter your full name.";
  }
  if (field === "email" && !/^[^\s@<>]+@[^\s@<>.]+(?:\.[^\s@<>.]+)+$/.test(trimmed)) {
    return "Please enter a valid email address.";
  }
  if (field === "message" && trimmed.length < 10) {
    return "Please enter a message of at least 10 characters.";
  }
}

export function validateContact(values: Record<string, unknown>): ContactErrors {
  const errors: ContactErrors = {};
  for (const field of contactFields) {
    const error = validateContactField(field, values[field]);
    if (error) errors[field] = error;
  }
  return errors;
}
