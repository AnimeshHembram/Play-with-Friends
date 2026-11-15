import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Icon, type IconName } from './Icon';
import { buttonClassName, buttonSpinnerClassName, type ButtonStyleOptions } from './buttonStyles';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonStyleOptions {
  /** Icon shown before the label. */
  icon?: IconName;
  /** Icon shown after the label. */
  iconEnd?: IconName;
  /** Shows a spinner and blocks clicks, keeping the button focusable. */
  busy?: boolean;
  children: ReactNode;
}

/**
 * The standard button. Every size is at least 44×44 px for touch.
 * Defaults to `type="button"` so it never submits a form by accident.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant,
    size,
    block,
    className,
    icon,
    iconEnd,
    busy = false,
    type = 'button',
    children,
    onClick,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={buttonClassName({ variant, size, block, className })}
      aria-busy={busy || undefined}
      aria-disabled={busy || undefined}
      onClick={busy ? (event) => event.preventDefault() : onClick}
      {...rest}
    >
      {busy ? (
        <span className={buttonSpinnerClassName} aria-hidden="true" />
      ) : (
        icon && <Icon name={icon} />
      )}
      {children}
      {iconEnd && <Icon name={iconEnd} />}
    </button>
  );
});
