import { expect, test, type Page } from '@playwright/test';

/**
 * The blank canvas and the menu, at representative phone, tablet and desktop
 * sizes, in portrait and landscape. These run in Chromium with device
 * emulation (viewport, touch); they are not a substitute for real devices.
 */

const VIEWPORTS = [
  { name: 'small phone', width: 320, height: 568, touch: true, expect: 'sheet' },
  { name: 'phone', width: 390, height: 844, touch: true, expect: 'sheet' },
  { name: 'large phone', width: 430, height: 932, touch: true, expect: 'sheet' },
  { name: 'phone landscape', width: 844, height: 390, touch: true, expect: 'drawer' },
  { name: 'tablet', width: 768, height: 1024, touch: true, expect: 'drawer' },
  { name: 'tablet landscape', width: 1024, height: 768, touch: true, expect: 'compact' },
  { name: 'large tablet', width: 1024, height: 1366, touch: true, expect: 'compact' },
  { name: 'laptop', width: 1366, height: 768, touch: false, expect: 'compact' },
  { name: 'desktop', width: 1920, height: 1080, touch: false, expect: 'compact' },
] as const;

function watchConsole(page: Page) {
  const problems: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') problems.push(m.text());
  });
  page.on('pageerror', (e) => problems.push(e.message));
  return problems;
}

/** Visible elements sticking out past the left/right edge of the viewport. */
async function overflowingElements(page: Page) {
  return page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    return [...document.querySelectorAll<HTMLElement>('body *')]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        if (r.width <= 1 || getComputedStyle(el).visibility === 'hidden') return false;
        return r.right > vw + 1 || r.left < -1;
      })
      .map((el) => `${el.tagName.toLowerCase()}.${el.className}`);
  });
}

async function openMenu(page: Page, touch: boolean) {
  const button = page.getByRole('button', { name: 'Open menu' });
  if (touch) await button.tap();
  else await button.click();
  const dialog = page.getByRole('dialog', { name: 'Menu' });
  await expect(dialog).toBeVisible();
  await dialog.evaluate((d) => Promise.all(d.getAnimations().map((a) => a.finished)));
  return dialog;
}

for (const vp of VIEWPORTS) {
  test.describe(`${vp.name} (${vp.width}×${vp.height})`, () => {
    test.use({
      viewport: { width: vp.width, height: vp.height },
      hasTouch: vp.touch,
      isMobile: vp.touch && vp.width < 1000,
    });

    test('blank canvas fills the screen, menu button sits top-left', async ({ page }) => {
      const problems = watchConsole(page);
      await page.goto('/');
      const button = page.getByRole('button', { name: 'Open menu' });
      await expect(button).toBeVisible();

      const box = (await button.boundingBox())!;
      expect(box.x).toBeLessThanOrEqual(24);
      expect(box.y).toBeLessThanOrEqual(24);
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);

      // The canvas covers the whole viewport and nothing else is on it.
      const canvas = await page.evaluate(() => {
        const el = document.querySelector('main')!.parentElement!.getBoundingClientRect();
        return { w: el.width, h: el.height };
      });
      expect(canvas.w).toBe(vp.width);
      expect(canvas.h).toBeGreaterThanOrEqual(vp.height);
      await expect(page.getByRole('link')).toHaveCount(0);
      await expect(page.getByRole('button')).toHaveCount(1);

      expect(await overflowingElements(page)).toEqual([]);
      const scroll = await page.evaluate(() => ({
        x: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        y: document.documentElement.scrollHeight - document.documentElement.clientHeight,
      }));
      expect(scroll.x).toBeLessThanOrEqual(0);
      expect(scroll.y).toBeLessThanOrEqual(0);
      expect(problems).toEqual([]);
    });

    test(`menu opens as a ${vp.expect}, fits the screen, and closes`, async ({ page }) => {
      await page.goto('/');
      const dialog = await openMenu(page, vp.touch);
      const box = (await dialog.boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(vp.width + 1);
      expect(box.y + box.height).toBeLessThanOrEqual(vp.height + 1);

      if (vp.expect === 'sheet') {
        expect(Math.round(box.width)).toBe(vp.width);
        expect(Math.round(box.y + box.height)).toBe(vp.height);
      } else if (vp.expect === 'drawer') {
        expect(box.x).toBe(0);
        expect(Math.round(box.height)).toBe(vp.height);
        expect(box.width).toBeLessThan(vp.width);
      } else {
        expect(box.x).toBeGreaterThan(0);
        expect(box.y).toBeGreaterThan(44);
        expect(box.width).toBeLessThanOrEqual(352);
      }

      // Every control in the panel is reachable (scroll inside the panel if needed).
      const reset = dialog.getByRole('button', { name: 'Reset to default' });
      await reset.scrollIntoViewIfNeeded();
      await expect(reset).toBeInViewport();
      expect(await overflowingElements(page)).toEqual([]);

      // Every control is a comfortable touch target.
      const small = await dialog.evaluate((d) =>
        [
          ...d.querySelectorAll<HTMLElement>(
            'button, a, label:has(input[type=radio]), input[type=color]',
          ),
        ]
          .map((el) => {
            const target = el.tagName === 'INPUT' ? el.parentElement! : el;
            const r = target.getBoundingClientRect();
            return {
              name: el.textContent?.trim() || el.getAttribute('aria-label') || el.id,
              w: r.width,
              h: r.height,
            };
          })
          .filter((t) => t.w < 43.5 || t.h < 43.5),
      );
      expect(small).toEqual([]);

      await page.keyboard.press('Escape');
      await expect(dialog).toBeHidden();
      await expect(page.getByRole('button', { name: 'Open menu' })).toBeFocused();
    });

    test('tapping or clicking outside the panel closes it', async ({ page }) => {
      await page.goto('/');
      const dialog = await openMenu(page, vp.touch);
      const box = (await dialog.boundingBox())!;
      // A point on the canvas, away from the panel.
      const x =
        vp.expect === 'sheet' ? vp.width / 2 : Math.min(vp.width - 10, box.x + box.width + 40);
      const y = vp.expect === 'sheet' ? Math.max(10, box.y / 2) : vp.height - 20;
      if (vp.touch) await page.touchscreen.tap(x, y);
      else await page.mouse.click(x, y);
      await expect(dialog).toBeHidden();
    });

    test('theme, background and accent change immediately', async ({ page }) => {
      await page.goto('/');
      const dialog = await openMenu(page, vp.touch);
      const bg = () =>
        page.evaluate(
          () => getComputedStyle(document.querySelector('main')!.parentElement!).backgroundColor,
        );
      const select = async (name: string) => {
        const radio = dialog.getByRole('radio', { name, exact: true });
        await radio.scrollIntoViewIfNeeded();
        // Radios are visually hidden inside their labels; tap/click the label area.
        const target = radio.locator('xpath=..');
        if (vp.touch) await target.tap();
        else await target.click();
        await expect(radio).toBeChecked();
      };

      await select('Dark');
      await expect.poll(bg).toBe('rgb(18, 18, 20)');
      await select('Light');
      await expect.poll(bg).toBe('rgb(251, 251, 250)');
      await select('Sage');
      await expect.poll(bg).toBe('rgb(237, 243, 238)');
      await select('Pink');
      const accent = await page.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim(),
      );
      expect(accent).toBe('#db2777');
    });
  });
}

