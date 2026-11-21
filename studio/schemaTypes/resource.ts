import { defineField, defineType } from "sanity";
import { IMAGE_FORMATS, PUBLIC_UPLOAD_WARNING } from "./documentAttachment";

export const resource = defineType({
  name: "resource",
  title: "Resource",
  type: "document",
  orderings: [{ title: "Newest first", name: "dateDesc", by: [{ field: "date", direction: "desc" }] }],
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (rule) => [rule.required(), rule.max(110).warning()] }),
    defineField({ name: "description", title: "Short description", type: "text", rows: 3, validation: (rule) => rule.max(240) }),
    defineField({
      name: "category", title: "Category", type: "string",
      options: { list: ["Brochure", "Whitepaper", "Report", "Other"], layout: "radio", direction: "horizontal" },
      initialValue: "Brochure", validation: (rule) => rule.required(),
    }),
    defineField({ name: "file", title: "File", type: "file", description: PUBLIC_UPLOAD_WARNING, options: { accept: ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx" }, validation: (rule) => rule.required() }),
    defineField({ name: "date", title: "Date", type: "date", initialValue: () => new Date().toISOString().slice(0, 10), validation: (rule) => rule.required() }),
    defineField({ name: "coverImage", title: "Cover image (optional)", type: "image", options: { hotspot: true, accept: IMAGE_FORMATS } }),
  ],
  preview: {
    select: { title: "title", category: "category", date: "date", media: "coverImage" },
    prepare: ({ title, category, date, media }) => ({ title, subtitle: [category, date].filter(Boolean).join(" · "), media }),
  },
});
