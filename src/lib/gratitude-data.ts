export type ThankYouNote = {
  id: number;
  recipient: string;
  role: string;
  body: string;
  author: string;
  anonymous: boolean;
  at: string;
};

/** Staff members residents may credit in a note. */
export const THANKABLE_STAFF = [
  "Antoine Marchetti · Residences Manager",
  "Priya Raghunathan · Chief Concierge",
  "Daniel Okonkwo · Concierge",
  "Marisol Vega · Concierge",
  "Elias Thorne · Head of Engineering",
  "Grace Lindqvist · Housekeeping Manager",
  "Tomás Ferreira · Valet Captain",
  "Nadia Hassan · Front of House",
  "Whole team",
] as const;

export const SEED_THANK_YOU_NOTES: ThankYouNote[] = [
  {
    id: 1,
    recipient: "Priya Raghunathan · Chief Concierge",
    role: "Chief Concierge",
    body: "Priya found us a table on a Saturday night with two hours' notice, then arranged the car without being asked. Faultless, as ever.",
    author: "Residence 34B",
    anonymous: false,
    at: "Two days ago",
  },
  {
    id: 2,
    recipient: "Elias Thorne · Head of Engineering",
    role: "Head of Engineering",
    body: "A burst valve at midnight and Elias was at the door in ten minutes. He stayed until it was dry and left the place spotless.",
    author: "A resident",
    anonymous: true,
    at: "Last week",
  },
  {
    id: 3,
    recipient: "Tomás Ferreira · Valet Captain",
    role: "Valet Captain",
    body: "Tomás remembers every car and every name. My mother visited once and he greeted her by name the next month.",
    author: "Residence 18D",
    anonymous: false,
    at: "Last week",
  },
  {
    id: 4,
    recipient: "Grace Lindqvist · Housekeeping Manager",
    role: "Housekeeping Manager",
    body: "Grace's team turned the residence around before our guests landed. Quiet, precise and unfailingly kind.",
    author: "A resident",
    anonymous: true,
    at: "Two weeks ago",
  },
  {
    id: 5,
    recipient: "Daniel Okonkwo · Concierge",
    role: "Concierge",
    body: "Daniel walked our parcels up in a downpour and refused to make a fuss about it. Thank you.",
    author: "Residence 27A",
    anonymous: false,
    at: "Three weeks ago",
  },
];
