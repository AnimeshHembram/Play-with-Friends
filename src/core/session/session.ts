import { createId } from '../lib/id';
import { fail, ok, type Result } from '../lib/result';

/**
 * Session management foundations.
 *
 * A session is one run of one game in one browser tab. It carries a lifecycle
 * status and the game's own state, which the platform treats as opaque: each
 * game decides what `TState` looks like.
 *
 * Lifecycle:
 *
 *   ready ──start──▶ active ──pause──▶ paused
 *     ▲                │  ▲              │
 *     │                │  └───resume─────┘
 *     └────reset───────┴──────end──────▶ ended
 *
 * `reset` is allowed from any status and returns to `ready` with fresh state.
 * `end` is allowed from any status except `ended`.
 * Games that have no use for pausing simply never call `pauseSession`.
 *
 * Sessions are isolated: each one gets its own id and a deep copy of the
 * initial state, so two sessions never share mutable data. There is no
 * cross-device or cross-tab sync, by design.
 *
 * Session state must be plain data (objects, arrays, strings, numbers,
 * booleans, null, Date, Map, Set). It is copied with `structuredClone`, which
 * cannot copy functions and turns class instances into plain objects.
 * `updateSessionState` stores whatever the update returns, so return new
 * objects instead of sharing module-level ones between sessions.
 */
export type SessionStatus = 'ready' | 'active' | 'paused' | 'ended';

export interface Session<TState> {
  readonly id: string;
  readonly gameId: string;
  readonly status: SessionStatus;
  readonly state: TState;
  readonly createdAt: number;
  readonly updatedAt: number;
}

export type SessionErrorCode = 'invalid-transition' | 'session-ended';
export type SessionResult<TState> = Result<Session<TState>, SessionErrorCode>;

export interface CreateSessionOptions<TState> {
  gameId: string;
  initialState: TState;
  id?: string;
  now?: () => number;
}

export function createSession<TState>({
  gameId,
  initialState,
  id = createId(),
  now = Date.now,
}: CreateSessionOptions<TState>): Session<TState> {
  if (!gameId) throw new Error('createSession: gameId is required');
  const t = now();
  return {
    id,
    gameId,
    status: 'ready',
    state: cloneState(initialState, 'createSession'),
    createdAt: t,
    updatedAt: t,
  };
}

/** Which statuses each action may be applied from. */
const actions = {
  start: { from: ['ready'], to: 'active' },
  pause: { from: ['active'], to: 'paused' },
  resume: { from: ['paused'], to: 'active' },
  end: { from: ['ready', 'active', 'paused'], to: 'ended' },
} as const satisfies Record<string, { from: readonly SessionStatus[]; to: SessionStatus }>;

export type SessionAction = keyof typeof actions;

export function canApply(status: SessionStatus, action: SessionAction): boolean {
  return (actions[action].from as readonly SessionStatus[]).includes(status);
}

function apply<TState>(
  session: Session<TState>,
  action: SessionAction,
  now: () => number,
): SessionResult<TState> {
  if (!canApply(session.status, action)) {
    return fail('invalid-transition', `Cannot ${action} a session that is ${session.status}.`);
  }
  return ok({ ...session, status: actions[action].to, updatedAt: now() });
}

export const startSession = <S>(s: Session<S>, now: () => number = Date.now) =>
  apply(s, 'start', now);
export const pauseSession = <S>(s: Session<S>, now: () => number = Date.now) =>
  apply(s, 'pause', now);
export const resumeSession = <S>(s: Session<S>, now: () => number = Date.now) =>
  apply(s, 'resume', now);
export const endSession = <S>(s: Session<S>, now: () => number = Date.now) => apply(s, 'end', now);

/** Returns to `ready` with a fresh copy of the given initial state. Keeps the session id. */
export function resetSession<TState>(
  session: Session<TState>,
  initialState: TState,
  now: () => number = Date.now,
): Session<TState> {
  return {
    ...session,
    status: 'ready',
    state: cloneState(initialState, 'resetSession'),
    updatedAt: now(),
  };
}

/** Applies a game-defined state update. Rejected once the session has ended. */
export function updateSessionState<TState>(
  session: Session<TState>,
  update: (state: TState) => TState,
  now: () => number = Date.now,
): SessionResult<TState> {
  if (session.status === 'ended') {
    return fail('session-ended', 'This game has ended. Start a new one to keep playing.');
  }
  return ok({ ...session, state: update(session.state), updatedAt: now() });
}

function cloneState<TState>(state: TState, caller: string): TState {
  try {
    return structuredClone(state);
  } catch (error) {
    throw new TypeError(
      `${caller}: initialState must be plain data (no functions or DOM nodes). ${String(error)}`,
      { cause: error },
    );
  }
}
