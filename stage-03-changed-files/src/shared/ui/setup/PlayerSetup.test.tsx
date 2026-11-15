import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import type { PlayerList } from '@/core/players';
import { PlayerSetup, type PlayerSetupProps } from './PlayerSetup';

function Harness(props: Partial<PlayerSetupProps>) {
  const [players, setPlayers] = useState<PlayerList>([]);
  return <PlayerSetup players={players} onPlayersChange={setPlayers} {...props} />;
}

const field = () => screen.getByRole('textbox', { name: 'Player name' });
const add = (name: string) => {
  fireEvent.change(field(), { target: { value: name } });
  fireEvent.click(screen.getByRole('button', { name: 'Add' }));
};

describe('PlayerSetup', () => {
  it('adds players, clears the field, keeps focus and announces the change', () => {
    render(<Harness />);
    add('  Priya  ');
    expect(screen.getByRole('list', { name: /players/i })).toHaveTextContent('Priya');
    expect(field()).toHaveValue('');
    expect(field()).toHaveFocus();
    expect(screen.getByRole('status')).toHaveTextContent('Priya added. 1 player.');
  });

  it('shows an accessible error for a duplicate name and clears it on typing', () => {
    render(<Harness />);
    add('Ravi');
    add('ravi');
    expect(field()).toHaveAttribute('aria-invalid', 'true');
    expect(field()).toHaveAccessibleDescription(/already playing/i);
    fireEvent.change(field(), { target: { value: 'Ravi K' } });
    expect(field()).not.toHaveAttribute('aria-invalid');
  });

  it('rejects an empty name', () => {
    render(<Harness />);
    add('   ');
    expect(screen.getByText('Enter a name for the player.')).toBeInTheDocument();
  });

  it('removes a player with a clearly labelled button', () => {
    render(<Harness />);
    add('Sam');
    add('Meera');
    fireEvent.click(screen.getByRole('button', { name: 'Remove Sam' }));
    expect(screen.queryByText('Sam')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Sam removed. 1 player.');
    expect(field()).toHaveFocus();
  });

  it('tells the group how many more players the game needs', () => {
    render(<Harness requirements={{ min: 3, max: null }} />);
    expect(screen.getByText('Add 3 more players')).toBeInTheDocument();
    add('A');
    add('B');
    expect(screen.getByText('Add 1 more player')).toBeInTheDocument();
    add('C');
    expect(screen.getByText('Ready to play')).toBeInTheDocument();
  });

  it('stops adding at the limit', () => {
    render(<Harness maxPlayers={2} />);
    add('A');
    add('B');
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
    expect(field()).toHaveAccessibleDescription(/maximum of 2 players/i);
  });

  it('can show player positions when order matters', () => {
    render(<Harness showPositions />);
    add('First');
    add('Second');
    const items = screen.getAllByRole('listitem');
    expect(items[1]).toHaveTextContent('2Second');
  });
});
