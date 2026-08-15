import { page } from 'vitest/browser';
import { cleanup, render } from 'vitest-browser-react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { LocalStorageAudioPreferencesRepository } from '../audio/preferences';
import '../styles.css';
import { SoundLab } from './SoundLab';

describe('SoundLab in a real browser', () => {
  beforeEach(() => {
    localStorage.removeItem(LocalStorageAudioPreferencesRepository.key);
  });

  afterEach(async () => {
    await cleanup();
  });

  it('presents the synthesized cue catalog and can audition a cue', async () => {
    await render(<SoundLab />);

    await expect
      .element(page.getByRole('heading', { name: 'Number Nook Sound Lab' }))
      .toBeVisible();
    await expect.element(page.getByRole('button', { name: 'Play Bright chime' })).toBeEnabled();
    await expect.element(page.getByText('No audio files are being played.')).toBeVisible();

    await page.getByRole('button', { name: 'Play Bright chime' }).click();
    await expect
      .element(page.getByRole('status', { name: 'Sound Lab status' }))
      .toHaveTextContent(/Scheduled “Bright chime”|Audio is muted or could not start/);
  });

  it('persists mute and reset controls for the playable app', async () => {
    await render(<SoundLab />);

    const effects = page.getByRole('checkbox', { name: 'Sound effects on' });
    await effects.click();
    await expect
      .element(page.getByRole('checkbox', { name: 'Sound effects off' }))
      .not.toBeChecked();
    await expect.element(page.getByRole('button', { name: 'Play Bright chime' })).toBeDisabled();
    expect(
      JSON.parse(
        localStorage.getItem(LocalStorageAudioPreferencesRepository.key) ?? '{}',
      ) as unknown,
    ).toEqual({ effectsEnabled: false, effectsVolume: 0.4 });

    await page.getByRole('button', { name: 'Reset audio defaults' }).click();
    await expect.element(page.getByRole('checkbox', { name: 'Sound effects on' })).toBeChecked();
    await expect.element(page.getByRole('slider', { name: 'Effects volume' })).toHaveValue('0.4');
  });

  it('customizes a cue and runs a stoppable repetition check', async () => {
    await render(<SoundLab />);

    await page.getByRole('combobox', { name: 'Starting sound' }).selectOptions('correct-spark');
    const pitch = page.getByRole('slider', { name: 'Pitch adjustment' });
    const length = page.getByRole('slider', { name: 'Sound length' });
    const intensity = page.getByRole('slider', { name: 'Sound intensity' });
    const attack = page.getByRole('slider', { name: 'Attack time' });
    const noise = page.getByRole('slider', { name: 'Noise texture' });
    const pan = page.getByRole('slider', { name: 'Stereo pan' });

    await pitch.fill('5');
    await length.fill('1.4');
    await intensity.fill('0.8');
    await attack.fill('2');
    await noise.fill('0.5');
    await pan.fill('-0.4');
    await page.getByRole('combobox', { name: 'Waveform character' }).selectOptions('square');

    await expect.element(page.getByText('+5 semitones')).toBeVisible();
    await expect.element(page.getByText('140%')).toBeVisible();
    await expect.element(page.getByText('Left 40%')).toBeVisible();
    const alignedInRowOrColumn = (
      first: ReturnType<typeof pitch.element>,
      second: ReturnType<typeof pitch.element>,
    ) => {
      const firstBox = first.getBoundingClientRect();
      const secondBox = second.getBoundingClientRect();
      return (
        Math.abs(firstBox.top - secondBox.top) < 2 || Math.abs(firstBox.left - secondBox.left) < 2
      );
    };
    expect(alignedInRowOrColumn(pitch.element(), length.element())).toBe(true);
    expect(alignedInRowOrColumn(attack.element(), noise.element())).toBe(true);
    expect(alignedInRowOrColumn(noise.element(), pan.element())).toBe(true);
    await page.getByRole('button', { name: 'Play customized sound' }).click();
    await expect
      .element(page.getByRole('status', { name: 'Sound Lab status' }))
      .toHaveTextContent(/Played customized “Correct spark|Audio is muted or could not start/);

    await page.getByRole('button', { name: 'Repeat ×5' }).click();
    await expect.element(page.getByRole('button', { name: 'Stop sequence' })).toBeEnabled();
    await page.getByRole('button', { name: 'Stop sequence' }).click();
    await expect
      .element(page.getByRole('status', { name: 'Sound Lab status' }))
      .toHaveTextContent('Sequence stopped');
  });
});
