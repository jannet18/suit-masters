"use client";

import * as Sentry from "@sentry/nextjs";
import NextError from "next/error";
import { useEffect } from "react";

/**
 * Next.js only renders this for errors thrown in the ROOT layout (errors
 * anywhere else are caught by the regular ErrorBoundary component). It must
 * render its own <html>/<body> since the root layout has already failed.
 */
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <NextError statusCode={0} />
      </body>
    </html>
  );
}
