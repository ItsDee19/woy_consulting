// Sends a correctly signed revalidate request to a local server, the way Sanity's webhook would.
import { encodeSignatureHeader, SIGNATURE_HEADER_NAME } from "@sanity/webhook";

const base = process.env.TEST_BASE_URL || "http://localhost:5173";
const secret = process.env.SANITY_REVALIDATE_SECRET;
if (!secret) {
  console.error("SANITY_REVALIDATE_SECRET is not set. Run `npm run cms:secret` first.");
  process.exit(1);
}
const body = JSON.stringify({ _type: "manual", _id: "local-revalidate" });
const signature = await encodeSignatureHeader(body, Date.now(), secret);
const response = await fetch(`${base}/api/revalidate`, {
  method: "POST", headers: { "content-type": "application/json", [SIGNATURE_HEADER_NAME]: signature }, body,
});
console.log(`POST /api/revalidate → ${response.status}`);
if (!response.ok) process.exitCode = 1;
