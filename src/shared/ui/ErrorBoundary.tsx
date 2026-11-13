import { Component, type ErrorInfo, type ReactNode } from 'react';
import { reportError } from '@/shared/lib/reportError';

interface Props {
  children: ReactNode;
  /** Shown instead of the children after an error. */
  fallback?: ReactNode;
  /** Label used when reporting the error. */
  context?: string;
}

interface State {
  hasError: boolean;
}

/**
 * Stops a rendering error from blanking the whole page. Used at the app root
 * and around each game, so one broken game can't take down the platform.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    reportError(error, `${this.props.context ?? 'render'}${info.componentStack ?? ''}`);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      this.props.fallback ?? (
        <main className="placeholder" role="alert">
          <h1>Something went wrong</h1>
          <p>Refresh the page to try again.</p>
        </main>
      )
    );
  }
}
