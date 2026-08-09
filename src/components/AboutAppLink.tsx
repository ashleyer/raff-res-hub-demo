import { Link } from "@tanstack/react-router";

/**
 * The non-technical "About this app" story — who built it, why, and how —
 * signed with a code-style tag instead of an icon, since it's a developer's
 * signature rather than a piece of site content.
 */
export function AboutAppLink({
  className = "",
  onClick,
}: {
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      to="/about-this-app"
      onClick={onClick}
      style={{ fontFamily: "'Courier New', Courier, monospace" }}
      className={className}
    >
      <span aria-hidden="true" className="text-green-400">
        {"<AR/>"}
      </span>
      <span>About this app — why it exists, and who built it</span>
    </Link>
  );
}
