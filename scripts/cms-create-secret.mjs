// Adds a random SANITY_REVALIDATE_SECRET to .env.local without ever printing it.
// The file is opened once ("a+": create if missing, read, append) and read and written through the
// same descriptor, so nothing can swap the file between the check and the write.
import { appendFileSync, closeSync, openSync, readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";

const fd = openSync(".env.local", "a+", 0o600);
try {
  const current = readFileSync(fd, "utf8");
  if (/^SANITY_REVALIDATE_SECRET=\S{32,}$/m.test(current)) {
    console.log("SANITY_REVALIDATE_SECRET already set in .env.local; left unchanged.");
  } else {
    const separator = current && !current.endsWith("\n") ? "\n" : "";
    appendFileSync(fd, `${separator}SANITY_REVALIDATE_SECRET=${randomBytes(32).toString("hex")}\n`);
    console.log("Added SANITY_REVALIDATE_SECRET to .env.local (value not shown). Open the file to copy it when configuring Sanity and Vercel.");
  }
} finally {
  closeSync(fd);
}
