import { useId, useState, type ReactElement, type ReactNode, cloneElement } from 'react';
import styles from './Tooltip.module.css';

interface TooltipProps {
  /** Text shown in the tooltip. Keep it short; never put essential info only here. */
  content: ReactNode;
  /** The element the tooltip describes. Must accept focus (a button or link). */
  children: ReactElement<{ 'aria-describedby'?: string }>;
  /**
   * When the tooltip only repeats the trigger's accessible name (icon
   * buttons), mark it decorative so screen readers don't read it twice.
   * Otherwise it is linked with aria-describedby as an accessible description.
   */
  decorative?: boolean;
  placement?: 'top' | 'bottom';
  /** Horizontal alignment with the trigger. Use start/end near screen edges. */
  align?: 'center' | 'start' | 'end';
}

/**
 * A small label that appears on hover *and* on keyboard focus, and hides on
 * Escape (WCAG 1.4.13). It never carries information that is unavailable
 * any other way, so touch users (no hover) lose nothing.
 */
export function Tooltip({
  content,
  children,
  decorative = false,
  placement = 'bottom',
  align = 'center',
}: TooltipProps) {
  const id = useId();
  const [dismissed, setDismissed] = useState(false);
  const trigger = decorative
    ? children
    : cloneElement(children, {
        'aria-describedby': [children.props['aria-describedby'], id].filter(Boolean).join(' '),
      });

  return (
    <span
      className={styles.wrapper}
      data-dismissed={dismissed || undefined}
      onKeyDown={(event) => {
        if (event.key === 'Escape') setDismissed(true);
      }}
      onPointerLeave={() => setDismissed(false)}
      onBlur={() => setDismissed(false)}
    >
      {trigger}
      <span
        id={decorative ? undefined : id}
        role={decorative ? undefined : 'tooltip'}
        aria-hidden={decorative || undefined}
        className={styles.tip}
        data-placement={placement}
        data-align={align}
      >
        {content}
      </span>
    </span>
  );
}
