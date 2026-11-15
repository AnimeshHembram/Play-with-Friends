import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter } from 'react-router';
import { App } from '@/app/App';
import { routes } from '@/app/routes';
import { createGameRegistry, defineGame, type GameEntryProps, type GameMeta } from '@/core/games';

const meta = (id: string, title: string): GameMeta => ({
  id,
  title,
  description: `${title} description`,
  players: { min: 0, max: null },
  interaction: ['single-action'],
});

function FixtureGame({ meta, onExit }: GameEntryProps) {
  return (
    <div>
      <p>Fixture running: {meta.title}</p>
      <button onClick={onExit}>Exit</button>
    </div>
  );
}

function Broken(): never {
  throw new Error('boom');
}

// Fails while `flakyOffline` is true, then succeeds: like a network outage or
// a chunk that was briefly unavailable after a deploy. (React itself retries a
// failed render once, so the number of attempts isn't fixed.)
let flakyOffline = true;
let flakyAttempts = 0;
const flakyLoad = () => {
  flakyAttempts += 1;
  return flakyOffline
    ? Promise.reject(new Error('network blip'))
    : Promise.resolve({ default: FixtureGame });
};

const registry = createGameRegistry([
  defineGame({ meta: meta('flaky', 'Flaky Game'), load: flakyLoad }),
  defineGame({
    meta: meta('fixture', 'Fixture Game'),
    load: async () => ({ default: FixtureGame }),
  }),
  defineGame({ meta: meta('planned', 'Planned Game') }),
  defineGame({ meta: meta('broken', 'Broken Game'), load: async () => ({ default: Broken }) }),
  defineGame({
    meta: meta('unloadable', 'Unloadable Game'),
    load: () => Promise.reject(new Error('chunk failed to load')),
  }),
]);

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(<App router={router} registry={registry} />);
  return router;
}

describe('routing', () => {
  it('renders the landing page with a launch link that opens a new tab', async () => {
    renderAt('/');
    const link = await screen.findByRole('link', {
      name: /^let’s play\s*\(opens in a new tab\)$/i,
    });
    expect(link).toHaveAttribute('href', '/play');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
  });

  it('lists registered games on the selection page', async () => {
    renderAt('/play');
    expect(await screen.findByRole('heading', { name: /choose a game/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Fixture Game' })).toHaveAttribute(
      'href',
      '/play/fixture',
    );
    expect(screen.getByText(/coming soon/i)).toBeInTheDocument();
  });

  it('loads a playable game and lets it exit back to selection', async () => {
    const router = renderAt('/play/fixture');
    expect(await screen.findByText('Fixture running: Fixture Game')).toBeInTheDocument();
    screen.getByRole('button', { name: 'Exit' }).click();
    expect(await screen.findByRole('heading', { name: /choose a game/i })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/play');
  });

  it('shows "coming soon" for a planned game', async () => {
    renderAt('/play/planned');
    expect(await screen.findByRole('heading', { name: 'Planned Game' })).toBeInTheDocument();
    expect(screen.getByText(/coming soon/i)).toBeInTheDocument();
  });

  it('handles an unknown game id', async () => {
    renderAt('/play/does-not-exist');
    expect(await screen.findByText(/couldn't find that game/i)).toBeInTheDocument();
  });

  it('handles an unknown route', async () => {
    renderAt('/nowhere');
    expect(await screen.findByRole('heading', { name: /page not found/i })).toBeInTheDocument();
  });

  it('contains a crashing game inside its own error boundary', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    renderAt('/play/broken');
    expect(await screen.findByText(/broken game ran into a problem/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to games/i })).toBeInTheDocument();
  });

  it('contains a game whose code fails to load', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    renderAt('/play/unloadable');
    expect(await screen.findByText(/unloadable game ran into a problem/i)).toBeInTheDocument();
  });

  it('lets the player retry a game whose code failed to load', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    renderAt('/play/flaky');
    const retry = await screen.findByRole('button', { name: 'Try again' });
    const attemptsWhileOffline = flakyAttempts;
    flakyOffline = false;
    fireEvent.click(retry);
    expect(await screen.findByText('Fixture running: Flaky Game')).toBeInTheDocument();
    // The failed load was not cached: retrying fetched the game again.
    expect(flakyAttempts).toBeGreaterThan(attemptsWhileOffline);
  });

  it('renders the design-system reference', async () => {
    renderAt('/design');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Design system' }),
    ).toBeInTheDocument();
  });

  it('shows game details and the rules on a planned game', async () => {
    renderAt('/play/planned');
    fireEvent.click(await screen.findByRole('button', { name: 'How to play' }));
    expect(screen.getByRole('dialog', { name: 'How to play Planned Game' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to games' })).toHaveAttribute('href', '/play');
  });

  it.each([
    ['/', 'Play with Friends'],
    ['/play', 'Choose a game · Play with Friends'],
    ['/play/fixture', 'Fixture Game · Play with Friends'],
    ['/play/planned', 'Planned Game · Play with Friends'],
    ['/play/does-not-exist', 'Game not found · Play with Friends'],
    ['/nowhere', 'Page not found · Play with Friends'],
  ])('sets the tab title on %s', async (path, title) => {
    renderAt(path);
    await waitFor(() => expect(document.title).toBe(title));
  });
});
