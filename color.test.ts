import {
  contrast,
  derivePalette,
  ensureContrast,
  isHex,
  luminance,
  MIN_TEXT_CONTRAST,
  MIN_UI_CONTRAST,
  mix,
  normalizeHex,
  readableOn,
} from './color';

describe('colour basics', () => {
  it('validates and normalises hex colours', () => {
    expect(isHex('#abc')).toBe(true);
    expect(isHex('#AABBCC')).toBe(true);
    expect(isHex('red')).toBe(false);
    expect(isHex('#abcd')).toBe(false);
    expect(normalizeHex('#ABC')).toBe('#aabbcc');
    expect(() => normalizeHex('blue')).toThrow();
  });

  it('computes WCAG luminance and contrast', () => {
    expect(luminance('#000000')).toBe(0);
    expect(luminance('#ffffff')).toBe(1);
    expect(contrast('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrast('#777777', '#ffffff')).toBeCloseTo(4.48, 2);
  });

  it('mixes colours', () => {
    expect(mix('#000000', '#ffffff', 0)).toBe('#000000');
    expect(mix('#000000', '#ffffff', 1)).toBe('#ffffff');
    expect(mix('#000000', '#ffffff', 0.5)).toBe('#808080');
  });

  it('picks black or white text, whichever reads better', () => {
    expect(readableOn('#ffff00')).toBe('#000000');
    expect(readableOn('#1e3a8a')).toBe('#ffffff');
  });

  it('nudges a colour until it reaches the requested contrast', () => {
    const fixed = ensureContrast('#ffff66', ['#ffffff'], 3, '#000000');
    expect(contrast(fixed, '#ffffff')).toBeGreaterThanOrEqual(3);
    expect(ensureContrast('#1d4ed8', ['#ffffff'], 3, '#000000')).toBe('#1d4ed8');
  });
});

describe('derivePalette', () => {
  it('keeps a good accent as chosen', () => {
    const palette = derivePalette('#ffffff', '#6b4eff');
    expect(palette.scheme).toBe('light');
    expect(palette.accentStrong).toBe('#6b4eff');
    expect(palette.accentAdjusted).toBe(false);
  });

  it('adjusts an accent that would vanish on the background', () => {
    const palette = derivePalette('#ffffff', '#ffff00');
    expect(palette.accentAdjusted).toBe(true);
    expect(contrast(palette.accentStrong, '#ffffff')).toBeGreaterThanOrEqual(MIN_UI_CONTRAST);
    expect(palette.onAccent).toBe('#000000');
  });

  it('switches to light text on dark backgrounds', () => {
    expect(derivePalette('#121214', '#6b4eff').scheme).toBe('dark');
    expect(derivePalette('#121214', '#6b4eff').text).toBe('#f4f4f5');
  });

  // Property test: whatever two colours a user picks, every pairing the UI
  // relies on meets WCAG 2.2 AA.
  it('is always accessible, for any background and accent', () => {
    let seed = 7;
    const random = () => {
      seed = (seed * 1103515245 + 12345) % 2 ** 31;
      return seed / 2 ** 31;
    };
    const randomHex = () =>
      `#${Math.floor(random() * 0xffffff)
        .toString(16)
        .padStart(6, '0')}`;
    const edgeCases = [
      '#000000',
      '#ffffff',
      '#777777',
      '#737373',
      '#767676',
      '#808080',
      '#ffff00',
      '#00ffff',
    ];
    const colours = [...edgeCases, ...Array.from({ length: 400 }, randomHex)];

    for (let i = 0; i < colours.length; i += 1) {
      const background = colours[i]!;
      const accent = colours[(i * 7 + 3) % colours.length]!;
      const p = derivePalette(background, accent);
      for (const surface of [p.background, p.surface]) {
        expect(contrast(p.text, surface), `text on ${surface}`).toBeGreaterThanOrEqual(
          MIN_TEXT_CONTRAST,
        );
        expect(contrast(p.textMuted, surface), `muted on ${surface}`).toBeGreaterThanOrEqual(
          MIN_TEXT_CONTRAST,
        );
        expect(contrast(p.border, surface), `border on ${surface}`).toBeGreaterThanOrEqual(
          MIN_UI_CONTRAST,
        );
        expect(contrast(p.accentStrong, surface), `accent on ${surface}`).toBeGreaterThanOrEqual(
          MIN_UI_CONTRAST,
        );
      }
      expect(contrast(p.onAccent, p.accent), `on-accent ${accent}`).toBeGreaterThanOrEqual(
        MIN_TEXT_CONTRAST,
      );
    }
  });
});
