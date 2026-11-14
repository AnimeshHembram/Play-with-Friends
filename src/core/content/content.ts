import { fail, ok, type Result } from '../lib/result';

/**
 * Content foundations.
 *
 * Game content (questions, dares, words, prompts) lives in data files inside
 * each game's own `content/` folder, never inside game logic. A pack holds the
 * items for one game in one locale. The item shape is up to the game, as long
 * as every item has a stable `id` (used for no-repeat tracking and, later,
 * for reporting or filtering items).
 *
 *   src/games/<game-id>/content/en.ts   -> export default defineContentPack({...})
 *   src/games/<game-id>/content/hi.ts   -> a translation, same item ids
 */
export interface ContentItem {
  readonly id: string;
}

export interface ContentPack<TItem extends ContentItem = ContentItem> {
  readonly id: string;
  readonly gameId: string;
  /** BCP 47 language tag, e.g. "en", "hi", "en-IN". */
  readonly locale: string;
  readonly version: number;
  readonly items: readonly TItem[];
}

export type ContentErrorCode =
  | 'pack-invalid'
  | 'items-invalid'
  | 'pack-id-missing'
  | 'pack-game-missing'
  | 'locale-invalid'
  | 'version-invalid'
  | 'pack-empty'
  | 'item-id-missing'
  | 'item-id-duplicate';

// BCP 47 tags are case-insensitive ("en-IN" == "EN-in"). Underscores
// ("en_IN", common in OS and browser settings) are treated as hyphens.
const LOCALE_PATTERN = /^[a-z]{2,3}(-[a-z0-9]{2,8})*$/i;

/** Lower-cases a locale and turns "en_IN" into "en-in". */
export function normalizeLocale(locale: string): string {
  return locale.trim().replace(/_/g, '-').toLowerCase();
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

/**
 * Checks a pack's structure. Accepts `unknown` input so that content loaded
 * from JSON (later phases) is reported as a readable error, not a crash.
 */
export function validateContentPack<TItem extends ContentItem>(
  pack: ContentPack<TItem>,
): Result<ContentPack<TItem>, ContentErrorCode> {
  if (!isRecord(pack)) return fail('pack-invalid', 'Content pack must be an object.');
  if (typeof pack.id !== 'string' || !pack.id) {
    return fail('pack-id-missing', 'Content pack is missing an id.');
  }
  if (typeof pack.gameId !== 'string' || !pack.gameId) {
    return fail('pack-game-missing', `Pack "${pack.id}" is missing a gameId.`);
  }
  if (typeof pack.locale !== 'string' || !LOCALE_PATTERN.test(pack.locale)) {
    return fail('locale-invalid', `Pack "${pack.id}" has an invalid locale "${pack.locale}".`);
  }
  if (!Number.isInteger(pack.version) || pack.version < 1) {
    return fail('version-invalid', `Pack "${pack.id}" needs a whole-number version of 1 or more.`);
  }
  if (!Array.isArray(pack.items)) {
    return fail('items-invalid', `Pack "${pack.id}" must have an items array.`);
  }
  if (pack.items.length === 0) return fail('pack-empty', `Pack "${pack.id}" has no items.`);
  const seen = new Set<string>();
  for (const item of pack.items as unknown[]) {
    if (!isRecord(item) || typeof item.id !== 'string' || !item.id) {
      return fail('item-id-missing', `Pack "${pack.id}" has an item without an id.`);
    }
    if (seen.has(item.id)) {
      return fail('item-id-duplicate', `Pack "${pack.id}" has a duplicate item id "${item.id}".`);
    }
    seen.add(item.id);
  }
  return ok(pack);
}

/** Identity helper so pack files get type-checked against `ContentPack`. */
export function defineContentPack<TItem extends ContentItem>(
  pack: ContentPack<TItem>,
): ContentPack<TItem> {
  return pack;
}

/**
 * Picks the best pack for a locale: exact match ("en-IN"), then base language
 * ("en"), then the fallback locale. Matching ignores case and treats "_" as
 * "-". Returns undefined if nothing matches.
 */
export function selectContentPack<TItem extends ContentItem>(
  packs: readonly ContentPack<TItem>[],
  locale: string,
  fallbackLocale = 'en',
): ContentPack<TItem> | undefined {
  const wanted = normalizeLocale(locale);
  const base = wanted.split('-')[0];
  const find = (target: string | undefined) =>
    target ? packs.find((p) => normalizeLocale(p.locale) === target) : undefined;
  return find(wanted) ?? find(base) ?? find(normalizeLocale(fallbackLocale));
}
