import * as React from "react";
import { logRuntimeError } from "@/lib/runtime-error-logger";

type Props = { children: React.ReactNode };
type State = { error: Error | null };

/** Global React error boundary. Catches render-time failures anywhere in the
 *  tree — including providers and undefined components — so residents see a
 *  courteous fallback instead of a blank page. */
export class AppErrorBoundary extends React.Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[AppErrorBoundary]", error, info.componentStack);
    logRuntimeError(error, "runtime_error", {
      boundary: "react_app_error_boundary",
      componentStack: info.componentStack?.slice(0, 2000),
    });
  }

  private reset = () => this.setState({ error: null });

  override render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div
        role="alert"
        className="flex min-h-dvh items-center justify-center bg-background px-5 py-16"
      >
        <div className="w-full max-w-md border border-border bg-card px-6 py-10 text-center">
          <p className="text-xs tracking-[0.28em] text-muted-foreground uppercase">
            Raffles Residences Boston
          </p>
          <h1 className="mt-4 text-2xl text-foreground">Something didn’t load</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            An unexpected issue interrupted this page. Nothing you have saved is affected; please
            try again, or return to the residence home page.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={this.reset}
              className="min-h-11 border border-primary bg-primary px-5 text-sm tracking-[0.18em] text-primary-foreground uppercase"
            >
              Try again
            </button>
            <a
              href="/"
              className="inline-flex min-h-11 items-center justify-center border border-input px-5 text-sm tracking-[0.18em] text-foreground uppercase"
            >
              Go home
            </a>
          </div>
          <p className="mt-6 text-xs break-words text-muted-foreground/80">{error.message}</p>
        </div>
      </div>
    );
  }
}
