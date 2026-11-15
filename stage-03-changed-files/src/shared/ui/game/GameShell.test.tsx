import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import type { ComponentProps } from 'react';
import { GameShell } from './GameShell';

function renderShell(props: Partial<ComponentProps<typeof GameShell>> = {}) {
  return render(
    <MemoryRouter>
      <GameShell title="Example" {...props}>
        <p>Stage content</p>
      </GameShell>
    </MemoryRouter>,
  );
}

describe('GameShell', () => {
  it('shows the title as the page heading and the stage as main content', () => {
    renderShell({ subtitle: 'Round 2' });
    expect(screen.getByRole('heading', { level: 1, name: 'Example' })).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveTextContent('Stage content');
    expect(screen.getByText('Round 2')).toBeInTheDocument();
  });

  it('exits straight away when nothing needs confirming', () => {
    const onExit = vi.fn();
    renderShell({ onExit });
    fireEvent.click(screen.getByRole('button', { name: 'Back to games' }));
    expect(onExit).toHaveBeenCalledOnce();
  });

  it('asks before exiting when the game requests it', () => {
    const onExit = vi.fn();
    renderShell({ onExit, confirmExit: { title: 'Leave this game?' } });
    fireEvent.click(screen.getByRole('button', { name: 'Back to games' }));
    expect(onExit).not.toHaveBeenCalled();
    expect(screen.getByRole('alertdialog', { name: 'Leave this game?' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Keep playing' }));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Back to games' }));
    fireEvent.click(screen.getByRole('button', { name: 'Leave game' }));
    expect(onExit).toHaveBeenCalledOnce();
  });

  it('uses a plain link when given exitTo', () => {
    renderShell({ exitTo: '/play' });
    expect(screen.getByRole('link', { name: 'Back to games' })).toHaveAttribute('href', '/play');
  });

  it('opens the rules in a dialog', () => {
    renderShell({ rules: <p>Rule text</p> });
    fireEvent.click(screen.getByRole('button', { name: 'How to play' }));
    expect(screen.getByRole('dialog', { name: 'How to play Example' })).toHaveTextContent(
      'Rule text',
    );
  });

  it('renders game-owned slots without interpreting them', () => {
    renderShell({
      players: <span>Priya, Ravi</span>,
      controls: <button>Next</button>,
      menuItems: [{ id: 'restart', label: 'Restart', onSelect: () => {} }],
    });
    expect(screen.getByRole('region', { name: 'Players' })).toHaveTextContent('Priya, Ravi');
    expect(screen.getByRole('group', { name: 'Game controls' })).toContainElement(
      screen.getByRole('button', { name: 'Next' }),
    );
    expect(screen.getByRole('button', { name: 'Game options' })).toBeInTheDocument();
  });

  it('omits the help button and menu when the game provides none', () => {
    renderShell();
    expect(screen.queryByRole('button', { name: 'How to play' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Game options' })).not.toBeInTheDocument();
  });
});
