import { cn } from "@/lib/utils";

/**
 * Small top-right corner marker placed over invented content — portraits of
 * fictional people, placeholder photography and simulated phone extensions —
 * so nothing on screen can be mistaken for real information.
 */
export function DemoTag({
  label = "Demo",
  title = "Not real — demonstration content only",
  className,
}: {
  label?: string;
  title?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute top-2 right-2 z-10 border border-primary/40 bg-background/85 px-2 py-0.5 text-[0.625rem] leading-4 font-medium tracking-[0.16em] text-primary uppercase backdrop-blur-sm",
        className,
      )}
    >
      <span className="sr-only">{title}. </span>
      <span aria-hidden="true">{label}</span>
    </span>
  );
}
