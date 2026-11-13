import { gameRegistry } from '@/app/gameRegistry';
import { isPlayable } from '@/core/games';

// Checks real discovery against the real src/games folder.
describe('discovered game catalogue', () => {
  it('finds every planned game folder, in catalogue order', () => {
    expect(gameRegistry.list().map((g) => g.meta.id)).toEqual([
      'truth-or-dare',
      'never-have-i-ever',
      'most-likely-to',
      'random-picker',
      'dumb-charades',
      'rolling-dice',
      'pick-a-card',
    ]);
  });

  it('has no playable games yet (Phase 01 is foundation only)', () => {
    expect(gameRegistry.list().filter(isPlayable)).toEqual([]);
  });
});
