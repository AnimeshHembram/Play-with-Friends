import { fireEvent, render, screen } from '@testing-library/react';
import { Dropdown } from './Dropdown';

function setup() {
  const restart = vi.fn();
  const leave = vi.fn();
  render(
    <Dropdown
      label="Game options"
      items={[
        { id: 'restart', label: 'Restart', onSelect: restart },
        { id: 'skip', label: 'Skip', onSelect: () => {}, disabled: true },
        { id: 'leave', label: 'Leave game', onSelect: leave, tone: 'danger' },
      ]}
    />,
  );
  return { restart, leave, trigger: screen.getByRole('button', { name: 'Game options' }) };
}

describe('Dropdown', () => {
  it('opens on click and focuses the first item', () => {
    const { trigger } = setup();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('menuitem', { name: 'Restart' })).toHaveFocus();
  });

  it('moves with arrow keys, skipping disabled items', () => {
    const { trigger } = setup();
    fireEvent.click(trigger);
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'ArrowDown' });
    expect(screen.getByRole('menuitem', { name: 'Leave game' })).toHaveFocus();
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'ArrowDown' });
    expect(screen.getByRole('menuitem', { name: 'Restart' })).toHaveFocus();
  });

  it('closes on Escape and returns focus to the trigger', () => {
    const { trigger } = setup();
    fireEvent.click(trigger);
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('runs the chosen action and closes', () => {
    const { trigger, leave } = setup();
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole('menuitem', { name: 'Leave game' }));
    expect(leave).toHaveBeenCalledOnce();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('closes when tapping outside', () => {
    const { trigger } = setup();
    fireEvent.click(trigger);
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
