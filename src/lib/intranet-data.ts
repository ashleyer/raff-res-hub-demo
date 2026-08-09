import residentsLoungeImg from "@/assets/residents-lounge.jpg";
import privateDiningImg from "@/assets/private-dining.jpg";
import longBarImg from "@/assets/long-bar.jpg";
import guerlainSpaImg from "@/assets/guerlain-spa.jpg";
import laPadronaImg from "@/assets/la-padrona.jpg";
import blindDuckImg from "@/assets/blind-duck.jpg";
import nantucketKitchenImg from "@/assets/nantucket-kitchen.jpg";
import secretGardenImg from "@/assets/secret-garden-room.jpg";
import sportsLoungeImg from "@/assets/sports-lounge.jpg";
import emeraldLoungeImg from "@/assets/emerald-lounge.jpg";

export type Broadcast = {
  id: number;
  title: string;
  summary: string;
  badge: string;
  date: string;
};

export type Suggestion = {
  id: number;
  title: string;
  body: string;
  category: string;
  anonymous: boolean;
  unit?: string;
  upvotes: number;
  createdAt: string;
};

export type Amenity = {
  id: string;
  name: string;
  location: string;
  description: string;
  hours: string;
  slots: string[];
  image: string;
  service?: string;
};

export type Booking = {
  id: number;
  amenityId: string;
  amenityName: string;
  date: string;
  slot: string;
  guests: number;
  unit: string;
  catering: string;
  notes?: string;
};

export type ResidentEvent = {
  id: number;
  title: string;
  detail: string;
  location: string;
  date: string;
  time: string;
  capacity: number;
  attending: number;
  image: string;
};

export type EventIdea = {
  id: number;
  title: string;
  body: string;
  unit?: string;
  anonymous: boolean;
  interest: number;
};

export type ConciergeReply = {
  id: number;
  body: string;
  author: string;
  at: string;
};

export type ConciergeRequest = {
  id: number;
  service: string;
  detail: string;
  unit: string;
  priority: "Standard" | "Priority";
  status: "Lodged" | "In progress" | "Completed";
  placedAt: string;
  /* Desk-side fields, filled in by staff in the concierge management view. */
  assignedTo?: string;
  replies?: ConciergeReply[];
};

export type GovernanceMeasure = {
  id: number;
  reference: string;
  title: string;
  summary: string;
  status: "Open for ballot" | "In committee" | "Carried" | "Withdrawn";
  closes: string;
  inFavour: number;
  against: number;
};

export type GovernanceDocument = {
  id: number;
  title: string;
  kind: string;
  issued: string;
};

export const CATEGORIES = [
  "Amenities",
  "Concierge & Service",
  "Governance",
  "Wellness & Spa",
  "Building Operations",
] as const;

export const BROADCASTS: Broadcast[] = [
  {
    id: 1,
    title: "Long Bar Terrace Reopening",
    summary:
      "The terrace above Back Bay returns to residents on the 12th following completion of the stone restoration programme. Evening service resumes at 5:00 PM daily.",
    badge: "Amenity",
    date: "March 4",
  },
  {
    id: 2,
    title: "Annual Trustee Assembly — Notice of Quorum",
    summary:
      "Deed-holders are asked to register attendance with the Residences Office no later than the 20th. Proxy instruments may be lodged with the concierge desk.",
    badge: "Governance",
    date: "March 1",
  },
  {
    id: 3,
    title: "Guerlain Spa Residents' Allocation",
    summary:
      "Priority treatment windows for in-residence members have been extended to weekday mornings, bookable through the concierge for the coming season.",
    badge: "Wellness",
    date: "February 26",
  },
];

export const SEED_SUGGESTIONS: Suggestion[] = [
  {
    id: 1,
    title: "Extend private dining room hours to Sunday evenings",
    body: "Several households host family on Sundays; a later close would be welcomed by residents on the upper floors.",
    category: "Amenities",
    anonymous: true,
    upvotes: 42,
    createdAt: "February 28",
  },
  {
    id: 2,
    title: "Dedicated EV valet charging in the arrival court",
    body: "Charging requests currently queue behind general valet. A reserved bay would shorten wait times considerably.",
    category: "Building Operations",
    anonymous: false,
    unit: "Residence 34B",
    upvotes: 31,
    createdAt: "February 24",
  },
  {
    id: 3,
    title: "Quarterly wine salon curated with the hotel sommelier",
    body: "A members-only tasting in the residents' lounge would give neighbours an occasion to meet in a considered setting.",
    category: "Concierge & Service",
    anonymous: true,
    upvotes: 27,
    createdAt: "February 19",
  },
];

