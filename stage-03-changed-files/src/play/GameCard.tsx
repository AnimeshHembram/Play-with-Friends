import { Link } from 'react-router';
import { interactionLabel, playersLabel } from '@/app/gameLabels';
import { paths } from '@/app/paths';
import { isPlayable, type GameDefinition } from '@/core/games';
import { Badge } from '@/shared/ui/Badge';
import { Card } from '@/shared/ui/Card';
import { GameTile } from '@/shared/ui/GameTile';
import { Icon } from '@/shared/ui/Icon';
import styles from './GameCard.module.css';

/**
 * One game in the catalogue. The whole card is the tap target, but the link
 * itself is just the game's title, so screen readers hear a short, clear
 * link name; the description and badges are attached as its description.
 *
 * Layout adapts to the card's own width (container query), not the screen:
 * compact row when narrow, roomier stacked layout when there's space.
 */
export function GameCard({ game, index }: { game: GameDefinition; index: number }) {
  const { meta } = game;
  const playable = isPlayable(game);
  const detailsId = `game-${meta.id}-details`;
  const style = interactionLabel(meta.interaction);

  return (
    <Card as="li" interactive padding="none" className={styles.card}>
      <div className={styles.inner}>
        <GameTile interaction={meta.interaction} index={index} className={styles.tile} />
        <div className={styles.body}>
          <h2 className={styles.title}>
            <Link
              to={paths.game(meta.id)}
              data-card-action
              aria-describedby={detailsId}
              className={styles.link}
            >
              {meta.title}
            </Link>
          </h2>
          <div id={detailsId} className={styles.details}>
            <p className={styles.description}>{meta.description}</p>
            <ul className={styles.badges} aria-label="Details">
              <li>
                <Badge icon="users">{playersLabel(meta.players)}</Badge>
              </li>
              {style && (
                <li>
                  <Badge>{style}</Badge>
                </li>
              )}
              {!playable && (
                <li>
                  <Badge tone="warning">Coming soon</Badge>
                </li>
              )}
            </ul>
          </div>
        </div>
        <Icon name="arrow-right" className={styles.arrow} />
      </div>
    </Card>
  );
}
