import { defineField, defineType } from "sanity";

export const PUBLIC_UPLOAD_WARNING =
  "Anything uploaded here can be downloaded by anyone, even before you publish. Never upload confidential material.";

export const documentAttachment = defineType({
  name: "documentAttachment",
  title: "Downloadable document",
  type: "object",
  fields: [
    defineField({
      name: "file",
      title: "File",
      type: "file",
      description: PUBLIC_UPLOAD_WARNING,
      options: { accept: ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx" },
    }),
    defineField({
      name: "label",
      title: "Button label",
      type: "string",
      description: "Optional. Leave empty for the standard label.",
      validation: (rule) => rule.max(40),
    }),
  ],
  validation: (rule) =>
    rule.custom((value: { file?: { asset?: unknown }; label?: string } | undefined) =>
      value?.label && !value.file?.asset ? "Upload a file, or clear the button label." : true),
});
