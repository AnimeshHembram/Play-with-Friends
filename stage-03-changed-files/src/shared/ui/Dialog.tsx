import { useEffect, useId, useRef, type ReactNode } from 'react';
import { cx } from '../lib/cx';
import { IconButton } from './IconButton';
import styles from './Dialog.module.css';

export interface DialogProps {
  open: boolean;
  /** Called when the user asks to close (Escape, close button, backdrop tap). */
  onClose: () => void;
  title: ReactNode;
  /** Optional short text under the title, linked as the dialog's description. */
  description?: ReactNode;
  children?: ReactNode;
  /** Actions row (buttons). Stacks on narrow screens. */
  footer?: ReactNode;
  /** `sm` for confirmations, `md` (default) for content such as rules. */
  size?: 'sm' | 'md' | 'lg';
  /** `alertdialog` for confirmations that need an explicit answer. */
  role?: 'dialog' | 'alertdialog';
  /** Show the × button in the corner. Default true. */
  showClose?: boolean;
  /** Close when the backdrop is tapped. Default true. */
  dismissOnBackdrop?: boolean;
  className?: string;
}

/**
 * Mark the control that should receive focus first with `data-autofocus`.
 *
 * Modal dialog built on the native <dialog> element, which gives us a real
 * modal for free: background content is inert, focus is trapped inside, and
 * Escape closes it. Focus returns to whatever opened the dialog.
 *
 * Layout: a bottom sheet on narrow screens (easy to reach with a thumb),
 * centred on wider ones. It never grows past the visible viewport; long
 * content scrolls inside the dialog body.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  role = 'dialog',
  showClose = true,
  dismissOnBackdrop = true,
  className,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || !open) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (!dialog.open) {
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', ''); // very old browsers: non-modal fallback
    }
    // Initial focus: an element marked data-autofocus (e.g. the safe choice in a
    // confirmation), otherwise the browser's default for modal dialogs.
    dialog.querySelector<HTMLElement>('[data-autofocus]')?.focus();
    return () => {
      if (typeof dialog.close === 'function' && dialog.open) dialog.close();
      else dialog.removeAttribute('open');
      // Return focus to the control that opened the dialog, if it still exists.
      if (opener?.isConnected) opener.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <dialog
      ref={ref}
      role={role === 'alertdialog' ? 'alertdialog' : undefined}
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      className={cx(styles.dialog, styles[size], className)}
      onCancel={(event) => {
        // Escape: keep React in charge of whether the dialog is open.
        event.preventDefault();
        onCloseRef.current();
      }}
      onClick={(event) => {
        // A click whose target is the <dialog> itself landed on the backdrop.
        if (dismissOnBackdrop && event.target === event.currentTarget) onCloseRef.current();
      }}
    >
      <div className={styles.panel}>
        <header className={styles.header}>
          <div className={styles.headings}>
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className={styles.description}>
                {description}
              </p>
            )}
          </div>
          {showClose && (
            <IconButton
              icon="close"
              label="Close"
              hideTooltip
              className={styles.close}
              onClick={() => onCloseRef.current()}
            />
          )}
        </header>
        {children && <div className={styles.body}>{children}</div>}
        {footer && <footer className={styles.footer}>{footer}</footer>}
      </div>
    </dialog>
  );
}
