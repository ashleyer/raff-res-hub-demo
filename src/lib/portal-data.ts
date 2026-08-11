/* ---------------------------------------------------------------- people */

/** A named person living in the residence, listed under the household profile. */
export type HouseholdMember = {
  id: string;
  name: string;
  relation: string;
  email?: string;
  phone?: string;
  /** Free text · dietary notes, arrival preferences, anything the desk should know. */
  notes?: string;
  /** Exactly one resident per residence is the main profile for the unit. */
  primary?: boolean;
};

/** A pet registered to the residence · useful for the concierge and for neighbours. */
export type HouseholdPet = {
  id: string;
  name: string;
  kind: string;
  note?: string;
};

export type Resident = {
  id: string;
  name: string;
  unit: string;
  email: string;
  phone: string;
  bio: string;
  interests: string[];
  visibleInDirectory: boolean;
  contactOptIn: boolean;
  members?: HouseholdMember[];
  pets?: HouseholdPet[];
};

export type Person = {
  id: number;
  name: string;
  role: string;
  bio: string;
  /** Portraits are intentionally blank in this demo · a monogram is shown instead. */
  photo?: string;
};

export const RESIDENTS: Resident[] = [
  {
    id: "r-34b",
    name: "Eleanor Vance",
    unit: "Residence 34B",
    email: "e.vance@residents.raffles-boston.test",
    phone: "(617) 555-0134",
    bio: "Retired trustee of the Boston Athenæum. Keen on wine, chamber music and long walks in the Public Garden.",
    interests: ["Wine", "Classical music", "Art"],
    visibleInDirectory: true,
    contactOptIn: true,
    members: [
      {
        id: "m-34b-1",
        name: "Eleanor Vance",
        relation: "Owner",
        email: "e.vance@residents.raffles-boston.test",
        phone: "(617) 555-0134",
      },
      {
        id: "m-34b-2",
        name: "Robert Vance",
        relation: "Spouse",
        email: "r.vance@residents.raffles-boston.test",
      },
    ],
    pets: [
      {
        id: "p-34b-1",
        name: "Bartholomew",
        kind: "Cat",
        note: "Indoor only · please do not hold the lift door open on 34.",
      },
    ],
  },
  {
    id: "r-21a",
    name: "Marcus Chen",
    unit: "Residence 21A",
    email: "m.chen@residents.raffles-boston.test",
    phone: "(617) 555-0121",
    bio: "Venture investor, marathon runner, and reluctant but committed owner of two very large dogs.",
    interests: ["Running", "Dogs", "Technology"],
    visibleInDirectory: true,
    contactOptIn: true,
    members: [
      {
        id: "m-21a-1",
        name: "Marcus Chen",
        relation: "Owner",
        email: "m.chen@residents.raffles-boston.test",
        phone: "(617) 555-0121",
      },
    ],
    pets: [
      {
        id: "p-21a-1",
        name: "Atlas",
        kind: "Dog · Bernese Mountain",
        note: "Walks at 6:30 AM through the Trinity Place door.",
      },
      { id: "p-21a-2", name: "Juno", kind: "Dog · Bernese Mountain" },
    ],
  },
  {
    id: "r-28d",
    name: "Priya Raman",
    unit: "Residence 28D",
    email: "p.raman@residents.raffles-boston.test",
    phone: "(617) 555-0128",
    bio: "Surgeon at MGH. Hosts the Floor 21 book club on the second Tuesday of the month.",
    interests: ["Books", "Wellness", "Travel"],
    visibleInDirectory: true,
    contactOptIn: false,
  },
  {
    id: "r-41c",
    name: "James & Odile Whitfield",
    unit: "Residence 41C",
    email: "whitfield@residents.raffles-boston.test",
    phone: "(617) 555-0141",
    bio: "Family household with two young children. Always happy to swap sitter recommendations.",
    interests: ["Families", "Sailing", "Food"],
    visibleInDirectory: true,
    contactOptIn: true,
    members: [
      {
        id: "m-41c-1",
        name: "James Whitfield",
        relation: "Owner",
        email: "j.whitfield@residents.raffles-boston.test",
        phone: "(617) 555-0141",
      },
      {
        id: "m-41c-2",
        name: "Odile Whitfield",
        relation: "Owner",
        email: "o.whitfield@residents.raffles-boston.test",
      },
      { id: "m-41c-3", name: "Colette", relation: "Child" },
      { id: "m-41c-4", name: "Hugo", relation: "Child" },
    ],
    pets: [],
  },
  {
    id: "r-17f",
    name: "Sofia Marchetti",
    unit: "Residence 17F",
    email: "s.marchetti@residents.raffles-boston.test",
    phone: "(617) 555-0117",
    bio: "Architect. Prefers to keep a low profile in the register.",
    interests: ["Design", "Cycling"],
    visibleInDirectory: false,
    contactOptIn: false,
  },
  {
    id: "r-22h",
    name: "Ashley Romano",
    unit: "Residence 22H",
    email: "a.romano@residents.raffles-boston.test",
    phone: "(978) 857-5775",
    bio: "Resident of 22H and the builder of this demonstration portal. Interested in design, technology and community programming.",
    interests: ["Design", "Technology", "Community"],
    visibleInDirectory: true,
    contactOptIn: true,
    members: [
      {
        id: "m-22h-1",
        name: "Ashley Romano",
        relation: "Owner",
        email: "a.romano@residents.raffles-boston.test",
        phone: "(978) 857-5775",
      },
    ],
    pets: [],
  },
];

