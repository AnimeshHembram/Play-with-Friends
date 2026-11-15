import type { ReactNode } from 'react';
import { cx } from '../lib/cx';
import { Icon, type IconName } from './Icon';
import styles from './StatePanel.module.css';

export type StateTone = 'neutral' | 'info' | 'error' | 'success';

interface StatePanelProps {
  /** Heading for the state, e.g. "No players yet" or "Something went wrong". */
  title: ReactNode;
  children?: ReactNode;
  icon?: IconName;
  tone?: StateTone;
  /** Buttons or links offering the way forward. */
  actions?: ReactNode;
  /** Heading level, so the panel fits the page outline. Default h2. */
  headingLevel?: 1 | 2 | 3;
  /** ARIA role: `alert` for errors that just happened, `status` for live updates. */
  role?: 'alert' | 'status';
  className?: string;
}

const DEFAULT_ICON: Record<StateTone, IconName> = {
  neutral: 'sparkle',
  info: 'help',
  error: 'alert',
  success: 'check',
};

/**
 * One component for empty, error and completion states, so they all look and
 * behave the same: icon, heading, explanation, and a clear next step.
 */
export function StatePanel({
  title,
  children,
  icon,
  tone = 'neutral',
  actions,
  headingLevel = 2,
  role,
  className,
}: StatePanelProps) {
  const Heading = `h${headingLevel}` as const;
  return (
    <div className={cx(styles.panel, styles[tone], className)} role={role}>
      <span className={styles.icon} aria-hidden="true">
        <Icon name={icon ?? DEFAULT_ICON[tone]} size="1.75rem" />
      </span>
      <Heading className={styles.title}>{title}</Heading>
      {children && <div className={styles.body}>{children}</div>}
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  );
}

/** Empty state: nothing here yet, and what to do about it. */
export function EmptyState(props: Omit<StatePanelProps, 'tone'>) {
  return <StatePanel tone="neutral" {...props} />;
}

/** Error state: what went wrong and how to recover. Announced as an alert by default. */
export function ErrorState({ role = 'alert', ...props }: Omit<StatePanelProps, 'tone'>) {
  return <StatePanel tone="error" role={role} {...props} />;
}
