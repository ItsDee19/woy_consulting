import Image from "next/image";
import { StructuredData } from "@/components/StructuredData";
import { ContactForm } from "@/components/ContactForm";
import { contentPageGraph, schemaId } from "@/lib/structured-data";
import { pageMetadata } from "@/lib/metadata";
import { site } from "@/lib/content";
import styles from "./contact.module.css";

export const metadata = pageMetadata(
  "Start a conversation",
  `Email WOY Consulting at ${site.email} or share your details to discuss your leadership, people or business challenge with a partner.`,
  "/contact"
);

export default function ContactPage() {
  return (
    <>
      <StructuredData id="contact-structured-data" nodes={contentPageGraph({
        path: "/contact", name: "Contact WOY Consulting", description: metadata.description ?? "",
        type: "ContactPage", mainEntity: { "@id": schemaId("/", "organization") },
      })} />
      <section className={`recreation ${styles.page}`} aria-labelledby="contact-heading">
        <div className={styles.layout}>
          <div className={styles.introduction}>
            <p className={styles.eyebrow}>Start a conversation</p>
            <h1 id="contact-heading" className={styles.title}>
              What’s your<br />
              <em>next chapter?</em>
            </h1>
            <p className={styles.lead}>
              A business priority. A leadership challenge. A change you need to make.
            </p>
            <p className={styles.description}>
              Tell us what’s on your mind. The first step is to understand your context and explore where WOY can contribute.
            </p>

            <div className={styles.directContact}>
              <p className={styles.eyebrow}>Email us</p>
              <a className={styles.email} href={`mailto:${site.email}`}>{site.email}</a>
            </div>

            <div className={styles.signature}>
              <Image
                className={styles.portrait}
                src="/assets/vipin-tuteja.jpeg"
                alt="Vipin Tuteja"
                width={60}
                height={60}
                sizes="60px"
              />
              <div>
                <p className={styles.name}>Vipin Tuteja</p>
                <p className={styles.role}>Founder &amp; Managing Director</p>
              </div>
            </div>

            <div className={styles.note}>
              <p className={styles.eyebrow}>Thoughtful conversation.<br />Practical next steps.</p>
              <p className={styles.noteDescription}>Every engagement begins with your priorities.</p>
            </div>
          </div>

          <div className={styles.formPanel}>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
