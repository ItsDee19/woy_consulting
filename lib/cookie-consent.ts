export const COOKIE_PREFERENCES_KEY = "woy-cookie-preferences";
export const COOKIE_PREFERENCES_EVENT = "woy-cookie-preferences-changed";

export type CookiePreferences = {
  version: 1;
  preferences: boolean;
  updatedAt: string;
};

export function readCookiePreferences(): CookiePreferences | null {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(COOKIE_PREFERENCES_KEY) ?? "null");
    if (
      typeof stored === "object" && stored !== null &&
      "version" in stored && stored.version === 1 &&
      "preferences" in stored && typeof stored.preferences === "boolean" &&
      "updatedAt" in stored && typeof stored.updatedAt === "string"
    ) {
      return stored as CookiePreferences;
    }
  } catch {
    // An unavailable store or an older/malformed record never grants consent.
  }
  return null;
}

export function hasPreferenceConsent(): boolean {
  return readCookiePreferences()?.preferences === true;
}
