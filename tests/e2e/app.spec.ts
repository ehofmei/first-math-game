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
  await expect(page.locator('.coin-tally')).not.toHaveText('+0');
  await page.getByRole('button', { name: 'Review questions' }).click();
  await expect(page.getByRole('heading', { name: 'Review your questions' })).toBeVisible();
  await expect(page.locator('.review-card')).toHaveCount(10);
  await page.getByRole('button', { name: 'Back', exact: true }).last().click();
  await expect(page.getByRole('button', { name: 'Review questions' })).toBeVisible();
  await page.getByRole('button', { name: 'Open a capsule' }).click();
  await page.getByRole('button', { name: 'Open capsule' }).click();
  await expect(page.getByRole('heading', { name: 'Opening your capsule…' })).toBeVisible();
  await expect(page.getByRole('heading', { name: /You found/ })).toBeVisible();
  const foundName = ((await page.getByRole('heading', { name: /You found/ }).textContent()) ?? '')
    .replace('You found ', '')
    .replace('!', '');
  await page.getByRole('button', { name: 'View collection' }).click();
  await expect(page.getByRole('heading', { name: 'Companion Collection' })).toBeVisible();
  await page.getByRole('button', { name: foundName }).click();
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.locator('.home-companion')).toContainText(foundName);
  await expect(page.locator('.home-companion')).toContainText('is ready!');
  await page.reload();
  await expect(page.locator('.home-companion')).toContainText(foundName);
});

test('game settings and home capsule access remain available after reload', async ({ page }) => {
  await onboard(page);
  await page.getByRole('button', { name: 'Cat Capsule' }).click();
  await expect(page.getByRole('heading', { name: 'Cat Capsule' })).toBeVisible();
  const unavailableCapsule = page.getByRole('button', { name: 'Need 60 more coins' });
  await expect(unavailableCapsule).toHaveAttribute('aria-disabled', 'true');
  await unavailableCapsule.click({ force: true });
  await expect(page.getByRole('heading', { name: 'A new friend is waiting' })).toBeVisible();
  await page.getByRole('button', { name: 'Back', exact: true }).click();

  await page.getByRole('button', { name: 'Change game' }).click();
  await page.getByRole('button', { name: '+ Addition' }).click();
  await page.getByRole('button', { name: '× Multiplication' }).click();
  await page.getByRole('button', { name: 'Hard' }).click();
  await page.getByRole('button', { name: '20' }).click();
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.getByText('Hard · − × · 20 questions')).toBeVisible();
  await page.reload();
  await expect(page.getByText('Hard · − × · 20 questions')).toBeVisible();
});

test('sound preference persists and the home control can recover from zero volume', async ({
  page,
}) => {
  await onboard(page);

  await page.getByRole('button', { name: 'Mute sound effects' }).click();
  await expect(page.getByRole('button', { name: 'Turn on sound effects' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Turn on sound effects' })).toBeVisible();

  await page.evaluate(() => {
    localStorage.setItem(
      'first-math-game:audio-preferences',
      JSON.stringify({ effectsEnabled: true, effectsVolume: 0 }),
    );
  });
  await page.reload();
  await page.getByRole('button', { name: 'Turn on sound effects' }).click();
  await expect(page.getByRole('button', { name: 'Mute sound effects' })).toBeVisible();
  const serialized = await page.evaluate(
    () => localStorage.getItem('first-math-game:audio-preferences') ?? '{}',
  );
  expect(JSON.parse(serialized) as unknown).toEqual({ effectsEnabled: true, effectsVolume: 0.4 });
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
  await expect(equation).toHaveCSS('outline-style', 'none');
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
  await expect(page.getByText('Ruleset 6').first()).toBeVisible();
  await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
  await expect.poll(() => page.evaluate<number>('window.scrollY')).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Review round' }).click();
  await expect(page.getByRole('heading', { name: 'Review your questions' })).toBeVisible();
  await expect.poll(() => page.evaluate<number>('window.scrollY')).toBe(0);
  await page.getByRole('button', { name: 'Back', exact: true }).last().click();
  await expect(page.getByRole('heading', { name: 'Play History' })).toBeVisible();
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
    exportVersion: 3,
    privacy: { playerNameIncluded: false },
  });
  expect(analysis.sessions).toHaveLength(1);
  expect(clipboard).not.toContain('Ada');

  await page.getByRole('button', { name: 'Clear play history' }).click();
  await page.getByRole('button', { name: 'Confirm clear history' }).click();
  await expect(page.locator('.history-overview article').first()).toContainText('0');
  await expect(
    page.getByText('Complete a round and its balance data will appear here.'),
  ).toBeVisible();
});

test('history keeps large setup collections compact until expanded', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'The setup preview behavior is covered once in Chromium.');
  await onboard(page);
  await page.evaluate(() => {
    const key = 'first-math-game:save';
    const save = JSON.parse(localStorage.getItem(key) ?? '{}') as {
      sessions: unknown[];
    };
    const settings = [
      { operations: ['addition'], difficulty: 'easy', questionCount: 10 },
      { operations: ['subtraction'], difficulty: 'easy', questionCount: 10 },
      { operations: ['multiplication'], difficulty: 'easy', questionCount: 10 },
      { operations: ['division'], difficulty: 'easy', questionCount: 10 },
      { operations: ['addition'], difficulty: 'medium', questionCount: 10 },
      { operations: ['addition'], difficulty: 'hard', questionCount: 10 },
      { operations: ['addition'], difficulty: 'advanced', questionCount: 10 },
      { operations: ['addition', 'subtraction'], difficulty: 'medium', questionCount: 10 },
    ];
    save.sessions = settings.map((gameSettings, index) => ({
      id: `setup-preview-${index}`,
      completedAt: new Date(Date.UTC(2026, 7, index + 1)).toISOString(),
      settings: gameSettings,
      seed: index + 1,
      rulesetVersion: 6,
      correctCount: 1,
      accuracy: 1,
      elapsedMs: 1_000,
      score: 1_000,
      coinsPotential: 1,
      coinsEarned: 1,
      answers: [
        {
          problemId: `setup-preview-question-${index}`,
          skillKey: 'addition:1:1',
          operation: 'addition',
          left: 1,
          right: 1,
          choices: [2, 1, 3, 4],
          correctChoiceIndex: 0,
          selectedAnswer: 2,
          correctAnswer: 2,
          correct: true,
          responseMs: 1_000,
        },
      ],
    }));
    localStorage.setItem(key, JSON.stringify(save));
  });
  await page.reload();
  await page.getByRole('button', { name: 'Your progress' }).click();

  await expect(page.locator('.session-history-card')).toHaveCount(5);
  await page.getByRole('button', { name: 'Show all 8 rounds' }).click();
  await expect(page.locator('.session-history-card')).toHaveCount(8);
  await page.getByRole('button', { name: 'Show fewer rounds' }).click();
  await expect(page.locator('.session-history-card')).toHaveCount(5);
  await expect(page.locator('.configuration-card')).toHaveCount(6);
  await page.getByRole('button', { name: 'Show all 8 setups' }).click();
  await expect(page.locator('.configuration-card')).toHaveCount(8);
  await page.getByRole('button', { name: 'Show fewer setups' }).click();
  await expect(page.locator('.configuration-card')).toHaveCount(6);
});

