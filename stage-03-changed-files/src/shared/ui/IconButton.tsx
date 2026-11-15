import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { iconButtonClassName, type ButtonSize, type ButtonVariant } from './buttonStyles';
import { Icon, type IconName } from './Icon';
import { Tooltip } from './Tooltip';

export interface IconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'aria-label'
> {
  icon: IconName;
  /**
   * Required accessible name, read by screen readers. It is also shown as a
   * tooltip on hover and keyboard focus, so sighted users can learn it too.
   */
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Hide the hover/focus tooltip (e.g. when a visible label is next to it). */
  hideTooltip?: boolean;
  /** Tooltip alignment; use 'start'/'end' for buttons near a screen edge. */
  tooltipAlign?: 'center' | 'start' | 'end';
}

/** A square, icon-only button with a guaranteed 44×44 px tap target. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {
    icon,
    label,
    variant = 'ghost',
    size = 'md',
    hideTooltip = false,
    tooltipAlign = 'center',
    className,
    type = 'button',
    ...rest
  },
  ref,
) {
  const button = (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      className={iconButtonClassName({ variant, size, className })}
      {...rest}
    >
      <Icon name={icon} />
    </button>
  );
  // The tooltip repeats the accessible name visually; aria-label already
  // names the button, so the tooltip is hidden from assistive technology.
  return hideTooltip ? (
    button
  ) : (
    <Tooltip content={label} decorative align={tooltipAlign}>
      {button}
    </Tooltip>
  );
});
