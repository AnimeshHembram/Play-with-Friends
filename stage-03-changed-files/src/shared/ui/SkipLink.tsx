import styles from './SkipLink.module.css';

/**
 * First focusable element on every page. Keyboard users press Tab once and
 * Enter to jump past the header to the page's main content.
 * The target must have the given id and tabIndex={-1}.
 */
export function SkipLink({
  targetId = 'main',
  children = 'Skip to content',
}: {
  targetId?: string;
  children?: string;
}) {
  return (
    <a
      className={styles.skip}
      href={`#${targetId}`}
      onClick={(event) => {
        // Move focus explicitly: hash navigation alone doesn't move focus in
        // every browser, and the router would otherwise ignore the hash.
        const target = document.getElementById(targetId);
        if (target) {
          event.preventDefault();
          target.focus();
          target.scrollIntoView();
        }
      }}
    >
      {children}
    </a>
  );
}
