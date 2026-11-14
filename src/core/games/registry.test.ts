import {
  buildGameRegistry,
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
    [{ interaction: ['turnbased'] }, /unknown style.*"turnbased"/],
    [{ title: 5 }, /title/],
    [{ description: null }, /description/],
    [{ players: undefined }, /players must be an object/],
    [{ players: { min: 1 } }, /players.max/],
    [{ players: { min: 0, max: 0 } }, /players.max/],
    [{ order: Number.NaN }, /order/],
  ])('reports %j', (over, pattern) => {
    expect(validateGameMeta(meta(over as Partial<GameMeta>)).join(' ')).toMatch(pattern);
  });

  it.each([undefined, null, 'meta', [], 42])(
    'reports non-object meta (%j) without crashing',
    (m) => {
      expect(validateGameMeta(m)).toEqual(['meta must be an object']);
    },
  );
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

  it.each([null, undefined, 'game', {}, { meta: 'x' }])(
    'rejects a malformed definition (%j) with a GameRegistryError',
    (def) => {
      expect(() => createGameRegistry([def as never])).toThrow(GameRegistryError);
    },
  );

  it('rejects a load that is not a function', () => {
    expect(() => createGameRegistry([{ meta: meta(), load: 'nope' } as never])).toThrow(
      /load must be a function/,
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

  it('rejects a module whose meta is not an object, with a clear message', () => {
    expect(() =>
      collectGameDefinitions({ '../games/x/index.ts': { default: { meta: 'x' } } }),
    ).toThrow(/meta must be an object with a string id/);
  });

  it('rejects a folder name that does not match the game id', () => {
    expect(() =>
      collectGameDefinitions({
        '../games/other-name/index.ts': { default: defineGame({ meta: meta() }) },
      }),
    ).toThrow(/must match/);
  });
});

describe('buildGameRegistry', () => {
  const good = (id: string) => ({
    [`../games/${id}/index.ts`]: { default: defineGame({ meta: meta({ id, title: id }) }) },
  });
  const modules = {
    ...good('alpha'),
    '../games/broken/index.ts': { default: { meta: { id: 'broken', title: '' } } },
    ...good('omega'),
  };

  it('strict mode (development and tests) throws on the first invalid game', () => {
    expect(() => buildGameRegistry(modules, { strict: true })).toThrow(GameRegistryError);
  });

  it('non-strict mode (production) skips the broken game, reports it, keeps the rest', () => {
    const onError = vi.fn();
    const registry = buildGameRegistry(modules, { strict: false, onError });
    expect(registry.list().map((g) => g.meta.id)).toEqual(['alpha', 'omega']);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(expect.any(GameRegistryError), '../games/broken/index.ts');
  });

  it('non-strict mode skips duplicates and modules without a default export', () => {
    const onError = vi.fn();
    const registry = buildGameRegistry(
      {
        ...good('alpha'),
        '../games/empty/index.ts': {},
        '../games/zeta/index.ts': { default: defineGame({ meta: meta({ id: 'alpha' }) }) },
      },
      { strict: false, onError },
    );
    expect(registry.list().map((g) => g.meta.id)).toEqual(['alpha']);
    expect(onError).toHaveBeenCalledTimes(2);
  });

  it('builds the same registry in both modes when every game is valid', () => {
    const valid = { ...good('alpha'), ...good('omega') };
    const ids = (strict: boolean) =>
      buildGameRegistry(valid, { strict })
        .list()
        .map((g) => g.meta.id);
    expect(ids(true)).toEqual(ids(false));
  });
});
