import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";
import { defineArrayMember, defineField, defineType } from "sanity";

const older = "older";

export const caseStudy = defineType({
  name: "caseStudy",
  title: "Case study",
  type: "document",
  orderings: [orderRankOrdering],
  fieldsets: [{
    name: older,
    title: "Older case-study page (/case-studies)",
    description: "Optional. Any field left empty reuses the matching main field above.",
    options: { collapsible: true, collapsed: true },
  }],
  fields: [
    orderRankField({ type: "caseStudy" }),
    defineField({ name: "title", title: "Title", type: "string", validation: (rule) => [rule.required(), rule.max(110).warning("Long titles may wrap awkwardly.")] }),
    defineField({ name: "slug", title: "Web address", type: "slug", description: "The part after /work/. Changing it changes the page address.", options: { source: "title", maxLength: 80 }, validation: (rule) => rule.required() }),
    defineField({ name: "industry", title: "Industry", type: "string", description: "Also used by the industry filter on Selected work.", validation: (rule) => [rule.required(), rule.max(40).warning()] }),
    defineField({ name: "summary", title: "Summary", type: "text", rows: 3, validation: (rule) => [rule.required(), rule.max(220).warning("Long summaries make the cards uneven.")] }),
    defineField({
      name: "coverText", title: "Cover text", type: "text", rows: 2,
      description: "Two short lines on the coloured cover. Press Enter between the lines.",
      validation: (rule) => [
        rule.required(),
        rule.custom((value?: string) => value && value.split("\n").length > 2 ? "Use at most two lines." : true),
      ],
    }),
    defineField({ name: "strap", title: "Strap line", type: "string", description: "Shown at the bottom of the cover, e.g. “Strategy · Governance · Culture”.", validation: (rule) => [rule.required(), rule.max(70).warning()] }),
    defineField({
      name: "theme", title: "Cover colour", type: "string",
      options: { list: [{ title: "Mist", value: "mist" }, { title: "Navy", value: "navy" }, { title: "Charcoal", value: "charcoal" }, { title: "Silver", value: "silver" }], layout: "radio", direction: "horizontal" },
      initialValue: "mist", validation: (rule) => rule.required(),
    }),
    defineField({ name: "featured", title: "Show on the homepage", type: "boolean", description: "The first four featured case studies, in list order, appear on the homepage.", initialValue: false }),
    defineField({ name: "context", title: "The context", type: "text", rows: 4, validation: (rule) => rule.required() }),
    defineField({ name: "focus", title: "Engagement focus", type: "array", of: [defineArrayMember({ type: "string" })], validation: (rule) => [rule.required().min(1), rule.max(6).warning()] }),
    defineField({
      name: "work", title: "The work", type: "array",
      of: [defineArrayMember({
        name: "workItem", type: "object",
        fields: [
          defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required() }),
          defineField({ name: "text", title: "Text", type: "text", rows: 3, validation: (rule) => rule.required() }),
        ],
        preview: { select: { title: "title", subtitle: "text" } },
      })],
      validation: (rule) => [rule.required().min(1), rule.max(6).warning()],
    }),
    defineField({ name: "resultsHeading", title: "Results heading", type: "string", description: "e.g. “What the engagement delivered”.", validation: (rule) => rule.required() }),
    defineField({ name: "results", title: "Results", type: "array", of: [defineArrayMember({ type: "string" })], validation: (rule) => [rule.required().min(1), rule.max(6).warning()] }),
    defineField({ name: "takeaway", title: "Takeaway", type: "text", rows: 2, validation: (rule) => [rule.required(), rule.max(160).warning()] }),
    defineField({ name: "document", title: "Downloadable document (optional)", type: "documentAttachment" }),
    defineField({ name: "legacySlug", title: "Older page address", type: "slug", fieldset: older, description: "The part after /case-studies/. Keep existing values so old links keep working." }),
    defineField({ name: "olderTitle", title: "Title", type: "string", fieldset: older }),
    defineField({ name: "olderIndustry", title: "Industry", type: "string", fieldset: older }),
    defineField({ name: "headline", title: "Headline", type: "text", rows: 2, fieldset: older }),
    defineField({ name: "olderContext", title: "The situation", type: "text", rows: 4, fieldset: older }),
    defineField({ name: "edge", title: "WOY’s role", type: "array", of: [defineArrayMember({ type: "string" })], fieldset: older }),
    defineField({ name: "framework", title: "Engagement design", type: "array", of: [defineArrayMember({ type: "string" })], fieldset: older }),
    defineField({ name: "outcomes", title: "What changed", type: "array", of: [defineArrayMember({ type: "string" })], fieldset: older }),
    defineField({ name: "olderOrder", title: "Position on the older page", type: "number", fieldset: older, validation: (rule) => rule.integer().min(1) }),
  ],
  preview: { select: { title: "title", subtitle: "industry" } },
});
