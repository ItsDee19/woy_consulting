/* =============================================================================
   Every page renders from this file. Edit copy here, not in the components.
   Sources: WOY Introduction deck (September 2026) and the WOY brand artwork.
   ============================================================================= */

export const site = {
  name: "WOY Consulting",
  principle: "Win Over Yourself",
  tagline: "Empowering leaders. Transforming organizations. Accelerating impact.",
  established: 2015,
  cta: "Request a conversation",
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

/* --------------------------------------------------------------- case studies */
export type CaseStudy = {
  slug: string;
  industry: string;
  title: string;
  headline: string;
  context: string;
  edge: string[];
  framework: string[];
  outcomes: string[];
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "insurance-senior-sales-leadership",
    industry: "Insurance",
    title: "Strengthening senior sales leadership",
    headline: "Ten senior sales leaders, one honest conversation about development.",
    context:
      "A senior sales leadership group needed development that connected individual growth to the business context they were being measured on, rather than a generic programme dropped in from outside.",
    edge: [
      "Built trust with ten senior sales leaders, which made candid conversations about development needs possible",
      "Connected individual development priorities to the business context and leadership expectations",
      "Combined personalised coaching with group learning applied to live leadership challenges",
      "Adapted delivery around business demands while holding continuity and engagement",
    ],
    framework: [
      "Discovery and alignment through leadership conversations, participant surveys and team climate feedback",
      "Individual development plans with specific behavioural goals",
      "One to one coaching, leadership workshops and team coaching",
      "Progress reviews, repeat team feedback and final leadership presentations",
    ],
    outcomes: [
      "Greater willingness across the cohort to work on individual development areas",
      "Stronger relationships across the group, observed and confirmed by the CHRO",
      "Leaders reported a shift from daily execution toward scalable governance and ecosystems",
      "Stronger cross-functional alignment and more enabling team leadership",
    ],
  },
  {
    slug: "education-institution-transformation",
    industry: "Education",
    title: "Strategy, governance, culture and people systems",
    headline: "One institution, two curriculum contexts, a single growth agenda.",
    context:
      "An education institution running two curriculum contexts needed a shared institutional agenda, and the operating discipline to deliver against it.",
    edge: [
      "Worked with founders and academic and functional leaders to shape one institutional agenda",
      "Combined strategic facilitation with organisation reviews, connecting ambition to delivery capacity",
      "Tailored priorities to two curriculum contexts while addressing shared requirements",
      "Worked through actual service gaps and process dependencies with individual function heads",
    ],
    framework: [
      "Consolidated five, three and one year roadmaps with initiatives, KPIs, owners and dependencies",
      "Service mapping, standard operating procedures and service level agreements",
      "Delegation of authority, approval routes and escalation protocols",
      "Values translated into observable behaviours and cascaded to leadership, administration and teaching staff",
    ],
    outcomes: [
      "A consolidated growth agenda shared across academic and support functions",
      "Defined service commitments, approval authorities and review routines",
      "A five-value framework with twenty behavioural launch pads, plus a differentiated four-value framework",
      "Role-specific goal sheets, rating guidance and calibration built into the performance cycle",
    ],
  },
  {
    slug: "it-ites-consultative-selling",
    industry: "IT and ITES",
    title: "Consultative selling mastery",
    headline: "Turning account managers into advisors clients actually consult.",
    context:
      "Account managers were selling transactionally in a market that rewarded trusted advisor relationships. The gap was mindset, not product knowledge.",
    edge: [
      "Translated consulting principles into a sales capability framework built for the sector",
      "Shifted the focus from transactional selling to a trusted advisor role",
      "Built experiential, simulation-led learning mapped to real client contexts",
      "Embedded tools and behaviours so skill transfer was immediate and measurable",
    ],
    framework: [
      "Entry and alignment: building trust, clarifying expectations, setting scope",
      "Discovery and dialogue: uncovering underlying client needs and reframing challenges",
      "Solutioning and agreement: co-creating options and securing commitment to action",
      "Implementation and partnership: working through resistance and holding engagement",
    ],
    outcomes: [
      "Clients began treating account managers as strategic partners",
      "Reduced rework through stronger discovery and clearer contracting",
      "Improved listening, reframing and courage in boundary conversations",
      "A shared consultative language adopted across teams",
    ],
  },
  {
    slug: "financial-services-entrepreneurial-mindset",
    industry: "Financial services",
    title: "Entrepreneurial mindset programme",
    headline: "Moving capable managers from risk-averse to opportunity-aware.",
    context:
      "Capable managers were operating risk-averse in a business that needed opportunity recognition, faster decisions and a tolerance for ambiguity.",
    edge: [
      "Designed a bespoke leadership programme focused on entrepreneurial competence in a financial services context",
      "Integrated creativity, innovation, risk-taking, problem solving and resilience into one measurable structure",
      "Used real sector case studies to ground the learning in market realities",
      "Balanced conceptual depth with empathy mapping, prototyping, simulations and financial analysis labs",
    ],
    framework: [
      "Entrepreneurship competence: proactiveness, adaptability, decision-making, opportunity recognition",
      "Empathy and problem solving: the desirability, feasibility and viability model applied to customer needs",
      "Business acumen: models, drivers, P&L, cost and profitability levers, writing business cases",
      "Risk and ambiguity, plus creativity and innovation through design thinking and lean methods",
    ],
    outcomes: [
      "Participants shifted from risk-averse management toward entrepreneurial thinking",
      "Empathy-driven problem solving produced sharper insight and practical prototypes",
      "Improved decisions on P&L drivers, cost trade-offs and return on investment",
      "Higher adaptability, tolerance for ambiguity and resilience across the group",
    ],
  },
  {
    slug: "automotive-leadership-assimilation",
    industry: "Automotive",
    title: "Leadership assimilation for a unified technical centre",
    headline: "Several inherited identities, rebuilt into one team.",
    context:
      "A newly unified technical centre carried several inherited identities and needed to operate as a single organisation rather than a set of adjacent ones.",
    edge: [
      "Designed a bespoke leadership assimilation journey for a newly unified technical centre",
      "Shifted leaders from a siloed identity toward a collective team mindset",
      "Combined systemic blockers, leadership system and cultural charter into one arc",
      "Balanced real case simulations with charters, empathy mapping and dialogue circles",
    ],
    framework: [
      "Setting context: why this transformation, and why now",
      "Uncovering blockers: mapping systemic and behavioural barriers, moving from blame to ownership",
      "Designing the leadership system: co-created principles, shared governance, role modelling",
      "Case jam and a charter of collective commitment with individual pledges",
    ],
    outcomes: [
      "Leaders aligned on the transformation imperatives",
      "Stronger ownership of a collective identity across previously separate groups",
      "Systemic blockers surfaced and mapped in the open",
      "A co-owned leadership framework with principles and governance made explicit",
    ],
  },
  {
    slug: "medical-technology-strategic-thinking",
    industry: "Medical technology",
    title: "Strategic thinking and global perspective",
    headline: "High-potential women leaders, operating at enterprise scale.",
    context:
      "High-potential women leaders were delivering operational excellence but working below enterprise-level influence, inside a six month leadership journey.",
    edge: [
      "Designed a one day, high-impact workshop as part of a six month women's leadership journey",
      "Focused on strategic thinking and global mindset, mapped to the client's strategic competencies",
      "Balanced experiential pedagogy with reflection, ensuring immediate workplace translation",
      "Integrated psychological safety, identity work, simulations and action commitments into one arc",
    ],
    framework: [
      "Strategic thinking: reframing roles, exploring blind spots, moving from execution to enterprise contribution",
      "Global perspective: simulations linking local decisions to global impact",
      "Enterprise thinking: cross-functional scenario challenges and strategic trade-offs",
      "Leadership identity, informal influence and stakeholder mapping",
    ],
    outcomes: [
      "Participants reframed their roles from operational excellence to enterprise contribution",
      "Recognition of cross-geography and cross-function dependencies in the business",
      "Leaders practised enterprise-level problem solving under ambiguity",
      "Each leader left with a personalised, observable strategic action",
    ],
  },
];

