import { serializeStructuredData, type SchemaNode } from "@/lib/structured-data";

/** Server-rendered JSON-LD; this component adds no browser JavaScript. */
export function StructuredData({ nodes, id }: { nodes: SchemaNode[]; id?: string }) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeStructuredData(nodes) }}
    />
  );
}
