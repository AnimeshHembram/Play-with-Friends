import type { Hex } from '@/shared/lib/color';

export type ThemeMode = 'system' | 'light' | 'dark';

export const THEME_MODES: readonly { id: ThemeMode; label: string }[] = [
  { id: 'system', label: 'System' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
];

/** Background presets. Each has a light and a dark version, picked by the theme mode. */
export const BACKGROUND_PRESETS: readonly { id: string; label: string; light: Hex; dark: Hex }[] = [
  { id: 'default', label: 'Default', light: '#fbfbfa', dark: '#121214' },
  { id: 'stone', label: 'Stone', light: '#f3f1ec', dark: '#1c1b19' },
  { id: 'sage', label: 'Sage', light: '#edf3ee', dark: '#111a15' },
  { id: 'ocean', label: 'Ocean', light: '#ecf2f9', dark: '#0e1621' },
  { id: 'rose', label: 'Rose', light: '#f9eef1', dark: '#1d1216' },
  { id: 'lavender', label: 'Lavender', light: '#f1effa', dark: '#15131f' },
];

/** Accent presets. Violet is the colour the foundation already used. */
export const ACCENT_PRESETS: readonly { id: string; label: string; value: Hex }[] = [
  { id: 'violet', label: 'Violet', value: '#6b4eff' },
  { id: 'blue', label: 'Blue', value: '#2563eb' },
  { id: 'teal', label: 'Teal', value: '#0d9488' },
  { id: 'green', label: 'Green', value: '#16a34a' },
  { id: 'amber', label: 'Amber', value: '#f59e0b' },
  { id: 'pink', label: 'Pink', value: '#db2777' },
];

/** A preset (by id) or a custom colour picked by the user. */
export type ColourChoice = { preset: string } | { custom: Hex };

export interface ThemeSettings {
  mode: ThemeMode;
  background: ColourChoice;
  accent: ColourChoice;
}

export const DEFAULT_THEME: ThemeSettings = {
  mode: 'system',
  background: { preset: 'default' },
  accent: { preset: 'violet' },
};

/** The background colour a choice resolves to for a given light/dark mode. */
export function resolveBackground(choice: ColourChoice, dark: boolean): Hex {
  if ('custom' in choice) return choice.custom;
  const preset = BACKGROUND_PRESETS.find((p) => p.id === choice.preset) ?? BACKGROUND_PRESETS[0]!;
  return dark ? preset.dark : preset.light;
}

export function resolveAccent(choice: ColourChoice): Hex {
  if ('custom' in choice) return choice.custom;
  return (ACCENT_PRESETS.find((p) => p.id === choice.preset) ?? ACCENT_PRESETS[0]!).value;
}