export const AMENITIES: Amenity[] = [
  {
    id: "residents-lounge",
    name: "Residents' Lounge",
    location: "Floor 21 · Deed-holders and their guests",
    description:
      "The private heart of the residences on the twenty-first floor: a panelled salon with skyline outlook over Back Bay, fireside seating and adjoining amenity rooms — the Nantucket Kitchen, Secret Garden Room, sports simulator and sports lounge.",
    hours: "Open 24 hours",
    service:
      "The lounge and its amenity rooms may be reserved through this desk. Catering is provided by the hotel kitchen — attach a selection to any request.",
    slots: ["Morning · 09:00", "Afternoon · 15:00", "Evening · 18:30", "Late · 21:30"],
    image: residentsLoungeImg,
  },
  {
    id: "nantucket-kitchen",
    name: "Nantucket Kitchen",
    location: "Floor 21 · Residents' Lounge",
    description:
      "A full demonstration kitchen with marble island and seating, reservable for cooking evenings, family gatherings and chef-led dinners. Hotel catering may be laid here.",
    hours: "Open 24 hours",
    service:
      "A complimentary resident breakfast is served here daily until 9:00 AM. Outside that window, catering from the hotel kitchen may be attached to any sitting.",
    slots: ["Morning · 09:00", "Luncheon · 12:30", "Evening · 18:30", "Late · 21:30"],
    image: nantucketKitchenImg,
  },
  {
    id: "secret-garden-room",
    name: "Secret Garden Room",
    location: "Floor 21 · Residents' Lounge",
    description:
      "A planted glass room off the lounge for quiet mornings, small seated gatherings and afternoon conversation above Back Bay.",
    hours: "Open 24 hours",
    slots: ["Morning · 09:00", "Afternoon · 15:00", "Evening · 18:30"],
    image: secretGardenImg,
  },
  {
    id: "sports-simulator",
    name: "Sports Simulator",
    location: "Floor 21 · Residents' Lounge",
    description:
      "The golf and multi-sport simulator bay, reserved by the hour for residents and their guests.",
    hours: "Open 24 hours",
    slots: ["07:00", "10:00", "13:00", "16:00", "19:00", "21:00"],
    image: sportsLoungeImg,
  },
  {
    id: "sports-lounge",
    name: "Sports Lounge",
    location: "Floor 21 · Residents' Lounge",
    description:
      "Club seating and screens beside the simulator — reservable for match evenings, with catering from the hotel on request.",
    hours: "Open 24 hours",
    service: "Catering from the hotel kitchen may be attached to any sitting.",
    slots: ["Afternoon · 14:00", "Evening · 18:00", "Late · 21:00"],
    image: sportsLoungeImg,
  },
  {
    id: "emerald-lounge",
    name: "Emerald Lounge",
    location: "Formerly Amar · Reservable in its entirety",
    description:
      "The emerald-panelled lounge, taken as a whole for private receptions, celebrations and seated dinners, with bar and catering supplied by the hotel.",
    hours: "Open 24 hours by arrangement",
    service: "Full buy-out only. Hotel catering and bar service may be attached to any request.",
    slots: ["Luncheon · 12:00", "Aperitif · 17:00", "Evening · 19:00", "Late · 21:30"],
    image: emeraldLoungeImg,
  },
];

/** Hotel venues residents may visit but cannot reserve through the residences desk. */
export type Venue = {
  id: string;
  name: string;
  location: string;
  description: string;
  hours: string[];
  note: string;
  image: string;
  links: { label: string; href: string }[];
};

