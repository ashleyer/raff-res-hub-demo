export type BrandMilestone = { year: string; title: string; detail: string };

export const RAFFLES_STORY: BrandMilestone[] = [
  {
    year: "1887",
    title: "Raffles Singapore opens",
    detail:
      "Ten rooms in a colonial bungalow on Beach Road, opened by the Armenian Sarkies brothers and named for Sir Stamford Raffles. It became the address travellers wrote home about.",
  },
  {
    year: "1915",
    title: "The Singapore Sling is poured",
    detail:
      "Bartender Ngiam Tong Boon mixes gin, cherry liqueur and pineapple at the Long Bar, a drink now served in every Raffles house, Boston included.",
  },
  {
    year: "1987",
    title: "A national monument",
    detail:
      "The Singapore government declares the original hotel a national monument, protecting the colonnades, courtyards and Writers Bar that defined the brand.",
  },
  {
    year: "2016",
    title: "Raffles joins Accor",
    detail:
      "Accor acquires the Raffles, Fairmont and Swissôtel brands, placing Raffles at the summit of its luxury collection alongside the ALL loyalty programme.",
  },
  {
    year: "2019",
    title: "The Singapore restoration",
    detail:
      "A three-year restoration returns the flagship to its 1920s proportions, with the butler tradition, the personal service model Raffles pioneered, retained on every floor.",
  },
  {
    year: "2023",
    title: "Raffles Boston opens",
    detail:
      "The brand's first North American house opens at 40 Trinity Place: thirty-five storeys, 147 guest rooms and 146 branded residences above them, the first Raffles Residences in the United States.",
  },
];

export type BrandNews = {
  id: string;
  headline: string;
  where: string;
  detail: string;
  when: string;
  href: string;
};

/** Openings and brand news across the wider Raffles collection. */
export const RAFFLES_NEWS: BrandNews[] = [
  {
    id: "boston",
    headline: "Raffles Boston earns its place on the world stay lists",
    where: "Boston, United States",
    detail:
      "The Back Bay house, the brand's North American debut and the only property in the city combining a Raffles hotel with branded residences, continues to collect national recognition for its dining and Guerlain Spa.",
    when: "Ongoing",
    href: "https://www.raffles.com/boston/",
  },
  {
    id: "london",
    headline: "Raffles London at The OWO",
    where: "London, United Kingdom",
    detail:
      "The former Old War Office on Whitehall reopened as a Raffles hotel with 85 residences, nine restaurants and bars, and a Guerlain Spa beneath the building's historic dome.",
    when: "Open",
    href: "https://www.raffles.com/london/",
  },
  {
    id: "sentosa",
    headline: "Raffles Sentosa Singapore",
    where: "Sentosa, Singapore",
    detail:
      "An all-villa resort on the island's western ridge, the brand's second house in its birthplace, each villa with a private pool and dedicated butler.",
    when: "Open",
    href: "https://www.raffles.com/sentosa/",
  },
  {
    id: "jaipur",
    headline: "Raffles Jaipur",
    where: "Jaipur, India",
    detail:
      "A palace-inspired house of fifty suites in the Pink City, with courtyards, stepwell water features and a Raffles Spa.",
    when: "Open",
    href: "https://www.raffles.com/jaipur/",
  },
  {
    id: "residences",
    headline: "Raffles Residences expand across the collection",
    where: "Global",
    detail:
      "Branded residences now sit alongside Raffles houses in Singapore, London, Boston, Bali, Phnom Penh and Jeddah, each with hotel service, private amenities and access to the ALL, Accor Live Limitless programme.",
    when: "Ongoing",
    href: "https://all.accor.com/loyalty-program/index.en.shtml",
  },
];
