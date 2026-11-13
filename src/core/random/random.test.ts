import {
  createNoRepeatPool,
  createSeededRandom,
  createStandardDeck,
  drawCards,
  pickMany,
  pickOne,
  randomInt,
  rollDice,
  rollDie,
  shuffle,
  shuffleDeck,
  browserRandom,
} from './index';

const rng = () => createSeededRandom(42);

describe('random sources', () => {
  it('seeded source is repeatable and stays in [0, 1)', () => {
    const a = rng();
    const b = rng();
    for (let i = 0; i < 1000; i++) {
      const x = a.next();
      expect(x).toBe(b.next());
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
    }
  });

  it('browser source stays in [0, 1)', () => {
    for (let i = 0; i < 1000; i++) {
      const x = browserRandom.next();
      expect(x >= 0 && x < 1).toBe(true);
    }
  });
});

describe('randomInt', () => {
  it('stays within bounds and reaches both ends', () => {
    const r = rng();
    const seen = new Set<number>();
    for (let i = 0; i < 2000; i++) {
      const v = randomInt(1, 6, r);
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(6);
      seen.add(v);
    }
    expect([...seen].sort()).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('is roughly uniform', () => {
    const r = rng();
    const counts = [0, 0, 0, 0];
    const draws = 40000;
    for (let i = 0; i < draws; i++) counts[randomInt(0, 3, r)]!++;
    for (const c of counts) expect(Math.abs(c - draws / 4)).toBeLessThan(draws * 0.02);
  });

  it('rejects invalid ranges', () => {
    expect(() => randomInt(5, 1)).toThrow(RangeError);
    expect(() => randomInt(0.5, 3)).toThrow(RangeError);
  });
});

describe('picking and shuffling', () => {
  it('pickOne returns an item and rejects empty lists', () => {
    expect(['a', 'b', 'c']).toContain(pickOne(['a', 'b', 'c'], rng()));
    expect(() => pickOne([])).toThrow(RangeError);
  });

  it('shuffle keeps every item, does not mutate, and actually reorders', () => {
    const input = Array.from({ length: 20 }, (_, i) => i);
    const out = shuffle(input, rng());
    expect(input).toEqual(Array.from({ length: 20 }, (_, i) => i));
    expect([...out].sort((a, b) => a - b)).toEqual(input);
    expect(out).not.toEqual(input);
  });

  it('pickMany returns distinct items and validates count', () => {
    const out = pickMany([1, 2, 3, 4, 5], 3, rng());
    expect(new Set(out).size).toBe(3);
    expect(() => pickMany([1, 2], 3)).toThrow(RangeError);
    expect(() => pickMany([1, 2], -1)).toThrow(RangeError);
  });
});

describe('no-repeat pool', () => {
  it('draws every item once per cycle', () => {
    const pool = createNoRepeatPool(['a', 'b', 'c', 'd'], { rng: rng() });
    const cycle = [pool.draw(), pool.draw(), pool.draw(), pool.draw()];
    expect([...cycle].sort()).toEqual(['a', 'b', 'c', 'd']);
    expect(pool.remaining).toBe(0);
  });

  it('never repeats back-to-back across reshuffles', () => {
    const pool = createNoRepeatPool([1, 2, 3], { rng: rng() });
    let prev = pool.draw();
    for (let i = 0; i < 300; i++) {
      const next = pool.draw();
      expect(next).not.toBe(prev);
      prev = next;
    }
  });

  it("'stop' mode returns undefined when exhausted until reset", () => {
    const pool = createNoRepeatPool(['x', 'y'], { rng: rng(), onExhausted: 'stop' });
    pool.draw();
    pool.draw();
    expect(pool.draw()).toBeUndefined();
    pool.reset();
    expect(pool.remaining).toBe(2);
  });

  it('handles empty and single-item pools', () => {
    expect(createNoRepeatPool([]).draw()).toBeUndefined();
    const one = createNoRepeatPool(['only']);
    expect([one.draw(), one.draw()]).toEqual(['only', 'only']);
  });

  it('is not affected by later changes to the source array', () => {
    const items = ['a', 'b'];
    const pool = createNoRepeatPool(items, { rng: rng() });
    items.push('c');
    expect(pool.size).toBe(2);
  });
});

describe('dice', () => {
  it('rolls within range and totals correctly', () => {
    const roll = rollDice(3, 6, rng());
    expect(roll.values).toHaveLength(3);
    roll.values.forEach((v) => expect(v >= 1 && v <= 6).toBe(true));
    expect(roll.total).toBe(roll.values.reduce((a, b) => a + b, 0));
  });

  it('rejects invalid dice', () => {
    expect(() => rollDie(1)).toThrow(RangeError);
    expect(() => rollDie(6.5)).toThrow(RangeError);
    expect(() => rollDice(0)).toThrow(RangeError);
    expect(() => rollDice(101)).toThrow(RangeError);
  });
});

describe('cards', () => {
  it('builds a full 52-card deck with unique ids, plus optional jokers', () => {
    const deck = createStandardDeck();
    expect(deck).toHaveLength(52);
    expect(new Set(deck.map((c) => c.id)).size).toBe(52);
    expect(createStandardDeck({ jokers: 2 })).toHaveLength(54);
  });

  it('shuffles without losing cards and draws from the top', () => {
    const deck = shuffleDeck(createStandardDeck(), rng());
    expect(new Set(deck.map((c) => c.id)).size).toBe(52);
    const { drawn, rest } = drawCards(deck, 5);
    expect(drawn).toEqual(deck.slice(0, 5));
    expect(rest).toHaveLength(47);
    expect(() => drawCards(rest, 48)).toThrow(RangeError);
    expect(() => drawCards(rest, -1)).toThrow(RangeError);
  });
});