/* --------------------------------------------------------------- practitioners */
export type Practitioner = {
  slug: string;
  name: string;
  initials: string;
  role: string;
  lede: string;
  bio: string[];
  expertise: string[];
  /* TODO: replace with the real LinkedIn profile URL before launch */
  linkedin: string | null;
  /* Authentic portraits extracted from the firm introduction deck. */
  photo: string | null;
};

export const practitioners: Practitioner[] = [
  {
    slug: "vipin-tuteja",
    name: "Vipin Tuteja",
    initials: "VT",
    role: "Founder and Managing Director",
    lede: "Aligning strategy, people, culture and execution through growth and transformation.",
    bio: [
      "Vipin partners with CEOs, founders, CHROs, boards and senior leadership teams to help organisations navigate growth, transformation and change with strategic clarity and disciplined execution.",
      "He brings over 35 years of leadership experience across Xerox, American Express, Ricoh and Samsung, where he held significant P&L roles, built businesses and managed complex transformation agendas across India, Southeast Asia, the US and the UK.",
      "Since founding WOY in 2015, his work has focused on helping leadership teams translate strategic intent into operating rhythms, leadership behaviours, governance mechanisms and people systems that hold up over time.",
    ],
    expertise: [
      "Strategy, growth and execution readiness",
      "Leadership development and CEO or CXO coaching",
      "Organisation diagnostics and culture architecture",
      "HR transformation, talent strategy and performance management",
    ],
    linkedin: null,
    photo: "/practitioners/vipin-tuteja.webp",
  },
  {
    slug: "sandeep-bidani",
    name: "Sandeep Bidani",
    initials: "SB",
    role: "Strategic Advisor, Leadership and Culture",
    lede: "Transforming leadership, culture and organisations from both sides of the table.",
    bio: [
      "Sandeep is a business-focused HR and transformation leader who has worked as a management consultant and change leader with KPMG, leading large-scale organisational and talent transformations across India and the Middle East.",
      "He then served as CHRO and regional HR head for KPMG, American Express and IBM, with responsibility for over 38,000 people across India, Sri Lanka, the Middle East, the Philippines and the UK.",
      "That combination of consulting rigour and operator credibility defines his current work as an advisor, coach and change catalyst, helping organisations build future-ready leadership, HR capability and execution alignment.",
    ],
    expertise: [
      "Enterprise organisation and culture transformation",
      "HR business partner capability building",
      "Post-merger integration and talent strategy",
      "Executive and team coaching, inclusion advisory",
    ],
    linkedin: null,
    photo: "/practitioners/sandeep-bidani.webp",
  },
  {
    slug: "kannan-swaminathan",
    name: "Kannan Swaminathan",
    initials: "KS",
    role: "Change Leader, Coach and Consultant",
    lede: "Twenty-nine years of banking and financial services, brought to the coaching conversation.",
    bio: [
      "Kannan is a senior business leader from the banking and financial services industry, with 29 years of corporate experience across The Royal Bank of Scotland Group, Tata Consultancy Services, ABN AMRO Bank, Standard Chartered Bank, ICICI Bank and ANZ Grindlays Bank.",
      "Fifteen of those years were in leadership roles in business process services, spanning transitions, operations, business development, change management, customer management and strategy.",
      "He is a Professional Certified Coach with the International Coaching Federation and credentialled as a Senior Practitioner by the European Mentoring and Coaching Council, with over 2,000 hours of coaching across India and globally.",
    ],
    expertise: [
      "Executive coaching across CXO and senior leadership",
      "Change management and strategy consulting",
      "Customer centricity and stakeholder-centred leadership",
      "Human potential assessment and applied neuroscience",
    ],
    linkedin: null,
    photo: "/practitioners/kannan-swaminathan.webp",
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
/* Extracted from the WOY introduction deck. Indicative, not exhaustive. */
export type ClientLogo = { name: string; file: string; w: number; h: number };

export const clientLogos: ClientLogo[] = [
  { name: "MetLife", file: "/logos/metlife.png", w: 165, h: 200 },
  { name: "Pramerica Life Insurance", file: "/logos/pramerica-life-insurance.png", w: 479, h: 97 },
  { name: "Reliance Industries", file: "/logos/reliance-industries.png", w: 288, h: 200 },
  { name: "Reliance Retail", file: "/logos/reliance-retail.png", w: 400, h: 200 },
  { name: "Hindustan Petroleum", file: "/logos/hindustan-petroleum.png", w: 157, h: 200 },
  { name: "Siemens Financial Services", file: "/logos/siemens-financial-services.png", w: 480, h: 120 },
  { name: "Union Bank of India", file: "/logos/union-bank-of-india.png", w: 1059, h: 158 },
  { name: "NatWest Group", file: "/logos/natwest-group.png", w: 138, h: 200 },
  { name: "National Fertilizers Limited", file: "/logos/national-fertilizers-limited.png", w: 178, h: 200 },
  { name: "SAIL", file: "/logos/sail.png", w: 393, h: 393 },
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
  { name: "GlobalLogic", file: "/logos/globallogic.png", w: 479, h: 89 },
  { name: "Maruti Suzuki", file: "/logos/maruti-suzuki.png", w: 342, h: 54 },
  { name: "Aditya Birla UltraTech", file: "/logos/aditya-birla-ultratech.png", w: 204, h: 200 },
  { name: "Foundever", file: "/logos/foundever.png", w: 521, h: 97 },
  { name: "Capgemini", file: "/logos/capgemini.png", w: 357, h: 84 },
  { name: "The Union", file: "/logos/the-union.png", w: 225, h: 225 },
  { name: "DLF", file: "/logos/dlf.png", w: 480, h: 171 },
  { name: "The Shri Ram Academy", file: "/logos/the-shri-ram-academy.png", w: 300, h: 285 },
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
  { name: "Horiba", file: "/logos/horiba.png", w: 480, h: 77 },
  { name: "Lumina CloudInfra", file: "/logos/lumina-cloudinfra.png", w: 480, h: 181 },
  { name: "Siemens Healthineers", file: "/logos/siemens-healthineers.png", w: 480, h: 112 },
  { name: "Glenmark", file: "/logos/glenmark.png", w: 358, h: 200 },
  { name: "Boston Scientific", file: "/logos/boston-scientific.png", w: 411, h: 180 },
];

export const logoDisclaimer =
  "Indicative, not exhaustive. Includes brands serviced from sister or affiliate platforms, in the past or as delivery partners.";

/* ------------------------------------------------------------------- helpers */
export const capabilitiesByPillar = (p: Pillar) => capabilities.filter((c) => c.pillar === p);
export const caseStudyBySlug = (s: string) => caseStudies.find((c) => c.slug === s);
