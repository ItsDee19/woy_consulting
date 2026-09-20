import Link from "next/link";
import { LegalPage, type LegalSection } from "@/components/LegalPage";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Terms and conditions",
  "Terms for using the WOY Consulting website, including enquiries, website content, intellectual property and links to other websites.",
  "/terms-and-conditions",
);

const sections: LegalSection[] = [
  {
    id: "using-this-website",
    title: "Using this website",
    content: (
      <p>
        These terms apply to your use of the WOY Consulting website.
        The site introduces our work, practitioners and services and lets you request a conversation.
        Please use it lawfully and with respect for other visitors and the people whose work appears here.
      </p>
    ),
  },
  {
    id: "information-and-advice",
    title: "Website information and advice",
    content: (
      <>
        <p>
          Website material provides general information about our approach and experience.
          It is not advice tailored to your organisation or a substitute for an assessment of your specific circumstances.
          Case studies describe particular engagements; they do not guarantee the same results for another organisation.
        </p>
        <p>
          Content, practitioner availability and service descriptions may change.
          Please confirm the scope and suitability of any proposed work directly with a WOY partner.
        </p>
      </>
    ),
  },
  {
    id: "enquiries-and-engagements",
    title: "Enquiries and engagements",
    content: (
      <>
        <p>
          Submitting the contact form requests a conversation. It does not create an advisory relationship,
          reserve availability or commit either party to a project.
          The scope, fees, deliverables, confidentiality and other terms of an engagement will be agreed separately.
        </p>
        <p>
          Provide accurate contact details that you are authorised to share.
          Please do not send confidential or sensitive business information through the website form.
          Information submitted through the site is handled as described in our <Link href="/privacy-policy">privacy policy</Link>.
        </p>
      </>
    ),
  },
  {
    id: "content-and-marks",
    title: "Content and brand marks",
    content: (
      <>
        <p>
          Website text, artwork, designs and other materials belong to WOY Consulting or their respective owners.
          You may view and share links to public pages. Ask for permission before reproducing or adapting material for commercial use,
          except where applicable law permits that use.
        </p>
        <p>
          Third-party names and logos remain the property of their owners.
          Any accompanying context or disclaimer applies to references to past work, affiliate platforms and delivery partnerships;
          displaying a mark does not by itself imply endorsement of this website.
        </p>
      </>
    ),
  },
  {
    id: "acceptable-use",
    title: "Acceptable use",
    content: (
      <p>
        Do not misuse the contact form, impersonate another person, submit spam or malicious code,
        attempt unauthorised access, or deliberately disrupt the website.
        Automated protections may limit or reject requests to protect availability and prevent abuse.
      </p>
    ),
  },
  {
    id: "external-links-and-availability",
    title: "External links and availability",
    content: (
      <>
        <p>
          Links to other websites are provided for reference. Their content, services and privacy practices are governed by their own terms.
          Review those terms when leaving this website.
        </p>
        <p>
          We cannot guarantee uninterrupted access or that every page will always be complete or current.
          If you find an error or cannot use a feature, please let us know through the <Link href="/contact">contact page</Link>.
          Nothing in these terms removes rights or liabilities that cannot be excluded under applicable law.
        </p>
      </>
    ),
  },
  {
    id: "questions-and-updates",
    title: "Questions and updates",
    content: (
      <p>
        Contact WOY Consulting through our <Link href="/contact">contact page</Link> with questions about these terms or permission to use website material.
        We may update the terms as the website changes; the date above identifies the current version.
        Any separately agreed engagement terms govern the services covered by that agreement.
      </p>
    ),
  },
];

export default function TermsAndConditionsPage() {
  return <LegalPage title="Terms and conditions" lede="The terms for exploring our work and getting in touch through this website." sections={sections} />;
}
