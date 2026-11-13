import type { AnchorHTMLAttributes, ReactNode } from 'react';

interface LaunchLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'target' | 'rel'> {
  href: string;
  children: ReactNode;
}

/**
 * Opens the gaming experience in a new browser tab.
 *
 * This is a real link with target="_blank", not `window.open()` called from
 * script. Browsers never block a new tab the user opened by clicking a link,
 * it still works with middle-click, and keyboard and screen-reader users get
 * normal link behaviour. `noopener` keeps the new tab from controlling this one.
 */
export function LaunchLink({ href, children, ...rest }: LaunchLinkProps) {
  return (
    <a {...rest} href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}
