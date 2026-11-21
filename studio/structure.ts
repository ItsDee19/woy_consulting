import { orderableDocumentListDeskItem } from "@sanity/orderable-document-list";
import type { StructureResolver } from "sanity/structure";

export const structure: StructureResolver = (S, context) =>
  S.list()
    .title("Website content")
    .items([
      orderableDocumentListDeskItem({ type: "caseStudy", title: "Case studies", S, context }),
      orderableDocumentListDeskItem({ type: "person", title: "People", S, context }),
      S.documentTypeListItem("resource").title("Resources"),
    ]);
