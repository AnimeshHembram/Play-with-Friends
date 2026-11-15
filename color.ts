/**
 * Small colour toolkit used by the theme settings.
 *
 * Users can pick any background and accent colour, so the app derives every
 * other colour (text, borders, focus ring, text on the accent) from those two
 * picks and checks each against WCAG 2.2 contrast minimums. If a pick would be
 * hard to read, the derived colour is nudged until it passes. A colour
 * choice can never make the interface unreadable.
 */

export type Hex = `#${string}`;

const HEX_PATTERN = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

export function isHex(value: string): value is Hex {
  return HEX_PATTERN.test(value);
}

/** Normalises #abc / #AABBCC to lowercase #aabbcc. Throws on anything else. */
export function normalizeHex(value: string): Hex {
  if (!isHex(value)) throw new Error(`Not a hex colour: ${value}`);
  const hex = value.slice(1).toLowerCase();
  const full = hex.length === 3 ? [...hex].map((c) => c + c).join('') : hex;
  return `#${full}`;
}

function toRgb(hex: string): [number, number, number] {
  const full = normalizeHex(hex).slice(1);
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)) as [number, number, number];
}

function toHex([r, g, b]: [number, number, number]): Hex {
  return `#${[r, g, b]
    .map((v) =>
      Math.round(Math.min(255, Math.max(0, v)))
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;
}

/** WCAG relative luminance (0 = black, 1 = white). */
export function luminance(hex: string): number {
  const [r, g, b] = toRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two colours (1 to 21). */
export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

/** Mixes `from` toward `to` by `amount` (0 = from, 1 = to), in sRGB. */
export function mix(from: string, to: string, amount: number): Hex {
  const a = toRgb(from);
  const b = toRgb(to);
  return toHex([0, 1, 2].map((i) => a[i]! + (b[i]! - a[i]!) * amount) as [number, number, number]);
}

/**
 * Returns `colour`, or the smallest step from it toward `toward` that reaches
 * `min` contrast against every colour in `against`. `toward` itself must pass
 * (callers pass the text colour, which always does).
 */
export function ensureContrast(
  colour: string,
  against: readonly string[],
  min: number,
  toward: string,
): Hex {
  for (let step = 0; step <= 20; step += 1) {
    const candidate = mix(colour, toward, step / 20);
    if (against.every((bg) => contrast(candidate, bg) >= min)) return candidate;
  }
  return normalizeHex(toward);
}

/** Black or white, whichever reads better on `background` (always ≥ 4.58:1). */
export function readableOn(background: string): Hex {
  return contrast(background, '#ffffff') >= contrast(background, '#000000') ? '#ffffff' : '#000000';
}

/** Minimum contrast ratios used by the theme (WCAG 2.2 AA). */
export const MIN_TEXT_CONTRAST = 4.5;
export const MIN_UI_CONTRAST = 3;

export interface ThemePalette {
  scheme: 'light' | 'dark';
  background: Hex;
  surface: Hex;
  text: Hex;
  textMuted: Hex;
  border: Hex;
  borderSubtle: Hex;
  accent: Hex;
  onAccent: Hex;
  /** Accent for outlines, focus rings and selected states: ≥ 3:1 on background and surface. */
  accentStrong: Hex;
  scrim: string;
  /** True when the chosen accent had to be adjusted to stay visible. */
  accentAdjusted: boolean;
}

const NEAR_BLACK = '#18181b';
const NEAR_WHITE = '#f4f4f5';

/** Derives a complete, accessible palette from a background and an accent colour. */
export function derivePalette(backgroundInput: string, accentInput: string): ThemePalette {
  const background = normalizeHex(backgroundInput);
  const accent = normalizeHex(accentInput);
  const scheme =
    contrast(background, '#ffffff') > contrast(background, '#000000') ? 'dark' : 'light';

  // Text: soft black/white, or pure black/white if the soft one isn't enough.
  const softText = scheme === 'dark' ? NEAR_WHITE : NEAR_BLACK;
  const pureText = scheme === 'dark' ? '#ffffff' : '#000000';

  // Panels sit slightly apart from the canvas: a touch lighter than the
  // background (white panel on an off-white canvas; lifted grey on dark). On
  // mid-tone backgrounds, where lifting would cost text contrast, the panel
  // simply matches the canvas and the border separates them.
  const lifted = mix(background, '#ffffff', scheme === 'dark' ? 0.06 : 0.6);
  const text = [background, lifted].every((bg) => contrast(softText, bg) >= 7)
    ? normalizeHex(softText)
    : normalizeHex(pureText);
  const surface = contrast(text, lifted) >= MIN_TEXT_CONTRAST ? lifted : background;
  const surfaces = [background, surface];
  const textMuted = ensureContrast(mix(text, background, 0.35), surfaces, MIN_TEXT_CONTRAST, text);
  const border = ensureContrast(mix(background, text, 0.32), surfaces, MIN_UI_CONTRAST, text);
  const borderSubtle = mix(background, text, 0.12);
  const accentStrong = ensureContrast(accent, surfaces, MIN_UI_CONTRAST, text);

  return {
    scheme,
    background,
    surface,
    text,
    textMuted,
    border,
    borderSubtle,
    accent,
    onAccent: readableOn(accent),
    accentStrong,
    scrim: scheme === 'dark' ? 'rgb(0 0 0 / 0.6)' : 'rgb(15 15 20 / 0.35)',
    accentAdjusted: accentStrong !== accent,
  };
}
