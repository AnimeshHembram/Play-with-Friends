import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';
import { cx } from '../lib/cx';
import { buttonClassName, iconButtonClassName } from './buttonStyles';
import { Icon, type IconName } from './Icon';
import styles from './Dropdown.module.css';

export interface DropdownItem {
  id: string;
  label: string;
  icon?: IconName;
  onSelect: () => void;
  tone?: 'default' | 'danger';
  disabled?: boolean;
}

interface DropdownProps {
  /** Accessible name of the trigger, e.g. "More options". */
  label: string;
  items: readonly DropdownItem[];
  /** Icon-only trigger (default) or a labelled button. */
  trigger?: { icon: IconName } | { text: ReactNode; icon?: IconName };
  /** Which edge of the trigger the menu lines up with. Use `end` near the right edge. */
  align?: 'start' | 'end';
  className?: string;
}

/**
 * A menu of actions behind a button (WAI-ARIA menu button pattern).
 * Works with touch, mouse and keyboard: Enter/Space/↓ opens it, arrow keys
 * move between items, Escape closes it and returns focus to the button,
 * and tapping outside closes it. No hover is ever needed.
 */
export function Dropdown({
  label,
  items,
  trigger = { icon: 'more' },
  align = 'end',
  className,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const enabled = items
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => !item.disabled);

  const focusItem = (position: 'first' | 'last' | number) => {
    if (enabled.length === 0) return;
    const target =
      position === 'first' ? enabled[0] : position === 'last' ? enabled.at(-1) : enabled[position];
    if (target) itemRefs.current[target.index]?.focus();
  };

  const close = (returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  };

  // Focus the first item when the menu opens.
  useEffect(() => {
    if (open) focusItem('first');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Close on a tap or click anywhere outside the menu.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  const onMenuKeyDown = (event: ReactKeyboardEvent) => {
    const current = enabled.findIndex(
      ({ index }) => itemRefs.current[index] === document.activeElement,
    );
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        focusItem((current + 1) % enabled.length);
        break;
      case 'ArrowUp':
        event.preventDefault();
        focusItem((current - 1 + enabled.length) % enabled.length);
        break;
      case 'Home':
        event.preventDefault();
        focusItem('first');
        break;
      case 'End':
        event.preventDefault();
        focusItem('last');
        break;
      case 'Escape':
        event.preventDefault();
        close(true);
        break;
      case 'Tab':
        setOpen(false);
        break;
    }
  };

  const isIconOnly = !('text' in trigger);

  return (
    <div ref={rootRef} className={cx(styles.root, className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={isIconOnly ? label : undefined}
        className={
          isIconOnly
            ? iconButtonClassName({ variant: 'ghost' })
            : buttonClassName({ variant: 'secondary' })
        }
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        {trigger.icon && <Icon name={trigger.icon} />}
        {'text' in trigger && trigger.text}
      </button>
      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label={label}
          className={styles.menu}
          data-align={align}
          onKeyDown={onMenuKeyDown}
        >
          {items.map((item, index) => (
            <button
              key={item.id}
              ref={(element) => {
                itemRefs.current[index] = element;
              }}
              type="button"
              role="menuitem"
              tabIndex={-1}
              disabled={item.disabled}
              className={cx(styles.item, item.tone === 'danger' && styles.danger)}
              onClick={() => {
                close(true);
                item.onSelect();
              }}
            >
              {item.icon && <Icon name={item.icon} />}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
