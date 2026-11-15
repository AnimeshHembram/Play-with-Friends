import { useState } from 'react';
import { useNavigate } from 'react-router';
import { PageTitle } from '@/app/PageTitle';
import { paths } from '@/app/paths';
import type { PlayerList } from '@/core/players';
import { checkPlayerCount } from '@/core/games';
import { IconButton } from '@/shared/ui/IconButton';
import { PlayerSetup } from '@/shared/ui/setup/PlayerSetup';
import { SetupScreen, SetupSection } from '@/shared/ui/setup/SetupScreen';
import { Dialog } from '@/shared/ui/Dialog';

const REQUIREMENTS = { min: 2, max: 12 };

/** Demo of the setup foundation. Not a real game: nothing starts. */
export function SetupDemo() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<PlayerList>([]);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [started, setStarted] = useState(false);
  const count = checkPlayerCount(REQUIREMENTS, players.length);
  const needed = REQUIREMENTS.min - players.length;

  return (
    <>
      <PageTitle title="Setup demo" />
      <SetupScreen
        title="Example game"
        intro="This page demonstrates the shared setup foundation. Games choose which parts they use."
        onBack={() => navigate(paths.design)}
        backLabel="Back to design system"
        headerActions={
          <IconButton
            icon="help"
            label="How to play"
            tooltipAlign="end"
            onClick={() => setRulesOpen(true)}
          />
        }
        startBlockedReason={
          count.ok
            ? null
            : needed > 0
              ? `Add ${needed} more ${needed === 1 ? 'player' : 'players'} to start`
              : count.error.message
        }
        onStart={() => setStarted(true)}
      >
        <SetupSection
          title="Who’s playing?"
          description="Add each player’s name. Order is the order you add them."
        >
          <PlayerSetup
            players={players}
            onPlayersChange={setPlayers}
            requirements={REQUIREMENTS}
            showPositions
          />
        </SetupSection>
        <SetupSection title="Game options" description="Each game puts its own settings here.">
          <p>No options in this demo.</p>
        </SetupSection>
        {started && (
          <p role="status">Demo only: a real game would start now with {players.length} players.</p>
        )}
      </SetupScreen>
      <Dialog open={rulesOpen} onClose={() => setRulesOpen(false)} title="How to play">
        <p>Rules for the selected game appear here.</p>
      </Dialog>
    </>
  );
}
