// Adds a random SANITY_REVALIDATE_SECRET to .env.local without ever printing it.
import { appendFileSync, existsSync, readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";

const file = ".env.local";
const current = existsSync(file) ? readFileSync(file, "utf8") : "";
if (/^SANITY_REVALIDATE_SECRET=\S{32,}$/m.test(current)) {
  console.log("SANITY_REVALIDATE_SECRET already set in .env.local; left unchanged.");
} else {
  const separator = current && !current.endsWith("\n") ? "\n" : "";
  appendFileSync(file, `${separator}SANITY_REVALIDATE_SECRET=${randomBytes(32).toString("hex")}\n`);
  console.log("Added SANITY_REVALIDATE_SECRET to .env.local (value not shown). Open the file to copy it when configuring Sanity and Vercel.");
}
