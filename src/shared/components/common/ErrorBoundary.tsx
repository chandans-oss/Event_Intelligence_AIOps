import * as React from "react";

import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";

type ErrorBoundaryProps = {
  children: React.ReactNode;
};

type ErrorBoundaryState = {
  error: Error | null;
  errorId: string | null;
};

function makeErrorId() {
  return Math.random().toString(36).slice(2, 8);
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    error: null,
    errorId: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error, errorId: makeErrorId() };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // This makes the failing component visible in DevTools/console.
    console.error("[ErrorBoundary] UI crashed", {
      errorId: this.state.errorId,
      message: error?.message,
      stack: error?.stack,
      componentStack: info?.componentStack,
    });
  }

  private handleReset = () => {
    this.setState({ error: null, errorId: null });
  };

  render() {
    if (!this.state.error) return this.props.children;

    const showDetails = import.meta.env.DEV;

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Something went wrong</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The page hit an unexpected UI error. You can retry, or return to the dashboard.
            </p>

            <div className="flex flex-wrap gap-2">
              <Button onClick={this.handleReset}>Retry</Button>
              <Button variant="outline" onClick={() => (window.location.href = "/")}> 
                Go to Dashboard
              </Button>
              <Button variant="ghost" onClick={() => window.location.reload()}>
                Reload
              </Button>
            </div>

            {showDetails && (
              <div className="rounded-lg border border-border bg-muted/20 p-3">
                <p className="text-xs font-medium text-foreground mb-2">
                  Debug details (dev only) — Error ID: {this.state.errorId}
                </p>
                <pre className="text-xs whitespace-pre-wrap text-muted-foreground">
{this.state.error?.message}
{this.state.error?.stack}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }
}
