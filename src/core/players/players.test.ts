import {
  addPlayer,
  movePlayer,
  normalizePlayerName,
  PLAYER_NAME_MAX_LENGTH,
  removePlayer,
  renamePlayer,
  validatePlayerName,
  type PlayerList,
} from './players';

let n = 0;
const idFactory = () => `p${++n}`;

function build(...names: string[]): PlayerList {
  return names.reduce<PlayerList>((list, name) => {
    const r = addPlayer(list, name, { idFactory });
    if (!r.ok) throw new Error(r.error.message);
    return r.value;
  }, []);
}

beforeEach(() => {
  n = 0;
});

describe('player names', () => {
  it('trims and collapses whitespace', () => {
    expect(normalizePlayerName('  Ravi   Kumar ')).toBe('Ravi Kumar');
  });

  it.each([
    ['', 'name-empty'],
    ['    ', 'name-empty'],
    ['x'.repeat(PLAYER_NAME_MAX_LENGTH + 1), 'name-too-long'],
  ])('rejects %j', (name, code) => {
    const r = validatePlayerName(name, []);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe(code);
  });

  it('rejects duplicates case-insensitively', () => {
    const r = addPlayer(build('Ravi'), 'ravi', { idFactory });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe('name-duplicate');
  });
});

describe('player list operations', () => {
  it('adds players in order with unique ids, without mutating the input', () => {
    const before = build('A');
    const r = addPlayer(before, 'B', { idFactory });
    expect(r.ok && r.value.map((p) => p.name)).toEqual(['A', 'B']);
    expect(before).toHaveLength(1);
  });

  it('enforces the player limit', () => {
    const r = addPlayer(build('A', 'B'), 'C', { maxPlayers: 2, idFactory });
    expect(!r.ok && r.error.code).toBe('player-limit-reached');
  });

  it('removes a player', () => {
    const list = build('A', 'B', 'C');
    const r = removePlayer(list, list[1]!.id);
    expect(r.ok && r.value.map((p) => p.name)).toEqual(['A', 'C']);
  });

  it('renames a player, allowing a case change of their own name', () => {
    const list = build('ravi', 'Asha');
    const r = renamePlayer(list, list[0]!.id, 'Ravi');
    expect(r.ok && r.value[0]!.name).toBe('Ravi');
    const clash = renamePlayer(list, list[0]!.id, 'asha');
    expect(!clash.ok && clash.error.code).toBe('name-duplicate');
  });

  it('reorders players', () => {
    const list = build('A', 'B', 'C');
    const r = movePlayer(list, list[2]!.id, 0);
    expect(r.ok && r.value.map((p) => p.name)).toEqual(['C', 'A', 'B']);
  });

  it('reports unknown ids and bad positions', () => {
    const list = build('A');
    expect(removePlayer(list, 'nope').ok).toBe(false);
    expect(renamePlayer(list, 'nope', 'X').ok).toBe(false);
    const r = movePlayer(list, list[0]!.id, 5);
    expect(!r.ok && r.error.code).toBe('index-out-of-range');
  });
});
