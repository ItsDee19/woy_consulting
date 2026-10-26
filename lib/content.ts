/* =============================================================================
   Every page renders from this file. Edit copy here, not in the components.
   Sources: WOY Introduction deck (September 2026) and the WOY brand artwork.
   ============================================================================= */

const contactEmail = "hello@woyconsulting.com";

export const site = {
  name: "WOY Consulting",
  legalName: "WOY Consulting Private Limited",
  location: "Gurgaon 122002, Haryana, India",
  email: contactEmail,
  // Verified against the D&B profile reached through the owner-supplied QR.
  duns: {
    number: "861471529",
    profileUrl: "https://dunsregistered.dnb.com/PA.aspx?Key1=3203111&PaArea=Email",
    referenceImage: "/credentials/duns-registration-reference.png",
  },
  ctaHref: "/contact",
  principle: "Win Over Yourself",
  tagline: "Empowering leaders. Transforming organizations. Accelerating impact.",
  established: 2015,
  cta: "Start a conversation",
  description:
    "WOY Consulting helps organisations develop leaders, strengthen people and culture, and turn strategy into execution through former CEO and CXO expertise.",
};

export const nav = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Approach", href: "/approach" },
  { label: "Case Studies", href: "/case-studies" },
  { label: "Practitioners", href: "/practitioners" },
];

/* ----------------------------------------------------------------- pillars */
export type Pillar = "empowering" | "transforming" | "accelerating";

export const pillars: Record<Pillar, { title: string; sub: string; blurb: string }> = {
  empowering: {
    title: "Empowering Leaders",
    sub: "Cultivating vision and capability",
    blurb:
      "Strengthening individual and leadership team effectiveness to enable clarity, resilience and future-readiness across the enterprise.",
  },
  transforming: {
    title: "Transforming Organizations",
    sub: "Driving systemic evolution",
    blurb:
      "Integrating people, purpose and performance to shape organisational environments where good work is the default.",
  },
  accelerating: {
    title: "Accelerating Impact",
    sub: "Driving robust and sustainable growth",
    blurb:
      "Helping organisations sharpen focus, align execution and accelerate the outcomes that face the market.",
  },
};

/* -------------------------------------------------------------- capabilities */
export type Capability = {
  slug: string;
  title: string;
  pillar: Pillar;
  summary: string;
  detail: { heading: string; points: string[] }[];
};