test.describe('keyboard', () => {
  test.use({ viewport: { width: 1366, height: 768 } });

  test('the menu works with the keyboard alone', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const button = page.getByRole('button', { name: 'Open menu' });
    await expect(button).toBeFocused();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog', { name: 'Menu' });
    await expect(dialog).toBeVisible();

    // Tab to the theme group, then use arrow keys to change the theme.
    await dialog.getByRole('radio', { name: 'System' }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(dialog.getByRole('radio', { name: 'Light' })).toBeChecked();
    await page.keyboard.press('ArrowRight');
    await expect(dialog.getByRole('radio', { name: 'Dark' })).toBeChecked();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    // Focus is visible on the focused control.
    const outline = await page.evaluate(() => {
      const label = document.activeElement!.closest('label')!;
      return getComputedStyle(label).outlineStyle;
    });
    expect(outline).toBe('solid');

    // Focus stays inside the open menu (it may briefly visit browser UI, never the page).
    for (let i = 0; i < 20; i += 1) {
      await page.keyboard.press('Tab');
      const where = await dialog.evaluate((d) =>
        document.activeElement === document.body
          ? 'browser'
          : d.contains(document.activeElement)
            ? 'menu'
            : 'page',
      );
      expect(where).not.toBe('page');
    }

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(button).toBeFocused();
  });
});

test.describe('orientation and preferences', () => {
  test('rotating a phone keeps the canvas full-screen and the menu usable', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const dialog = await openMenu(page, false);
    await page.setViewportSize({ width: 844, height: 390 });
    // The panel changes from sheet to drawer; let its short entrance animation finish.
    await dialog.evaluate((d) => Promise.all(d.getAnimations().map((a) => a.finished)));
    const box = (await dialog.boundingBox())!;
    expect(box.y + box.height).toBeLessThanOrEqual(391);
    expect(await overflowingElements(page)).toEqual([]);
    await page.keyboard.press('Escape');
    const canvasHeight = await page.evaluate(
      () => document.querySelector('main')!.parentElement!.getBoundingClientRect().height,
    );
    expect(canvasHeight).toBeGreaterThanOrEqual(390);
  });

  test('follows the device colour scheme in System mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.emulateMedia({ colorScheme: 'light' });
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });

  test('an unreadable accent is adjusted, never applied as-is to outlines', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    const dialog = await openMenu(page, false);
    await dialog.getByLabel('Custom background colour').fill('#ffffff');
    await dialog.getByLabel('Custom accent colour').fill('#ffff00');
    await expect(dialog.getByText(/adjusted slightly/i)).toBeVisible();
    const strong = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--color-accent-strong').trim(),
    );
    expect(strong).not.toBe('#ffff00');
  });

  test('settings last for the session only (reset on reload)', async ({ page }) => {
    await page.goto('/');
    const dialog = await openMenu(page, false);
    await dialog.getByRole('radio', { name: 'Pink' }).locator('xpath=..').click();
    await page.reload();
    const accent = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim(),
    );
    expect(accent).toBe('#6b4eff');
    expect(await page.evaluate(() => localStorage.length + sessionStorage.length)).toBe(0);
  });

  test('large text (200%) still fits the menu without sideways scrolling', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });
    await openMenu(page, false);
    expect(await overflowingElements(page)).toEqual([]);
  });
});