export const VENUES: Venue[] = [
  {
    id: "long-bar",
    name: "Long Bar & Terrace",
    location: "Perched above Back Bay · Raffles Boston",
    description:
      "All-day dining with New England classics — lobster rolls, oysters on the half shell — legendary Raffles cocktails including the Singapore Sling and Boston Sling, and afternoon tea Thursday to Sunday, 2:00–4:30 PM.",
    hours: [
      "Monday – Friday · 6:30 AM – 12:00 AM",
      "Saturday & Sunday · 7:00 AM – 12:00 AM",
      "Breakfast served daily · 6:30 AM – 11:00 AM",
      "Food served until 11:00 PM",
    ],
    note: "The Long Bar cannot be reserved in its entirety. Tables are booked through the hotel.",
    image: longBarImg,
    links: [
      { label: "View menus", href: "https://www.raffles.com/boston/dining/long-bar-and-terrace/" },
      {
        label: "Book a table",
        href: "https://www.sevenrooms.com/explore/longbarandterrace/reservations/create/search/",
      },
    ],
  },
  {
    id: "la-padrona",
    name: "La Padrona",
    location: "38 Trinity Place · Michelin Guide recommended Italian",
    description:
      "Chef Jody Adams' Italian dining room beside the residences — an ode to exquisite cuisine, cherished company and the pleasure of breaking bread together.",
    hours: ["Sunday – Thursday · 5:00 PM – 10:00 PM", "Friday & Saturday · 5:00 PM – 11:00 PM"],
    note: "Reservations open on Resy at 9:00 AM on a rolling fourteen-day basis.",
    image: laPadronaImg,
    links: [
      { label: "View menus", href: "https://www.lapadronaboston.com/menus" },
      { label: "Reservations", href: "https://resy.com/cities/boston-ma/venues/la-padrona" },
    ],
  },
  {
    id: "blind-duck",
    name: "Blind Duck",
    location: "Floors 17 & 18 · Raffles Boston",
    description:
      "Boston in a tall glass: a seasonal cocktail programme with barrel-aged spirits, handcrafted signatures such as the Soufflé Espresso Martini and Midnight Garden, and low- and non-alcoholic pours.",
    hours: [
      "Tuesday – Thursday · 5:00 PM – 1:00 AM",
      "Friday & Saturday · 5:00 PM – 2:00 AM",
      "Sunday & Monday · Closed",
    ],
    note: "The room cannot be reserved in its entirety.",
    image: blindDuckImg,
    links: [
      { label: "View menus", href: "https://www.raffles.com/boston/dining/speakeasy/" },
      { label: "Reservations", href: "https://www.sevenrooms.com/reservations/blindduckboston" },
    ],
  },
  {
    id: "guerlain-spa",
    name: "Guerlain Spa",
    location: "Wellness Level · One of four Guerlain sanctuaries in the United States",
    description:
      "Treatment suites and private relaxation pods, his and hers sauna and steam rooms, a contemporary fitness centre and a twenty-metre pool.",
    hours: ["Daily · 7:00 AM – 8:00 PM"],
    note: "Treatment rooms are not reservable here — book directly with the spa.",
    image: guerlainSpaImg,
    links: [
      { label: "Spa services", href: "https://www.raffles.com/boston/wellness/" },
      { label: "Email the spa", href: "mailto:spa.rbo@raffles.com" },
    ],
  },
];

/** In-residence dining, ordered rather than reserved. */
export type MenuItem = { id: string; name: string; detail: string; price: number };
export type MenuSection = { id: string; label: string; hours: string; items: MenuItem[] };

export const IN_RESIDENCE_DINING = {
  name: "Private Dining — In-Residence",
  location: "Served in your residence by Raffles Hotel Staff, In-Room Dining",
  hours: "Open 24 hours",
  note: "Table dressing, glassware and clearing are included. A 20% service charge and delivery fee apply to every order.",
  image: privateDiningImg,
};

