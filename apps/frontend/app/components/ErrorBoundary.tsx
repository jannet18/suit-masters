"use client";

import { Component, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component that catches JavaScript errors anywhere in its
 * child component tree, logs those errors, and displays a fallback UI.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack?: string }) {
    // Log to console in development
    console.error("[ErrorBoundary] Caught an error:", error);
    console.error("[ErrorBoundary] Component stack:", errorInfo.componentStack);

    // In production, this is where you'd send to Sentry/DataDog
    if (process.env.NODE_ENV === "production") {
      // TODO: Integrate with Sentry
      // Sentry.captureException(error, { extra: errorInfo });
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-100 flex items-center justify-center bg-[#0f0f0f] text-[#f5f0eb]">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#c9a96e]/10 flex items-center justify-center">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#c9a96e"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">
              Something went wrong
            </h2>
            <p className="text-[#9a9490] mb-6">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-6 py-2.5 bg-[#c9a96e] text-[#0f0f0f] rounded-lg hover:bg-[#d4b87a] transition-colors font-medium"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
