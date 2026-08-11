import residentsLoungeImg from "@/assets/residents-lounge.jpg";
import nantucketKitchenImg from "@/assets/nantucket-kitchen.jpg";
import secretGardenImg from "@/assets/secret-garden-room.jpg";
import sportsLoungeImg from "@/assets/sports-lounge.jpg";
import emeraldLoungeImg from "@/assets/emerald-lounge.jpg";
import longBarImg from "@/assets/long-bar.jpg";
import laPadronaImg from "@/assets/la-padrona.jpg";
import blindDuckImg from "@/assets/blind-duck.jpg";
import guerlainSpaImg from "@/assets/guerlain-spa.jpg";
import patisserieImg from "@/assets/patisserie.jpg";
import poolImg from "@/assets/pool.jpg";
import fitnessImg from "@/assets/fitness.jpg";
import dogRunImg from "@/assets/dog-run.jpg";
import privateDiningImg from "@/assets/private-dining.jpg";
import boardRoomImg from "@/assets/board-room.jpg";
import heroTowerImg from "@/assets/hero-tower.jpg";
import rafflesHeritageImg from "@/assets/raffles-heritage.jpg";
import residenceListingImg from "@/assets/residence-listing.jpg";
import socialOneImg from "@/assets/social/social-1.jpg";
import socialTwoImg from "@/assets/social/social-2.jpg";
import socialThreeImg from "@/assets/social/social-3.jpg";
import socialFourImg from "@/assets/social/social-4.jpg";
import socialFiveImg from "@/assets/social/social-5.jpg";
import socialSixImg from "@/assets/social/social-6.jpg";
import pastOneImg from "@/assets/events/past-1.jpg";
import pastTwoImg from "@/assets/events/past-2.jpg";
import pastThreeImg from "@/assets/events/past-3.jpg";
import pastFourImg from "@/assets/events/past-4.jpg";
import pastFiveImg from "@/assets/events/past-5.jpg";

export type ThankYouNote = {
  id: number;
  recipient: string;
  role: string;
  body: string;
  author: string;
  anonymous: boolean;
  at: string;
  /** Optional attached photograph or video, either uploaded or chosen from the gallery. */
  attachment?: { src: string; kind: "image" | "video" };
};

/** Staff members residents may credit in a note. */
export const THANKABLE_STAFF = [
  "Antoine Marchetti, Residences Manager",
  "Priya Raghunathan, Chief Concierge",
  "Daniel Okonkwo, Concierge",
  "Marisol Vega, Concierge",
  "Elias Thorne, Head of Engineering",
  "Grace Lindqvist, Housekeeping Manager",
  "Tomás Ferreira, Valet Captain",
  "Nadia Hassan, Front of House",
  "Whole team",
] as const;

/** A grouped recipient picker: staff first, then neighbours, pets, places and Boston itself. */
export const THANKABLE_GROUPS: { label: string; options: string[] }[] = [
  {
    label: "Staff member",
    options: [
      "Antoine Marchetti, Residences Manager",
      "Priya Raghunathan, Chief Concierge",
      "Daniel Okonkwo, Concierge",
      "Marisol Vega, Concierge",
      "Elias Thorne, Head of Engineering",
      "Grace Lindqvist, Housekeeping Manager",
      "Tomás Ferreira, Valet Captain",
      "Nadia Hassan, Front of House",
      "The whole house team",
    ],
  },
  {
    label: "Neighbour or resident",
    options: [
      "A neighbour on my floor",
      "A resident I only know from the elevator",
      "The household next door",
    ],
  },
  {
    label: "A pet of the building",
    options: ["A resident dog of the dog run", "A resident cat", "A visiting four-legged friend"],
  },
  {
    label: "An event",
    options: [
      "The Sommelier's Wine Salon",
      "The Chef's Table evening",
      "A wellness morning at the spa",
      "Midsummer on the terrace",
      "A holiday afternoon in the lounge",
    ],
  },
  {
    label: "A space within the property",
    options: [
      "Residents' Lounge, Floor 21",
      "Nantucket Kitchen",
      "Secret Garden Room",
      "Sports Lounge & Simulator",
      "Emerald Lounge",
      "Long Bar & Terrace",
      "La Padrona",
      "Blind Duck",
      "Guerlain Spa",
      "The Pool",
      "Fitness Centre",
      "The Patisserie",
      "The Dog Run",
      "My own residence",
    ],
  },
  {
    label: "Other Raffles & Accor hotels",
    options: [
      "Raffles Boston Hotel",
      "Raffles Singapore",
      "Raffles London at The OWO",
      "Raffles Paris, Le Royal Monceau",
      "Raffles Dubai",
      "An Accor hotel elsewhere in the world",
    ],
  },
  {
    label: "Boston landmark, neighbourhood or experience",
    options: [
      "Back Bay",
      "The Charles River Esplanade",
      "Boston Public Garden",
      "Trinity Church, Copley Square",
      "Fenway Park",
      "The North End",
      "Newbury Street",
      "A game, concert or show in town",
    ],
  },
  {
    label: "Public transport",
    options: [
      "The MBTA Green Line",
      "The MBTA Orange Line",
      "Back Bay Station",
      "The Commuter Rail",
      "A Bluebikes ride",
    ],
  },
  {
    label: "A business, service or product",
    options: [
      "A neighbourhood business",
      "A trusted local service",
      "An experience worth recommending",
      "A product that earned its place",
    ],
  },
];