/** Demo credentials · passcode is the same for every account in this preview. */
export const DEMO_PASSCODE = "raffles2026";

/** Open demonstration login shown on the sign-in page. */
export const DEMO_ACCOUNT = {
  email: "demo@demo.com",
  password: "checkitout02116",
} as const;

export const BOARD: Person[] = [
  {
    id: 1,
    name: "Margaret Ellsworth",
    role: "President, Board of Trustees · Residence 39A",
    bio: "Twelve years on Back Bay association boards. Leads the reserve study and the terrace restoration programme.",
  },
  {
    id: 2,
    name: "Andre Whitcombe",
    role: "Vice President · Residence 26C",
    bio: "Former CFO in commercial real estate. Partners with the President on capital planning and vendor contracts.",
  },
  {
    id: 3,
    name: "Priya Raghunathan",
    role: "Treasurer · Residence 30F",
    bio: "Oversees the operating budget, the condominium fee schedule, the reserve fund and the annual audit.",
  },
  {
    id: 4,
    name: "Hana Sato",
    role: "Secretary · Residence 32E",
    bio: "Keeps the minutes of every trustee sitting and maintains the governance record for deed-holders.",
  },
  {
    id: 5,
    name: "Clifford Bowen",
    role: "Trustee · Chair, Buildings & Grounds · Residence 24D",
    bio: "Follows engineering projects, façade and terrace works, and the long-range maintenance calendar.",
  },
  {
    id: 6,
    name: "Rosalind Meyer",
    role: "Trustee · Chair, Amenities & Events · Residence 35B",
    bio: "Works with the Residences Office on the Residents' Lounge programme and the events committee calendar.",
  },
  {
    id: 7,
    name: "Daniel Okonkwo",
    role: "Trustee · Chair, Rules & Compliance · Residence 28A",
    bio: "Reviews house rules, short-term stay policy and the moving and contractor procedures.",
  },
  {
    id: 8,
    name: "Beatrice Lindqvist",
    role: "Trustee · Chair, Finance Review · Residence 41C",
    bio: "Reads the monthly variance report with the Treasurer and presents findings at the quarterly meeting.",
  },
  {
    id: 9,
    name: "Victor Alarcón",
    role: "Trustee at Large · Residence 22K",
    bio: "Liaison to the hotel operator on shared services, valet flow and loading dock scheduling.",
  },
];

