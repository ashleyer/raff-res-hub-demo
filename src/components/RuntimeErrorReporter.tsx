import { useEffect } from "react";
import { installRuntimeErrorLogging } from "@/lib/runtime-error-logger";

/** Mounts the global runtime error listeners once, client-side only. */
export function RuntimeErrorReporter() {
  useEffect(() => installRuntimeErrorLogging(), []);
  return null;
}
