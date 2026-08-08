import socialOne from "@/assets/social/social-1.jpg";
import pastOne from "@/assets/events/past-1.jpg";
import pastFour from "@/assets/events/past-4.jpg";
import patisserie from "@/assets/patisserie.jpg";
import secretGarden from "@/assets/secret-garden-room.jpg";
import pool from "@/assets/pool.jpg";

/** A resident-submitted photograph and note from life in the building. */
export type GalleryPost = {
  id: number;
  image: string;
  alt: string;
  caption: string;
  place: string;
  author: string;
  at: string;
  likes: number;
};

export const GALLERY_PLACES = [
  "Residents' Lounge, Floor 21",
  "Nantucket Kitchen",
  "Secret Garden Room",
  "Sports Lounge",
  "Emerald Lounge",
  "Long Bar & Terrace",
  "La Padrona",
  "Blind Duck",
  "Guerlain Spa",
  "The Pool",
  "Fitness Centre",
  "The Patisserie",
  "The Dog Run",
  "In my residence",
  "Elsewhere at 40 Trinity Place",
] as const;

export const SEED_GALLERY_POSTS: GalleryPost[] = [
  {
    id: 1,
    image: socialOne,
    alt: "Golden hour over the Boston skyline from a residence terrace",
    caption:
      "Third winter here and the light off the Charles at four o'clock still stops me on the way through the living room.",
    place: "In my residence",
    author: "Residence 31A",
    at: "Two days ago",
    likes: 54,
  },
  {
    id: 2,
    image: pastOne,
    alt: "Residents seated at a candlelit table during a wine salon",
    caption:
      "The Burgundy salon in the Secret Garden Room — twelve of us, three hours, no one wanted to leave.",
    place: "Secret Garden Room",
    author: "Residence 18C",
    at: "Last week",
    likes: 87,
  },
  {
    id: 3,
    image: patisserie,
    alt: "Pastries and coffee on a marble counter",
    caption:
      "Saturday ritual: two croissants and a cortado downstairs before anyone else in the house is awake.",
    place: "The Patisserie",
    author: "Anonymous resident",
    at: "Last week",
    likes: 41,
  },
  {
    id: 4,
    image: secretGarden,
    alt: "A softly lit private dining room with garden motifs",
    caption:
      "Booked the kitchen and the garden room for my mother's eightieth. The hotel catered it and I did nothing but pour wine.",
    place: "Nantucket Kitchen",
    author: "Residence 27F",
    at: "Two weeks ago",
    likes: 132,
  },
  {
    id: 5,
    image: pool,
    alt: "An indoor pool with loungers and soft daylight",
    caption: "Residents' quiet swim at half six. The whole pool to myself most mornings.",
    place: "The Pool",
    author: "Residence 12B",
    at: "Three weeks ago",
    likes: 63,
  },
  {
    id: 6,
    image: pastFour,
    alt: "Residents at cocktail tables on a terrace at dusk",
    caption: "Midsummer on the terrace. Met four neighbours I had only ever nodded to in the lift.",
    place: "Long Bar & Terrace",
    author: "Residence 22H",
    at: "Last month",
    likes: 96,
  },
];
