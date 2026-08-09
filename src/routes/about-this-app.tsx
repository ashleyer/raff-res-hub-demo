import { createFileRoute } from "@tanstack/react-router";
import {
  Sparkles,
  Heart,
  Users,
  Bell,
  Vote,
  ShieldCheck,
  Wrench,
  Mail,
  Phone,
  Github,
} from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { ContactLink } from "@/components/ContactLink";

export const Route = createFileRoute("/about-this-app")({
  head: () => ({
    meta: [
      { title: "About This App — Why Raffles Boston Residences Hub Exists" },
      {
        name: "description",
        content:
          "The story behind this demo: a resident, a coder, and two years of neighbours saying the same thing — they want more community. Meet Ashley Romano and what she built.",
      },
      { property: "og:title", content: "About This App — Why It Exists" },
      {
        property: "og:description",
        content: "A resident-built demo exploring whether software can make a building happier.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutThisAppPage,
});

const FEATURES: { icon: typeof Sparkles; title: string; body: string }[] = [
  {
    icon: Bell,
    title: "Ask for anything, and know it landed",
    body: "Housekeeping, valet, a guest arrival, a security concern — lodge it with the concierge desk and get an on-screen receipt, not just a hope that an email went through.",
  },
  {
    icon: Users,
    title: "A directory that asks first",
    body: "Every resident decides, room by room, whether to be listed and whether neighbours can reach them directly. Nothing is visible by default — community should never come at the cost of privacy.",
  },
  {
    icon: Heart,
    title: "Community, on purpose",
    body: "Interest circles, a marketplace for favours and recommendations, a gratitude board for the staff who make the place feel like home — the small threads that turn a building into neighbours.",
  },
  {
    icon: Vote,
    title: "A real voice in how the building runs",
    body: "Board measures, live ballots, and the governing documents in one place — one vote per residence, counted transparently.",
  },
  {
    icon: Wrench,
    title: "The hotel side, simplified",
    body: "A simulated bridge into the hotel's systems — folios, priority tables, in-residence delivery — showing what a genuinely connected residence-hotel experience could feel like.",
  },
  {
    icon: ShieldCheck,
    title: "Built to hold up, not just look nice",
    body: "Session handling, accessibility (WCAG 2.2 AA), and automated visual, unit and accessibility checks run against this codebase the same way they would for a production product.",
  },
];

function InitialsPortrait() {
  return (
    <div
      className="flex aspect-square w-full max-w-56 items-center justify-center border border-border bg-secondary/40"
      role="img"
      aria-label="Portrait placeholder for Ashley Romano"
    >
      <span className="font-display text-6xl font-light text-primary">AR</span>
    </div>
  );
}

function AboutThisAppPage() {
  return (
    <PageShell
      eyebrow="The Story Behind This Demo"
      title="Why this app exists"
      intro="Two years of living at Raffles Residences Boston taught me one thing before anything else: residents want community. So does the person writing this. So I built a demo to see what software could do about it."
    >
      <section aria-labelledby="origin-heading" className="mt-16 border-t border-border pt-14">
        <p className="eyebrow">Unit 22H</p>
        <h2 id="origin-heading" className="mt-3 text-3xl">
          The same conversation, over and over
        </h2>
        <div className="gold-rule mt-4" />
        <div className="measure mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          <p>
            I've lived here for two years. In that time, at dinners, in the elevator, at events in
            the Residents' Lounge, one topic keeps coming back no matter who I'm talking to:
            residents want to feel more connected — to each other, to the staff who take such good
            care of us, and to the building itself. I want that too.
          </p>
          <p>
            I'm also, by nature and by trade, a nerd who codes for fun. So instead of just agreeing
            over another glass of wine, I built this: a fully working demo of what an intranet for a
            residence like ours could look like — concierge requests, amenity bookings, a resident
            directory, governance ballots, a marketplace, a gratitude board for staff, even a
            simulated bridge into the hotel's own systems. Everything you can click on this site
            actually works.
          </p>
          <p>
            It's not affiliated with Raffles, Accor, or the real building's management — it's an
            independent, self-funded side project, built and paid for on my own time, to explore one
            question honestly: could a well-built app make everyone here — staff, residents, and the
            community around them — a little happier? I think the answer is yes, and I'd love the
            chance to build it for real.
          </p>
        </div>
      </section>

      <section aria-labelledby="features-heading" className="mt-20 border-t border-border pt-14">
        <p className="eyebrow">What's actually inside</p>
        <h2 id="features-heading" className="mt-3 text-3xl">
          What this demo does
        </h2>
        <div className="gold-rule mt-4" />
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <li key={f.title} className="border border-border bg-card p-6">
              <f.icon className="h-5 w-5 text-primary" aria-hidden="true" />
              <h3 className="mt-4 text-lg leading-snug">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="who-heading" className="mt-20 border-t border-border pt-14">
        <p className="eyebrow">Who built it</p>
        <h2 id="who-heading" className="mt-3 text-3xl">
          Meet Ashley Romano
        </h2>
        <div className="gold-rule mt-4" />

        <div className="mt-8 grid gap-10 lg:grid-cols-[14rem_1fr]">
          <InitialsPortrait />

          <div className="space-y-5">
            <ul className="flex flex-wrap gap-2 text-[0.65rem] tracking-[0.16em] text-primary uppercase">
              {[
                "Co-Founder & President, StayRele",
                "Harvard & Boston University",
                "Liberty Mutual TechStart alum",
                "3 patents pending",
                "Google · IBM · Anthropic AI certified",
                "MIT Innovation & Technology",
              ].map((chip) => (
                <li key={chip} className="border border-primary/40 px-3 py-1.5">
                  {chip}
                </li>
              ))}
            </ul>

            <div className="measure space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              <p>
                By day, I'm Co-Founder (Technical) and President of{" "}
                <span className="text-foreground">StayRele</span>, a pre-launch social platform
                built against the attention economy. I lead a 21-person team, wrote the company's
                founder-adopted AI Governance Playbook and Moderation Governance Policy, and still
                ship production code myself in TypeScript, React Native, and C#/.NET most weeks.
              </p>
              <p>
                I didn't take the usual road here. After years of entrepreneurial pursuits and
                studies at Harvard and Boston University, I landed in General Assembly's full-stack
                immersive, which led to Liberty Mutual's FAANG-competitive TechStart engineering
                apprenticeship — and to shipping real production code in its Investments and Legal
                Strategic Services business units. The legal work stuck: I went on to design four
                proprietary access-to-justice algorithms for a legaltech startup, three of which are
                now under provisional patent.
              </p>
              <p>
                Curiosity about AI pulled me into the Boston Google Developer Group and Gemini
                certifications, then IBM and Anthropic AI certifications, alongside an MIT
                Innovation and Technology certificate. On the side, I do AI benchmarking task work
                for a Stanford-backed startup, which keeps my skills sharp and my humility sharper.
              </p>
              <p>
                I mentor women and anyone entering tech, and I run my team on a fail-forward rule I
                apply to myself first: break things, admit it, laugh, learn. In coding, there's no
                room for egos — there's always room for a laugh. My mistakes are the only reason I
                know anything.
              </p>
              <p>
                I'm a former SAT teacher, the designated talker for a giant multi-generational
                family, and once the face of an open-source developer community with 15,000+
                members. In enterprise engineering, I was consistently chosen to cross-functionally
                present sprint reviews to 100+ stakeholders — making sure engineers and executives
                were actually speaking the same language. I've spoken at Liberty Mutual's Women in
                Tech and TechStart programs about my path into software, in a style I'd describe as
                practical, energetic, and just funny enough to keep a room of engineers awake after
                lunch. Beyond software, I volunteer with animal, environmental, and neighbourhood
                organizations across Boston, Paradise Valley, Concord, and Nantucket.
              </p>
              <p>
                And, evenings and weekends, I live at Raffles Residences Boston in Unit 22H — which
                is where this particular idea came from.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="motto-heading" className="mt-20 border-t border-border pt-14">
        <p className="eyebrow text-center sm:text-left">The philosophy behind the build</p>
        <h2 id="motto-heading" className="sr-only">
          Ashley's motto
        </h2>
        <blockquote className="chrome-dark mt-6 border border-border p-8 text-center sm:p-12">
          <Sparkles className="mx-auto h-6 w-6 text-primary" aria-hidden="true" />
          <p className="measure mx-auto mt-5 text-pretty font-display text-xl leading-relaxed font-light sm:text-2xl">
            "AI + Tech are one of humanity's greatest advances; let's learn it, experiment with it,
            + apply it so we change what's going on right now — until it helps over harms humans +
            their communities, and so it loses its currently bad rap, and instead gives way to even
            greater emotional, physical, spiritual, + financial gain for Earth's inhabitants."
          </p>
          <p className="mt-6 text-sm tracking-[0.2em] text-primary uppercase">
            Just Say No to the Status Quo!
          </p>
        </blockquote>
      </section>

      <section
        aria-labelledby="contact-heading"
        className="mt-20 border-t border-border pt-14 text-center"
      >
        <h2 id="contact-heading" className="text-2xl">
          Say hello, ask a question, or file a bug
        </h2>
        <p className="measure mx-auto mt-3 text-sm leading-relaxed text-muted-foreground">
          I built this alone, on my own time — I'd genuinely love to hear what you think of it.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-8">
          <ContactLink
            href="mailto:ashleye.romano@gmail.com"
            value="ashleye.romano@gmail.com"
            kind="mail"
            ariaLabel="Email Ashley Romano at ashleye.romano@gmail.com"
            className="nav-link inline-flex min-h-11 items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
            ashleye.romano@gmail.com
          </ContactLink>
          <ContactLink
            href="tel:+19788575775"
            value="978-857-5775"
            kind="tel"
            ariaLabel="Call or text Ashley Romano at 978-857-5775"
            className="nav-link inline-flex min-h-11 items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            Call or text: 978-857-5775
          </ContactLink>
          <a
            href="https://github.com/ashleyer/raff-res-hub-demo"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link inline-flex min-h-11 items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <Github className="h-4 w-4" aria-hidden="true" />
            GitHub repo
          </a>
        </div>

        <p
          style={{ fontFamily: "'Courier New', Courier, monospace" }}
          className="mt-12 text-[0.6875rem] text-muted-foreground"
        >
          built with{" "}
          <span role="img" aria-label="white heart">
            🤍
          </span>{" "}
          in Raffles Residences Boston, Unit 22H by Ashley Romano, 2026
        </p>
      </section>
    </PageShell>
  );
}
