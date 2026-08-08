import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePortal } from "@/lib/portal-store";
import { SURVEY_NAME, isSurveyWindowOpen, monthLabel } from "@/lib/portal-data";

const SNOOZE_KEY = "raffles-happiness-survey-snoozed";

/**
 * Auto-triggers the Monthly Residence Happiness Survey on the last day of each
 * month for signed-in residents, and keeps appearing until it is completed.
 */
export function SurveyPrompt() {
  const { currentUser, hasAnsweredSurvey } = usePortal();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const month = monthLabel();

  useEffect(() => {
    if (!currentUser || hasAnsweredSurvey) {
      setOpen(false);
      return;
    }
    if (!isSurveyWindowOpen()) return;
    try {
      if (sessionStorage.getItem(`${SNOOZE_KEY}-${month}`)) return;
    } catch {
      /* ignore */
    }
    const timer = setTimeout(() => setOpen(true), 1200);
    return () => clearTimeout(timer);
  }, [currentUser, hasAnsweredSurvey, month]);

  const snooze = () => {
    setOpen(false);
    try {
      sessionStorage.setItem(`${SNOOZE_KEY}-${month}`, "1");
    } catch {
      /* ignore */
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? setOpen(true) : snooze())}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">{SURVEY_NAME}</DialogTitle>
          <DialogDescription>
            It is the last day of {month}. Five quick ratings tell the Residences Office how the
            month felt — answers are anonymous and go to management only.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-start">
          <Button
            className="min-h-11 tracking-[0.18em] uppercase"
            onClick={() => {
              setOpen(false);
              navigate({ to: "/management", hash: "survey" });
            }}
          >
            Take the survey
          </Button>
          <Button variant="outline" className="min-h-11" onClick={snooze}>
            Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
