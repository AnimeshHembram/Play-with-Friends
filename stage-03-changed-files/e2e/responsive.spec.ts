import { expect, test, type Page } from '@playwright/test';

/**
 * Responsive and accessibility checks in a real browser (Chromium), against
 * the production build.
 *
 * These use browser emulation (viewport size, touch, device pixel ratio).
 * They are a strong signal but not a substitute for trying the site on
 * physical phones and tablets.
 *
 * The sizes below are representative test points, not layout targets: the
 * layout itself uses content-driven breakpoints and container queries.
 */

interface Viewport {
  name: string;
  width: number;
  height: number;
  touch: boolean;
}

const VIEWPORTS: Viewport[] = [
  { name: 'small phone', width: 320, height: 568, touch: true },
  { name: 'standard phone', width: 375, height: 667, touch: true },
  { name: 'large phone', width: 430, height: 932, touch: true },
  { name: 'phone landscape', width: 667, height: 375, touch: true },
  { name: 'large phone landscape', width: 932, height: 430, touch: true },
  { name: 'small tablet', width: 768, height: 1024, touch: true },
  { name: 'tablet landscape', width: 1024, height: 768, touch: true },
  { name: 'large tablet', width: 1024, height: 1366, touch: true },
  { name: 'laptop', width: 1366, height: 768, touch: false },
  { name: 'desktop', width: 1920, height: 1080, touch: false },
];

const PAGES = [
  '/',
  '/play',
  '/play/truth-or-dare',
  '/play/most-likely-to',
  '/design',
  '/design/setup',
  '/design/shell',
  '/this/does/not/exist',
];

/** Minimum touch target we hold ourselves to (WCAG 2.2 AA requires 24px). */
const TAP_MIN = 44;

