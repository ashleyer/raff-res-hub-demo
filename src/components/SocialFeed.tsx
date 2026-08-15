import { Instagram } from "lucide-react";
import social1 from "@/assets/social/social-1.jpg";
import social2 from "@/assets/social/social-2.jpg";
import social3 from "@/assets/social/social-3.jpg";
import social4 from "@/assets/social/social-4.jpg";
import social5 from "@/assets/social/social-5.jpg";
import social6 from "@/assets/social/social-6.jpg";

const IG_PROFILE = "https://www.instagram.com/rafflesresidencesboston/";

type Post = {
  id: number;
  image: string;
  alt: string;
  caption: string;
  posted: string;
  likes: number;
  comments: number;
};

const POSTS: Post[] = [
  {
    id: 1,
    image: social1,
    alt: "Golden hour over the Boston skyline from a residence terrace",
    caption: "Golden hour from the terrace. Forty Trinity Place at its best.",
    posted: "2 hours ago",
    likes: 412,
    comments: 18,
  },
  {
    id: 2,
    image: social2,
    alt: "A signature cocktail on the marble counter of the Long Bar",
    caption: "The Long Bar pours its winter list from Thursday.",
    posted: "Yesterday",
    likes: 587,
    comments: 34,
  },
  {
    id: 3,
    image: social3,
    alt: "Candlelit treatment room at the Guerlain Spa",
    caption: "Quiet hours at the Guerlain Spa; residents book through the concierge.",
    posted: "2 days ago",
    likes: 296,
    comments: 9,
  },
  {
    id: 4,
    image: social4,
    alt: "Breakfast plated beside a tall window in the Residents' Lounge",
    caption: "Breakfast is served daily in the Residents' Lounge until 9 AM, Floor 21.",
    posted: "4 days ago",
    likes: 733,
    comments: 51,
  },
  {
    id: 5,
    image: social5,
    alt: "The residences lobby with its seasonal floral arrangement",
    caption: "This week's arrangement in the arrival lobby.",
    posted: "6 days ago",
    likes: 344,
    comments: 12,
  },
  {
    id: 6,
    image: social6,
    alt: "Snow-dusted Back Bay brownstones at dusk",
    caption: "First snow in Back Bay. The neighbourhood we call home.",
    posted: "1 week ago",
    likes: 918,
    comments: 47,
  },
];

export function SocialFeed() {
  return (
    <section aria-label="Recent posts" className="mt-12">
      <div className="flex justify-center sm:justify-end">
        <a
          href={IG_PROFILE}
          target="_blank"
          rel="noreferrer noopener"
          className="btn-outline inline-flex min-h-11 items-center gap-2"
        >
          <Instagram className="h-4 w-4 shrink-0" aria-hidden="true" />
          @rafflesresidencesboston
          <span className="sr-only">on Instagram (opens in a new tab)</span>
        </a>
      </div>

      <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {POSTS.map((p) => (
          <li key={p.id} className="border border-border bg-card">
            <a href={IG_PROFILE} target="_blank" rel="noreferrer noopener" className="group block">
              <img
                src={p.image}
                alt={p.alt}
                width={512}
                height={512}
                loading="lazy"
                className="aspect-square w-full object-cover transition-opacity group-hover:opacity-90"
              />
              <div className="p-5">
                <p className="text-sm leading-relaxed">{p.caption}</p>
                <p className="mt-3 text-xs tracking-[0.16em] text-muted-foreground uppercase">
                  {p.posted} · {p.likes.toLocaleString("en-US")} likes · {p.comments} comments
                </p>
                <p className="mt-3 inline-flex items-center gap-2 text-xs tracking-[0.16em] text-primary uppercase">
                  View on Instagram
                  <span className="sr-only">(opens in a new tab)</span>
                </p>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
