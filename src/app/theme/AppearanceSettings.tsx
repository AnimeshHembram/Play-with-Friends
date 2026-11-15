import { useId } from 'react';
import { normalizeHex } from '@/shared/lib/color';
import { ACCENT_PRESETS, BACKGROUND_PRESETS, THEME_MODES, type ColourChoice } from './themeOptions';
import { useTheme } from './useTheme';
import styles from './AppearanceSettings.module.css';

/**
 * Theme mode, background colour and accent colour. Every change applies
 * immediately to the whole app; the preview shows the result in a small sample.
 * Built from native radio buttons and colour inputs, so it works with touch,
 * mouse, keyboard (arrow keys within a group) and screen readers.
 */
export function AppearanceSettings() {
  const { settings, palette, setMode, setBackground, setAccent, reset } = useTheme();
  const dark = palette.scheme === 'dark';
  const customBackground = 'custom' in settings.background;

  return (
    <section aria-labelledby="appearance-title" className={styles.section}>
      <h3 id="appearance-title" className={styles.heading}>
        Appearance
      </h3>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>Theme</legend>
        <div className={styles.segmented}>
          {THEME_MODES.map((mode) => (
            <label key={mode.id} className={styles.segment}>
              <input
                type="radio"
                name="theme-mode"
                value={mode.id}
                checked={settings.mode === mode.id}
                onChange={() => setMode(mode.id)}
              />
              <span>{mode.label}</span>
            </label>
          ))}
        </div>
        {customBackground && (
          <p className={styles.hint}>A custom background sets light or dark text by itself.</p>
        )}
      </fieldset>

      <SwatchGroup
        legend="Background"
        name="background"
        choice={settings.background}
        onChange={setBackground}
        presets={BACKGROUND_PRESETS.map((p) => ({
          id: p.id,
          label: p.label,
          value: dark ? p.dark : p.light,
        }))}
        customValue={palette.background}
      />

      <SwatchGroup
        legend="Accent"
        name="accent"
        choice={settings.accent}
        onChange={setAccent}
        presets={ACCENT_PRESETS}
        customValue={palette.accent}
      />

      <div className={styles.preview} aria-label="Preview" role="group">
        <div>
          <p className={styles.previewTitle}>Preview</p>
          <p className={styles.previewText}>Text stays readable on every colour.</p>
        </div>
        <span className={styles.previewButton}>Accent</span>
      </div>

      <p className={styles.hint} aria-live="polite">
        {palette.accentAdjusted
          ? 'Accent outlines are adjusted slightly so they stay visible on this background.'
          : ''}
      </p>

      <button type="button" className={styles.reset} onClick={reset}>
        Reset to default
      </button>
    </section>
  );
}

interface SwatchGroupProps {
  legend: string;
  name: string;
  choice: ColourChoice;
  onChange: (choice: ColourChoice) => void;
  presets: readonly { id: string; label: string; value: string }[];
  /** The colour currently in use, shown in the custom picker. */
  customValue: string;
}

function SwatchGroup({ legend, name, choice, onChange, presets, customValue }: SwatchGroupProps) {
  const customId = useId();
  const isCustom = 'custom' in choice;

  return (
    <fieldset className={styles.group}>
      <legend className={styles.legend}>{legend}</legend>
      <div className={styles.swatches}>
        {presets.map((preset) => (
          <label key={preset.id} className={styles.swatch} title={preset.label}>
            <input
              type="radio"
              name={name}
              value={preset.id}
              checked={!isCustom && choice.preset === preset.id}
              onChange={() => onChange({ preset: preset.id })}
              aria-label={preset.label}
            />
            <span className={styles.dot} style={{ background: preset.value }} aria-hidden="true" />
          </label>
        ))}
        <span className={styles.swatch} data-selected={isCustom || undefined}>
          <label htmlFor={customId} className="visually-hidden">
            Custom {legend.toLowerCase()} colour
          </label>
          <input
            id={customId}
            type="color"
            className={styles.picker}
            value={customValue}
            onChange={(event) => onChange({ custom: normalizeHex(event.target.value) })}
          />
        </span>
      </div>
    </fieldset>
  );
}
