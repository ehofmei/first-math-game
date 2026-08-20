import type { CSSProperties } from 'react';
import { page } from 'vitest/browser';
import { cleanup, render } from 'vitest-browser-react';
import { afterEach, describe, expect, it } from 'vitest';
import { catalog } from '../content/catalog';
import type { SelectedDialogue } from '../companions/types';
import '../styles.css';
import { CompanionDialogue } from './CompanionDialogue';

const companion = catalog.collectibles[0]!;
const dialogue: SelectedDialogue = {
  id: 'home-welcome-01',
  text: 'Ready when you are.',
  context: 'home',
  source: 'global',
};

describe('CompanionDialogue in a real browser', () => {
  afterEach(async () => {
    await cleanup();
  });

  it('keeps home dialogue quiet and its linked portrait decorative', async () => {
    await render(
      <div className="play-card" style={{ '--theme-accent-strong': '#78300d' } as CSSProperties}>
        <CompanionDialogue
          companion={companion}
          artStyle="sticker"
          dialogue={dialogue}
          variant="home"
          decorativePortrait
        />
      </div>,
    );

    await expect.element(page.getByText('Ready when you are.')).toBeVisible();
    await expect
      .element(page.getByTestId('player-companion-dialogue-text'))
      .toHaveStyle({ color: 'rgb(120, 48, 13)' });
    await expect
      .element(page.getByTestId('player-companion-dialogue-home'))
      .toHaveAttribute('data-dialogue-context', 'home');
    await expect
      .element(page.getByTestId('player-companion-dialogue-bubble'))
      .not.toHaveAttribute('aria-live');
  });

  it('announces results politely and preserves meaningful portrait alt text', async () => {
    await render(
      <CompanionDialogue
        companion={companion}
        artStyle="sticker"
        dialogue={{ ...dialogue, id: 'results-perfect-01', context: 'results' }}
        variant="results"
      />,
    );

    await expect
      .element(page.getByTestId('player-companion-dialogue-bubble'))
      .toHaveAttribute('aria-live', 'polite');
    await expect.element(page.getByRole('img', { name: companion.altText })).toBeVisible();
  });
});
