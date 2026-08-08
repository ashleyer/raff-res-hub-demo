import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/* "Remember me" is opt-in and never switches on silently: enabling it opens a
   plain-language confirmation of exactly what is stored, where, and for how
   long, so the resident consents before anything is written to the device. */

type Props = {
  id: string;
  checked: boolean;
  onChange: (value: boolean) => void;
};

export function RememberMeConsent({ id, checked, onChange }: Props) {
  const [asking, setAsking] = useState(false);
  const hintId = `${id}-hint`;

  return (
    <div className="border-t border-border pt-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Label htmlFor={id} className="text-sm font-normal">
            Remember me on this device
          </Label>
          <p id={hintId} className="mt-1 text-pretty text-xs text-muted-foreground">
            {checked
              ? "On: your email address and residence number stay on this device for up to 30 days. Your signed-in session lapses after 12 hours of inactivity."
              : "Off: nothing is kept once you sign out. Switch on to review exactly what would be stored."}
          </p>
        </div>
        <Switch
          id={id}
          checked={checked}
          aria-describedby={hintId}
          onCheckedChange={(next) => {
            if (next) setAsking(true);
            else onChange(false);
          }}
        />
      </div>

      <AlertDialog open={asking} onOpenChange={setAsking}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ShieldCheck aria-hidden="true" className="size-5 text-primary" />
              Before you switch on “Remember me”
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-left">
                <p>
                  Nothing is sent anywhere. Everything below is written only to this browser, on
                  this device, and can be removed at any time by switching “Remember me” off.
                </p>
                <ul className="space-y-2">
                  <li>
                    <strong className="text-foreground">
                      Your email address and residence number
                    </strong>{" "}
                    — used to pre-fill the sign-in form. Kept for up to 30 days, then deleted
                    automatically.
                  </li>
                  <li>
                    <strong className="text-foreground">Your signed-in session</strong> — so you are
                    not asked to sign in again on every visit. It lapses after 12 hours without
                    activity, and the stored record is deleted the moment it lapses.
                  </li>
                </ul>
                <p>
                  Your password is never stored. Signing out ends the session immediately; your
                  email and residence remain only so you can sign back in rather than register
                  again.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-11">Keep it off</AlertDialogCancel>
            <AlertDialogAction className="min-h-11" onClick={() => onChange(true)}>
              I understand — remember me
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