export const capabilities: Capability[] = [
  {
    slug: "coaching-and-leadership-development",
    title: "Coaching & Leadership Development",
    pillar: "empowering",
    summary:
      "Developing self-aware, future-ready leaders with the judgement, strategic clarity and influence to carry an enterprise agenda.",
    detail: [
      {
        heading: "CEO, CXO and executive coaching",
        points: [
          "Deepening self-awareness and emotional intelligence",
          "Enhancing strategic clarity and sound judgement",
          "Strengthening stakeholder influence and upward alignment",
        ],
      },
      {
        heading: "Leadership assimilation",
        points: [
          "Supporting newly appointed CEOs and CXOs to integrate with speed and impact",
          "Navigating board, team and cultural expectations effectively",
          "Designing and executing an accelerated 90 to 120 day assimilation roadmap",
        ],
      },
      {
        heading: "Future-ready leadership",
        points: [
          "Building agility, systems thinking and strategic foresight",
          "Enhancing comfort with ambiguity, change and complexity",
          "Shaping leaders equipped to anticipate, adapt and act decisively",
        ],
      },
      {
        heading: "Enterprise-wide leadership alignment",
        points: [
          "Driving shared leadership behaviours that reflect strategy and values",
          "Creating collective ownership for business outcomes",
          "Enabling high-performing teams through clarity, cohesion and trust",
        ],
      },
    ],
  },
  {
    slug: "inclusive-leadership-and-culture",
    title: "Inclusive Leadership & Culture",
    pillar: "empowering",
    summary:
      "Building leadership capability and organisational practice that make inclusion, equity and belonging operational rather than aspirational.",
    detail: [
      {
        heading: "Inclusive leadership consulting",
        points: [
          "Strengthening inclusive decision-making, allyship and voice amplification",
          "Integrating inclusion into leadership behaviours, rituals and systems",
          "Addressing structural and psychological barriers to inclusion",
        ],
      },
      {
        heading: "Cultural competency and bias interventions",
        points: [
          "Enhancing awareness of cultural context and identity dynamics",
          "Diagnosing and mitigating bias in key people processes",
          "Enabling respectful dialogue and cross-cultural collaboration",
        ],
      },
      {
        heading: "Equity-centred talent practices",
        points: [
          "Designing inclusive hiring, onboarding and advancement frameworks",
          "Creating equitable development and sponsorship pathways",
          "Auditing performance and reward systems for fairness and transparency",
        ],
      },
    ],
  },
  {
    slug: "people-and-culture-consulting",
    title: "People & Culture Consulting",
    pillar: "transforming",
    summary:
      "Talent strategy, culture diagnosis and change enablement, connected to the business outcomes they are meant to serve.",
    detail: [
      {
        heading: "Talent strategy and succession architecture",
        points: [
          "Designing talent blueprints linked to business goals and future capability needs",
          "Creating succession pathways and future leader pipelines",
          "Integrating marketplace models for internal and external talent mobility",
        ],
      },
      {
        heading: "Culture diagnosis and activation",
        points: [
          "Conducting stakeholder-informed and insight-led culture diagnostics",
          "Aligning behaviours, mindsets and practices with strategic priorities",
          "Activating culture through visible leadership behaviours and reinforcing mechanisms",
        ],
      },
      {
        heading: "Change enablement and stakeholder alignment",
        points: [
          "Mapping change readiness and functional impact",
          "Designing stakeholder engagement and ownership pathways",
          "Orchestrating transitions with minimal disruption and maximal commitment",
        ],
      },
    ],
  },
  {
    slug: "hr-capability-and-transformation",
    title: "HR Capability & Transformation",
    pillar: "transforming",
    summary:
      "Building HR functions that are business-aligned, future-focused and execution-ready, moving from transactional support to strategic influence.",
    detail: [
      {
        heading: "Strategic HR alignment and operating model design",
        points: [
          "Realigning HR structure, roles and charters to business imperatives",
          "Enhancing governance, decision flows and service delivery models",
          "Embedding insight-led decision making into workforce practices",
        ],
      },
      {
        heading: "HR business partner capability",
        points: [
          "Shifting from transactional support to strategic influence",
          "Enabling HR to consult, challenge and co-create with business leaders",
          "Driving enterprise change through real business integration",
        ],
      },
      {
        heading: "Performance and talent architecture",
        points: [
          "Designing KRAs, success profiles and performance frameworks aligned to strategy",
          "Integrating continuous feedback, recognition and development pathways",
          "Enabling talent visibility, internal mobility and succession continuity",
        ],
      },
      {
        heading: "Behavioural event interviewing and selection",
        points: [
          "Building capability to assess competence, culture fit and future potential",
          "Embedding structured evaluation into hiring and internal movement",
          "Enhancing objectivity and predictability in selection and succession",
        ],
      },
    ],
  },
  {
    slug: "strategy-and-sales-management",
    title: "Strategy & Sales Management",
    pillar: "accelerating",
    summary:
      "Translating strategy into execution roadmaps, then building the selling capability and performance levers that carry it to market.",
    detail: [
      {
        heading: "Strategic planning and execution",
        points: [
          "Designing adaptive business models aligned to long-term goals",
          "Translating strategy into actionable execution roadmaps",
          "Strengthening leadership ownership, prioritisation and decision-making",
        ],
      },
      {
        heading: "Sales capability and effectiveness",
        points: [
          "Enhancing consultative selling, value articulation and relationship management",
          "Strengthening sales conversations with business acumen and stakeholder understanding",
          "Improving conversion effectiveness and win rates across buying cycles",
        ],
      },
      {
        heading: "Sales management and performance levers",
        points: [
          "Designing pipeline visibility and opportunity tracking mechanisms",
          "Embedding performance metrics and incentive alignment",
          "Driving disciplined reviews, forecasting accuracy and accountability",
        ],
      },
    ],
  },
  {
    slug: "organization-diagnostics-and-restructuring",
    title: "Organization Diagnostics & Restructuring",
    pillar: "accelerating",
    summary:
      "Ensuring organisational design, leadership capability and systems are aligned to scale and to strategic shifts.",
    detail: [
      {
        heading: "Org design and strategic alignment",
        points: [
          "Realigning structure, spans and layers to business priorities",
          "Clarifying roles, decision rights and team interdependencies",
          "Strengthening structure-to-strategy coherence during growth, scale or pivot",
        ],
      },
      {
        heading: "Capability identification and development",
        points: [
          "Conducting capability diagnostics through leadership engagement and context mapping",
          "Identifying core capability gaps essential for future-readiness",
          "Co-developing interventions to strengthen leadership and functional capability",
        ],
      },
      {
        heading: "Process optimisation and change readiness",
        points: [
          "Auditing and simplifying key processes to eliminate friction",
          "Enhancing change adaptability across levels and functions",
          "Strengthening operational agility and execution discipline",
        ],
      },
    ],
  },
];

