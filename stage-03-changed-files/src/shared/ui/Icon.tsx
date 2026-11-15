import type { SVGProps } from 'react';

/**
 * A small, hand-drawn icon set (24×24, 2px strokes). Icons are decorative by
 * default (`aria-hidden`); the control that holds an icon provides the
 * accessible name. Add a new icon by adding its path data below.
 */
const PATHS = {
  'arrow-left': 'M19 12H5m0 0 6-6m-6 6 6 6',
  'arrow-right': 'M5 12h14m0 0-6-6m6 6-6 6',
  close: 'M6 6l12 12M18 6 6 18',
  plus: 'M12 5v14M5 12h14',
  check: 'm5 12.5 4.5 4.5L19 7',
  help: 'M9.2 9.2a2.9 2.9 0 1 1 4.3 2.6c-.9.5-1.5 1.1-1.5 2.1v.4M12 17.6v.1M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
  users:
    'M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 10.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM21 19v-1a4 4 0 0 0-3-3.9M15.5 4.6a3 3 0 0 1 0 5.8',
  user: 'M18 20v-1a5 5 0 0 0-5-5h-2a5 5 0 0 0-5 5v1M12 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z',
  alert:
    'M12 8v5M12 16.5v.1M10.3 3.9 2.6 17.3A2 2 0 0 0 4.3 20h15.4a2 2 0 0 0 1.7-2.7L13.7 3.9a2 2 0 0 0-3.4 0Z',
  refresh: 'M20 11a8 8 0 0 0-14.6-4.5L4 8m0-4v4h4M4 13a8 8 0 0 0 14.6 4.5L20 16m0 4v-4h-4',
  home: 'M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1v-8.5Z',
  sparkle: 'M12 3.5l2 6.5 6.5 2-6.5 2-2 6.5-2-6.5-6.5-2 6.5-2 2-6.5Z',
  clock: 'M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  // Interaction styles, used on game tiles.
  turns: 'M20 12a8 8 0 1 1-2.3-5.7M20 4v4.5h-4.5M12 8v4l2.5 2.5',
  everyone:
    'M7 9.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM17 9.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM12 14a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM3 19.5c0-2.5 1.8-4.5 4-4.5M21 19.5c0-2.5-1.8-4.5-4-4.5M7.5 20c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5',
  teams: 'M5 21V4M5 4h11l-2 4 2 4H5M19 21v-6',
  tap: 'M9 11V5.5a1.5 1.5 0 0 1 3 0V11m0-1.5a1.5 1.5 0 0 1 3 0V12m0-1a1.5 1.5 0 0 1 3 0v4a6 6 0 0 1-6 6h-.7a6 6 0 0 1-4.6-2.2L4.4 16a1.5 1.5 0 0 1 2.3-2L9 16.5',
  device: 'M8 3h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2ZM11 18h2',
  lock: 'M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6v-9Z',
  download: 'M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 20h14',
} as const;

export type IconName = keyof typeof PATHS;

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  /** CSS size, defaults to 1.25em so icons follow the surrounding text size. */
  size?: string;
}

export function Icon({ name, size = '1.25em', ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
