import { DemoTag } from "@/components/DemoTag";
import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { requireResidentSession } from "@/lib/session-guard";
import { toast } from "sonner";
import { PageShell } from "@/components/PageShell";
import { RequireSession } from "@/components/RequireSession";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { GALLERY_PLACES, SEED_GALLERY_POSTS, type GalleryPost } from "@/lib/gallery-data";
import { usePortal } from "@/lib/portal-store";

export const Route = createFileRoute("/gallery")({
  ssr: false,
  beforeLoad: requireResidentSession,
  head: () => ({
    meta: [
      { title: "Residence Gallery, Raffles Boston Residences" },
      {
        name: "description",
        content:
          "A resident-made photo gallery of life at 40 Trinity Place, terraces, salons, the pool and the patisserie, posted by neighbours.",
      },
      { property: "og:title", content: "Residence Gallery, Raffles Boston Residences" },
      {
        property: "og:description",
        content:
          "Residents share photographs and notes from their days in the building. Sign in to post your own.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GalleryPage,
});

function GalleryPage() {
  const [posts, setPosts] = useState<GalleryPost[]>(SEED_GALLERY_POSTS);
  const [liked, setLiked] = useState<number[]>([]);

  const toggleLike = (id: number) => {
    const isLiked = liked.includes(id);
    setLiked((prev) => (isLiked ? prev.filter((x) => x !== id) : [...prev, id]));
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, likes: p.likes + (isLiked ? -1 : 1) } : p)),
    );
  };

  return (
    <PageShell
      eyebrow="Residents' Photographs"
      title="Residence gallery"
      intro="A gallery kept by the house, not the marketing department. Post a photograph from your day in the building, a terrace at dusk, a table in the garden room, the pool before anyone else is up, with a line about it."
    >
      <RequireSession area="the residence gallery">
        <PostForm onPost={(post) => setPosts((prev) => [post, ...prev])} />
      </RequireSession>

      <section aria-labelledby="gallery-heading" className="mt-16 border-t border-border pt-14">
        <h2 id="gallery-heading" className="text-2xl">
          Posted by residents
        </h2>
        <div className="gold-rule mt-4" />

        <ul className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <li key={post.id} className="relative flex flex-col border border-border bg-card">
              <DemoTag label="Demo photo" title="Illustrative photo, not a real resident post" />
              <img
                src={post.image}
                alt={post.alt}
                loading="lazy"
                className="aspect-[4/5] w-full object-cover"
              />
              <div className="flex flex-1 flex-col p-5">
                <p className="eyebrow text-[0.6rem]">{post.place}</p>
                <p className="mt-3 flex-1 text-pretty text-sm leading-relaxed">{post.caption}</p>
                <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
                  <p className="min-w-0 text-[0.65rem] tracking-[0.18em] text-muted-foreground uppercase">
                    {post.author} · {post.at}
                  </p>
                  <button
                    type="button"
                    onClick={() => toggleLike(post.id)}
                    aria-pressed={liked.includes(post.id)}
                    aria-label={`Appreciate this photograph from ${post.author}`}
                    className="-mr-2 -my-2 min-h-11 min-w-11 px-2 text-xs tracking-[0.14em] text-muted-foreground uppercase transition-colors hover:text-foreground"
                  >
                    {liked.includes(post.id) ? "♥" : "♡"} {post.likes}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </PageShell>
  );
}

function PostForm({ onPost }: { onPost: (post: GalleryPost) => void }) {
  const { currentUser } = usePortal();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [alt, setAlt] = useState("");
  const [caption, setCaption] = useState("");
  const [place, setPlace] = useState<string>(GALLERY_PLACES[0]);
  const [anonymous, setAnonymous] = useState(false);

  const pickFile = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Please choose an image under 8 MB.");
      return;
    }
    setPreview(URL.createObjectURL(file));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!preview) {
      toast.error("Please choose a photograph to post.");
      return;
    }
    if (caption.trim().length < 5) {
      toast.error("Please add a short line about the photograph.");
      return;
    }
    onPost({
      id: Date.now(),
      image: preview,
      alt: alt.trim() || caption.trim().slice(0, 120),
      caption: caption.trim().slice(0, 400),
      place,
      author: anonymous
        ? "Anonymous resident"
        : currentUser?.unit
          ? `Residence ${currentUser.unit}`.replace("Residence Residence", "Residence")
          : "A resident",
      at: "Just now",
      likes: 0,
    });
    setPreview(null);
    setAlt("");
    setCaption("");
    if (fileRef.current) fileRef.current.value = "";
    toast.success("Posted to the residence gallery.");
  };

  return (
    <section
      aria-labelledby="post-heading"
      className="mt-16 border border-border bg-card p-6 sm:p-8"
    >
      <p className="eyebrow">Add to the gallery</p>
      <h2 id="post-heading" className="mt-3 text-2xl">
        Post a photograph
      </h2>
      <div className="gold-rule mt-4" />

      <form onSubmit={submit} className="mt-6 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="gal-file">Photograph</Label>
          <Input
            id="gal-file"
            ref={fileRef}
            type="file"
            accept="image/*"
            className="min-h-11"
            onChange={(e) => pickFile(e.target.files?.[0])}
            aria-describedby="gal-file-hint"
          />
          <p id="gal-file-hint" className="text-xs text-muted-foreground">
            Images stay in your browser for this demo, nothing is uploaded to a server.
          </p>
        </div>

        {preview ? (
          <img
            src={preview}
            alt="Preview of the photograph you are about to post"
            className="max-h-64 w-full border border-border object-cover"
          />
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="gal-place">Where was it taken?</Label>
          <select
            id="gal-place"
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            className="min-h-11 w-full border border-input bg-transparent px-3 text-sm"
          >
            {GALLERY_PLACES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="gal-caption">Your note</Label>
          <Textarea
            id="gal-caption"
            rows={4}
            maxLength={400}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="A line about the moment."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gal-alt">Image description (for screen readers)</Label>
          <Input
            id="gal-alt"
            value={alt}
            maxLength={140}
            onChange={(e) => setAlt(e.target.value)}
            placeholder="Sunset over the Charles from a terrace"
            className="min-h-11"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <div className="min-w-0 flex-1">
            <Label htmlFor="gal-anon" className="text-sm font-normal">
              Post anonymously
            </Label>
            <p id="gal-anon-hint" className="mt-1 text-pretty text-xs text-muted-foreground">
              Your residence number is hidden from the gallery.
            </p>
          </div>
          <Switch
            id="gal-anon"
            checked={anonymous}
            onCheckedChange={setAnonymous}
            aria-describedby="gal-anon-hint"
          />
        </div>

        <Button type="submit" className="min-h-12 w-full tracking-[0.18em] uppercase sm:w-auto">
          Post photograph
        </Button>
      </form>
    </section>
  );
}