/* ---------------------------------------------------------- homepage expertise */
export type ExpertiseArea = {
  slug: string;
  title: string;
  summary: string;
  href: string;
  legacySlugs: string[];
};

/** Business priorities bring the six underlying capabilities into four clear areas. */
export const expertiseAreas: ExpertiseArea[] = [
  {
    slug: "strategy-growth-execution",
    title: "Strategy, growth & execution",
    summary:
      "Translate ambition into clear choices, practical roadmaps and disciplined execution. We help leadership teams connect growth priorities with the capabilities, decisions and operating rhythms they need.",
    href: "/expertise#strategy",
    legacySlugs: ["strategy-and-sales-management"],
  },
  {
    slug: "leadership-executive-coaching",
    title: "Leadership & executive coaching",
    summary:
      "Develop the judgement, alignment and adaptability to lead through complexity. Executive coaching complements our advisory work, helping leaders turn insight into sustained changes in how they lead.",
    href: "/expertise#leadership",
    legacySlugs: ["coaching-and-leadership-development"],
  },
  {
    slug: "organisation-culture-change",
    title: "Organisation, culture & change",
    summary:
      "Align structure, decision rights and everyday behaviour with business priorities. We work with leaders to diagnose friction, build shared ownership and make change practical.",
    href: "/expertise#culture",
    legacySlugs: [
      "inclusive-leadership-and-culture",
      "people-and-culture-consulting",
      "organization-diagnostics-and-restructuring",
    ],
  },
  {
    slug: "people-performance-systems",
    title: "People & performance systems",
    summary:
      "Build business-aligned HR, talent and performance systems that leaders and teams can use. Connect roles, capability, accountability and development to what the organisation is trying to achieve.",
    href: "/expertise#people",
    legacySlugs: ["hr-capability-and-transformation"],
  },
];

/* ------------------------------------------------------------------ 4D steps */
export const approach = [
  {
    key: "discover",
    title: "Discover",
    tag: "Build a shared, fact-based view of reality",
    body: "Rapid deep dives into the real challenges through conversations with the people closest to them. We test the assumptions the organisation has stopped noticing, and surface the gaps and opportunities the current view is missing.",
    outputs: ["Stakeholder interviews", "Assumption challenge", "Gap and opportunity map"],
  },
  {
    key: "define",
    title: "Define",
    tag: "Agree the ambition and the choices",
    body: "Sharpen the problem, set the outcomes and prioritise. This is also where we agree what to drop. A clear list of what the organisation is not doing is usually worth more than another initiative.",
    outputs: ["Problem statement", "Outcome definition", "Explicit stop list"],
  },
  {
    key: "design",
    title: "Design",
    tag: "Build solutions that fit your context",
    body: "Co-create the journey, the deliverables, the dependencies and the timelines. Proven frameworks are adapted to your operating reality, ownership model and maturity stage, so the teams who inherit them can actually run them.",
    outputs: ["Tailored journey", "Deliverables and dependencies", "Delivery timeline"],
  },
  {
    key: "deliver",
    title: "Deliver",
    tag: "Embed the change and transfer ownership",
    body: "We support implementation, refine in real time, and build internal capability so the change sustains without us. Success metrics, operating cadences and accountability loops stay behind when we leave.",
    outputs: ["Implementation support", "Capability transfer", "Metrics and cadences"],
  },
];

