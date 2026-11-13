import {
  createSession,
  endSession,
  pauseSession,
  resetSession,
  resumeSession,
  startSession,
  updateSessionState,
  type Session,
} from './session';

const now = () => 1000;

function unwrap<T>(r: { ok: true; value: T } | { ok: false; error: { message: string } }): T {
  if (!r.ok) throw new Error(r.error.message);
  return r.value;
}

describe('session lifecycle', () => {
  it('starts ready and moves through start, pause, resume, end', () => {
    let s = createSession({ gameId: 'g', initialState: { round: 0 }, now });
    expect(s.status).toBe('ready');
    s = unwrap(startSession(s, now));
    expect(s.status).toBe('active');
    s = unwrap(pauseSession(s, now));
    expect(s.status).toBe('paused');
    s = unwrap(resumeSession(s, now));
    expect(s.status).toBe('active');
    s = unwrap(endSession(s, now));
    expect(s.status).toBe('ended');
  });

  it.each<[string, (s: Session<object>) => { ok: boolean }]>([
    ['pause a ready session', (s) => pauseSession(s)],
    ['resume a ready session', (s) => resumeSession(s)],
  ])('refuses to %s', (_label, action) => {
    const s = createSession({ gameId: 'g', initialState: {} });
    expect(action(s).ok).toBe(false);
  });

  it('refuses to start a paused session (it must be resumed)', () => {
    const paused = unwrap(
      pauseSession(unwrap(startSession(createSession({ gameId: 'g', initialState: {} })))),
    );
    expect(startSession(paused).ok).toBe(false);
  });

  it('refuses any transition or update after ending', () => {
    const ended = unwrap(endSession(createSession({ gameId: 'g', initialState: { n: 1 } })));
    expect(startSession(ended).ok).toBe(false);
    expect(endSession(ended).ok).toBe(false);
    const r = updateSessionState(ended, (st) => st);
    expect(!r.ok && r.error.code).toBe('session-ended');
  });

  it('reset returns to ready with fresh state and keeps the id', () => {
    const initial = { round: 0 };
    let s = unwrap(startSession(createSession({ gameId: 'g', initialState: initial, id: 'abc' })));
    s = unwrap(updateSessionState(s, (st) => ({ round: st.round + 3 })));
    const reset = resetSession(s, initial);
    expect(reset).toMatchObject({ id: 'abc', status: 'ready', state: { round: 0 } });
  });

  it('requires a game id', () => {
    expect(() => createSession({ gameId: '', initialState: {} })).toThrow();
  });
});

describe('session isolation', () => {
  it('gives each session its own id and its own copy of the initial state', () => {
    const initial = { picked: [] as string[] };
    const a = createSession({ gameId: 'g', initialState: initial });
    const b = createSession({ gameId: 'g', initialState: initial });
    expect(a.id).not.toBe(b.id);

    a.state.picked.push('only-in-a');
    expect(b.state.picked).toEqual([]);
    expect(initial.picked).toEqual([]);
  });

  it('updating one session does not change another', () => {
    const a = unwrap(startSession(createSession({ gameId: 'g', initialState: { score: 0 } })));
    const b = unwrap(startSession(createSession({ gameId: 'g', initialState: { score: 0 } })));
    const a2 = unwrap(updateSessionState(a, (s) => ({ score: s.score + 1 })));
    expect(a2.state.score).toBe(1);
    expect(b.state.score).toBe(0);
    expect(a.state.score).toBe(0);
  });
});
