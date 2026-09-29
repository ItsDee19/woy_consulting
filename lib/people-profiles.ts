export type PersonProfile = {
  slug: string;
  name: string;
  role: string;
  portrait: string;
  imagePosition: string;
  introduction: string;
  biography: string[];
  experience: string[];
};

export const peopleProfiles: PersonProfile[] = [
  {
    slug: "vipin-tuteja",
    name: "Vipin Tuteja",
    role: "Founder & Managing Director",
    portrait: "/assets/vipin-tuteja.jpeg",
    imagePosition: "50% 26%",
    introduction:
      "Helping leadership teams align strategy, people, culture and execution through growth and transformation.",
    biography: [
      "Vipin partners with CEOs, founders, CHROs, Boards and senior leadership teams to bring strategic clarity, organisational alignment and disciplined execution to growth, transformation and change.",
      "He brings more than 35 years of leadership experience across Xerox, American Express, Ricoh and Samsung, including significant P&L responsibilities, business building and transformation across India, Southeast Asia, the US and the UK.",
      "Since founding WOY Consulting in 2015, he has focused on translating strategic intent into operating rhythms, leadership behaviours, governance mechanisms and people systems. His consulting practice is complemented by ICF-credentialed executive coaching and more than 2,000 coaching hours.",
    ],
    experience: ["Xerox", "American Express", "Ricoh", "Samsung"],
  },
  {
    slug: "sandeep-bidani",
    name: "Sandeep Bidani",
    role: "Director & Partner",
    portrait: "/assets/sandeep-bidani.jpeg",
    imagePosition: "52% 15%",
    introduction:
      "Bringing a business-focused perspective to leadership, culture and organisation transformation.",
    biography: [
      "Sandeep combines experience as a management consultant and change leader with senior HR leadership across large, complex organisations.",
      "His background includes KPMG consulting work in India and the Middle East and CHRO and regional HR responsibilities at KPMG, American Express and IBM. He has worked across organisation transformation, talent strategy, HR capability and leadership alignment.",
      "His advisory and coaching work helps leaders connect business priorities with leadership capability and execution. Inclusion is a central part of his work, including his role as co-founder of the disability-inclusion platform Saarathee.",
      "He is a Marshall Goldsmith Executive & Team Coach,\u00a0ICF ACTP Credentialed,\u00a0GCG & Human Potential Coach with over 1500 hours of coaching.",
    ],
    experience: ["KPMG", "American Express", "IBM"],
  },
  {
    slug: "kannan-swaminathan",
    name: "Kannan Swaminathan",
    role: "Director & Partner",
    portrait: "/assets/kannan-swaminathan.jpg",
    imagePosition: "48% 8%",
    introduction:
      "Connecting leadership development with the realities of operations, transitions and change.",
    biography: [
      "Kannan brings 29 years of corporate experience in banking and financial services, including 15 years in leadership roles.",
      "His experience spans transitions, operations, business development, relationship management and strategy, with organisations including the Royal Bank of Scotland Group, Tata Consultancy Services, ABN AMRO, Standard Chartered, ICICI Bank and ANZ Grindlays.",
      "He brings this operating perspective to leadership and executive coaching, helping leaders examine their context, strengthen their effectiveness and navigate change.",
      "He is a Professional Certified Coach from the International Coaching Federation. He has been credentialed as a Senior Practitioner by the European Mentoring and Coaching Council. He has over 2000+ hours of coaching experience and has worked with leadership across CXO, Business Function Heads, Vice Presidents, Directors, and Senior Managers in the Banking, Information Technology, Healthcare, Logistics, and Consulting industries across India and globally.",
    ],
    experience: ["RBS", "TCS", "ABN AMRO", "Standard Chartered", "ICICI Bank", "ANZ Grindlays"],
  },
];
