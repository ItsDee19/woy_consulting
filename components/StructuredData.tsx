import { headers } from "next/headers";
import { serializeStructuredData, type SchemaNode } from "@/lib/structured-data";

/** Server-rendered JSON-LD; this component adds no browser JavaScript. */
export async function StructuredData({ nodes, id }: { nodes: SchemaNode[]; id?: string }) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <script
      id={id}
      nonce={nonce}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeStructuredData(nodes) }}
    />
  );
}
