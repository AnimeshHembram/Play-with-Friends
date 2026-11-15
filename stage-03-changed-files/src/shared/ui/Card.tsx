import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../lib/cx';
import styles from './Card.module.css';

interface CardProps extends HTMLAttributes<HTMLElement> {
  /** Render as a different element (`article`, `section`, `li`). Defaults to `div`. */
  as?: 'div' | 'article' | 'section' | 'li';
  /** `raised` adds a shadow; `outline` is a quieter card for nested content. */
  variant?: 'default' | 'raised' | 'outline';
  /** Inner padding. `none` lets the content control it. */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /**
   * Makes the whole card clickable through a single link or button inside it
   * marked with `data-card-action`. The link keeps its own short accessible
   * name; the card's other text is not read as part of it.
   */
  interactive?: boolean;
  children: ReactNode;
}

/**
 * A surface that groups related content. Cards are also CSS containers, so
 * content inside can adapt to the card's own width with container queries
 * (a card in a narrow column lays out differently from the same card in a
 * wide one, whatever the screen size).
 */
export function Card({
  as: Element = 'div',
  variant = 'default',
  padding = 'md',
  interactive = false,
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <Element
      className={cx(
        styles.card,
        styles[variant],
        styles[`pad-${padding}`],
        interactive && styles.interactive,
        className,
      )}
      {...rest}
    >
      {children}
    </Element>
  );
}
