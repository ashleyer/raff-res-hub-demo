import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const SEEN_KEY = "raffles-demo-notice-seen";
const BANNER_KEY = "raffles-demo-banner-dismissed";

export function DemoBanner() {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(BANNER_KEY)) setDismissed(true);
    } catch {
      /* ignore */
    }
  }, []);

  if (dismissed) return null;

  return (
    <div className="border-emerald-deep/40 bg-emerald-deep w-full border-b">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-2 py-1.5 pr-1 pl-4 sm:gap-4 sm:py-2 sm:pr-2 sm:pl-6">
        <p className="text-ivory/90 min-w-0 flex-1 text-center text-[0.6875rem] leading-snug tracking-[0.12em] text-balance uppercase sm:text-[0.6875rem] sm:tracking-[0.18em]">
          Demo Site Only: All information is simulated and not real
        </p>

        <button
          type="button"
          aria-label="Dismiss demo notice"
          onClick={() => {
            setDismissed(true);
            try {
              localStorage.setItem(BANNER_KEY, "1");
            } catch {
              /* ignore */
            }
          }}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export function DemoModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (!sessionStorage.getItem(SEEN_KEY)) {
        setOpen(true);
        sessionStorage.setItem(SEEN_KEY, "1");
      }
    } catch {
      setOpen(true);
    }
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm border-border bg-background text-center">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-light">Demo Mode</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
            Content is not real. Everything shown in this residents' portal is illustrative.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