test('complete backup downloads and safely replaces existing progress', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'Download behavior is covered once in Chromium.');
  await onboard(page);
  await page.evaluate(() => {
    const key = 'first-math-game:save';
    const save = JSON.parse(localStorage.getItem(key) ?? '{}') as { coins: number };
    save.coins = 42;
    localStorage.setItem(key, JSON.stringify(save));
  });
  await page.reload();
  await page.getByRole('button', { name: 'Backup & restore' }).click();

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Save backup file' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^number-nook-save-\d{4}-\d{2}-\d{2}\.json$/);
  const backupPath = await download.path();
  expect(backupPath).not.toBeNull();

  await page.evaluate(() => {
    const key = 'first-math-game:save';
    const save = JSON.parse(localStorage.getItem(key) ?? '{}') as {
      player: { name: string };
      coins: number;
    };
    save.player.name = 'Bea';
    save.coins = 7;
    localStorage.setItem(key, JSON.stringify(save));
  });
  await page.reload();
  await page.getByRole('button', { name: 'Backup & restore' }).click();

  await page.getByLabel('Choose backup file').setInputFiles({
    name: 'not-a-save.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{}'),
  });
  await expect(page.getByRole('alert')).toContainText('not a valid Number Nook backup');

  await page.getByLabel('Choose backup file').setInputFiles(backupPath);
  const preview = page.getByRole('region', { name: 'Backup preview' });
  await expect(preview).toContainText('Ada');
  await expect(preview).toContainText('42');
  expect(
    await page.evaluate(() => {
      const save = JSON.parse(localStorage.getItem('first-math-game:save') ?? '{}') as {
        player: { name: string };
      };
      return save.player.name;
    }),
  ).toBe('Bea');

  await page.getByRole('button', { name: 'Restore this backup' }).click();
  await expect(page.getByRole('status')).toHaveText('Backup restored successfully.');
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.getByRole('heading', { name: "Ada's Number Nook" })).toBeVisible();
  await expect(page.getByLabel('42 Paw Coins')).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: "Ada's Number Nook" })).toBeVisible();
});

test('a backup can be restored on a device before onboarding', async ({ page }) => {
  await onboard(page);
  const backup = await page.evaluate<string>('localStorage.getItem("first-math-game:save") ?? ""');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.getByRole('button', { name: 'Restore a backup' }).click();
  await expect(page.getByRole('heading', { name: 'Backup & restore' })).toBeVisible();
  await page.getByLabel('Choose backup file').setInputFiles({
    name: 'number-nook-save.json',
    mimeType: 'application/json',
    buffer: Buffer.from(backup),
  });
  await page.getByRole('button', { name: 'Restore this backup' }).click();
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.getByRole('heading', { name: "Ada's Number Nook" })).toBeVisible();
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
  await page.getByRole('button', { name: 'Back', exact: true }).click();

  await page.getByRole('button', { name: 'Backup & restore' }).click();
  results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
  await page.getByRole('button', { name: 'Back', exact: true }).click();

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

test('@visual backup phone layout', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'phone', 'This baseline targets the phone viewport.');
  await onboard(page);
  await page.getByRole('button', { name: 'Backup & restore' }).click();
  await expect(page).toHaveScreenshot('backup.png', { fullPage: true });
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
