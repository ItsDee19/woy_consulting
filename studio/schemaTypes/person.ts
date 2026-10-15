import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";
import { defineArrayMember, defineField, defineType } from "sanity";

const older = "older";

export const person = defineType({
  name: "person",
  title: "Person",
  type: "document",
  orderings: [orderRankOrdering],
  fieldsets: [{
    name: older,
    title: "Older practitioners page (/practitioners)",
    description: "Optional. Empty fields reuse the main fields; the highlight box is hidden unless all three highlight fields are filled.",
    options: { collapsible: true, collapsed: true },
  }],
  fields: [
    orderRankField({ type: "person" }),
    defineField({ name: "name", title: "Name", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "slug", title: "Web address", type: "slug", description: "The part after /people/. Changing it changes the page address.", options: { source: "name", maxLength: 80 }, validation: (rule) => rule.required() }),
    defineField({ name: "role", title: "Role", type: "string", validation: (rule) => rule.required() }),
    defineField({
      name: "group", title: "Group on Leadership & Partners", type: "string",
      options: { list: [{ title: "Our Leadership", value: "leadership" }, { title: "Our Partners", value: "partner" }], layout: "radio" },
      initialValue: "leadership", validation: (rule) => rule.required(),
    }),
    defineField({ name: "portrait", title: "Portrait", type: "image", description: "Click the crop icon and drag the focal point onto the face; profile pages frame the photo around it.", options: { hotspot: true }, validation: (rule) => rule.required() }),
    defineField({ name: "introduction", title: "Introduction", type: "text", rows: 3, validation: (rule) => [rule.required(), rule.max(200).warning()] }),
    defineField({ name: "biography", title: "Biography", type: "array", description: "One entry per paragraph.", of: [defineArrayMember({ type: "text", rows: 4 })], validation: (rule) => rule.required().min(1) }),
    defineField({ name: "experience", title: "Previous organisations", type: "array", of: [defineArrayMember({ type: "string" })] }),
    defineField({ name: "focus", title: "Focus line", type: "string", description: "One line under the name on the Leadership & Partners page.", validation: (rule) => [rule.required(), rule.max(80).warning()] }),
    defineField({ name: "linkedin", title: "LinkedIn profile", type: "url", validation: (rule) => rule.uri({ scheme: ["https"] }) }),
    defineField({ name: "document", title: "Downloadable document (optional)", type: "documentAttachment" }),
    defineField({ name: "olderRole", title: "Role", type: "string", fieldset: older }),
    defineField({ name: "lede", title: "Short introduction", type: "text", rows: 2, fieldset: older }),
    defineField({ name: "olderBio", title: "Biography", type: "array", of: [defineArrayMember({ type: "text", rows: 4 })], fieldset: older }),
    defineField({ name: "expertise", title: "Areas of focus", type: "array", of: [defineArrayMember({ type: "string" })], fieldset: older }),
    defineField({ name: "olderPhoto", title: "Photo", type: "image", options: { hotspot: true }, fieldset: older }),
    defineField({ name: "highlightLabel", title: "Highlight: label", type: "string", fieldset: older }),
    defineField({ name: "highlightDetail", title: "Highlight: detail", type: "string", fieldset: older }),
    defineField({ name: "highlightBackground", title: "Highlight: background line", type: "string", fieldset: older }),
  ],
  preview: { select: { title: "name", subtitle: "role", media: "portrait" } },
});
