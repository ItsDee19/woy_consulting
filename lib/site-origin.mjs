/** Canonical URL rules shared by Next configuration and server metadata. */

/** @param {string} hostname */
export function isLocalHost(hostname) {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  return host === "localhost" || host.endsWith(".localhost") ||
    /^127(?:\.\d{1,3}){3}$/.test(host) || host === "0.0.0.0" || host === "[::1]" ||
    /^\[::ffff:7f[0-9a-f]{2}:[0-9a-f]{1,4}\]$/.test(host);
}

/** @param {string} value */
export function normalizeSiteOrigin(value) {
  let url;
  try {
    url = new URL(value.trim());
  } catch {
    throw new Error("SITE_URL must be an HTTP(S) origin, without a path, credentials or query string.");
  }
  if (!/^https?:$/.test(url.protocol) || url.username || url.password ||
      url.pathname !== "/" || url.search || url.hash) {
    throw new Error("SITE_URL must be an HTTP(S) origin, without a path, credentials or query string.");
  }
  if (!isLocalHost(url.hostname)) url.protocol = "https:";
  return url.origin;
}

/** @param {Record<string, string | undefined>} environment */
export function configuredSiteOrigins(environment) {
  const explicit = environment.SITE_URL?.trim() || environment.NEXT_PUBLIC_SITE_URL?.trim();
  const candidates = [
    explicit,
    ...[environment.VERCEL_PROJECT_PRODUCTION_URL, environment.VERCEL_URL]
      .filter(Boolean)
      .map((hostname) => `https://${hostname?.trim()}`),
  ].filter((value) => typeof value === "string" && value.length > 0);
  return [...new Set(candidates.map((value) => normalizeSiteOrigin(value)))];
}

/** Resolve indexability without ever allowing local or preview pages into search.
 * @param {Record<string, string | undefined>} environment
 */
export function siteSettings(environment) {
  const siteUrl = configuredSiteOrigins(environment)[0] || "http://localhost:5173";
  const isIndexable = environment.NODE_ENV === "production" &&
    environment.VERCEL_ENV !== "preview" && environment.VERCEL_ENV !== "development" &&
    environment.SITE_INDEXING?.trim().toLowerCase() !== "disabled" &&
    !isLocalHost(new URL(siteUrl).hostname);
  return { siteUrl, isIndexable };
}