export const IN_RESIDENCE_MENU: MenuSection[] = [
  {
    id: "breakfast",
    label: "Breakfast",
    hours: "6:30 AM – 11:00 AM",
    items: [
      {
        id: "continental",
        name: "Continental Breakfast",
        detail: "Viennoiserie, seasonal fruit, yoghurt, juice and coffee",
        price: 42,
      },
      {
        id: "eggs",
        name: "Eggs Any Style",
        detail: "Two eggs, breakfast potatoes, choice of bacon or chicken sausage",
        price: 34,
      },
      {
        id: "avocado-toast",
        name: "Avocado Toast",
        detail: "Sourdough, soft-poached egg, chilli, lemon",
        price: 28,
      },
      {
        id: "oatmeal",
        name: "Steel-Cut Oats",
        detail: "Brown sugar, toasted almond, berries",
        price: 22,
      },
    ],
  },
  {
    id: "all-day",
    label: "All Day",
    hours: "11:00 AM – 11:00 PM",
    items: [
      {
        id: "lobster-roll",
        name: "Maine Lobster Roll",
        detail: "Butter-poached lobster, split-top brioche, house fries",
        price: 46,
      },
      {
        id: "oysters",
        name: "Oysters on the Half Shell",
        detail: "Half dozen, mignonette, lemon",
        price: 32,
      },
      {
        id: "clam-chowder",
        name: "New England Clam Chowder",
        detail: "Cream, potato, oyster crackers",
        price: 24,
      },
      {
        id: "raffles-burger",
        name: "Raffles Burger",
        detail: "Aged cheddar, caramelised onion, house pickle, fries",
        price: 36,
      },
      {
        id: "little-gem",
        name: "Little Gem Salad",
        detail: "Green goddess, radish, herbs, pecorino",
        price: 26,
      },
      {
        id: "cacio-e-pepe",
        name: "Cacio e Pepe",
        detail: "Tonnarelli, pecorino romano, black pepper",
        price: 34,
      },
      { id: "branzino", name: "Roasted Branzino", detail: "Fennel, olive, salsa verde", price: 52 },
    ],
  },
  {
    id: "overnight",
    label: "Overnight",
    hours: "11:00 PM – 6:30 AM",
    items: [
      {
        id: "cheese-board",
        name: "Artisan Cheese Board",
        detail: "Three cheeses, honeycomb, crackers",
        price: 30,
      },
      {
        id: "club",
        name: "Raffles Club Sandwich",
        detail: "Roast chicken, bacon, tomato, fries",
        price: 32,
      },
      {
        id: "crudites",
        name: "Crudités & Dips",
        detail: "Market vegetables, hummus, herb ranch",
        price: 22,
      },
    ],
  },
  {
    id: "cellar",
    label: "From the Cellar",
    hours: "Available 24 hours",
    items: [
      {
        id: "champagne",
        name: "Champagne, Brut NV",
        detail: "Bottle, chilled, served with glassware",
        price: 165,
      },
      { id: "barolo", name: "Barolo, Piedmont", detail: "Bottle, decanted on arrival", price: 190 },
      {
        id: "sling",
        name: "Boston Sling",
        detail: "Two servings, batched and delivered on ice",
        price: 44,
      },
      { id: "tea", name: "Raffles Tea Service", detail: "Pot for two, house blend", price: 18 },
    ],
  },
];

export const CATERING_OPTIONS = [
  "No catering — room only",
  "Hotel continental breakfast service",
  "Coffee, tea & pastries",
  "Canapés & Champagne reception",
  "Seated three-course dinner from the hotel kitchen",
  "Chef's tasting menu with wine pairing",
  "Bar service only (host account)",
] as const;

export const SEED_BOOKINGS: Booking[] = [
  {
    id: 1,
    amenityId: "emerald-lounge",
    amenityName: "Emerald Lounge",
    date: "2026-08-08",
    slot: "Evening · 19:00",
    guests: 8,
    unit: "Residence 34B",
    catering: "Canapés & Champagne reception",
  },
  {
    id: 2,
    amenityId: "nantucket-kitchen",
    amenityName: "Nantucket Kitchen",
    date: "2026-08-09",
    slot: "Evening · 18:30",
    guests: 12,
    unit: "Residence 21A",
    catering: "Chef's tasting menu with wine pairing",
  },
  {
    id: 3,
    amenityId: "residents-lounge",
    amenityName: "Residents' Lounge",
    date: "2026-08-11",
    slot: "Afternoon · 15:00",
    guests: 6,
    unit: "Residence 28D",
    catering: "Coffee, tea & pastries",
    notes: "Book club sitting by the fireplace.",
  },
];

