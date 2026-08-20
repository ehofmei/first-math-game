import { page } from 'vitest/browser';
import { cleanup, render } from 'vitest-browser-react';
import { afterEach, describe, expect, it } from 'vitest';
import '../styles.css';
import { CompanionLab } from './CompanionLab';

describe('CompanionLab in a real browser', () => {
  afterEach(async () => {
    await cleanup();
  });

  it('previews companions, result conditions, and the per-context recent queue', async () => {
    await render(<CompanionLab />);

    await expect
      .element(page.getByRole('heading', { name: 'Number Nook Companion Lab' }))
      .toBeVisible();
    await expect.element(page.getByTestId('companion-dialogue')).toBeVisible();
    await expect.element(page.getByTestId('recent-count')).toHaveTextContent('0 / 8');

    await page.getByRole('combobox', { name: 'Companion' }).selectOptions('cozy-cats:cloud');
    await expect.element(page.getByRole('img', { name: /fluffy white cat/i })).toBeVisible();
    await expect.element(page.getByTestId('companion-dialogue-name')).toHaveTextContent(/^Cloud$/);
    await expect
      .element(page.getByRole('combobox', { name: 'Motion profile' }))
      .toHaveValue('calm-float');

    await page.getByRole('combobox', { name: 'Dialogue context' }).selectOptions('results');
    await page.getByRole('checkbox', { name: 'Perfect round' }).click();
    await expect.element(page.getByText('100% accuracy')).toBeVisible();
    await expect
      .element(page.getByTestId('selected-phrase-id'))
      .toHaveTextContent('results-perfect-');

    await page.getByRole('button', { name: 'Next phrase' }).click();
    await expect.element(page.getByTestId('recent-count')).toHaveTextContent('1 / 8');
  });

  it('runs deterministic diagnostics and exposes presentation stress controls', async () => {
    await render(<CompanionLab />);

    await page.getByRole('combobox', { name: 'Preview width' }).selectOptions('phone');
    await page.getByRole('checkbox', { name: 'Simulate reduced motion' }).click();
    await page.getByRole('checkbox', { name: 'Large-text stress test' }).click();

    const preview = page.getByTestId('companion-preview');
    await expect.element(preview).toHaveClass(/companion-lab-preview--phone/);
    await expect.element(preview).toHaveClass(/companion-lab-preview--reduced/);
    await expect.element(preview).toHaveClass(/companion-lab-preview--large-text/);

    await page.getByRole('button', { name: 'Draw 50' }).click();
    await expect.element(page.getByRole('heading', { name: 'Draw 50 diagnostics' })).toBeVisible();
    await expect.element(page.getByText('50 draws', { exact: true })).toBeVisible();
    await expect.element(page.getByTestId('diagnostic-duplicates')).toHaveTextContent('0');
    await expect.element(page.getByTestId('diagnostic-unresolved')).toHaveTextContent('0');
    await expect.element(page.getByRole('table', { name: 'Phrase frequency' })).toBeVisible();
  });
});
