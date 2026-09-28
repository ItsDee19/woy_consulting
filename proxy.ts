import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { contentSecurityPolicy } from "./lib/security-policy.mjs";
import { isLocalHost } from "./lib/site-origin.mjs";

export function proxy(request: NextRequest) {
  const nonce = randomBytes(24).toString("base64");
  const policy = contentSecurityPolicy({
    nonce,
    production: process.env.NODE_ENV === "production",
    https: !isLocalHost(request.nextUrl.hostname),
    turnstile: Boolean(process.env.TURNSTILE_SITE_KEY?.trim()),
  });
  const requestHeaders = new Headers(request.headers);
  // Overwrite client-supplied values before Next extracts the nonce for its scripts.
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", policy);
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", policy);
  // HTML with a one-use nonce must never enter a shared CDN or browser cache.
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}

export const config = {
  matcher: ["/((?!api/contact$|_next/static|_next/image|assets/|images/|logos/|fonts/|credentials/|practitioners/[^/]+\\.webp$|favicon\\.ico$|icon\\.svg$|apple-icon\\.png$|opengraph-image(?:/|$)|twitter-image(?:/|$)|robots\\.txt$|sitemap\\.xml$|llms\\.txt$).*)"],
};
