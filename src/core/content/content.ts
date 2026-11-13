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
  | 'pack-id-missing'
  | 'pack-game-missing'
  | 'locale-invalid'
  | 'version-invalid'
  | 'pack-empty'
  | 'item-id-missing'
  | 'item-id-duplicate';

const LOCALE_PATTERN = /^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/;

export function validateContentPack<TItem extends ContentItem>(
  pack: ContentPack<TItem>,
): Result<ContentPack<TItem>, ContentErrorCode> {
  if (!pack.id) return fail('pack-id-missing', 'Content pack is missing an id.');
  if (!pack.gameId) return fail('pack-game-missing', `Pack "${pack.id}" is missing a gameId.`);
  if (!LOCALE_PATTERN.test(pack.locale)) {
    return fail('locale-invalid', `Pack "${pack.id}" has an invalid locale "${pack.locale}".`);
  }
  if (!Number.isInteger(pack.version) || pack.version < 1) {
    return fail('version-invalid', `Pack "${pack.id}" needs a whole-number version of 1 or more.`);
  }
  if (pack.items.length === 0) return fail('pack-empty', `Pack "${pack.id}" has no items.`);
  const seen = new Set<string>();
  for (const item of pack.items) {
    if (!item.id) return fail('item-id-missing', `Pack "${pack.id}" has an item without an id.`);
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
 * ("en"), then the fallback locale. Returns undefined if nothing matches.
 */
export function selectContentPack<TItem extends ContentItem>(
  packs: readonly ContentPack<TItem>[],
  locale: string,
  fallbackLocale = 'en',
): ContentPack<TItem> | undefined {
  const lower = (s: string) => s.toLowerCase();
  const base = lower(locale).split('-')[0];
  return (
    packs.find((p) => lower(p.locale) === lower(locale)) ??
    packs.find((p) => lower(p.locale) === base) ??
    packs.find((p) => lower(p.locale) === lower(fallbackLocale))
  );
}
