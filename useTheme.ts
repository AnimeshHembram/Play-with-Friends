import { createContext, useContext } from 'react';
import type { ThemePalette } from '@/shared/lib/color';
import type { ColourChoice, ThemeMode, ThemeSettings } from './themeOptions';

export interface ThemeContextValue {
  settings: ThemeSettings;
  /** The colours actually in use, after accessibility adjustments. */
  palette: ThemePalette;
  setMode: (mode: ThemeMode) => void;
  setBackground: (choice: ColourChoice) => void;
  setAccent: (choice: ColourChoice) => void;
  reset: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme must be used inside <ThemeProvider>');
  return value;
}
