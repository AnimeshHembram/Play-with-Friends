import { useLayoutEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react';
import { derivePalette, type ThemePalette } from '@/shared/lib/color';
import {
  DEFAULT_THEME,
  resolveAccent,
  resolveBackground,
  type ThemeSettings,
} from './themeOptions';
import { ThemeContext, type ThemeContextValue } from './useTheme';

const DARK_QUERY = '(prefers-color-scheme: dark)';

function subscribeToSystemScheme(onChange: () => void) {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  const query = window.matchMedia(DARK_QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

function systemPrefersDark(): boolean {
  return (
    typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia(DARK_QUERY).matches
  );
}

/** Writes the palette to CSS custom properties on <html>, so every component updates at once. */
function applyPalette(palette: ThemePalette) {
  const root = document.documentElement;
  const vars: Record<string, string> = {
    '--color-bg': palette.background,
    '--color-surface': palette.surface,
    '--color-text': palette.text,
    '--color-text-muted': palette.textMuted,
    '--color-border': palette.border,
    '--color-border-subtle': palette.borderSubtle,
    '--color-accent': palette.accent,
    '--color-on-accent': palette.onAccent,
    '--color-accent-strong': palette.accentStrong,
    '--color-scrim': palette.scrim,
  };
  for (const [name, value] of Object.entries(vars)) root.style.setProperty(name, value);
  // Native controls, scrollbars and form widgets follow the effective scheme.
  root.style.colorScheme = palette.scheme;
  root.dataset.theme = palette.scheme;
  // The mobile browser's address bar matches the canvas.
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', palette.background);
}

/**
 * Holds the appearance settings for this browser tab only (React state, no
 * storage): they reset when the page is reloaded and aren't shared with other
 * tabs or devices.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ThemeSettings>(DEFAULT_THEME);
  const prefersDark = useSyncExternalStore(subscribeToSystemScheme, systemPrefersDark, () => false);
  const dark = settings.mode === 'system' ? prefersDark : settings.mode === 'dark';

  const palette = useMemo(
    () =>
      derivePalette(resolveBackground(settings.background, dark), resolveAccent(settings.accent)),
    [settings.background, settings.accent, dark],
  );

  useLayoutEffect(() => applyPalette(palette), [palette]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      settings,
      palette,
      setMode: (mode) => setSettings((s) => ({ ...s, mode })),
      setBackground: (background) => setSettings((s) => ({ ...s, background })),
      setAccent: (accent) => setSettings((s) => ({ ...s, accent })),
      reset: () => setSettings(DEFAULT_THEME),
    }),
    [settings, palette],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
