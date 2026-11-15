import { expect, test, type Page } from '@playwright/test';

/**
 * Smoke tests for every existing route, run in a real browser against the
 * production build. They also fail on any console error or warning, and on
 * any uncaught page error.
 */

const GAMES = [
  ['truth-or-dare', 'Truth or Dare'],
  ['never-have-i-ever', 'Never Have I Ever'],
  ['most-likely-to', "Who's Most Likely To?"],
  ['random-picker', 'Random Picker'],
  ['dumb-charades', 'Dumb Charades'],
  ['rolling-dice', 'Rolling Dice'],
  ['pick-a-card', 'Pick a Card'],
] as const;

function watchConsole(page: Page) {
  const problems: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      problems.push(`${msg.type()}: ${msg.text()}`);
    }
  });
  page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`));
  return problems;
}

test.describe('routes', () => {
  let problems: string[];

  test.beforeEach(({ page }) => {
    problems = watchConsole(page);
  });

  test.afterEach(() => {
    expect(problems, 'console errors or warnings').toEqual([]);
  });

  test('landing page', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1, name: 'Play with Friends' })).toBeAttached();
    await expect(page).toHaveTitle('Play with Friends');
    await page.getByRole('button', { name: 'Open menu' }).click();
    const launch = page.getByRole('link', { name: /launch games/i });
    await expect(launch).toHaveAttribute('href', '/play');
    await expect(launch).toHaveAttribute('target', '_blank');
  });

  test('game selection lists all seven games in order', async ({ page }) => {
    await page.goto('/play');
    await expect(page.getByRole('heading', { name: 'Choose a game' })).toBeVisible();
    await expect(page).toHaveTitle('Choose a game · Play with Friends');
    const links = page.getByRole('list', { name: 'Games' }).getByRole('link');
    await expect(links).toHaveText(GAMES.map(([, title]) => title));
  });

  for (const [id, title] of GAMES) {
    test(`direct visit to /play/${id}`, async ({ page }) => {
      await page.goto(`/play/${id}`);
      await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible();
      await expect(page.getByText('Coming soon.')).toBeVisible();
      await expect(page).toHaveTitle(`${title} · Play with Friends`);
    });
  }

  test('unknown game id', async ({ page }) => {
    await page.goto('/play/not-a-game');
    await expect(page.getByText("We couldn't find that game.")).toBeVisible();
    await expect(page).toHaveTitle('Game not found · Play with Friends');
  });

  test('unknown route', async ({ page }) => {
    await page.goto('/this/does/not/exist');
    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
    await expect(page).toHaveTitle('Page not found · Play with Friends');
  });
});

test.describe('navigation', () => {
  test('launch button opens the games in a new tab', async ({ page, context }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Open menu' }).click();
    const [gameTab] = await Promise.all([
      context.waitForEvent('page'),
      page.getByRole('link', { name: /launch games/i }).click(),
    ]);
    await gameTab.waitForLoadState();
    await expect(gameTab).toHaveURL(/\/play$/);
    await expect(gameTab.getByRole('heading', { name: 'Choose a game' })).toBeVisible();
    // The landing tab stays where it was.
    await expect(page).toHaveURL(/\/$/);
  });

  test('selection → game → back, and reload keeps the route', async ({ page }) => {
    const problems = watchConsole(page);
    await page.goto('/play');
    await page.getByRole('link', { name: 'Rolling Dice' }).click();
    await expect(page).toHaveURL(/\/play\/rolling-dice$/);
    await expect(page.getByRole('heading', { name: 'Rolling Dice' })).toBeVisible();

    await page.reload();
    await expect(page.getByRole('heading', { name: 'Rolling Dice' })).toBeVisible();

    await page.getByRole('link', { name: 'Back to games' }).click();
    await expect(page.getByRole('heading', { name: 'Choose a game' })).toBeVisible();
    expect(problems).toEqual([]);
  });

  test('each tab runs independently', async ({ context }) => {
    const a = await context.newPage();
    const b = await context.newPage();
    await a.goto('/play/truth-or-dare');
    await b.goto('/play/pick-a-card');
    await expect(a.getByRole('heading', { name: 'Truth or Dare' })).toBeVisible();
    await expect(b.getByRole('heading', { name: 'Pick a Card' })).toBeVisible();
  });
});
