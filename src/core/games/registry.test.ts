import {
  collectGameDefinitions,
  createGameRegistry,
  defineGame,
  GameRegistryError,
  isPlayable,
  validateGameMeta,
  type GameMeta,
} from './index';

const meta = (over: Partial<GameMeta> = {}): GameMeta => ({
  id: 'sample-game',
  title: 'Sample',
  description: 'A sample game.',
  players: { min: 2, max: null },
  interaction: ['turn-based'],
  ...over,
});

describe('game metadata validation', () => {
  it('accepts valid metadata', () => {
    expect(validateGameMeta(meta())).toEqual([]);
  });

  it.each([
    [{ id: 'Bad Id' }, /id/],
    [{ title: ' ' }, /title/],
    [{ description: '' }, /description/],
    [{ players: { min: -1, max: null } }, /players.min/],
    [{ players: { min: 3, max: 2 } }, /players.max/],
    [{ interaction: [] }, /interaction/],
  ])('reports %j', (over, pattern) => {
    expect(validateGameMeta(meta(over as Partial<GameMeta>)).join(' ')).toMatch(pattern);
  });
});

describe('game registry', () => {
  it('registers and finds games', () => {
    const registry = createGameRegistry([defineGame({ meta: meta() })]);
    expect(registry.has('sample-game')).toBe(true);
    expect(registry.get('sample-game')?.meta.title).toBe('Sample');
    expect(registry.get('missing')).toBeUndefined();
  });

  it('sorts by order, then title', () => {
    const registry = createGameRegistry([
      defineGame({ meta: meta({ id: 'c', title: 'C' }) }),
      defineGame({ meta: meta({ id: 'b', title: 'B', order: 2 }) }),
      defineGame({ meta: meta({ id: 'a', title: 'A', order: 1 }) }),
      defineGame({ meta: meta({ id: 'd', title: 'Alpha' }) }),
    ]);
    expect(registry.list().map((g) => g.meta.id)).toEqual(['a', 'b', 'd', 'c']);
  });

  it('rejects duplicates and invalid games', () => {
    const registry = createGameRegistry([defineGame({ meta: meta() })]);
    expect(() => registry.register(defineGame({ meta: meta() }))).toThrow(GameRegistryError);
    expect(() => registry.register(defineGame({ meta: meta({ id: '' }) }))).toThrow(
      GameRegistryError,
    );
  });

  it('distinguishes planned games from playable ones', () => {
    expect(isPlayable(defineGame({ meta: meta() }))).toBe(false);
    expect(
      isPlayable(defineGame({ meta: meta(), load: async () => ({ default: () => null }) })),
    ).toBe(true);
  });
});

describe('game discovery', () => {
  it('collects default exports from game modules', () => {
    const defs = collectGameDefinitions({
      '../games/sample-game/index.ts': { default: defineGame({ meta: meta() }) },
    });
    expect(defs.map((d) => d.meta.id)).toEqual(['sample-game']);
  });

  it('rejects a module without a valid default export', () => {
    expect(() => collectGameDefinitions({ '../games/x/index.ts': {} })).toThrow(/default export/);
  });

  it('rejects a folder name that does not match the game id', () => {
    expect(() =>
      collectGameDefinitions({
        '../games/other-name/index.ts': { default: defineGame({ meta: meta() }) },
      }),
    ).toThrow(/must match/);
  });
});
