export const contactFields = ["name", "mobile", "email"] as const;
export type ContactField = (typeof contactFields)[number];
export type ContactValues = Record<ContactField, string>;
export type ContactErrors = Partial<Record<ContactField, string>>;

export const contactRules = {
  name: { label: "Full name", maxLength: 100 },
  mobile: { label: "Mobile number", maxLength: 32 },
  email: { label: "Email address", maxLength: 254 },
} satisfies Record<ContactField, { label: string; maxLength: number }>;

export function validateContactField(field: ContactField, value: unknown): string | undefined {
  if (typeof value !== "string" || value.length > contactRules[field].maxLength || /[\u0000-\u001f\u007f]/u.test(value)) {
    return `Please enter a valid ${contactRules[field].label.toLowerCase()} (up to ${contactRules[field].maxLength} characters).`;
  }
  const trimmed = value.trim();
  if (field === "name" && (trimmed.length < 2 || !/\p{L}/u.test(trimmed))) {
    return "Please enter your full name.";
  }
  if (field === "mobile") {
    const digits = trimmed.replace(/\D/g, "");
    if (!/^\+?[\d\s().-]+$/.test(trimmed) || digits.length < 7 || digits.length > 15) {
      return "Please enter a mobile number with 7 to 15 digits, including your country code.";
    }
  }
  if (field === "email" && !/^[^\s@<>]+@[^\s@<>.]+(?:\.[^\s@<>.]+)+$/.test(trimmed)) {
    return "Please enter a valid email address.";
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
