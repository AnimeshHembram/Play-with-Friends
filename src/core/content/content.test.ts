import {
  defineContentPack,
  normalizeLocale,
  selectContentPack,
  validateContentPack,
  type ContentPack,
} from './content';

const pack = (over: Partial<ContentPack<{ id: string; text: string }>> = {}) =>
  defineContentPack({
    id: 'tod-en',
    gameId: 'truth-or-dare',
    locale: 'en',
    version: 1,
    items: [
      { id: 't1', text: 'A' },
      { id: 't2', text: 'B' },
    ],
    ...over,
  });

describe('content packs', () => {
  it('accepts a valid pack', () => {
    expect(validateContentPack(pack()).ok).toBe(true);
  });

  it.each([
    [{ id: '' }, 'pack-id-missing'],
    [{ gameId: '' }, 'pack-game-missing'],
    [{ locale: 'English' }, 'locale-invalid'],
    [{ version: 0 }, 'version-invalid'],
    [{ items: [] }, 'pack-empty'],
    [{ items: [{ id: '', text: 'x' }] }, 'item-id-missing'],
    [
      {
        items: [
          { id: 'a', text: 'x' },
          { id: 'a', text: 'y' },
        ],
      },
      'item-id-duplicate',
    ],
  ] as const)('rejects %j', (over, code) => {
    const r = validateContentPack(pack(over as never));
    expect(!r.ok && r.error.code).toBe(code);
  });

  it.each([
    [null, 'pack-invalid'],
    ['not a pack', 'pack-invalid'],
  ])('rejects a malformed pack (%j)', (input, code) => {
    const r = validateContentPack(input as never);
    expect(!r.ok && r.error.code).toBe(code);
  });

  it.each([
    [{ items: null }, 'items-invalid'],
    [{ items: 'abc' }, 'items-invalid'],
    [{ items: [null] }, 'item-id-missing'],
    [{ items: [{ id: 42 }] }, 'item-id-missing'],
    [{ id: 7 }, 'pack-id-missing'],
    [{ locale: undefined }, 'locale-invalid'],
  ])('rejects malformed fields %j', (over, code) => {
    const r = validateContentPack(pack(over as never));
    expect(!r.ok && r.error.code).toBe(code);
  });

  it('accepts locale tags in any case', () => {
    expect(validateContentPack(pack({ locale: 'EN-in' })).ok).toBe(true);
  });

  it('normalizes locales', () => {
    expect(normalizeLocale(' en_IN ')).toBe('en-in');
  });

  it('matches locales regardless of case or underscores', () => {
    const packs = [pack({ locale: 'en' }), pack({ locale: 'hi', id: 'tod-hi' })];
    expect(selectContentPack(packs, 'hi_IN')?.id).toBe('tod-hi');
    expect(selectContentPack(packs, 'HI')?.id).toBe('tod-hi');
    expect(selectContentPack([pack({ locale: 'en-IN', id: 'in' })], 'en-in')?.id).toBe('in');
  });

  it('falls back to the fallback locale for an empty locale', () => {
    expect(selectContentPack([pack({ locale: 'en' })], '')?.locale).toBe('en');
  });

  it('selects by exact locale, then base language, then fallback', () => {
    const packs = [pack({ locale: 'en' }), pack({ locale: 'hi', id: 'tod-hi' })];
    expect(selectContentPack(packs, 'hi')?.id).toBe('tod-hi');
    expect(selectContentPack(packs, 'hi-IN')?.id).toBe('tod-hi');
    expect(selectContentPack(packs, 'ta')?.locale).toBe('en');
    expect(selectContentPack([pack({ locale: 'hi' })], 'ta')).toBeUndefined();
  });
});
