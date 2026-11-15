import { cx } from '../lib/cx';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonStyleOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Stretch to the full width of the container. */
  block?: boolean;
  className?: string;
}

/**
 * The button look as a class name, so links (react-router `Link`,
 * `LaunchLink`) can look like buttons while staying real links.
 */
export function buttonClassName({
  variant = 'secondary',
  size = 'md',
  block = false,
  className,
}: ButtonStyleOptions = {}): string {
  return cx(
    styles.button,
    styles[variant],
    size !== 'md' && styles[size],
    block && styles.block,
    className,
  );
}

/** Class names for the icon-only button look (used by IconButton and icon links). */
export function iconButtonClassName(options: Omit<ButtonStyleOptions, 'block'> = {}): string {
  return cx(buttonClassName({ variant: 'ghost', ...options }), styles.icon);
}

/** Class for the inline busy spinner inside a button. */
export const buttonSpinnerClassName = styles.spinner;
