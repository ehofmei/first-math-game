import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { describe, expect, it, vi } from 'vitest';
import { AnswerCard } from './AnswerCard';
import '../styles.css';

describe('AnswerCard in a real browser', () => {
  it('exposes a semantic answer and handles a player click', async () => {
    const onChoose = vi.fn();
    await render(
      <AnswerCard answer={13} index={0} disabled={false} state="idle" onChoose={onChoose} />,
    );

    const answer = page.getByRole('button', { name: 'Answer 13' });
    await expect.element(answer).toBeVisible();
    await answer.click();
    expect(onChoose).toHaveBeenCalledOnce();
  });

  it('renders feedback states without accepting another answer', async () => {
    const onChoose = vi.fn();
    await render(
      <AnswerCard answer={11} index={1} disabled state="incorrect" onChoose={onChoose} />,
    );

    const answer = page.getByRole('button', { name: 'Answer 11' });
    await expect.element(answer).toBeDisabled();
    expect(onChoose).not.toHaveBeenCalled();
  });
});
