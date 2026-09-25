import Link from "next/link";
import { PRIVACY_NOTICE_VERSION } from "@/lib/contact-validation";
import { LegalPage, type LegalSection } from "@/components/LegalPage";
import { CookiePreferencesButton } from "@/components/CookieConsent";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Privacy policy",
  "How WOY Consulting handles contact enquiries, essential cookies and optional theme preferences, and how to contact us about your information.",
  "/privacy-policy",
);

const sections: LegalSection[] = [
  {
    id: "about-this-policy",
    title: "About this policy",
    content: (
      <p>
        This policy explains how WOY Consulting handles information through this website.
        It covers browsing, requests for a conversation and the choices you make on your device.
        An advisory engagement may involve separate confidentiality and data-handling terms.
      </p>
    ),
  },
  {
    id: "information-you-provide",
    title: "Information you provide",
    content: (
      <>
        <p>
          Our contact form asks for your name, email address, optional organisation and a message about your enquiry.
          It also records your consent, the privacy notice version and a submission identifier.
          We use these details to respond to your enquiry, arrange a conversation and discuss whether our services fit your needs.
          Sending an enquiry does not subscribe you to marketing emails.
        </p>
        <p>
          Please provide your own contact details or details you are authorised to share.
          The form does not ask for financial information, identity documents or confidential business material.
        </p>
      </>
    ),
  },
  {
    id: "technical-information",
    title: "Technical and security information",
    content: (
      <>
        <p>
          Website hosting services process technical information needed to deliver pages and protect the service,
          which can include your IP address, browser information, requested pages and request times.
        </p>
        <p>
          The contact form uses a temporary security token and short-lived request counters to help prevent spam and duplicate submissions.
          These counters use pseudonymous identifiers and submission fingerprints; they do not store your name, email address, organisation or message.
          These security records are temporary and are used to protect the contact service, not to build advertising profiles.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies and your choices",
    content: (
      <>
        <p>
          This website does not include analytics or advertising trackers.
          It uses the following cookies and browser storage:
        </p>
        <ul>
          <li>
            <strong className="font-medium text-ink">Contact protection:</strong> the essential <code>woy_contact</code> cookie helps verify form requests.
            It expires within one hour and is not available to page scripts.
          </li>
          <li>
            <strong className="font-medium text-ink">Your privacy choice:</strong> <code>woy-cookie-preferences</code> stores your choice on this device
            so we do not ask on every page. It remains until you change it or clear browser data.
          </li>
          <li>
            <strong className="font-medium text-ink">Optional theme memory:</strong> if you allow it, <code>woy-theme</code> remembers your light or dark theme
            until you turn this preference off or clear browser data. Without it, you can still switch themes during your visit.
          </li>
        </ul>
        <p>
          Optional storage is off unless you choose it. You can change your choice at any time using{" "}
          <CookiePreferencesButton className="font-medium text-ink underline underline-offset-4 hover:text-red" />
          {" "}in the footer. Choosing essential storage only removes the saved theme.
          Your browser also lets you delete cookies and local storage.
        </p>
      </>
    ),
  },
  {
    id: "sharing-and-storage",
    title: "Sharing and storage",
    content: (
      <>
        <p>
          Contact details pass through the website server to the enquiry-delivery service configured for WOY Consulting,
          so a partner can respond. Website hosting and enquiry-delivery providers process the information needed to operate those services.
          The form reports an error if delivery is unavailable; it does not treat an unavailable delivery service as a successful enquiry.
        </p>
        <p>
          Enquiry records may be held in WOY’s correspondence systems and those of its service providers.
          Retention depends on the purpose of the enquiry, any ongoing advisory relationship and applicable recordkeeping obligations.
          You can ask about records associated with your enquiry or request their deletion using the contact route below.
        </p>
        <p>
          Provider infrastructure may be located in a different country from you.
          Contact us if you need information about the providers or handling arrangements relevant to your enquiry before submitting it.
        </p>
      </>
    ),
  },
  {
    id: "your-requests",
    title: "Your requests and privacy contact",
    content: (
      <>
        <p>
          You may ask about information held about you, request a correction or deletion, or tell us you no longer want a response to an enquiry.
          The rights available and any exceptions depend on the law that applies to your request.
          We may need information to verify your identity before acting on a request.
        </p>
        <p>
          To raise a privacy question, concern or request, use our <Link href="/contact">contact page</Link> to request a conversation
          with WOY Consulting and explain the request when a partner contacts you.
        </p>
      </>
    ),
  },
  {
    id: "policy-updates",
    title: "Changes to this policy",
    content: (
      <p>
        We may update this policy when the website or its information-handling arrangements change.
        The date above identifies the latest update. Any new optional tracking would require an updated notice and a choice before it is enabled.
      </p>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return <LegalPage title="Privacy policy" lede="What we collect, why we use it, and the choices available to you." sections={sections} updatedDate={PRIVACY_NOTICE_VERSION} updatedLabel="25 September 2026" />;
}
