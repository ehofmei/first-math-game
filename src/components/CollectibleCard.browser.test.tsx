import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { describe, expect, it } from 'vitest';
import { getCollectible } from '../content/catalog';
import { CollectibleCard } from './CollectibleCard';
import '../styles.css';

describe('CollectibleCard in a real browser', () => {
  it('renders the selected production art style', async () => {
    const sunny = getCollectible('cozy-cats:sunny')!;
    await render(<CollectibleCard collectible={sunny} owned artStyle="sticker" />);

    const portrait = page.getByRole('img', { name: sunny.altText });
    await expect.element(portrait).toHaveAttribute('src', '/collectibles/sunny-sticker.webp');
  });

  it('falls back when a companion does not have the selected style', async () => {
    const guest = getCollectible('special-guests:button-bunny')!;
    const classicOnlyGuest = {
      ...guest,
      art: { classic: 'collectibles/button-bunny.svg' },
    };
    await render(<CollectibleCard collectible={classicOnlyGuest} owned artStyle="sticker" />);

    const portrait = page.getByRole('img', { name: guest.altText });
    await expect.element(portrait).toHaveAttribute('src', '/collectibles/button-bunny.svg');
  });

  it('renders the Special Guest Sticker portrait', async () => {
    const guest = getCollectible('special-guests:button-bunny')!;
    await render(<CollectibleCard collectible={guest} owned artStyle="sticker" />);

    const portrait = page.getByRole('img', { name: guest.altText });
    await expect
      .element(portrait)
      .toHaveAttribute('src', '/collectibles/button-bunny-sticker.webp');
  });
});
