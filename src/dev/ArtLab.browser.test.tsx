import { page } from 'vitest/browser';
import { cleanup, render } from 'vitest-browser-react';
import { afterEach, describe, expect, it } from 'vitest';
import '../styles.css';
import { ArtLab } from './ArtLab';

describe('ArtLab in a real browser', () => {
  afterEach(async () => {
    await cleanup();
  });

  it('compares every treatment and updates all context tests from one selection', async () => {
    await render(<ArtLab />);

    await expect.element(page.getByRole('heading', { name: 'Number Nook Art Lab' })).toBeVisible();
    await expect
      .element(page.getByRole('button', { name: /Simple SVG/ }))
      .toHaveAttribute('aria-pressed', 'true');
    const scaleSamples = page.getByRole('region', { name: 'Actual-size samples' });
    await expect.element(scaleSamples.getByText('96 px', { exact: true })).toBeVisible();
    await expect.element(scaleSamples.getByText('290 px', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: /Soft storybook/ }).click();
    await expect
      .element(page.getByRole('button', { name: /Soft storybook/ }))
      .toHaveAttribute('aria-pressed', 'true');
    await expect.element(page.getByText('Soft storybook').last()).toBeVisible();
    await expect.element(page.getByText('You found Moonbeam!')).toBeVisible();
    await expect.element(page.getByText('The Classic roster is a production draft,')).toBeVisible();
  });

  it('shows the complete Classic collection at full and compact sizes', async () => {
    await render(<ArtLab />);

    const roster = page.getByTestId('classic-roster');
    await expect.element(page.getByText('10 / 10 drafted')).toBeVisible();
    await expect.element(roster.getByRole('img')).toHaveLength(10);
    await expect.element(roster.getByRole('img', { name: /biscuit-beige/ })).toBeVisible();
    await expect.element(roster.getByRole('img', { name: /pearly cat/ })).toBeVisible();
    await expect.element(page.getByLabelText('Classic 96 pixel comparison')).toBeVisible();

    const lockedToggle = page.getByRole('button', { name: 'Preview locked' });
    await lockedToggle.click();
    const unlockedToggle = page.getByRole('button', { name: 'Show unlocked colors' });
    await expect.element(unlockedToggle).toHaveAttribute('aria-pressed', 'true');
    await expect.element(unlockedToggle).toBeVisible();
  });

  it('compares the Sticker companions with their Classic identities', async () => {
    await render(<ArtLab />);

    await expect
      .element(page.getByRole('heading', { name: 'Companion Sticker contact sheet' }))
      .toBeVisible();
    await expect.element(page.getByRole('img', { name: /Sticker version 1/ })).toHaveLength(11);
    await expect
      .element(page.getByRole('img', { name: 'Biscuit in the Classic style' }))
      .toBeVisible();
    await expect
      .element(page.getByRole('img', { name: /Biscuit Sticker version 1/ }))
      .toBeVisible();
    await expect
      .element(page.getByRole('img', { name: /Biscuit Sticker version 2/ }))
      .toBeVisible();
    const biscuit = page.getByTestId('sticker-biscuit');
    await expect.element(biscuit.getByText('Sticker v1 · leading')).toBeVisible();
    await expect.element(page.getByRole('img', { name: /Cloud Sticker version 2/ })).toBeVisible();
    const cloud = page.getByTestId('sticker-cloud');
    await expect.element(cloud.getByText('Sticker v2 · leading')).toBeVisible();
    await expect
      .element(page.getByRole('img', { name: 'Aurora in the Classic style' }))
      .toBeVisible();
    await expect.element(page.getByRole('img', { name: /Aurora Sticker version 1/ })).toBeVisible();
    await expect
      .element(page.getByRole('img', { name: 'Button Bunny in the Classic style' }))
      .toBeVisible();
    await expect
      .element(page.getByRole('img', { name: /Button Bunny Sticker version 1/ }))
      .toBeVisible();
  });
});