export const STAFF: Person[] = [
  {
    id: 1,
    name: "Julien Marchand",
    role: "Director of Residences",
    bio: "Twenty years with Raffles across Singapore and Paris. Point of escalation for every household matter.",
  },
  {
    id: 2,
    name: "Amelia Reyes",
    role: "Head Concierge",
    bio: "Leads the concierge team: in-residence dining, guest arrivals, packing, unpacking and daily requests.",
  },
  {
    id: 3,
    name: "Thomas Baird",
    role: "Chief Engineer",
    bio: "Runs building operations and the maintenance desk, including after-hours engineering response.",
  },
  {
    id: 4,
    name: "Nadia Farouk",
    role: "Residences Manager",
    bio: "Day-to-day management of the residential floors, move coordination and contractor access.",
  },
  {
    id: 5,
    name: "Grace Okafor",
    role: "Resident Relations Manager",
    bio: "First point of contact for household questions, directory listings and community programming.",
  },
  {
    id: 6,
    name: "Marcus Devlin",
    role: "Director of Security",
    bio: "Oversees the security team, access credentials, package chain of custody and life-safety drills.",
  },
  {
    id: 7,
    name: "Sofia Grimaldi",
    role: "Concierge, Evenings",
    bio: "Evening desk coverage: dining reservations, car requests, guest greetings and late arrivals.",
  },
  {
    id: 8,
    name: "Henry Lassiter",
    role: "Valet Manager",
    bio: "Manages valet staffing, vehicle retrieval times and the resident parking roster.",
  },
  {
    id: 9,
    name: "Camille Boucher",
    role: "Housekeeping Manager, Residences",
    bio: "Coordinates in-residence housekeeping, dry cleaning collection and common-area presentation.",
  },
  {
    id: 10,
    name: "Owen Pierce",
    role: "Building Engineer",
    bio: "Preventive maintenance, mechanical systems and same-day repairs across the residential floors.",
  },
  {
    id: 11,
    name: "Isabel Moreno",
    role: "Financial Administrator",
    bio: "House accounts, condominium fee statements, payment plans and billing questions.",
  },
  {
    id: 12,
    name: "Kenji Watanabe",
    role: "Amenities & Events Coordinator",
    bio: "Books the Residents' Lounge spaces, the Emerald Lounge and hotel catering for private events.",
  },
];

/* --------------------------------------------------------- announcements */

export type Announcement = {
  id: number;
  title: string;
  body: string;
  author: string;
  date: string;
  pinned?: boolean;
};

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: 1,
    title: "Q3 condominium fee schedule posted",
    body: "The revised schedule takes effect 1 September. Statements are available in your house account, and autopay instructions are unchanged.",
    author: "Residences Office",
    date: "August 3, 2026",
    pinned: true,
  },
  {
    id: 2,
    title: "Elevator 3 modernisation · 11–15 August",
    body: "Car three will be out of service for controller replacement. Service lifts remain available for move-ins and deliveries throughout.",
    author: "Chief Engineer",
    date: "July 30, 2026",
  },
  {
    id: 3,
    title: "Parcel handling at the concierge desk",
    body: "All deliveries are received and held at the concierge desk. Residents are notified in the portal on arrival and may request delivery to the residence.",
    author: "Concierge Desk",
    date: "July 22, 2026",
  },
];

/* --------------------------------------------------------------- billing */

export type StatementLine = { label: string; amount: number };

export type Statement = {
  id: number;
  period: string;
  issued: string;
  due: string;
  amount: number;
  status: "Paid" | "Due" | "Scheduled";
  lines: StatementLine[];
};

export const STATEMENTS: Statement[] = [
  {
    id: 1,
    period: "August 2026",
    issued: "August 1, 2026",
    due: "August 15, 2026",
    amount: 4820.5,
    status: "Due",
    lines: [
      { label: "Condominium fee", amount: 4150 },
      { label: "Valet parking · two bays", amount: 450 },
      { label: "In-residence dining (July)", amount: 186.5 },
      { label: "Floristry programme", amount: 34 },
    ],
  },
  {
    id: 2,
    period: "July 2026",
    issued: "July 1, 2026",
    due: "July 15, 2026",
    amount: 4612.75,
    status: "Paid",
    lines: [
      { label: "Condominium fee", amount: 4150 },
      { label: "Valet parking · two bays", amount: 450 },
      { label: "Long Bar house account", amount: 12.75 },
    ],
  },
  {
    id: 3,
    period: "June 2026",
    issued: "June 1, 2026",
    due: "June 15, 2026",
    amount: 4380,
    status: "Paid",
    lines: [
      { label: "Condominium fee", amount: 4150 },
      { label: "Guerlain Spa treatments", amount: 230 },
    ],
  },
];

export type PaymentMethod = { id: string; label: string };

export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: "ach", label: "Bank transfer · Cambridge Trust ••4417" },
  { id: "visa", label: "Visa ••2019" },
  { id: "amex", label: "American Express ••1006" },
];

