import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /**
   * Shown instead of the children after an error. Pass a function to get a
   * `reset` callback, which clears the error and renders the children again.
   */
  fallback?: ReactNode | ((reset: () => void) => ReactNode);
  /** Called when `reset` is used, before the children render again. */
  onReset?: () => void;
}

interface State {
  hasError: boolean;
}

/**
 * Stops a rendering error from blanking the whole page. Used at the app root
 * and around each game, so one broken game can't take down the platform.
 *
 * Reporting is not done here: React passes every caught error to the root's
 * `onCaughtError` handler (see main.tsx), which reports it once.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  reset = () => {
    this.props.onReset?.();
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    const { fallback } = this.props;
    if (typeof fallback === 'function') return fallback(this.reset);
    return (
      fallback ?? (
        <main className="placeholder" role="alert">
          <h1>Something went wrong</h1>
          <p>Refresh the page to try again.</p>
        </main>
      )
    );
  }
}
