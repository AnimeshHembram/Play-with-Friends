import { useEffect, useId, useRef, useState } from 'react';
import { LaunchLink } from '@/shared/ui/LaunchLink';
import { paths } from './paths';
import { AppearanceSettings } from './theme/AppearanceSettings';
import styles from './AppMenu.module.css';

/**
 * Hamburger button (top-left) and the menu panel it opens.
 *
 * The panel is a native modal <dialog>: focus moves into it and stays there,
 * the page behind can't be reached, Escape closes it, and focus returns to
 * the hamburger afterwards. Tapping or clicking outside the panel closes it too.
 *
 * Layout (CSS only): a bottom sheet on phones held upright, a side drawer on
 * tablets and phones in landscape, and a compact panel under the button on
 * large screens.
 */
export function AppMenu() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const panelId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
    } else if (!open && dialog.open) {
      if (typeof dialog.close === 'function') dialog.close();
      else dialog.removeAttribute('open');
      buttonRef.current?.focus();
    }
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={styles.hamburger}
        aria-label="Open menu"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(true)}
      >
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
          <path
            d="M4 7h16M4 12h16M4 17h16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <dialog
        ref={dialogRef}
        id={panelId}
        className={styles.panel}
        aria-labelledby={titleId}
        onCancel={(event) => {
          // Escape: let React state drive closing so focus handling stays in one place.
          event.preventDefault();
          setOpen(false);
        }}
        onClick={(event) => {
          // A click on the <dialog> element itself (not its content) is on the backdrop.
          if (event.target === event.currentTarget) setOpen(false);
        }}
      >
        {open && (
          <div className={styles.inner}>
            <header className={styles.header}>
              <h2 id={titleId} className={styles.title}>
                Menu
              </h2>
              <button
                type="button"
                className={styles.close}
                aria-label="Close menu"
                onClick={() => setOpen(false)}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    d="M6 6l12 12M18 6 6 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </header>

            <div className={styles.body}>
              <AppearanceSettings />

              <nav aria-label="Main" className={styles.nav}>
                <LaunchLink href={paths.play} className={styles.navLink}>
                  Launch games
                </LaunchLink>
              </nav>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