export type PaymentRecord = {
  id: number;
  statementPeriod: string;
  amount: number;
  method: string;
  at: string;
};

/* -------------------------------------------------------------- services */

export type ValetRequest = {
  id: number;
  kind: "Retrieve vehicle" | "Return to garage" | "Guest arrival";
  vehicle: string;
  when: string;
  notes?: string;
  status: "Requested" | "Attendant assigned" | "At the arrival court" | "Completed";
};

export const SEED_VALET: ValetRequest[] = [
  {
    id: 1,
    kind: "Retrieve vehicle",
    vehicle: "Range Rover · MA 4RF-118",
    when: "Today, 6:10 PM",
    status: "Attendant assigned",
  },
  {
    id: 2,
    kind: "Guest arrival",
    vehicle: "Guest of Residence 21A · black sedan",
    when: "Tomorrow, 7:30 PM",
    notes: "Two guests for dinner at La Padrona.",
    status: "Requested",
  },
];

export type MaintenanceTicket = {
  id: number;
  category: string;
  detail: string;
  unit: string;
  urgency: "Routine" | "Same day" | "Urgent";
  status: "Reported" | "Scheduled" | "In progress" | "Resolved";
  reportedAt: string;
  permissionToEnter: boolean;
};

export const MAINTENANCE_CATEGORIES = [
  "Plumbing",
  "Electrical",
  "HVAC & climate",
  "Appliance",
  "Doors, locks & hardware",
  "Common area issue",
  "Other",
] as const;

export const SEED_MAINTENANCE: MaintenanceTicket[] = [
  {
    id: 1,
    category: "HVAC & climate",
    detail: "Primary bedroom is holding two degrees above the set point overnight.",
    unit: "Residence 34B",
    urgency: "Same day",
    status: "Scheduled",
    reportedAt: "Yesterday",
    permissionToEnter: true,
  },
  {
    id: 2,
    category: "Common area issue",
    detail: "Scuffed panelling by the Floor 21 lounge entry · likely from a delivery trolley.",
    unit: "Residence 28D",
    urgency: "Routine",
    status: "Reported",
    reportedAt: "August 2",
    permissionToEnter: false,
  },
];

export type Parcel = {
  id: number;
  carrier: string;
  description: string;
  arrived: string;
  unit: string;
  status: "Awaiting collection" | "Concierge delivery requested" | "Delivered to residence";
};

export const SEED_PARCELS: Parcel[] = [
  {
    id: 1,
    carrier: "FedEx",
    description: "Two parcels · signature required",
    arrived: "Today, 11:05 AM",
    unit: "Residence 34B",
    status: "Awaiting collection",
  },
  {
    id: 2,
    carrier: "Neiman Marcus",
    description: "Garment box",
    arrived: "Today, 9:40 AM",
    unit: "Residence 34B",
    status: "Concierge delivery requested",
  },
  {
    id: 3,
    carrier: "USPS",
    description: "Registered letter · Residences Office",
    arrived: "Yesterday",
    unit: "Residence 34B",
    status: "Delivered to residence",
  },
];

export type LostFoundItem = {
  id: number;
  kind: "Lost" | "Found";
  item: string;
  location: string;
  when: string;
  contact: string;
  status: "Open" | "Reunited";
};

export const SEED_LOST_FOUND: LostFoundItem[] = [
  {
    id: 1,
    kind: "Found",
    item: "Gold cufflink, engraved monogram",
    location: "Long Bar terrace",
    when: "August 1",
    contact: "Held at the concierge desk",
    status: "Open",
  },
  {
    id: 2,
    kind: "Lost",
    item: "Grey cashmere scarf",
    location: "Residents' Lounge, Floor 21",
    when: "July 28",
    contact: "Residence 28D",
    status: "Open",
  },
  {
    id: 3,
    kind: "Found",
    item: "Set of two keys on a leather fob",
    location: "Arrival court",
    when: "July 19",
    contact: "Held at the concierge desk",
    status: "Reunited",
  },
];

/* ------------------------------------------------------------- community */

export type SubCommunity = {
  id: string;
  name: string;
  description: string;
  members: number;
};

