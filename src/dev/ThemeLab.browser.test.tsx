import { page } from 'vitest/browser';
import { cleanup, render } from 'vitest-browser-react';
import { afterEach, describe, expect, it } from 'vitest';
import { catalog } from '../content/catalog';
import '../styles.css';
import { ThemeLab } from './ThemeLab';

describe('ThemeLab in a real browser', () => {
  afterEach(async () => {
    await cleanup();
  });

  it('previews every valid palette without changing saved state', async () => {
    await render(<ThemeLab />);

    await expect
      .element(page.getByRole('heading', { name: 'Number Nook Theme Lab' }))
      .toBeVisible();
    await expect
      .element(
        page.getByText(
          `${catalog.collectibles.length} / ${catalog.collectibles.length} palettes pass`,
        ),
      )
      .toBeVisible();
    await expect
      .element(page.getByRole('button', { name: /Sunny/ }))
      .toHaveAttribute('aria-pressed', 'true');

    await page.getByRole('button', { name: /Cloud/ }).click();
    await expect
      .element(page.getByRole('button', { name: /Cloud/ }))
      .toHaveAttribute('aria-pressed', 'true');
    const preview = page.getByTestId('theme-preview');
    await expect
      .element(preview.getByRole('heading', { name: "Cloud's Number Nook" }))
      .toBeVisible();
    await expect.element(preview.getByText('#286BA6')).toBeVisible();
    await expect
      .element(page.getByRole('heading', { name: 'Cloud contrast checks' }))
      .toBeVisible();
  });
});
