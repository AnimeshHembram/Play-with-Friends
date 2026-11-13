import { reportError } from '@/shared/lib/reportError';

/** Catches errors that escape React (unhandled promises, top-level script errors). */
export function installGlobalErrorHandlers(target: Window = window): void {
  target.addEventListener('error', (event) =>
    reportError(event.error ?? event.message, 'window error'),
  );
  target.addEventListener('unhandledrejection', (event) =>
    reportError(event.reason, 'unhandled promise rejection'),
  );
}
