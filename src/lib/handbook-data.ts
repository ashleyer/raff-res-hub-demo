/**
 * Dummy Residence Handbook — invented content for the demo only.
 * Surfaced on the Management page and alongside the Board's governing documents.
 */
export type HandbookClause = {
  id: string;
  /** e.g. "1.2" */
  number: string;
  title: string;
  body: string;
};

export type HandbookChapter = {
  id: string;
  /** e.g. "Article I" */
  article: string;
  title: string;
  summary: string;
  clauses: HandbookClause[];
};

export const HANDBOOK_EDITION = "Third Edition · Revised February 2026";
export const HANDBOOK_TITLE = "The Residence Handbook";

export const HANDBOOK: HandbookChapter[] = [
  {
    id: "arrival",
    article: "Article I",
    title: "Arrival, access & the concierge desk",
    summary: "How residents, guests and deliveries move through the building.",
    clauses: [
      {
        id: "1-1",
        number: "1.1",
        title: "Residence access",
        body: "Each registered residence is issued key fobs programmed for the lobby, its own floor and the amenity levels. Lost fobs should be reported to the concierge desk at once so they may be de-authorised; replacements are issued the same day.",
      },
      {
        id: "1-2",
        number: "1.2",
        title: "Guests & visitors",
        body: "Residents are asked to announce expected guests to the concierge desk in advance. Unannounced visitors are held in the lobby until the residence is reached by telephone. Guests remain the responsibility of the residence that received them.",
      },
      {
        id: "1-3",
        number: "1.3",
        title: "Parcels & deliveries",
        body: "Parcels are received at the concierge desk and a notification is raised in the resident portal. There is no separate package room. Perishable deliveries are refrigerated where possible and should be collected the same day.",
      },
      {
        id: "1-4",
        number: "1.4",
        title: "Valet & motor court",
        body: "Valet service operates from the motor court around the clock. Vehicles may be requested from the portal or by telephone; ten minutes' notice is customary at peak hours.",
      },
    ],
  },
  {
    id: "residing",
    article: "Article II",
    title: "Living in the residence",
    summary: "Quiet enjoyment, alterations, pets and household staff.",
    clauses: [
      {
        id: "2-1",
        number: "2.1",
        title: "Quiet enjoyment",
        body: "Quiet hours run from 10:00 pm to 8:00 am. Musical instruments, entertaining and household equipment should be moderated so that no sound is audible in an adjoining residence during those hours.",
      },
      {
        id: "2-2",
        number: "2.2",
        title: "Alterations & contractors",
        body: "Any alteration touching flooring, plumbing, electrical service or the building envelope requires written approval from the Residences Office before work begins. Approved contractors may work Monday to Friday, 9:00 am to 5:00 pm, and must be signed in at the service entrance.",
      },
      {
        id: "2-3",
        number: "2.3",
        title: "Pets in residence",
        body: "Two domestic animals are permitted per residence. Pets are carried or leashed in all common areas, travel by the service lift where practicable, and are registered with the Residences Office. The dog run on the amenity level is provided for exercise.",
      },
      {
        id: "2-4",
        number: "2.4",
        title: "Household staff",
        body: "Housekeepers, nannies and personal staff are registered with the concierge desk and issued day access. Residents remain responsible for the conduct of anyone engaged on their behalf.",
      },
    ],
  },
  {
    id: "amenities",
    article: "Article III",
    title: "Amenities & hospitality",
    summary: "Use of the Residents' Lounge, the wellness floor and hotel services.",
    clauses: [
      {
        id: "3-1",
        number: "3.1",
        title: "Residents' Lounge, Floor 21",
        body: "The Residents' Lounge (including the Nantucket Kitchen, Secret Garden Room, sports lounge and simulator) is open to residents at all hours. The kitchen and its amenity spaces may be reserved through the portal, and catering may be arranged from the hotel.",
      },
      {
        id: "3-2",
        number: "3.2",
        title: "Private Dining · In-Residence",
        body: "In-residence dining is served by Raffles hotel staff around the clock. Orders are placed from the menu in the portal; a service charge is posted to the house account.",
      },
      {
        id: "3-3",
        number: "3.3",
        title: "Pool, gym & spa",
        body: "The pool and fitness floor are for residents and accompanied guests. Guerlain Spa treatments are booked directly with the spa. Appropriate attire is expected throughout the wellness floor.",
      },
      {
        id: "3-4",
        number: "3.4",
        title: "Reservations & cancellations",
        body: "Amenity reservations may be cancelled without charge up to twenty-four hours in advance. Repeated no-shows may lead to a temporary suspension of booking privileges.",
      },
    ],
  },
  {
    id: "financial",
    article: "Article IV",
    title: "Common charges & the house account",
    summary: "Condominium fees, billing and collections.",
    clauses: [
      {
        id: "4-1",
        number: "4.1",
        title: "Common charges",
        body: "Common charges are billed monthly in advance and are due on the first of the month. Statements are published to the house account in the portal.",
      },
      {
        id: "4-2",
        number: "4.2",
        title: "House account",
        body: "Dining, valet, catering and concierge purchases are posted to the residence's house account and settled with the monthly statement.",
      },
      {
        id: "4-3",
        number: "4.3",
        title: "Arrears",
        body: "Balances unpaid after thirty days accrue interest at the rate set annually by the Board of Trustees. Amenity privileges may be suspended while an account is materially in arrears.",
      },
    ],
  },
  {
    id: "safety",
    article: "Article V",
    title: "Safety, maintenance & emergencies",
    summary: "Reporting faults, life-safety systems and building emergencies.",
    clauses: [
      {
        id: "5-1",
        number: "5.1",
        title: "Maintenance requests",
        body: "Faults inside a residence are lodged through the portal and triaged by building engineering. Emergencies (water ingress, loss of power, smoke) should be telephoned to the concierge desk immediately rather than logged.",
      },
      {
        id: "5-2",
        number: "5.2",
        title: "Life-safety systems",
        body: "Detectors, sprinklers and shut-off valves are tested annually and must remain accessible. Nothing may be hung from a sprinkler head, and detectors may not be disabled.",
      },
      {
        id: "5-3",
        number: "5.3",
        title: "Evacuation",
        body: "In an alarm, residents proceed to the nearest fire stair and assemble at the designated point on the street. Lifts are recalled automatically and may not be used.",
      },
    ],
  },
  {
    id: "governance",
    article: "Article VI",
    title: "Governance & conduct",
    summary: "The Board, resident meetings and how the handbook is amended.",
    clauses: [
      {
        id: "6-1",
        number: "6.1",
        title: "The Board of Trustees",
        body: "The Board is elected by the deed-holders and sits monthly. One ballot is held per registered residence; proxies may be lodged with the concierge desk.",
      },
      {
        id: "6-2",
        number: "6.2",
        title: "Concerns & disputes",
        body: "Concerns between residences are raised first with the Residences Office, which may convene an informal hearing before any matter reaches the Board.",
      },
      {
        id: "6-3",
        number: "6.3",
        title: "Amendment",
        body: "The handbook is reviewed annually. Amendments are proposed by the Board, posted for thirty days' comment, and take effect on adoption at a trustee sitting.",
      },
    ],
  },
];