export const SEED_EVENTS: ResidentEvent[] = [
  {
    id: 1,
    title: "Sommelier's Wine Salon",
    detail:
      "A guided tasting of six Piedmontese bottles with the hotel sommelier, poured alongside a cheese and charcuterie table.",
    location: "Residents' Lounge · Floor 21",
    date: "August 14, 2026",
    time: "6:30 PM",
    capacity: 40,
    attending: 26,
    image: residentsLoungeImg,
  },
  {
    id: 2,
    title: "Chef's Table — Late Summer Menu",
    detail:
      "Five courses composed by the La Padrona kitchen, served at the private table for residences.",
    location: "La Padrona",
    date: "August 22, 2026",
    time: "7:00 PM",
    capacity: 14,
    attending: 11,
    image: laPadronaImg,
  },
  {
    id: 3,
    title: "Wellness Morning & Lap Swim",
    detail:
      "Reserved pool hour followed by breathwork in the spa suite and a light breakfast in the lounge.",
    location: "Guerlain Spa",
    date: "September 5, 2026",
    time: "8:00 AM",
    capacity: 20,
    attending: 7,
    image: guerlainSpaImg,
  },
];

export const SEED_EVENT_IDEAS: EventIdea[] = [
  {
    id: 1,
    title: "Autumn rooftop jazz trio",
    body: "A short set on the terrace before the season turns, with a cocktail from the Long Bar list.",
    anonymous: true,
    interest: 18,
  },
  {
    id: 2,
    title: "Children's holiday afternoon in the lounge",
    body: "A supervised afternoon on Floor 21 for households with young families in December.",
    unit: "Residence 41C",
    anonymous: false,
    interest: 12,
  },
];

export const CONCIERGE_SERVICES = [
  "Housekeeping",
  "Dry Cleaning & Laundry",
  "Valet & Transport",
  "In-Residence Dining",
  "Guest Arrival Greeting",
  "Floristry",
  "Package & Courier",
  "Engineering",
  "Security",
  "Other",
] as const;

export const SEED_REQUESTS: ConciergeRequest[] = [
  {
    id: 1,
    service: "Valet & Transport",
    detail: "Car to Logan Airport, Terminal E, departing the arrival court at 6:15 AM.",
    unit: "Residence 41C",
    priority: "Priority",
    status: "In progress",
    placedAt: "This morning",
  },
  {
    id: 2,
    service: "Floristry",
    detail: "Weekly arrangement for the entry console — white peony and eucalyptus.",
    unit: "Residence 28D",
    priority: "Standard",
    status: "Lodged",
    placedAt: "Yesterday",
  },
  {
    id: 3,
    service: "Engineering",
    detail: "Adjust the terrace door closer; the seal is catching in humid weather.",
    unit: "Residence 34B",
    priority: "Standard",
    status: "Completed",
    placedAt: "March 2",
  },
];

export const MEASURES: GovernanceMeasure[] = [
  {
    id: 1,
    reference: "M-2026-04",
    title: "Adoption of the restored terrace maintenance schedule",
    summary:
      "The Board proposes a biannual stone and planter programme funded from the amenity reserve, effective the coming season.",
    status: "Open for ballot",
    closes: "August 21",
    inFavour: 63,
    against: 11,
  },
  {
    id: 2,
    reference: "M-2026-03",
    title: "Reserved electric-vehicle bays in the arrival court",
    summary:
      "Four bays would be re-designated for resident charging, with valet retaining priority for arrivals between 5:00 and 8:00 PM.",
    status: "In committee",
    closes: "September 4",
    inFavour: 48,
    against: 19,
  },
  {
    id: 3,
    reference: "M-2026-02",
    title: "Extension of private dining service to Sunday evenings",
    summary:
      "Carried at the February sitting following the community register submission from the upper floors.",
    status: "Carried",
    closes: "Closed February 27",
    inFavour: 71,
    against: 6,
  },
];

export const GOVERNANCE_DOCUMENTS: GovernanceDocument[] = [
  {
    id: 1,
    title: "Declaration of Trust & House Rules",
    kind: "Governing instrument",
    issued: "Revised January 2026",
  },
  { id: 2, title: "Operating Budget & Reserve Study", kind: "Financial", issued: "February 2026" },
  { id: 3, title: "Minutes — February Trustee Sitting", kind: "Minutes", issued: "March 1, 2026" },
  {
    id: 4,
    title: "Proxy Instrument for the Annual Assembly",
    kind: "Form",
    issued: "March 1, 2026",
  },
];
