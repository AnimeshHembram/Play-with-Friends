import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../lib/cx';
import { Icon, type IconName } from './Icon';
import styles from './Badge.module.css';

export type BadgeTone = 'neutral' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  icon?: IconName;
  children: ReactNode;
}

/** A short, non-interactive label: "2+ players", "Coming soon", "Ready". */
export function Badge({ tone = 'neutral', icon, className, children, ...rest }: BadgeProps) {
  return (
    <span className={cx(styles.badge, styles[tone], className)} {...rest}>
      {icon && <Icon name={icon} size="1em" />}
      {children}
    </span>
  );
}