function watchConsole(page: Page) {
  const problems: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning')
      problems.push(`${msg.type()}: ${msg.text()}`);
  });
  page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`));
  return problems;
}

/**
 * Finds visible elements that stick out past the left or right edge of the
 * viewport. Checking `scrollWidth` alone isn't enough, because the page
 * clips horizontal overflow as a safety net; this catches what that net hides.
 * Descendants of an element that clips its own overflow are only reported if
 * the clipping element itself overflows.
 */
async function horizontalOverflow(page: Page) {
  return page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const offenders: string[] = [];
    const visit = (el: Element) => {
      const style = getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') return;
      const rect = el.getBoundingClientRect();
      const visuallyHidden = rect.width <= 1 && rect.height <= 1;
      if (!visuallyHidden && rect.width > 0 && (rect.right > vw + 1 || rect.left < -1)) {
        const id = `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}.${[...el.classList].join('.')}`;
        offenders.push(`${id} [${Math.round(rect.left)}, ${Math.round(rect.right)}] > ${vw}`);
        return;
      }
      if (el !== document.body && el !== document.documentElement) {
        const clips = ['hidden', 'clip', 'auto', 'scroll'].includes(style.overflowX);
        if (clips) return;
      }
      for (const child of el.children) visit(child);
    };
    visit(document.body);
    return { offenders, docOverflow: document.documentElement.scrollWidth - vw };
  });
}

/** Interactive controls smaller than the tap minimum (inline text links excluded). */
async function smallTargets(page: Page, min: number) {
  return page.evaluate((min) => {
    const selector = 'button, a[href], input, select, textarea, [role="menuitem"]';
    const small: string[] = [];
    for (const el of document.querySelectorAll<HTMLElement>(selector)) {
      const rect = el.getBoundingClientRect();
      if (rect.width <= 1 || rect.height <= 1) continue; // visually hidden
      if (rect.bottom < 0) continue; // off-screen skip link
      if (getComputedStyle(el).visibility === 'hidden') continue;
      // Exempt: links inside running text, and card links whose whole card is the target.
      if (el.tagName === 'A' && el.closest('p, li > p, dd')) continue;
      if (el.hasAttribute('data-card-action')) continue;
      if (rect.width < min - 0.5 || rect.height < min - 0.5) {
        small.push(
          `${el.tagName.toLowerCase()} "${(el.getAttribute('aria-label') ?? el.textContent ?? '').trim().slice(0, 30)}" ${Math.round(rect.width)}×${Math.round(rect.height)}`,
        );
      }
    }
    return small;
  }, min);
}

/** Headings whose text is cut off (overflowing their own box). */
async function clippedHeadings(page: Page) {
  return page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>('h1, h2, h3')]
      .filter((h) => h.getClientRects().length > 0)
      .filter((h) => {
        // Text wider than its box (e.g. an unbreakable word) is always a problem.
        if (h.scrollWidth > h.clientWidth + 1) return true;
        // Taller than its box only matters if the box hides the overflow
        // (glyph descenders spilling past a tight line-height are still drawn).
        const style = getComputedStyle(h);
        const hides = style.overflowY !== 'visible' || style.webkitLineClamp !== 'none';
        return hides && h.scrollHeight > h.clientHeight + 1;
      })
      .map((h) => h.textContent?.trim() ?? ''),
  );
}

for (const vp of VIEWPORTS) {
  test.describe(`${vp.name} (${vp.width}×${vp.height})`, () => {
    test.use({
      viewport: { width: vp.width, height: vp.height },
      hasTouch: vp.touch,
      isMobile: vp.touch && vp.width < 1000,
    });

    test('every page fits: no sideways overflow, no clipped headings, comfortable targets', async ({
      page,
    }) => {
      const problems = watchConsole(page);
      for (const path of PAGES) {
        await page.goto(path);
        await expect(page.locator('h1').first()).toBeVisible();
        const overflow = await horizontalOverflow(page);
        expect(overflow.offenders, `${path}: elements past the viewport edge`).toEqual([]);
        expect(overflow.docOverflow, `${path}: document wider than viewport`).toBeLessThanOrEqual(
          0,
        );
        expect(await clippedHeadings(page), `${path}: clipped headings`).toEqual([]);
        expect(await smallTargets(page, TAP_MIN), `${path}: targets under ${TAP_MIN}px`).toEqual(
          [],
        );
      }
      expect(problems).toEqual([]);
    });

    test('the header play button is always on screen, the main CTA is reachable', async ({
      page,
    }) => {
      await page.goto('/');
      await expect(page.getByRole('link', { name: /play now/i })).toBeInViewport();
      const cta = page.getByRole('link', { name: /let’s play/i });
      await cta.scrollIntoViewIfNeeded();
      await expect(cta).toBeInViewport();
    });

    test('catalogue shows all seven games with columns that fit the width', async ({ page }) => {
      await page.goto('/play');
      const cards = page
        .getByRole('list', { name: 'Games' })
        .getByRole('listitem')
        .filter({
          has: page.getByRole('heading', { level: 2 }),
        });
      await expect(cards).toHaveCount(7);
      const lefts = new Set<number>();
      for (const box of await cards.evaluateAll((els) =>
        els.map((e) => Math.round(e.getBoundingClientRect().left)),
      ))
        lefts.add(box);
      if (vp.width < 600) expect(lefts.size).toBe(1);
      else expect(lefts.size).toBeGreaterThanOrEqual(2);
      expect(lefts.size).toBeLessThanOrEqual(3);
    });

    test('dialogs fit the screen and close with Escape, returning focus', async ({ page }) => {
      await page.goto('/play/truth-or-dare');
      const help = page.getByRole('button', { name: 'How to play' });
      await help.click();
      const dialog = page.getByRole('dialog', { name: /how to play truth or dare/i });
      await expect(dialog).toBeVisible();
      // Measure after the entrance animation has finished.
      await dialog.evaluate((d) => Promise.all(d.getAnimations().map((a) => a.finished)));
      const box = await dialog.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.y).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(vp.width + 1);
      expect(box!.y + box!.height).toBeLessThanOrEqual(vp.height + 1);
      await page.keyboard.press('Escape');
      await expect(dialog).toBeHidden();
      await expect(help).toBeFocused();
    });

    test('game controls stay on screen without scrolling', async ({ page }) => {
      await page.goto('/design/shell');
      await expect(page.getByRole('button', { name: 'Next card' })).toBeInViewport();
      await expect(page.getByRole('button', { name: 'Back to design system' })).toBeInViewport();
    });
  });
}

test.describe('touch', () => {
  test.use({ viewport: { width: 375, height: 667 }, hasTouch: true, isMobile: true });

  test('tapping anywhere on a game card opens the game', async ({ page }) => {
    await page.goto('/play');
    // Tap the description, not the title link: the whole card is the target.
    const description = page.getByText('Roll one or more dice.');
    await description.scrollIntoViewIfNeeded();
    const box = await description.boundingBox();
    await page.touchscreen.tap(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await expect(page).toHaveURL(/\/play\/rolling-dice$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Rolling Dice' })).toBeVisible();
  });

  test('bottom-sheet dialog closes when tapping the backdrop', async ({ page }) => {
    await page.goto('/play/rolling-dice');
    await page.getByRole('button', { name: 'How to play' }).tap();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await page.touchscreen.tap(187, 10);
    await expect(dialog).toBeHidden();
  });

  test('players can be added and removed with taps and the on-screen keyboard', async ({
    page,
  }) => {
    await page.goto('/design/setup');
    const start = page.getByRole('button', { name: 'Start game' });
    await expect(start).toBeDisabled();
    const field = page.getByRole('textbox', { name: 'Player name' });
    for (const name of ['Priya', 'Ravi']) {
      await field.tap();
      await field.fill(name);
      await page.getByRole('button', { name: 'Add', exact: true }).tap();
    }
    await expect(page.getByText('Ready to play')).toBeVisible();
    await expect(start).toBeEnabled();
    await page.getByRole('button', { name: 'Remove Ravi' }).tap();
    await expect(start).toBeDisabled();
    await expect(page.getByText('Add 1 more player to start')).toBeVisible();
  });

  test('rotating the phone keeps the game usable', async ({ page }) => {
    await page.goto('/design/shell');
    await expect(page.getByRole('button', { name: 'Next card' })).toBeInViewport();
    await page.setViewportSize({ width: 667, height: 375 });
    await expect(page.getByRole('button', { name: 'Next card' })).toBeInViewport();
    expect((await horizontalOverflow(page)).offenders).toEqual([]);
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByRole('button', { name: 'Next card' })).toBeInViewport();
  });

  test('game shell asks before leaving a game in progress', async ({ page }) => {
    await page.goto('/design/shell');
    await page.getByRole('button', { name: 'Next card' }).tap();
    await page.getByRole('button', { name: 'Back to design system' }).tap();
    const confirm = page.getByRole('alertdialog', { name: 'Leave this game?' });
    await expect(confirm).toBeVisible();
    await expect(page.getByRole('button', { name: 'Keep playing' })).toBeFocused();
    await page.getByRole('button', { name: 'Keep playing' }).tap();
    await expect(confirm).toBeHidden();
    await expect(page).toHaveURL(/\/design\/shell$/);
  });
});

test.describe('keyboard', () => {
  test.use({ viewport: { width: 1366, height: 768 } });

  test('skip link is first and moves focus to the main content', async ({ page }) => {
    await page.goto('/play');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Skip to content' });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
    await page.keyboard.press('Enter');
    await expect(page.locator('#main')).toBeFocused();
  });

  test('a game can be chosen with the keyboard alone', async ({ page }) => {
    await page.goto('/play');
    await page.locator('#main').focus();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Truth or Dare' })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Never Have I Ever' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/play\/never-have-i-ever$/);
  });

  test('focus is always visible', async ({ page }) => {
    await page.goto('/');
    for (let i = 0; i < 6; i += 1) {
      await page.keyboard.press('Tab');
      const outline = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement;
        const card = el.closest('[class*="interactive"]') ?? el;
        const style = getComputedStyle(el.matches(':focus-visible') ? el : card);
        return { width: parseFloat(style.outlineWidth), style: style.outlineStyle };
      });
      expect(outline.style).not.toBe('none');
      expect(outline.width).toBeGreaterThanOrEqual(2);
    }
  });

  test('menus work with the keyboard', async ({ page }) => {
    await page.goto('/design/shell');
    const trigger = page.getByRole('button', { name: 'Game options' });
    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('menuitem', { name: 'Restart' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('menu')).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('dialogs trap focus while open', async ({ page }) => {
    await page.goto('/design');
    await page.getByRole('button', { name: 'Open dialog' }).click();
    const dialog = page.getByRole('dialog', { name: 'How to play' });
    // Focus may briefly leave to the browser's own UI (allowed for native
    // modals), but it must never land on page content behind the dialog.
    for (let i = 0; i < 6; i += 1) {
      await page.keyboard.press('Tab');
      const where = await dialog.evaluate((d) => {
        const active = document.activeElement;
        if (!active || active === document.body) return 'outside-page';
        return d.contains(active) ? 'dialog' : 'page';
      });
      expect(where).not.toBe('page');
    }
  });
});

test.describe('user preferences', () => {
  test('large text (200%) still reflows without sideways scrolling', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    for (const path of ['/', '/play', '/play/truth-or-dare', '/design/setup']) {
      await page.goto(path);
      await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });
      expect((await horizontalOverflow(page)).offenders, path).toEqual([]);
    }
  });

  test('reduced motion turns transitions off', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const duration = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--duration-base').trim(),
    );
    expect(['0ms', '0s']).toContain(duration);
  });

  test('light and dark colour schemes both apply', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    const light = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    await page.emulateMedia({ colorScheme: 'dark' });
    const dark = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(light).toBe('rgb(251, 247, 241)');
    expect(dark).toBe('rgb(18, 15, 28)');
  });
});
