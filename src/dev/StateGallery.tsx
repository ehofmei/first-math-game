import { catalog } from '../content/catalog';
import { AnswerCard } from '../components/AnswerCard';
import { CollectibleCard } from '../components/CollectibleCard';

export function StateGallery() {
  return (
    <main className="state-gallery page-shell">
      <header className="page-header">
        <div>
          <span className="eyebrow">Development only</span>
          <h1>Interface state gallery</h1>
          <p>
            Looking for audio? Open the <a href="?dev=sounds">Sound Lab</a>.
          </p>
        </div>
      </header>

      <section className="panel">
        <h2>Answer cards</h2>
        <div className="answer-grid">
          <AnswerCard
            answer={12}
            index={0}
            disabled={false}
            state="idle"
            onChoose={() => undefined}
          />
          <AnswerCard answer={14} index={1} disabled state="correct" onChoose={() => undefined} />
          <AnswerCard answer={16} index={2} disabled state="incorrect" onChoose={() => undefined} />
          <AnswerCard answer={18} index={3} disabled state="muted" onChoose={() => undefined} />
        </div>
      </section>

      <section className="panel">
        <h2>Feedback ribbons</h2>
        <div className="gallery-stack">
          <div className="feedback-ribbon feedback-ribbon--correct">✓ 7 + 6 = 13</div>
          <div className="feedback-ribbon feedback-ribbon--incorrect">7 + 6 = 13</div>
        </div>
      </section>

      <section className="panel">
        <h2>Collection states</h2>
        <div className="collection-grid">
          {catalog.collectibles.map((item, index) => (
            <CollectibleCard
              key={item.id}
              collectible={item}
              owned={index !== 3}
              equipped={index === 0}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