/** Recipient picker value shown when none of the presets quite fit. */
export const THANKABLE_OTHER = "Someone or something else";

/** Preloaded photographs from the site that can be attached to a note. */
export const GRATITUDE_GALLERY: { src: string; label: string }[] = [
  { src: residentsLoungeImg, label: "Residents' Lounge" },
  { src: nantucketKitchenImg, label: "Nantucket Kitchen" },
  { src: secretGardenImg, label: "Secret Garden Room" },
  { src: sportsLoungeImg, label: "Sports Lounge" },
  { src: emeraldLoungeImg, label: "Emerald Lounge" },
  { src: longBarImg, label: "Long Bar & Terrace" },
  { src: laPadronaImg, label: "La Padrona" },
  { src: blindDuckImg, label: "Blind Duck" },
  { src: guerlainSpaImg, label: "Guerlain Spa" },
  { src: poolImg, label: "The Pool" },
  { src: fitnessImg, label: "Fitness Centre" },
  { src: patisserieImg, label: "The Patisserie" },
  { src: dogRunImg, label: "The Dog Run" },
  { src: privateDiningImg, label: "In-Residence Dining" },
  { src: boardRoomImg, label: "The Board Room" },
  { src: heroTowerImg, label: "40 Trinity Place" },
  { src: rafflesHeritageImg, label: "Raffles heritage" },
  { src: residenceListingImg, label: "A residence interior" },
  { src: socialOneImg, label: "Golden hour terrace" },
  { src: socialTwoImg, label: "Long Bar pour" },
  { src: socialThreeImg, label: "Spa candlelight" },
  { src: socialFourImg, label: "Lounge breakfast" },
  { src: socialFiveImg, label: "A building moment" },
  { src: socialSixImg, label: "A residence view" },
  { src: pastOneImg, label: "A past wine salon" },
  { src: pastTwoImg, label: "A past gathering" },
  { src: pastThreeImg, label: "A past evening" },
  { src: pastFourImg, label: "Midsummer terrace" },
  { src: pastFiveImg, label: "A past celebration" },
];

export const SEED_THANK_YOU_NOTES: ThankYouNote[] = [
  {
    id: 1,
    recipient: "Priya Raghunathan, Chief Concierge",
    role: "Chief Concierge",
    body: "Priya found us a table on a Saturday night with two hours' notice, then arranged the car without being asked. Faultless, as ever.",
    author: "Residence 34B",
    anonymous: false,
    at: "Two days ago",
    attachment: { src: laPadronaImg, kind: "image" },
  },
  {
    id: 2,
    recipient: "Elias Thorne, Head of Engineering",
    role: "Head of Engineering",
    body: "A burst valve at midnight and Elias was at the door in ten minutes. He stayed until it was dry and left the place spotless.",
    author: "A resident",
    anonymous: true,
    at: "Last week",
  },
  {
    id: 3,
    recipient: "Tomás Ferreira, Valet Captain",
    role: "Valet Captain",
    body: "Tomás remembers every car and every name. My mother visited once and he greeted her by name the next month.",
    author: "Residence 18D",
    anonymous: false,
    at: "Last week",
  },
  {
    id: 4,
    recipient: "Secret Garden Room",
    role: "A space within the property",
    body: "Twelve of us around one table for the Burgundy salon and nobody wanted to leave. The best room in the building after dark.",
    author: "Residence 18C",
    anonymous: false,
    at: "Last week",
    attachment: { src: secretGardenImg, kind: "image" },
  },
  {
    id: 5,
    recipient: "A resident dog of the dog run",
    role: "A pet of the building",
    body: "Whoever owns the small spaniel with the enormous ears: that dog has improved every single one of my mornings this month.",
    author: "A resident",
    anonymous: true,
    at: "Two weeks ago",
    attachment: { src: dogRunImg, kind: "image" },
  },
  {
    id: 6,
    recipient: "Grace Lindqvist, Housekeeping Manager",
    role: "Housekeeping Manager",
    body: "Grace's team turned the residence around before our guests landed. Quiet, precise and unfailingly kind.",
    author: "A resident",
    anonymous: true,
    at: "Two weeks ago",
  },
  {
    id: 7,
    recipient: "Daniel Okonkwo, Concierge",
    role: "Concierge",
    body: "Daniel walked our parcels up in a downpour and refused to make a fuss about it. Thank you.",
    author: "Residence 27A",
    anonymous: false,
    at: "Three weeks ago",
  },
];