export const SUB_COMMUNITIES: SubCommunity[] = [
  {
    id: "wine",
    name: "Wine & Spirits Circle",
    description: "Tastings, cellar swaps and the annual Piedmont trip.",
    members: 34,
  },
  {
    id: "dogs",
    name: "Residences Dog Owners",
    description: "Walks, sitters and the Trinity Place green.",
    members: 22,
  },
  {
    id: "books",
    name: "Floor 21 Book Club",
    description: "Second Tuesday of the month in the lounge.",
    members: 18,
  },
  {
    id: "wellness",
    name: "Wellness & Lap Swim",
    description: "Early swims, breathwork and spa allocations.",
    members: 27,
  },
  {
    id: "families",
    name: "Families at Trinity Place",
    description: "Playdates, schools and holiday afternoons.",
    members: 15,
  },
];

export type ForumReply = { id: number; author: string; body: string; at: string };

export type ForumTopic = {
  id: number;
  community: string;
  title: string;
  body: string;
  author: string;
  at: string;
  replies: ForumReply[];
};

export const SEED_TOPICS: ForumTopic[] = [
  {
    id: 1,
    community: "wine",
    title: "Barolo verticals for the autumn tasting",
    body: "I have three vintages I'd happily contribute if the group wants to build a vertical for September.",
    author: "Eleanor Vance · Residence 34B",
    at: "August 2",
    replies: [
      {
        id: 1,
        author: "Marcus Chen · Residence 21A",
        body: "Count me in · I can bring glassware for twenty.",
        at: "August 2",
      },
    ],
  },
  {
    id: 2,
    community: "dogs",
    title: "Early morning walking group?",
    body: "Thinking of a standing 6:30 AM loop through the Back Bay Fens. Anyone else keen?",
    author: "Anonymous deed-holder",
    at: "July 29",
    replies: [],
  },
  {
    id: 3,
    community: "families",
    title: "Holiday afternoon in the lounge · helpers wanted",
    body: "We'd like two or three households to help organise the December afternoon on Floor 21.",
    author: "James & Odile Whitfield · Residence 41C",
    at: "July 24",
    replies: [
      {
        id: 1,
        author: "Priya Raman · Residence 28D",
        body: "Happy to help with the reading corner.",
        at: "July 25",
      },
    ],
  },
];

/* ----------------------------------------------------------- marketplace */

export type MarketReply = { id: number; author: string; body: string; at: string };

export type Listing = {
  id: number;
  kind: "Recommendation wanted" | "For sale" | "To give away";
  title: string;
  body: string;
  price?: number;
  author: string;
  at: string;
  replies: MarketReply[];
};

export const SEED_LISTINGS: Listing[] = [
  {
    id: 1,
    kind: "Recommendation wanted",
    title: "Trusted dog sitter for two weeks in September",
    body: "Two large but very well-behaved dogs. Would prefer someone another household has used.",
    author: "Marcus Chen · Residence 21A",
    at: "August 3",
    replies: [
      {
        id: 1,
        author: "Eleanor Vance · Residence 34B",
        body: "We use Clara through the concierge desk · excellent, and she is already cleared by security.",
        at: "August 3",
      },
    ],
  },
  {
    id: 2,
    kind: "Recommendation wanted",
    title: "House cleaner, twice weekly",
    body: "Looking for a cleaner with building experience who is comfortable with the service lift protocol.",
    author: "Anonymous deed-holder",
    at: "August 1",
    replies: [],
  },
  {
    id: 3,
    kind: "For sale",
    title: "Pair of Poltrona Frau lounge chairs, cognac leather",
    body: "Four years old, excellent condition. Available after the September refurbishment.",
    price: 3200,
    author: "Priya Raman · Residence 28D",
    at: "July 27",
    replies: [],
  },
  {
    id: 4,
    kind: "To give away",
    title: "Child's cot and changing table",
    body: "Both in good order. Collection from Residence 41C at your convenience.",
    author: "James & Odile Whitfield · Residence 41C",
    at: "July 20",
    replies: [],
  },
];

/* ------------------------------------------------------------- proposals */

export type Proposal = {
  id: number;
  title: string;
  body: string;
  category: string;
  author: string;
  at: string;
  up: number;
  down: number;
};