/* ------------------------------------------------------------ why partner with */
export const differentiators = [
  {
    title: "Practitioner-led perspective",
    points: [
      "A consortium of more than ten former CEOs, CXOs and business leaders",
      "We advise with operational realism, not theoretical elegance",
      "Built for the pressures leaders actually face: targets, talent, trade-offs, execution",
    ],
  },
  {
    title: "Bespoke by design",
    points: [
      "Every engagement is tailored to your context, maturity and constraints",
      "We adapt frameworks to your reality instead of force-fitting templates",
      "Output is designed for adoption: clear choices, usable tools, aligned behaviours",
    ],
  },
  {
    title: "Enterprise rigour, boutique agility",
    points: [
      "Strong diagnosis, clear recommendations, structured rollout",
      "Faster cycles, direct access to senior partners, fewer layers",
      "High-quality governance without slowing delivery down",
    ],
  },
  {
    title: "Outcomes that stick",
    points: [
      "Focus on observable behaviour shifts and system reinforcement",
      "Leaders, HR and line teams are equipped to sustain the change",
      "Success metrics, operating cadences and accountability loops stay behind",
    ],
  },
];

/* ------------------------------------------------------------- logo philosophy */
export const symbols = [
  {
    key: "ring" as const,
    name: "Circle",
    lede: "Holistic growth and unified vision",
    body: "Self-awareness in leaders, and diverse organisational perspectives pulled into one strategy. Growth that holds together rather than growth in fragments.",
  },
  {
    key: "star" as const,
    name: "Five-point star",
    lede: "Excellence and competitive advantage",
    body: "Setting the benchmark instead of meeting it. Leaders and businesses that deliver exceptional value and hold their advantage over time.",
  },
  {
    key: "needle" as const,
    name: "Compass",
    lede: "Strategic agility and adaptability",
    body: "Navigating uncertainty with clarity and resilience. Adapting to market shifts early, and evolving to stay relevant without losing the core.",
  },
];

/* ---------------------------------------------------------------- client logos */
/* Original deck roster plus owner-requested additions. Indicative, not exhaustive. */
export type ClientLogo = { name: string; file: string; w: number; h: number };

