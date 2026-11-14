import { appConfig } from './config';

/**
 * Sets the browser tab title for the current page. React 19 moves a rendered
 * <title> into <head> automatically, so no extra library is needed.
 */
export function PageTitle({ title }: { title?: string }) {
  return <title>{title ? `${title} · ${appConfig.appName}` : appConfig.appName}</title>;
}
