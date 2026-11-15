import { useState } from 'react';
import { useNavigate } from 'react-router';
import { PageTitle } from '@/app/PageTitle';
import { paths } from '@/app/paths';
import { Button } from '@/shared/ui/Button';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { GameCompletion } from '@/shared/ui/game/GameCompletion';
import { GameShell } from '@/shared/ui/game/GameShell';
import { PlayerChip } from '@/shared/ui/PlayerChip';
import styles from './Showcase.module.css';

const PLAYERS = ['Priya', 'Ravi', 'Sam', 'Meera'];
const PROMPTS = ['Example prompt one', 'Example prompt two', 'Example prompt three'];

/**
 * Demo of the shared game shell with every slot filled. The "game" here is a
 * placeholder that cycles through three cards: it exists only to show the
 * layout, not as gameplay.
 */
export function ShellDemo() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [confirmRestart, setConfirmRestart] = useState(false);
  const finished = step >= PROMPTS.length;
  const active = step % PLAYERS.length;

  return (
    <>
      <PageTitle title="Game shell demo" />
      <GameShell
        title="Example game"
        subtitle={finished ? 'Finished' : `Card ${step + 1} of ${PROMPTS.length}`}
        onExit={() => navigate(paths.design)}
        exitLabel="Back to design system"
        confirmExit={
          step > 0 && !finished
            ? { title: 'Leave this game?', description: 'Progress in this demo will be lost.' }
            : null
        }
        rules={
          <ol>
            <li>Each game supplies its own rules here.</li>
            <li>The shell only shows them in a dialog.</li>
          </ol>
        }
        menuItems={[
          {
            id: 'restart',
            label: 'Restart',
            icon: 'refresh',
            onSelect: () => setConfirmRestart(true),
          },
        ]}
        players={
          <ul className={styles.playerStrip} aria-label="Players">
            {PLAYERS.map((name, index) => (
              <li key={name}>
                <PlayerChip name={name} active={!finished && index === active} />
              </li>
            ))}
          </ul>
        }
        controls={
          finished ? undefined : (
            <>
              <Button variant="secondary" size="lg" onClick={() => setStep(PROMPTS.length)}>
                Skip to end
              </Button>
              <Button
                variant="primary"
                size="lg"
                iconEnd="arrow-right"
                onClick={() => setStep((s) => s + 1)}
              >
                Next card
              </Button>
            </>
          )
        }
      >
        {finished ? (
          <GameCompletion
            title="Game over"
            onPlayAgain={() => setStep(0)}
            onExit={() => navigate(paths.design)}
          >
            <p>Results for the game would appear here.</p>
          </GameCompletion>
        ) : (
          <div className={styles.demoStage}>
            <p>
              <strong>{PLAYERS[active]}</strong>, it’s your card.
            </p>
            <div className={styles.bigCard} aria-live="polite">
              {PROMPTS[step]}
            </div>
          </div>
        )}
      </GameShell>
      <ConfirmDialog
        open={confirmRestart}
        title="Restart the game?"
        description="This starts again from the first card."
        confirmLabel="Restart"
        tone="danger"
        onCancel={() => setConfirmRestart(false)}
        onConfirm={() => {
          setConfirmRestart(false);
          setStep(0);
        }}
      />
    </>
  );
}
