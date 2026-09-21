import { approach, caseStudies, practitioners, site } from "@/lib/content";

export type FAQItem = {
  id: string;
  question: string;
  answer: string;
  links: { label: string; href: string }[];
};

const list = (items: string[]) => new Intl.ListFormat("en", { style: "long", type: "conjunction" }).format(items);

/**
 * Visitor-facing answers grounded in content.ts and the About, Approach,
 * Case Studies and Contact pages. Shared by the visible FAQ and its structured data.
 */
export const faqItems: FAQItem[] = [
  {
    id: "what-woy-means",
    question: "What does WOY stand for?",
    answer: `WOY stands for ${site.principle}. It is the guiding principle behind WOY Consulting's work to strengthen leadership, support organisational transformation and improve execution.`,
    links: [{ label: "About WOY", href: "/about" }],
  },
  {
    id: "consulting-services",
    question: "What does WOY Consulting help organisations with?",
    answer: "WOY Consulting works across coaching and leadership development, inclusive leadership and culture, people and culture consulting, HR capability and transformation, strategy and sales management, and organisation diagnostics and restructuring. These capabilities connect leadership, people systems and business execution.",
    links: [{ label: "Explore our expertise", href: "/#expertise" }],
  },
  {
    id: "who-we-work-with",
    question: "Who does WOY work with?",
    answer: "WOY works with multinationals, Indian conglomerates, public sector institutions, SMEs, startups and founder-led businesses. Its advisory work supports CEOs, founders, CHROs, boards and senior leadership teams navigating growth, transformation and change.",
    links: [{ label: "How we work with organisations", href: "/about" }],
  },
  {
    id: "practitioner-led-advisory",
    question: "What does practitioner-led advisory mean at WOY?",
    answer: `WOY brings together former CEOs, CXOs and senior business leaders with experience of leading teams, running businesses and driving change. The work is partner-led through delivery. Practitioners featured on this website include ${list(practitioners.map((practitioner) => practitioner.name))}.`,
    links: [{ label: "Meet the practitioners", href: "/practitioners" }],
  },
  {
    id: "four-d-approach",
    question: "What is WOY's 4D approach?",
    answer: `The 4D approach is ${list(approach.map((step) => step.title))}. Discover builds a shared view of the challenge. Define agrees the outcomes and priorities. Design shapes a solution for the organisation's context. Deliver supports implementation and transfers capability, with success metrics, operating cadences and accountability loops.`,
    links: [{ label: "Explore the 4D approach", href: "/approach" }],
  },
  {
    id: "tailored-engagements",
    question: "Are engagements tailored to each organisation?",
    answer: "Yes. WOY tailors engagements to the organisation's context, maturity and constraints. Proven frameworks are adapted to its operating reality, and the journey, deliverables, dependencies and timelines are co-created during the Design stage. The focus is on tools and practices the internal team can use and sustain.",
    links: [{ label: "How an engagement takes shape", href: "/approach" }],
  },
  {
    id: "examples-of-work",
    question: "Where can I see examples of WOY's work?",
    answer: `The case studies cover ${list(caseStudies.map((study) => study.industry.toLowerCase().replace("it and ites", "IT and ITES")))}. Each describes the context, approach and observed outcomes. Client names are withheld under confidentiality agreements; the industry and scope of work are shown.`,
    links: [{ label: "Read the case studies", href: "/case-studies" }],
  },
  {
    id: "starting-a-conversation",
    question: "How do I start a conversation with WOY?",
    answer: `Email ${site.email} or use the contact form to share your full name, mobile number and email address. A WOY partner can then discuss what you are working on and whether the advisory team is the right fit. You do not need a fully defined brief to begin; understanding the challenge is part of Discover.`,
    links: [{ label: "What happens after an enquiry", href: "/contact" }],
  },
];
