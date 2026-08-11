import { toast } from "sonner";
import { ShieldOff } from "lucide-react";
import { usePortal, REMEMBER_TTL_MS } from "@/lib/portal-store";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const REMEMBER_DAYS = Math.round(REMEMBER_TTL_MS / (24 * 60 * 60 * 1000));

/** One-click removal of the residence and contact details kept in this browser
 *  by "Remember me", plus the privacy switch that stops it happening again. */
export function SavedDetailsControl() {
  const {
    rememberedEmail,
    rememberedUnit,
    clearSavedDetails,
    rememberEnabled,
    setRememberEnabled,
  } = usePortal();
  const hasSaved = Boolean(rememberedEmail || rememberedUnit);

  return (
    <section className="mt-8 border-t border-border pt-6">
      <h3 className="flex items-center gap-2 text-lg">
        <ShieldOff className="h-4 w-4 text-primary" aria-hidden="true" />
        Saved residence details
      </h3>

      <div className="mt-4 flex items-start justify-between gap-4 border border-border bg-card px-4 py-4">
        <div>
          <Label htmlFor="remember-me-toggle" className="text-sm text-foreground">
            Remember me on this browser
          </Label>
          <p id="remember-me-help" className="mt-1 text-sm text-muted-foreground">
            When off, nothing is kept between sign-ins, anything already saved is erased the moment
            you switch it off.
          </p>
        </div>
        <Switch
          id="remember-me-toggle"
          checked={rememberEnabled}
          aria-describedby="remember-me-help"
          onCheckedChange={(next) => {
            setRememberEnabled(next);
            toast.success(
              next
                ? "Remember me is on for this browser."
                : "Remember me is off, saved details cleared from this browser.",
            );
          }}
        />
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        {hasSaved ? (
          <>
            This browser is remembering <span className="text-foreground">{rememberedEmail}</span>
            {rememberedUnit ? (
              <>
                {" "}
                and residence <span className="text-foreground">{rememberedUnit}</span>
              </>
            ) : null}{" "}
            for up to {REMEMBER_DAYS} days so sign-in is prefilled. You may remove it at any time.
          </>
        ) : rememberEnabled ? (
          <>
            Nothing is saved on this browser. Enable “Remember me” at sign-in if you would like it
            prefilled.
          </>
        ) : (
          <>Nothing is saved, and nothing will be: persistence is switched off for this browser.</>
        )}
      </p>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={!hasSaved}
            className="mt-4 min-h-11 w-full tracking-[0.18em] uppercase sm:w-auto"
          >
            Clear saved residence details
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear saved residence details?</AlertDialogTitle>
            <AlertDialogDescription>
              The remembered email address and residence number will be erased from this browser
              immediately. Your account, household profile and current session are untouched, you
              will simply need to type your details the next time you sign in.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-11">Keep them</AlertDialogCancel>
            <AlertDialogAction
              className="min-h-11"
              onClick={() => {
                clearSavedDetails();
                toast.success("Saved residence details cleared from this browser.");
              }}
            >
              Clear now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
