import type { ReactNode } from "react";
import { toast } from "sonner";

type ContactLinkProps = {
  href: string;
  /** The raw phone number or email address, used for the copy fallback. */
  value: string;
  kind: "tel" | "mail";
  className?: string;
  ariaLabel?: string;
  children: ReactNode;
};

/**
 * Renders a tel:/mailto: link that still works when the page is rendered inside
 * a sandboxed preview frame (which silently blocks external protocol handlers).
 * If navigation is blocked, the address is copied to the clipboard instead.
 */
export function ContactLink({
  href,
  value,
  kind,
  className,
  ariaLabel,
  children,
}: ContactLinkProps) {
  const label = kind === "tel" ? "Phone number" : "Email address";

  const copyFallback = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`, { description: value });
    } catch {
      toast.info(label, { description: value });
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    // Inside a sandboxed iframe the default navigation is swallowed with no
    // feedback, so open it explicitly and fall back to copying.
    const inFrame = typeof window !== "undefined" && window.self !== window.top;
    if (!inFrame) return;

    event.preventDefault();
    try {
      const opened = window.open(href, "_self");
      if (!opened) void copyFallback();
    } catch {
      void copyFallback();
    }
    // Sandboxed frames report success but do nothing; always surface the value.
    window.setTimeout(() => {
      void copyFallback();
    }, 400);
  };

  return (
    <a href={href} className={className} aria-label={ariaLabel} onClick={handleClick}>
      {children}
    </a>
  );
}
