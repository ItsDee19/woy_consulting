import { revalidateTag } from "next/cache";
import { isValidSignature, SIGNATURE_HEADER_NAME } from "@sanity/webhook";

export const dynamic = "force-dynamic";

const MAX_BODY_CHARACTERS = 64 * 1024;
const empty = (status: number) => new Response(null, { status });

/** Sanity publish webhook: verifies the HMAC signature, then expires every CMS read ("sanity" tag). */
export async function POST(request: Request) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret || secret.length < 32) return empty(503);
  const signature = request.headers.get(SIGNATURE_HEADER_NAME);
  const body = await request.text();
  if (body.length > MAX_BODY_CHARACTERS) return empty(413);
  if (!signature) return empty(401);
  let valid = false;
  try {
    valid = await isValidSignature(body, signature, secret);
  } catch {
    valid = false;
  }
  if (!valid) return empty(401);
  revalidateTag("sanity", { expire: 0 });
  return Response.json({ revalidated: true });
}
