"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { Button } from "./components/ui/button";

/**
 * Next.js renders this for any error thrown while rendering a route segment
 * (everything except the root layout itself — see global-error.tsx for that).
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-muted-foreground max-w-md">
        An unexpected error occurred. The team has been notified.
      </p>
      <Button onClick={() => reset()}>Try again</Button>
    </div>
  );
}
