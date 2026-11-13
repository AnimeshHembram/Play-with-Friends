import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter } from 'react-router';
import { App } from '@/app/App';
import { routes } from '@/app/routes';
import { gameRegistry } from '@/app/gameRegistry';
import { installGlobalErrorHandlers } from '@/app/errors';
import '@/styles/global.css';

installGlobalErrorHandlers();

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element #root not found in index.html');

createRoot(rootElement).render(
  <StrictMode>
    <App router={createBrowserRouter(routes)} registry={gameRegistry} />
  </StrictMode>,
);
