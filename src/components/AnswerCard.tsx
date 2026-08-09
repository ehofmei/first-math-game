interface AnswerCardProps {
  answer: number;
  index: number;
  disabled: boolean;
  state: 'idle' | 'correct' | 'incorrect' | 'muted';
  onChoose: () => void;
}

export function AnswerCard({ answer, index, disabled, state, onChoose }: AnswerCardProps) {
  return (
    <button
      type="button"
      className={`answer-card answer-card--${state}`}
      disabled={disabled}
      onClick={onChoose}
      aria-label={`Answer ${answer}`}
    >
      <span className="answer-shortcut" aria-hidden="true">
        {index + 1}
      </span>
      <span>{answer}</span>
      {state === 'correct' && (
        <span className="answer-result" aria-hidden="true">
          ✓
        </span>
      )}
      {state === 'incorrect' && (
        <span className="answer-result" aria-hidden="true">
          ×
        </span>
      )}
    </button>
  );
}
