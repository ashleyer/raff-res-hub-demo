import patisserieImg from "@/assets/patisserie.jpg";
import poolImg from "@/assets/pool.jpg";
import fitnessImg from "@/assets/fitness.jpg";
import dogRunImg from "@/assets/dog-run.jpg";
import pastOne from "@/assets/events/past-1.jpg";
import pastTwo from "@/assets/events/past-2.jpg";
import pastThree from "@/assets/events/past-3.jpg";
import pastFour from "@/assets/events/past-4.jpg";
import pastFive from "@/assets/events/past-5.jpg";

/** Daily-use house amenities: open to residents, not reserved through the desk. */
export type HouseAmenity = {
  id: string;
  name: string;
  location: string;
  description: string;
  hours: string[];
  note: string;
  image: string;
  links?: { label: string; href: string }[];
};

export const HOUSE_AMENITIES: HouseAmenity[] = [
  {
    id: "patisserie",
    name: "The Patisserie",
    location: "Ground floor · Trinity Place",
    description:
      "The hotel's pastry counter: viennoiserie, entremets, chocolates and coffee, prepared each morning by the Raffles pastry kitchen. Residents may charge to the house account or send an order up through the concierge.",
    hours: ["Daily · 7:00 AM – 6:00 PM"],
    note: "Walk-in only. Whole cakes and celebration orders take forty-eight hours' notice.",
    image: patisserieImg,
    links: [{ label: "Raffles Boston dining", href: "https://www.raffles.com/boston/dining/" }],
  },
  {
    id: "pool",
    name: "The Pool",
    location: "Wellness Level · Guerlain Spa",
    description:
      "A twenty-metre indoor pool with loungers, towel service and quiet hours reserved for residents each morning.",
    hours: ["Daily · 6:00 AM – 10:00 PM", "Residents' quiet swim · 6:00 – 8:00 AM"],
    note: "No reservation required. Children under sixteen must be accompanied.",
    image: poolImg,
    links: [
      { label: "Wellness at Raffles Boston", href: "https://www.raffles.com/boston/wellness/" },
    ],
  },
  {
    id: "fitness",
    name: "Fitness Centre",
    location: "Wellness Level · Guerlain Spa",
    description:
      "A contemporary gym with cardio, strength and free-weight stations, plus a studio for private training and residents' morning classes.",
    hours: ["Open 24 hours to deed-holders"],
    note: "Personal training and class bookings are arranged through the spa desk.",
    image: fitnessImg,
    links: [
      { label: "Wellness at Raffles Boston", href: "https://www.raffles.com/boston/wellness/" },
    ],
  },
  {
    id: "dog-run",
    name: "The Dog Run",
    location: "Terrace level · Residences only",
    description:
      "A turfed and fenced run for residents' dogs, with a rinse station, shaded bench seating and waste service twice daily.",
    hours: ["Daily · 6:00 AM – 10:00 PM"],
    note: "Dogs must be registered with the concierge and leashed in all common areas.",
    image: dogRunImg,
  },
];

export type PastEventPhoto = {
  id: string;
  image: string;
  alt: string;
  title: string;
  caption: string;
  when: string;
};

export const PAST_EVENT_PHOTOS: PastEventPhoto[] = [
  {
    id: "wine-salon",
    image: pastOne,
    alt: "Residents seated at a candlelit table during a wine salon",
    title: "Burgundy Salon",
    caption: "A seated tasting with the hotel sommelier in the Secret Garden Room.",
    when: "March",
  },
  {
    id: "tree-lighting",
    image: pastTwo,
    alt: "Residents gathered at a decorated tree in the arrival lobby",
    title: "Tree Lighting Reception",
    caption: "Champagne and carols in the arrival lobby on Trinity Place.",
    when: "December",
  },
  {
    id: "chefs-table",
    image: pastThree,
    alt: "Plated courses along the marble island of the Nantucket Kitchen",
    title: "Chef's Table",
    caption: "Six courses served at the Nantucket Kitchen island on Floor 21.",
    when: "February",
  },
  {
    id: "rooftop-summer",
    image: pastFour,
    alt: "Residents at cocktail tables on a terrace at dusk",
    title: "Midsummer Terrace",
    caption: "Cocktails and a jazz trio as the skyline turned.",
    when: "July",
  },
  {
    id: "wellness-morning",
    image: pastFive,
    alt: "A morning yoga class in a bright glass lounge",
    title: "Wellness Morning",
    caption: "Sunrise practice in the Residents' Lounge, followed by breakfast.",
    when: "May",
  },
];
