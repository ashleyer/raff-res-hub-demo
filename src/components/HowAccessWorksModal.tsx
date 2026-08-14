import { useState } from "react";
import { Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DEMO_ACCOUNT, DEMO_PASSCODE } from "@/lib/portal-data";

const SECTIONS: { title: string; body: string }[] = [
  {
    title: "Any resident, one shared passcode",
    body: `Every listed resident email works with the same preview passcode, "${DEMO_PASSCODE}". There is also a fully open demo account (${DEMO_ACCOUNT.email} / ${DEMO_ACCOUNT.password}) that needs no residence number at all.`,
  },
  {
    title: "Your profile is required; being listed isn't",
    body: "Creating an account needs a name, residence and contact detail, but appearing in the Directory (and letting neighbours message you) defaults to off. Nothing about you is shown to anyone until you switch it on yourself.",
  },
  {
    title: "One household, many people",
    body: "A residence can hold several individual and pet profiles nested under one unit. The first person you add becomes the primary contact automatically, and that reassigns itself if the primary profile is ever removed.",
  },
  {
    title: "Staying signed in",
    body: "A session lasts 12 hours. Checking “Remember me” keeps your email and residence pre-filled on this device for 30 days; after that, or after 12 hours idle, you'll just sign in again.",
  },
  {
    title: "Forgot your password",
    body: "The reset flow is fully simulated: a one-time code appears on screen instead of being emailed, lapses after 15 minutes or on reload, and can be resent every 30 seconds.",
  },
  {
    title: "What's behind sign-in",
    body: "Eleven areas of the portal (Account, Community, Directory, For You, Gallery, Thank You Notes, Hotel Bridge, Marketplace, Messages, Proposals and Services) are only reachable once you're signed in as a resident.",
  },
  {
    title: "Raffles personnel is a separate system",
    body: "Staff and building-personnel accounts are entirely independent of resident accounts, reached via the Personnel Sign Up / Sign In links in the site footer, and gated separately from anything above.",
  },
];

/** Dismissible reference for how the demo's sign-in, sessions and access model actually work. */
export function HowAccessWorksModal() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 items-center gap-1.5 text-xs tracking-[0.16em] text-primary uppercase underline-offset-4 hover:underline"
      >
        <Info className="h-3.5 w-3.5" aria-hidden="true" />
        How sign-in &amp; sessions work
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-light">
              How sign-in &amp; sessions work
            </DialogTitle>
          </DialogHeader>
          <dl className="space-y-5">
            {SECTIONS.map((s) => (
              <div key={s.title}>
                <dt className="text-sm font-medium text-foreground">{s.title}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.body}</dd>
              </div>
            ))}
          </dl>
        </DialogContent>
      </Dialog>
    </>
  );
}
