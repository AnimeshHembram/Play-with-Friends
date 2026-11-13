/** Global app configuration. Values come from VITE_ env vars with safe defaults. */
export const appConfig = {
  appName: import.meta.env.VITE_APP_NAME?.trim() || 'Play with Friends',
  isDev: import.meta.env.DEV,
} as const;
