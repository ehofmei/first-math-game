import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

async function onboard(page: Page) {
  await page.getByLabel('What should we call you?').fill('Ada');
  await page.getByRole('button', { name: 'Moonbeam' }).click();
  await page.getByRole('button', { name: 'Enter Number Nook' }).click();
  await expect(page.getByRole('heading', { name: "Ada's Number Nook" })).toBeVisible();
}

function solveEquation(text: string): number {
  const operands = text.match(/(-?\d+)\s*([+−×÷])\s*(-?\d+)/);
  if (!operands) throw new Error(`Could not parse equation: ${text}`);
  const left = Number(operands[1]);
  const right = Number(operands[3]);
  switch (operands[2]) {
    case '+':
      return left + right;
    case '−':
      return left - right;
    case '×':
      return left * right;
    case '÷':
      return left / right;
    default:
      throw new Error(`Unknown operator: ${operands[2]}`);
  }
}

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('first launch, game, capsule, gallery, equip, and reload', async ({ page }) => {
  await onboard(page);
  await page.evaluate(() => {
    const key = 'first-math-game:save';
    const save = JSON.parse(localStorage.getItem(key) ?? '{}') as { coins: number };
    save.coins = 60;
    localStorage.setItem(key, JSON.stringify(save));
  });
  await page.reload();
  await page.getByRole('button', { name: 'Change game' }).click();
  await page.getByRole('button', { name: '× Multiplication' }).click();
  await page.getByRole('button', { name: '÷ Division' }).click();
  await page.getByRole('button', { name: 'Easy' }).click();
  await page.getByRole('button', { name: 'Start game' }).click();

  const operators = new Set<string>();
  for (let index = 0; index < 10; index += 1) {
    const equation = page.locator('#equation');
    const text = (await equation.textContent()) ?? '';
    const operator = text.match(/[+−×÷]/)?.[0];
    if (operator) operators.add(operator);
    const answer = solveEquation(text);
    await page.getByRole('button', { name: `Answer ${answer}`, exact: true }).click();
    if (index < 9) await expect(equation).not.toHaveText(text);
  }
  expect(operators).toEqual(new Set(['+', '−', '×', '÷']));

  await expect(
    page.getByRole('heading', { name: /First score|personal best|practice round/i }),
  ).toBeVisible();
  await expect(page.getByText('100%')).toBeVisible();
  await page.getByRole('button', { name: 'Open a capsule' }).click();
  await page.getByRole('button', { name: 'Open capsule' }).click();
  await expect(page.getByRole('heading', { name: /You found/ })).toBeVisible();
  const foundName = ((await page.getByRole('heading', { name: /You found/ }).textContent()) ?? '')
    .replace('You found ', '')
    .replace('!', '');
  await page.getByRole('button', { name: 'View collection' }).click();
  await expect(page.getByRole('heading', { name: 'Companion Collection' })).toBeVisible();
  await page.getByRole('button', { name: foundName }).click();
  await page.getByRole('button', { name: 'Back' }).click();
  await expect(page.locator('.home-companion')).toContainText(foundName);
  await expect(page.locator('.home-companion')).toContainText('is ready!');
  await page.reload();
  await expect(page.locator('.home-companion')).toContainText(foundName);
});

test('game settings and home capsule access remain available after reload', async ({ page }) => {
  await onboard(page);
  await page.getByRole('button', { name: 'Cat Capsule' }).click();
  await expect(page.getByRole('heading', { name: 'Cat Capsule' })).toBeVisible();
  await page.getByRole('button', { name: 'Back' }).click();

  await page.getByRole('button', { name: 'Change game' }).click();
  await page.getByRole('button', { name: '+ Addition' }).click();
  await page.getByRole('button', { name: '× Multiplication' }).click();
  await page.getByRole('button', { name: 'Hard' }).click();
  await page.getByRole('button', { name: '20' }).click();
  await page.getByRole('button', { name: 'Back' }).click();
  await expect(page.getByText('Hard · − × · 20 questions')).toBeVisible();
  await page.reload();
  await expect(page.getByText('Hard · − × · 20 questions')).toBeVisible();
});

test('focus moves away from the selected answer when the next question appears', async ({
  page,
}) => {
  await onboard(page);
  await page.getByRole('button', { name: 'Play now' }).click();

  const equation = page.locator('#equation');
  const firstEquation = (await equation.textContent()) ?? '';
  await page.locator('.answer-card').nth(3).click();
  await expect(equation).not.toHaveText(firstEquation);

  await expect(equation).toBeFocused();
  await expect(page.locator('.answer-card').nth(3)).not.toBeFocused();
});

test('history copies a name-free, versioned analysis export', async ({
  page,
  context,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'Clipboard export is covered once in Chromium.');
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await onboard(page);
  await page.getByRole('button', { name: 'Play now' }).click();

  for (let index = 0; index < 10; index += 1) {
    const equation = page.locator('#equation');
    const text = (await equation.textContent()) ?? '';
    await page.getByRole('button', { name: `Answer ${solveEquation(text)}`, exact: true }).click();
    if (index < 9) await expect(equation).not.toHaveText(text);
  }

  await page.getByRole('button', { name: 'Back home' }).click();
  await page.getByRole('button', { name: 'Your progress' }).click();
  await expect(page.getByRole('heading', { name: 'Play History' })).toBeVisible();
  await expect(page.getByText('Ruleset 3').first()).toBeVisible();
  await page.getByRole('button', { name: 'Copy analysis data' }).click();
  await expect(page.getByText('Copied! You can paste it into the chat.')).toBeVisible();

  const clipboard = await page.evaluate<string>('navigator.clipboard.readText()');
  const analysis = JSON.parse(clipboard) as {
    format: string;
    exportVersion: number;
    privacy: { playerNameIncluded: boolean };
    sessions: unknown[];
  };
  expect(analysis).toMatchObject({
    format: 'number-nook-play-history',
    exportVersion: 2,
    privacy: { playerNameIncluded: false },
  });
  expect(analysis.sessions).toHaveLength(1);
  expect(clipboard).not.toContain('Ada');
});

test('onboarding, home, history, and setup have no detectable accessibility violations', async ({
  page,
}) => {
  let results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);

  await onboard(page);
  results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);

  await page.getByRole('button', { name: 'Your progress' }).click();
  results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
  await page.getByRole('button', { name: 'Back' }).click();

  await page.getByRole('button', { name: 'Change game' }).click();
  results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test('@visual onboarding phone layout', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'phone', 'This baseline targets the phone viewport.');
  await expect(page).toHaveScreenshot('onboarding.png', { fullPage: true });
});

test('@visual setup phone layout', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'phone', 'This baseline targets the phone viewport.');
  await onboard(page);
  await page.getByRole('button', { name: 'Change game' }).click();
  await expect(page).toHaveScreenshot('setup.png', { fullPage: true });
});

test('@visual home phone layout', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'phone', 'This baseline targets the phone viewport.');
  await onboard(page);
  await expect(page).toHaveScreenshot('home.png', { fullPage: true });
});

test('@visual empty history phone layout', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'phone', 'This baseline targets the phone viewport.');
  await onboard(page);
  await page.getByRole('button', { name: 'Your progress' }).click();
  await expect(page).toHaveScreenshot('history-empty.png', { fullPage: true });
});

test('@pwa production build works after the network goes offline', async ({
  page,
  context,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'Offline reload is covered once in Chromium.');
  await page.evaluate('navigator.serviceWorker.ready');
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Welcome to Number Nook' })).toBeVisible();
});
