import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter } from 'react-router';
import { App } from '@/app/App';
import { routes } from '@/app/routes';
import { gameRegistry } from '@/app/gameRegistry';
import { installGlobalErrorHandlers } from '@/app/errors';
import { reportError } from '@/shared/lib/reportError';
import '@/styles/global.css';

installGlobalErrorHandlers();

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element #root not found in index.html');

// React passes every rendering error here, so each one is reported exactly once.
createRoot(rootElement, {
  onCaughtError: (error, info) =>
    reportError(error, `caught by error boundary${info.componentStack ?? ''}`),
  onUncaughtError: (error, info) =>
    reportError(error, `uncaught render error${info.componentStack ?? ''}`),
  onRecoverableError: (error) => reportError(error, 'recoverable render error'),
}).render(
  <StrictMode>
    <App router={createBrowserRouter(routes)} registry={gameRegistry} />
  </StrictMode>,
);
