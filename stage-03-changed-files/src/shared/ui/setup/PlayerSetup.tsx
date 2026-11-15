import { useId, useRef, useState, type FormEvent } from 'react';
import {
  addPlayer,
  DEFAULT_MAX_PLAYERS,
  PLAYER_NAME_MAX_LENGTH,
  removePlayer,
  type PlayerList,
} from '@/core/players';
import { checkPlayerCount, type PlayerRequirements } from '@/core/games';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { PlayerChip } from '../PlayerChip';
import { TextField } from '../TextField';
import styles from './PlayerSetup.module.css';

export interface PlayerSetupProps {
  players: PlayerList;
  onPlayersChange: (players: PlayerList) => void;
  /**
   * The game's player requirements (usually `meta.players`). Used only to show
   * how many more players are needed; the game decides what to do with them.
   */
  requirements?: PlayerRequirements;
  /** Hard cap for this list. Defaults to `requirements.max`, then the platform default. */
  maxPlayers?: number;
  /** Field label. Default "Player name". */
  label?: string;
  /** Show each player's position (useful when order matters, e.g. turns). */
  showPositions?: boolean;
  /** Text shown when the list is empty. */
  emptyText?: string;
}

/**
 * Add/remove players by name. Controlled: the game owns the list.
 *
 * Uses the platform's player rules (src/core/players): names are cleaned,
 * must be unique (ignoring case) and at most 24 characters. Errors appear
 * under the field and are announced; every add/remove is announced too.
 * Focus stays in the name field, so entering a whole group is fast on both
 * a phone keyboard and a laptop.
 */
export function PlayerSetup({
  players,
  onPlayersChange,
  requirements,
  maxPlayers,
  label = 'Player name',
  showPositions = false,
  emptyText = 'No players yet. Add everyone who is playing.',
}: PlayerSetupProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const limit = maxPlayers ?? requirements?.max ?? DEFAULT_MAX_PLAYERS;
  const atLimit = players.length >= limit;
  const countLabel = `${players.length} ${players.length === 1 ? 'player' : 'players'}`;

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const result = addPlayer(players, name, { maxPlayers: limit });
    if (!result.ok) {
      setError(result.error.message);
      inputRef.current?.focus();
      return;
    }
    const added = result.value.at(-1);
    onPlayersChange(result.value);
    setName('');
    setError(null);
    setAnnouncement(
      `${added?.name ?? 'Player'} added. ${result.value.length} ${result.value.length === 1 ? 'player' : 'players'}.`,
    );
    inputRef.current?.focus();
  };

  const onRemove = (id: string, playerName: string) => {
    const result = removePlayer(players, id);
    if (!result.ok) return;
    onPlayersChange(result.value);
    setError(null);
    setAnnouncement(
      `${playerName} removed. ${result.value.length} ${result.value.length === 1 ? 'player' : 'players'}.`,
    );
    // The removed chip's button no longer exists; keep focus somewhere useful.
    inputRef.current?.focus();
  };

  const status = requirements ? checkPlayerCount(requirements, players.length) : null;
  const needed = requirements ? Math.max(0, requirements.min - players.length) : 0;

  return (
    <div className={styles.setup}>
      <form className={styles.form} onSubmit={onSubmit} noValidate>
        <TextField
          ref={inputRef}
          label={label}
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            if (error) setError(null);
          }}
          error={error}
          hint={
            atLimit
              ? `That's the maximum of ${limit} players.`
              : `Up to ${PLAYER_NAME_MAX_LENGTH} characters.`
          }
          autoComplete="off"
          autoCapitalize="words"
          enterKeyHint="done"
          spellCheck={false}
          disabled={atLimit}
          action={
            <Button
              type="submit"
              variant="primary"
              icon="plus"
              disabled={atLimit}
              className={styles.add}
            >
              Add
            </Button>
          }
        />
      </form>

      <div className={styles.listHeader}>
        <h3 className={styles.listTitle} id={listId}>
          Players <span className={styles.count}>({countLabel})</span>
        </h3>
        {status && (
          <p className={styles.requirement} data-ready={status.ok || undefined}>
            <Icon name={status.ok ? 'check' : 'users'} size="1.1em" />
            {status.ok
              ? 'Ready to play'
              : needed > 0
                ? `Add ${needed} more ${needed === 1 ? 'player' : 'players'}`
                : status.error.message}
          </p>
        )}
      </div>

      {players.length === 0 ? (
        <p className={styles.empty}>{emptyText}</p>
      ) : (
        <ul className={styles.list} aria-labelledby={listId}>
          {players.map((player, index) => (
            <li key={player.id}>
              <PlayerChip
                name={player.name}
                position={showPositions ? index + 1 : undefined}
                onRemove={() => onRemove(player.id, player.name)}
              />
            </li>
          ))}
        </ul>
      )}

      <p className="visually-hidden" role="status" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}
