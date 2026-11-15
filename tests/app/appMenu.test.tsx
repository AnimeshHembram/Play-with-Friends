import { fireEvent, render, screen, within } from '@testing-library/react';
import { createMemoryRouter } from 'react-router';
import { App } from '@/app/App';
import { routes } from '@/app/routes';
import { createGameRegistry, defineGame } from '@/core/games';
import { contrast } from '@/shared/lib/color';

const registry = createGameRegistry([
  defineGame({
    meta: {
      id: 'planned',
      title: 'Planned Game',
      description: 'd',
      players: { min: 0, max: null },
      interaction: ['single-action'],
    },
  }),
]);

function renderHome() {
  render(
    <App router={createMemoryRouter(routes, { initialEntries: ['/'] })} registry={registry} />,
  );
}

const cssVar = (name: string) => document.documentElement.style.getPropertyValue(name);
const openMenu = async () => {
  fireEvent.click(await screen.findByRole('button', { name: 'Open menu' }));
  return screen.getByRole('dialog', { name: 'Menu' });
};

describe('app menu', () => {
  it('shows only the menu button on the blank canvas', async () => {
    renderHome();
    const button = await screen.findByRole('button', { name: 'Open menu' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });

  it('opens the menu and closes it with the close button, returning focus', async () => {
    renderHome();
    const dialog = await openMenu();
    const button = screen.getByRole('button', { name: 'Open menu' });
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(within(dialog).getByRole('heading', { name: 'Appearance' })).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Close menu' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(button).toHaveFocus();
  });

  it('closes on Escape and on a click outside the panel', async () => {
    renderHome();
    let dialog = await openMenu();
    fireEvent(dialog, new Event('cancel', { cancelable: true }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    dialog = await openMenu();
    fireEvent.click(dialog); // the backdrop is part of the <dialog> element itself
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('switches between light and dark immediately', async () => {
    renderHome();
    const dialog = await openMenu();
    fireEvent.click(within(dialog).getByRole('radio', { name: 'Dark' }));
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(cssVar('--color-bg')).toBe('#121214');
    fireEvent.click(within(dialog).getByRole('radio', { name: 'Light' }));
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(cssVar('--color-bg')).toBe('#fbfbfa');
    expect(within(dialog).getByRole('radio', { name: 'System' })).not.toBeChecked();
  });

  it('applies background and accent presets', async () => {
    renderHome();
    const dialog = await openMenu();
    fireEvent.click(within(dialog).getByRole('radio', { name: 'Light' }));
    fireEvent.click(within(dialog).getByRole('radio', { name: 'Ocean' }));
    expect(cssVar('--color-bg')).toBe('#ecf2f9');
    fireEvent.click(within(dialog).getByRole('radio', { name: 'Teal' }));
    expect(cssVar('--color-accent')).toBe('#0d9488');
  });

  it('accepts custom colours but keeps them readable', async () => {
    renderHome();
    const dialog = await openMenu();
    fireEvent.change(within(dialog).getByLabelText('Custom background colour'), {
      target: { value: '#ffffff' },
    });
    fireEvent.change(within(dialog).getByLabelText('Custom accent colour'), {
      target: { value: '#ffff00' },
    });
    expect(cssVar('--color-accent')).toBe('#ffff00');
    // The outline/focus version of the accent is nudged until it's visible on white.
    expect(contrast(cssVar('--color-accent-strong'), '#ffffff')).toBeGreaterThanOrEqual(3);
    expect(cssVar('--color-on-accent')).toBe('#000000');
    expect(within(dialog).getByText(/adjusted slightly/i)).toBeInTheDocument();

    // A dark custom background flips the text to light.
    fireEvent.change(within(dialog).getByLabelText('Custom background colour'), {
      target: { value: '#202040' },
    });
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('resets to the defaults', async () => {
    renderHome();
    const dialog = await openMenu();
    fireEvent.click(within(dialog).getByRole('radio', { name: 'Pink' }));
    fireEvent.click(within(dialog).getByRole('button', { name: 'Reset to default' }));
    expect(cssVar('--color-accent')).toBe('#6b4eff');
    expect(within(dialog).getByRole('radio', { name: 'System' })).toBeChecked();
  });
});
