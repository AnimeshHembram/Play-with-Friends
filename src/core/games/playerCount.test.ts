import { checkPlayerCount } from './playerCount';

describe('checkPlayerCount', () => {
  it('accepts counts within the limits', () => {
    expect(checkPlayerCount({ min: 2, max: 8 }, 2)).toEqual({ ok: true, value: 2 });
    expect(checkPlayerCount({ min: 2, max: 8 }, 8).ok).toBe(true);
    expect(checkPlayerCount({ min: 0, max: null }, 0).ok).toBe(true);
    expect(checkPlayerCount({ min: 3, max: null }, 500).ok).toBe(true);
  });

  it('rejects too few and too many players', () => {
    const few = checkPlayerCount({ min: 3, max: null }, 2);
    expect(!few.ok && few.error).toEqual({
      code: 'too-few-players',
      message: 'This game needs at least 3 players.',
    });
    const many = checkPlayerCount({ min: 1, max: 1 }, 2);
    expect(!many.ok && many.error).toEqual({
      code: 'too-many-players',
      message: 'This game allows at most 1 player.',
    });
  });

  it.each([-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])('rejects an invalid count (%s)', (n) => {
    const r = checkPlayerCount({ min: 0, max: null }, n);
    expect(!r.ok && r.error.code).toBe('invalid-count');
  });
});
