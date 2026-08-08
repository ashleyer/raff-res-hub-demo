import { Link } from "@tanstack/react-router";
import { usePortal } from "@/lib/portal-store";

export function AccountAccess() {
  const { currentUser } = usePortal();
  if (currentUser) return null;

  return (
    <section
      aria-labelledby="resident-access"
      className="mx-auto w-full max-w-7xl px-5 pt-4 pb-16 sm:px-8"
    >
      <h2 id="resident-access" className="sr-only">
        Resident account access
      </h2>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col border border-border bg-card px-5 py-8 text-center sm:px-10">
          <p className="eyebrow">New here</p>
          <h3 className="mt-3 text-balance text-xl sm:text-2xl">Create your account</h3>
          <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground">
            Register your residence, build your household profile, and choose what neighbours can
            see.
          </p>
          <Link
            to="/login"
            search={{ mode: "signup" }}
            className="btn-outline mt-6 w-full self-center sm:w-auto"
          >
            Sign up
          </Link>
        </div>

        <div className="flex flex-col border border-border bg-card px-5 py-8 text-center sm:px-10">
          <p className="eyebrow">Returning resident</p>
          <h3 className="mt-3 text-balance text-xl sm:text-2xl">Resident sign in</h3>
          <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground">
            Pick up where you left off — requests, reservations, messages and billing.
          </p>
          <Link
            to="/login"
            search={{ mode: "signin" }}
            className="btn-outline mt-6 w-full self-center sm:w-auto"
          >
            Sign in
          </Link>
          <p className="mt-4 text-sm">
            <Link to="/reset-password" className="underline underline-offset-4">
              Forgot password?
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
