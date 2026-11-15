import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../lib/cx';
import { Icon } from './Icon';
import styles from './TextField.module.css';

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Visible label. Always required: placeholders are not labels. */
  label: string;
  /** Hide the label visually (it is still read by screen readers). */
  hideLabel?: boolean;
  /** Help text under the field. */
  hint?: ReactNode;
  /** Error message. When set, the field is marked invalid and the message is announced. */
  error?: string | null;
  /** Element placed at the end of the input row (e.g. an Add button). */
  action?: ReactNode;
}

/**
 * Labelled text input with hint and error support. The hint and the error are
 * connected with aria-describedby, the field gets aria-invalid when there is
 * an error, and errors are announced politely as they appear.
 * Font size stays ≥ 16px so iOS never zooms the page when the field is focused.
 */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, hideLabel = false, hint, error, action, className, id, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ');

  return (
    <div className={cx(styles.field, className)}>
      <label htmlFor={inputId} className={cx(styles.label, hideLabel && 'visually-hidden')}>
        {label}
      </label>
      <div className={styles.row}>
        <input
          ref={ref}
          id={inputId}
          className={styles.input}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          {...rest}
        />
        {action}
      </div>
      {hint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
      <p id={errorId} className={styles.error} aria-live="polite">
        {error && (
          <>
            <Icon name="alert" size="1.1em" />
            <span>{error}</span>
          </>
        )}
      </p>
    </div>
  );
});