export const SEED_PROPOSALS: Proposal[] = [
  {
    id: 1,
    title: "Extend private dining room hours to Sunday evenings",
    body: "Several households host family on Sundays; a later close would be welcomed by residents on the upper floors.",
    category: "Amenities",
    author: "Anonymous deed-holder",
    at: "February 28",
    up: 42,
    down: 4,
  },
  {
    id: 2,
    title: "Dedicated EV valet charging in the arrival court",
    body: "Charging requests currently queue behind general valet. A reserved bay would shorten wait times considerably.",
    category: "Building Operations",
    author: "Residence 34B",
    at: "February 24",
    up: 31,
    down: 9,
  },
  {
    id: 3,
    title: "Quarterly wine salon curated with the hotel sommelier",
    body: "A members-only tasting in the residents' lounge would give neighbours an occasion to meet in a considered setting.",
    category: "Concierge & Service",
    author: "Anonymous deed-holder",
    at: "February 19",
    up: 27,
    down: 2,
  },
];

/* -------------------------------------------------------------- messages */

export type Message = { id: number; author: string; body: string; at: string };

export type Thread = {
  id: number;
  kind: "Group" | "Private";
  name: string;
  participants: string[];
  messages: Message[];
};

export const SEED_THREADS: Thread[] = [
  {
    id: 1,
    kind: "Group",
    name: "Floor 21 Book Club",
    participants: ["Eleanor Vance", "Priya Raman", "Marcus Chen"],
    messages: [
      {
        id: 1,
        author: "Priya Raman",
        body: "September's title is settled · we're reading the Ferrante.",
        at: "August 2, 4:12 PM",
      },
      {
        id: 2,
        author: "Eleanor Vance",
        body: "Wonderful. I'll ask the lounge to hold the fireside corner.",
        at: "August 2, 4:20 PM",
      },
    ],
  },
  {
    id: 2,
    kind: "Private",
    name: "Marcus Chen · Residence 21A",
    participants: ["Marcus Chen"],
    messages: [
      {
        id: 1,
        author: "Marcus Chen",
        body: "Thank you for the sitter recommendation · she starts on the 9th.",
        at: "August 3, 9:05 AM",
      },
    ],
  },
  {
    id: 3,
    kind: "Group",
    name: "Wine & Spirits Circle",
    participants: ["Eleanor Vance", "Marcus Chen", "Sofia Marchetti"],
    messages: [
      {
        id: 1,
        author: "Eleanor Vance",
        body: "Terrace is back · shall we hold the September tasting outdoors?",
        at: "August 1, 6:40 PM",
      },
    ],
  },
];

/* --------------------------------------------------------------- surveys */

export type SurveyQuestion = { id: string; prompt: string };

export const SURVEY_QUESTIONS: SurveyQuestion[] = [
  { id: "concierge", prompt: "Responsiveness of the concierge team" },
  { id: "amenities", prompt: "Condition and availability of the amenities" },
  { id: "maintenance", prompt: "Speed and quality of maintenance work" },
  { id: "communication", prompt: "Clarity of communication from management" },
  { id: "value", prompt: "Overall value for the condominium fee" },
];

export type SurveyResponse = {
  id: number;
  month: string;
  ratings: Record<string, number>;
  comment?: string;
  submittedBy: string;
};

export const SURVEY_NAME = "Monthly Residence Happiness Survey";

/** Management-only access code for the survey results dashboard (demo). */
export const MANAGEMENT_ACCESS_CODE = "residences-office";

export function monthLabel(date: Date = new Date()) {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

/** True on the final calendar day of the month, and on any later day of a month
 *  that has already rolled over · the prompt keeps appearing until completed. */
export function isSurveyWindowOpen(date: Date = new Date()) {
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  return date.getDate() >= lastDay;
}

export const CURRENT_SURVEY_MONTH = "August 2026";

export const SEED_SURVEY_RESPONSES: SurveyResponse[] = [
  {
    id: 1,
    month: "August 2026",
    ratings: { concierge: 5, amenities: 4, maintenance: 4, communication: 3, value: 4 },
    comment: "The concierge team has been exceptional this month.",
    submittedBy: "Anonymous",
  },
  {
    id: 2,
    month: "August 2026",
    ratings: { concierge: 4, amenities: 5, maintenance: 3, communication: 3, value: 3 },
    submittedBy: "Anonymous",
  },
  {
    id: 3,
    month: "August 2026",
    ratings: { concierge: 5, amenities: 4, maintenance: 5, communication: 4, value: 4 },
    comment: "Would welcome more notice before lift works.",
    submittedBy: "Anonymous",
  },
];