export const clientLogos: ClientLogo[] = [
  { name: "MetLife", file: "/logos/metlife.png", w: 165, h: 200 },
  { name: "Aviva", file: "/assets/logos/aviva.png", w: 630, h: 198 },
  { name: "Pramerica Life Insurance", file: "/logos/pramerica-life-insurance.png", w: 479, h: 97 },
  { name: "Reliance Industries", file: "/logos/reliance-industries.png", w: 288, h: 200 },
  { name: "Reliance Retail", file: "/logos/reliance-retail.png", w: 400, h: 200 },
  { name: "Hindustan Petroleum", file: "/logos/hindustan-petroleum.png", w: 157, h: 200 },
  { name: "Siemens Financial Services", file: "/logos/siemens-financial-services.png", w: 480, h: 120 },
  { name: "Union Bank of India", file: "/logos/union-bank-of-india-source.png", w: 1059, h: 158 },
  { name: "HDFC Bank", file: "/logos/hdfc-bank.svg", w: 178, h: 35 },
  { name: "NatWest Group", file: "/logos/natwest-group.png", w: 138, h: 200 },
  { name: "National Fertilizers Limited", file: "/logos/national-fertilizers-limited.png", w: 178, h: 200 },
  { name: "SAIL", file: "/logos/sail-source.png", w: 393, h: 393 },
  { name: "Tata Management Training Centre", file: "/logos/tata-management-training-centre.png", w: 225, h: 215 },
  { name: "Punjab National Bank", file: "/logos/punjab-national-bank.png", w: 480, h: 61 },
  { name: "Samsung", file: "/logos/samsung.png", w: 479, h: 73 },
  { name: "Persistent Systems", file: "/logos/persistent-systems.png", w: 215, h: 200 },
  { name: "Tata Play", file: "/logos/tata-play.png", w: 402, h: 48 },
  { name: "Presto", file: "/logos/presto.png", w: 648, h: 122 },
  { name: "Mivi", file: "/logos/mivi.png", w: 600, h: 292 },
  { name: "EY", file: "/logos/ey.png", w: 300, h: 200 },
  { name: "Airtel", file: "/logos/airtel.png", w: 215, h: 234 },
  { name: "Cvent", file: "/logos/cvent.png", w: 479, h: 95 },
  { name: "CGI", file: "/logos/cgi.png", w: 212, h: 200 },
  { name: "ZS", file: "/logos/zs.png", w: 255, h: 200 },
  { name: "Go First", file: "/assets/logos/go-first.png", w: 542, h: 542 },
  { name: "GlobalLogic", file: "/logos/globallogic.png", w: 479, h: 89 },
  { name: "Maruti Suzuki", file: "/logos/maruti-suzuki.png", w: 342, h: 54 },
  { name: "Aditya Birla UltraTech", file: "/logos/aditya-birla-ultratech.png", w: 204, h: 200 },
  { name: "Foundever", file: "/logos/foundever.png", w: 521, h: 97 },
  { name: "Capgemini", file: "/logos/capgemini.png", w: 357, h: 84 },
  { name: "The Union", file: "/logos/the-union.png", w: 225, h: 225 },
  { name: "DLF", file: "/logos/dlf.png", w: 480, h: 171 },
  { name: "The Shri Ram Academy", file: "/logos/the-shri-ram-academy-source.png", w: 300, h: 285 },
  { name: "American India Foundation", file: "/logos/american-india-foundation.png", w: 480, h: 152 },
  { name: "Sutherland", file: "/logos/sutherland.png", w: 345, h: 54 },
  { name: "Magicbricks", file: "/logos/magicbricks.png", w: 480, h: 173 },
  { name: "The Shri Ram Universal School", file: "/logos/the-shri-ram-universal-school.png", w: 479, h: 154 },
  { name: "Cipla", file: "/logos/cipla.png", w: 480, h: 166 },
  { name: "Dr. Reddy's", file: "/logos/dr-reddy-s.png", w: 480, h: 105 },
  { name: "Valeo", file: "/logos/valeo.png", w: 462, h: 200 },
  { name: "BT", file: "/logos/bt.png", w: 386, h: 387 },
  { name: "Zydus", file: "/logos/zydus.png", w: 367, h: 200 },
  { name: "Orbis", file: "/logos/orbis.png", w: 478, h: 200 },
  { name: "INSEAD", file: "/logos/insead.png", w: 480, h: 168 },
  { name: "GE HealthCare", file: "/logos/ge-healthcare.png", w: 480, h: 151 },
  { name: "Horiba", file: "/logos/horiba-source.png", w: 480, h: 77 },
  { name: "Lumina CloudInfra", file: "/logos/lumina-cloudinfra.png", w: 480, h: 181 },
  { name: "Siemens Healthineers", file: "/logos/siemens-healthineers.png", w: 480, h: 112 },
  { name: "Glenmark", file: "/logos/glenmark.png", w: 358, h: 200 },
  { name: "Boston Scientific", file: "/logos/boston-scientific-source.png", w: 411, h: 180 },
];

export const logoDisclaimer =
  "Indicative, not exhaustive. Includes brands serviced from sister or affiliate platforms, in the past or as delivery partners.";

/* ------------------------------------------------------------------- helpers */
export const capabilitiesByPillar = (p: Pillar) => capabilities.filter((c) => c.pillar === p);
