import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { buildPlayHistoryExport, serializePlayHistory } from './analytics/history';
import { AnswerCard } from './components/AnswerCard';
import { CollectibleCard } from './components/CollectibleCard';
import { catalog, getCollectible, getStarterCollectibles } from './content/catalog';
import type { CollectibleDefinition } from './content/schema';
import { SystemClock } from './domain/clock';
import { answerFeedbackDelay } from './domain/feedback';
import {
  DEFAULT_SETTINGS,
  DIFFICULTY_IDS,
  DIFFICULTY_LABELS,
  formatProblem,
  generateSession,
  OPERATION_IDS,
  OPERATION_LABELS,
  OPERATION_SYMBOLS,
  QUESTION_COUNTS,
  type DifficultyId,
  type GameSettings,
  type OperationId,
  type Problem,
} from './domain/math';
import { createRandomSeed, SeededRandom } from './domain/random';
import { CAPSULE_COST, chooseCapsuleReward, DAILY_COIN_CAP } from './domain/rewards';
import { summarizeSession, type AnswerRecord, type SessionSummary } from './domain/session';
import { StateGallery } from './dev/StateGallery';
import {
  applyCompletedSession,
  createInitialSave,
  dailyCoinsRemaining,
  LocalStorageSaveRepository,
  type SaveData,
  updateSettings,
} from './storage/save';

type Screen =
  'onboarding' | 'home' | 'setup' | 'play' | 'results' | 'capsule' | 'gallery' | 'history';

interface ActiveGame {
  seed: number;
  problems: Problem[];
  index: number;
  answers: AnswerRecord[];
  questionStartedAt: number;
  startedAt: number;
  feedback: { selected: number; correct: boolean } | null;
  previous: { answer: AnswerRecord; prompt: string } | null;
}

const repository = new LocalStorageSaveRepository();
const clock = new SystemClock();

function formatTime(milliseconds: number): string {
  const seconds = Math.max(0, milliseconds) / 1_000;
  return `${seconds.toFixed(1)}s`;
}

function settingsSummary(settings: GameSettings): string {
  const operations = settings.operations.map((operation) => OPERATION_SYMBOLS[operation]).join(' ');
  return `${DIFFICULTY_LABELS[settings.difficulty]} · ${operations} · ${settings.questionCount} questions`;
}

function difficultyDescription(difficulty: DifficultyId): string {
  const descriptions: Record<DifficultyId, string> = {
    easy: 'Foundational facts with friendly number ranges.',
    medium: 'Larger addition and subtraction, with tables through 10.',
    hard: 'Multi-digit arithmetic and multiplication tables through 12.',
    advanced: 'Large numbers, tables through 20, and negative subtraction answers.',
  };
  return descriptions[difficulty];
}

function resultHeadline(summary: SessionSummary, previous: readonly SessionSummary[]): string {
  if (previous.length === 0) return 'First score on the board!';
  const bestAccuracy = Math.max(...previous.map(({ accuracy }) => accuracy));
  const bestScore = Math.max(...previous.map(({ score }) => score));
  if (summary.accuracy > bestAccuracy) return 'Your accuracy just grew!';
  if (summary.score > bestScore) return 'New personal best!';
  return 'Another strong practice round!';
}

function Onboarding({ onComplete }: { onComplete: (name: string, starterId: string) => void }) {
  const starters = getStarterCollectibles();
  const [name, setName] = useState('');
  const [starterId, setStarterId] = useState(starters[0]?.id ?? '');

  return (
    <main className="onboarding page-shell">
      <section className="hero-card">
        <div className="hero-copy">
          <span className="eyebrow">A little practice. A lot of progress.</span>
          <h1>Welcome to Number Nook</h1>
          <p>
            Solve quick math puzzles, earn Paw Coins, and discover companions for your collection.
          </p>
        </div>
        <div className="math-doodles" aria-hidden="true">
          <span>7 + 6</span>
          <span>= 13</span>
          <span>★</span>
        </div>
      </section>

      <form
        className="panel onboarding-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (name.trim() && starterId) onComplete(name, starterId);
        }}
      >
        <div className="field-group">
          <label htmlFor="player-name">What should we call you?</label>
          <input
            id="player-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={30}
            placeholder="Your name"
            autoComplete="nickname"
          />
        </div>

        <fieldset>
          <legend>Choose your first companion</legend>
          <p className="field-help">You can discover the others later.</p>
          <div className="starter-grid">
            {starters.map((starter) => (
              <CollectibleCard
                key={starter.id}
                collectible={starter}
                owned
                selected={starterId === starter.id}
                onSelect={() => setStarterId(starter.id)}
              />
            ))}
          </div>
        </fieldset>

        <button className="primary-button" type="submit" disabled={!name.trim() || !starterId}>
          Enter Number Nook
        </button>
      </form>
    </main>
  );
}

function Home({
  save,
  onPlay,
  onSetup,
  onGallery,
  onCapsule,
  onHistory,
}: {
  save: SaveData;
  onPlay: () => void;
  onSetup: () => void;
  onGallery: () => void;
  onCapsule: () => void;
  onHistory: () => void;
}) {
  const companion = getCollectible(save.equippedCollectibleId);
  const lastSession = save.sessions.at(-1);

  return (
    <main className="page-shell home-page">
      <header className="home-header">
        <div>
          <span className="eyebrow">Welcome back</span>
          <h1>{save.player.name}'s Number Nook</h1>
        </div>
        <div className="coin-pill" aria-label={`${save.coins} Paw Coins`}>
          <span>🐾</span>
          {save.coins}
        </div>
      </header>

      <section className="play-card">
        <div className="play-card__copy">
          <span className="mode-pill">{settingsSummary(save.settings)}</span>
          <h2>Ready for a quick game?</h2>
          <p>Take your time, aim carefully, and see what you can improve.</p>
          <div className="play-actions">
            <button className="primary-button" type="button" onClick={onPlay}>
              Play now
            </button>
            <button className="secondary-button" type="button" onClick={onSetup}>
              Change game
            </button>
          </div>
        </div>
        {companion && (
          <div className="home-companion">
            <img src={`${import.meta.env.BASE_URL}${companion.image}`} alt={companion.altText} />
            <strong>{companion.name}</strong>
            <span>is ready!</span>
          </div>
        )}
      </section>

      <div className="home-grid">
        <button className="dashboard-card" type="button" onClick={onGallery}>
          <span className="dashboard-icon" aria-hidden="true">
            ✦
          </span>
          <span>
            <strong>Collection</strong>
            <small>
              {save.ownedCollectibleIds.length} of {catalog.collectibles.length} discovered
            </small>
          </span>
          <span aria-hidden="true">→</span>
        </button>
        <button className="dashboard-card" type="button" onClick={onCapsule}>
          <span className="dashboard-icon" aria-hidden="true">
            🐾
          </span>
          <span>
            <strong>Cat Capsule</strong>
            <small>
              {save.coins >= CAPSULE_COST
                ? 'A new companion is waiting!'
                : `${CAPSULE_COST - save.coins} more coins to open one`}
            </small>
          </span>
          <span aria-hidden="true">→</span>
        </button>
        <button className="dashboard-card" type="button" onClick={onHistory}>
          <span className="dashboard-icon" aria-hidden="true">
            ↗
          </span>
          <span>
            <strong>Your progress</strong>
            <small>
              {lastSession
                ? `${Math.round(lastSession.accuracy * 100)}% last game`
                : 'Your first game is waiting'}
            </small>
            <small>
              {dailyCoinsRemaining(save, clock.today())} of {DAILY_COIN_CAP} coins available today
            </small>
          </span>
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </main>
  );
}

function Setup({
  settings,
  onChange,
  onBack,
  onStart,
}: {
  settings: GameSettings;
  onChange: (settings: GameSettings) => void;
  onBack: () => void;
  onStart: () => void;
}) {
  const toggleOperation = (operation: OperationId) => {
    const selected = settings.operations.includes(operation);
    if (selected && settings.operations.length === 1) return;
    onChange({
      ...settings,
      operations: selected
        ? settings.operations.filter((value) => value !== operation)
        : [...settings.operations, operation],
    });
  };

  return (
    <main className="page-shell narrow-page">
      <header className="page-header">
        <button className="icon-button" type="button" onClick={onBack} aria-label="Back">
          ←
        </button>
        <div>
          <span className="eyebrow">Game setup</span>
          <h1>Choose your challenge</h1>
        </div>
      </header>
      <section className="panel setup-panel">
        <div className="setting-block">
          <h2>Operation</h2>
          <div className="choice-row">
            {OPERATION_IDS.map((operation) => {
              const selected = settings.operations.includes(operation);
              return (
                <button
                  key={operation}
                  className={`choice-chip ${selected ? 'choice-chip--selected' : ''}`}
                  type="button"
                  aria-pressed={selected}
                  aria-disabled={selected && settings.operations.length === 1}
                  onClick={() => toggleOperation(operation)}
                >
                  {OPERATION_SYMBOLS[operation]} {OPERATION_LABELS[operation]}
                </button>
              );
            })}
          </div>
          <p>Select one operation or mix several in a balanced round.</p>
        </div>
        <div className="setting-block">
          <h2>Difficulty</h2>
          <div className="choice-row">
            {DIFFICULTY_IDS.map((difficulty) => (
              <button
                key={difficulty}
                className={`choice-chip ${settings.difficulty === difficulty ? 'choice-chip--selected' : ''}`}
                type="button"
                aria-pressed={settings.difficulty === difficulty}
                onClick={() => onChange({ ...settings, difficulty })}
              >
                {DIFFICULTY_LABELS[difficulty]}
              </button>
            ))}
          </div>
          <p>{difficultyDescription(settings.difficulty)}</p>
        </div>
        <div className="setting-block">
          <h2>Questions</h2>
          <div className="choice-row">
            {QUESTION_COUNTS.map((questionCount) => (
              <button
                key={questionCount}
                className={`choice-chip ${settings.questionCount === questionCount ? 'choice-chip--selected' : ''}`}
                type="button"
                aria-pressed={settings.questionCount === questionCount}
                onClick={() => onChange({ ...settings, questionCount })}
              >
                {questionCount}
              </button>
            ))}
          </div>
        </div>
        <button className="text-button" type="button" onClick={() => onChange(DEFAULT_SETTINGS)}>
          Reset defaults
        </button>
        <button className="primary-button primary-button--wide" type="button" onClick={onStart}>
          Start game
        </button>
      </section>
    </main>
  );
}

function Play({
  game,
  elapsed,
  onAnswer,
  onExit,
}: {
  game: ActiveGame;
  elapsed: number;
  onAnswer: (answer: number) => void;
  onExit: () => void;
}) {
  const problem = game.problems[game.index];
  const equationRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    equationRef.current?.focus({ preventScroll: true });
  }, [game.index]);

  if (!problem) return null;

  return (
    <main className="game-page page-shell">
      <header className="game-header">
        <button className="icon-button" type="button" onClick={onExit} aria-label="Exit game">
          ×
        </button>
        <div
          className="game-progress"
          aria-label={`Question ${game.index + 1} of ${game.problems.length}`}
        >
          <span>
            Question {game.index + 1} of {game.problems.length}
          </span>
          <div className="progress-track">
            <span style={{ width: `${((game.index + 1) / game.problems.length) * 100}%` }} />
          </div>
        </div>
        <div className="timer-pill" aria-label={`Elapsed time ${formatTime(elapsed)}`}>
          ◷ {formatTime(elapsed)}
        </div>
      </header>

      <div className="feedback-slot" aria-live="polite">
        {game.previous && (
          <div
            className={`feedback-ribbon feedback-ribbon--${game.previous.answer.correct ? 'correct' : 'incorrect'}`}
          >
            {game.previous.answer.correct ? '✓ ' : ''}
            {game.previous.prompt} = {game.previous.answer.correctAnswer}
          </div>
        )}
      </div>

      <section className="question-panel" aria-labelledby="equation">
        <span className="eyebrow">What is the answer?</span>
        <h1 id="equation" ref={equationRef} tabIndex={-1}>
          <span>{problem.left}</span>
          <span className="operator">{OPERATION_SYMBOLS[problem.operation]}</span>
          <span>{problem.right}</span>
          <span className="equals">=</span>
          <span className="answer-blank">?</span>
        </h1>
      </section>

      <div className="answer-grid">
        {problem.choices.map((choice, index) => {
          let state: 'idle' | 'correct' | 'incorrect' | 'muted' = 'idle';
          if (game.feedback) {
            if (choice === problem.correctAnswer) state = 'correct';
            else if (choice === game.feedback.selected) state = 'incorrect';
            else state = 'muted';
          }
          return (
            <AnswerCard
              key={choice}
              answer={choice}
              index={index}
              disabled={Boolean(game.feedback)}
              state={state}
              onChoose={() => onAnswer(choice)}
            />
          );
        })}
      </div>
      <p className="keyboard-hint">Tip: use keys 1–4 to choose an answer.</p>
    </main>
  );
}

function Results({
  summary,
  previous,
  onReplay,
  onHome,
  onCapsule,
  dailyRemaining,
}: {
  summary: SessionSummary;
  previous: readonly SessionSummary[];
  onReplay: () => void;
  onHome: () => void;
  onCapsule: () => void;
  dailyRemaining: number;
}) {
  return (
    <main className="page-shell narrow-page results-page">
      <section className="celebration-card">
        <span className="celebration-stars" aria-hidden="true">
          ✦ ★ ✦
        </span>
        <span className="eyebrow">Round complete</span>
        <h1>{resultHeadline(summary, previous)}</h1>
        <p>
          You completed all {summary.answers.length} questions and added another practice round.
        </p>
      </section>
      <section className="results-grid" aria-label="Game results">
        <article>
          <span>Accuracy</span>
          <strong>{Math.round(summary.accuracy * 100)}%</strong>
          <small>
            {summary.correctCount} of {summary.answers.length} correct
          </small>
        </article>
        <article>
          <span>Time</span>
          <strong>{formatTime(summary.elapsedMs)}</strong>
          <small>thinking time</small>
        </article>
        <article>
          <span>Score</span>
          <strong>{summary.score.toLocaleString()}</strong>
          <small>accuracy first</small>
        </article>
        <article className="coin-result">
          <span>Paw Coins</span>
          <strong>+{summary.coinsEarned}</strong>
          <small>
            {dailyRemaining > 0
              ? `${dailyRemaining} available today`
              : "Today's Paw Coin pouch is full"}
          </small>
        </article>
      </section>
      <div className="result-actions">
        <button className="primary-button" type="button" onClick={onReplay}>
          Play again
        </button>
        <button className="secondary-button" type="button" onClick={onCapsule}>
          Open a capsule
        </button>
        <button className="text-button" type="button" onClick={onHome}>
          Back home
        </button>
      </div>
    </main>
  );
}

function History({ save, onBack }: { save: SaveData; onBack: () => void }) {
  const [generatedAt] = useState(() => new Date().toISOString());
  const analysis = useMemo(() => buildPlayHistoryExport(save, generatedAt), [generatedAt, save]);
  const serialized = useMemo(() => serializePlayHistory(save, generatedAt), [generatedAt, save]);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>('idle');

  const copyHistory = async () => {
    try {
      await navigator.clipboard.writeText(serialized);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('failed');
    }
  };

  const downloadHistory = () => {
    const url = URL.createObjectURL(new Blob([serialized], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `number-nook-history-${generatedAt.slice(0, 10)}.json`;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  return (
    <main className="page-shell history-page">
      <header className="page-header">
        <button className="icon-button" type="button" onClick={onBack} aria-label="Back">
          ←
        </button>
        <div>
          <span className="eyebrow">Local analysis</span>
          <h1>Play History</h1>
          <p>Your name and device identifiers are excluded from the analysis export.</p>
        </div>
      </header>

      <section className="history-overview" aria-label="Overall play history">
        <article>
          <span>Rounds</span>
          <strong>{analysis.currentState.completedRoundCount}</strong>
        </article>
        <article>
          <span>Average accuracy</span>
          <strong>{analysis.overall.averageAccuracyPercent}%</strong>
        </article>
        <article>
          <span>Average score</span>
          <strong>{Math.round(analysis.overall.averageScore).toLocaleString()}</strong>
        </article>
        <article>
          <span>Questions answered</span>
          <strong>{analysis.overall.totalQuestions}</strong>
        </article>
      </section>

      <section className="panel history-export-panel">
        <div>
          <h2>Share for balance analysis</h2>
          <p>
            Copy the versioned JSON and paste it into our chat. It includes exact settings,
            questions, choices, scores, timing, and coin-cap effects.
          </p>
        </div>
        <div className="history-actions">
          <button className="primary-button" type="button" onClick={() => void copyHistory()}>
            Copy analysis data
          </button>
          <button className="secondary-button" type="button" onClick={downloadHistory}>
            Download JSON
          </button>
        </div>
        <p className="copy-status" aria-live="polite">
          {copyStatus === 'copied' && 'Copied! You can paste it into the chat.'}
          {copyStatus === 'failed' &&
            'Clipboard access was blocked. Download the JSON or copy it from the preview below.'}
        </p>
        <details>
          <summary>Preview export JSON</summary>
          <textarea
            className="history-json"
            value={serialized}
            readOnly
            rows={12}
            aria-label="Play history export JSON"
            onFocus={(event) => event.currentTarget.select()}
          />
        </details>
      </section>

      <section className="history-section">
        <h2>Performance by setup</h2>
        {analysis.configurations.length === 0 ? (
          <div className="panel empty-history">
            <p>Complete a round and its balance data will appear here.</p>
          </div>
        ) : (
          <div className="configuration-grid">
            {analysis.configurations.map((configuration) => (
              <article className="configuration-card" key={configuration.key}>
                <span className="mode-pill">{settingsSummary(configuration.settings)}</span>
                <small>Ruleset {configuration.rulesetVersion}</small>
                <strong>{configuration.highScore.toLocaleString()} high score</strong>
                <dl>
                  <div>
                    <dt>Rounds</dt>
                    <dd>{configuration.rounds}</dd>
                  </div>
                  <div>
                    <dt>Average score</dt>
                    <dd>{Math.round(configuration.averageScore).toLocaleString()}</dd>
                  </div>
                  <div>
                    <dt>Accuracy</dt>
                    <dd>{configuration.averageAccuracyPercent}%</dd>
                  </div>
                  <div>
                    <dt>Average answer</dt>
                    <dd>{formatTime(configuration.averageResponseMs)}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        )}
      </section>

      {save.sessions.length > 0 && (
        <section className="history-section">
          <h2>Completed rounds</h2>
          <div className="session-history-list">
            {[...save.sessions].reverse().map((session) => (
              <article className="session-history-card" key={session.id}>
                <div>
                  <span className="mode-pill">{settingsSummary(session.settings)}</span>
                  <strong>
                    {new Intl.DateTimeFormat(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    }).format(new Date(session.completedAt))}
                  </strong>
                  <small>Ruleset {session.rulesetVersion}</small>
                </div>
                <dl>
                  <div>
                    <dt>Score</dt>
                    <dd>{session.score.toLocaleString()}</dd>
                  </div>
                  <div>
                    <dt>Accuracy</dt>
                    <dd>{Math.round(session.accuracy * 100)}%</dd>
                  </div>
                  <div>
                    <dt>Time</dt>
                    <dd>{formatTime(session.elapsedMs)}</dd>
                  </div>
                  <div>
                    <dt>Coins</dt>
                    <dd>
                      +{session.coinsEarned}
                      {session.coinsEarned < session.coinsPotential
                        ? ` of ${session.coinsPotential}`
                        : ''}
                    </dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function Capsule({
  save,
  reward,
  onOpen,
  onGallery,
  onBack,
}: {
  save: SaveData;
  reward: CollectibleDefinition | null | undefined;
  onOpen: () => void;
  onGallery: () => void;
  onBack: () => void;
}) {
  const complete = save.ownedCollectibleIds.length === catalog.collectibles.length;
  return (
    <main className="page-shell narrow-page capsule-page">
      <header className="page-header">
        <button className="icon-button" type="button" onClick={onBack} aria-label="Back">
          ←
        </button>
        <div>
          <span className="eyebrow">Companion corner</span>
          <h1>Cat Capsule</h1>
        </div>
        <div className="coin-pill">
          <span>🐾</span>
          {save.coins}
        </div>
      </header>
      <section className={`capsule-machine ${reward ? 'capsule-machine--open' : ''}`}>
        {reward ? (
          <div className="reveal-card" aria-live="polite">
            <span className="reveal-burst" aria-hidden="true">
              ✦
            </span>
            <img src={`${import.meta.env.BASE_URL}${reward.image}`} alt={reward.altText} />
            <span className={`rarity rarity--${reward.rarity}`}>{reward.rarity}</span>
            <h2>You found {reward.name}!</h2>
            {reward.kind === 'guest' && <span className="guest-badge">Special Guest</span>}
            <p>{reward.description}</p>
            <button className="primary-button" type="button" onClick={onGallery}>
              View collection
            </button>
          </div>
        ) : (
          <>
            <div className="capsule-orb" aria-hidden="true">
              <span>?</span>
            </div>
            <h2>{complete ? 'Collection complete!' : 'A new friend is waiting'}</h2>
            <p>
              {complete
                ? 'You have discovered every companion in this collection.'
                : `Every capsule contains someone new. One capsule costs ${CAPSULE_COST} Paw Coins.`}
            </p>
            <button
              className="primary-button"
              type="button"
              onClick={onOpen}
              disabled={save.coins < CAPSULE_COST || complete}
            >
              {save.coins < CAPSULE_COST && !complete
                ? `Need ${CAPSULE_COST - save.coins} more coins`
                : 'Open capsule'}
            </button>
          </>
        )}
      </section>
    </main>
  );
}

function Gallery({
  save,
  onEquip,
  onBack,
}: {
  save: SaveData;
  onEquip: (id: string) => void;
  onBack: () => void;
}) {
  const [filter, setFilter] = useState<'all' | 'cat' | 'guest'>('all');
  const visible = catalog.collectibles.filter((item) => filter === 'all' || item.kind === filter);
  return (
    <main className="page-shell gallery-page">
      <header className="page-header">
        <button className="icon-button" type="button" onClick={onBack} aria-label="Back">
          ←
        </button>
        <div>
          <span className="eyebrow">Your discoveries</span>
          <h1>Companion Collection</h1>
          <p>
            {save.ownedCollectibleIds.length} of {catalog.collectibles.length} found
          </p>
        </div>
      </header>
      <div className="filter-row" aria-label="Collection filters">
        {(['all', 'cat', 'guest'] as const).map((value) => (
          <button
            key={value}
            type="button"
            className={`choice-chip ${filter === value ? 'choice-chip--selected' : ''}`}
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
          >
            {value === 'all' ? 'All' : value === 'cat' ? 'Cats' : 'Guests'}
          </button>
        ))}
      </div>
      <div className="collection-grid">
        {visible.map((item) => {
          const owned = save.ownedCollectibleIds.includes(item.id);
          return (
            <CollectibleCard
              key={item.id}
              collectible={item}
              owned={owned}
              equipped={save.equippedCollectibleId === item.id}
              onSelect={owned ? () => onEquip(item.id) : undefined}
            />
          );
        })}
      </div>
    </main>
  );
}

export default function App() {
  const showStateGallery =
    import.meta.env.DEV && new URLSearchParams(location.search).get('dev') === 'states';
  const [save, setSave] = useState<SaveData | null | undefined>(undefined);
  const [screen, setScreen] = useState<Screen>('home');
  const [game, setGame] = useState<ActiveGame | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [previousSessions, setPreviousSessions] = useState<SessionSummary[]>([]);
  const [capsuleReward, setCapsuleReward] = useState<CollectibleDefinition | null | undefined>(
    undefined,
  );
  const transitionTimer = useRef<number | null>(null);

  useEffect(() => {
    void repository.load().then((loaded) => {
      setSave(loaded);
      setScreen(loaded ? 'home' : 'onboarding');
    });
    return () => {
      if (transitionTimer.current !== null) window.clearTimeout(transitionTimer.current);
    };
  }, []);

  useEffect(() => {
    if (screen !== 'play' || !game) return;
    const interval = window.setInterval(() => setElapsed(performance.now() - game.startedAt), 100);
    return () => window.clearInterval(interval);
  }, [game, screen]);

  const commitSave = useCallback((next: SaveData) => {
    setSave(next);
    void repository.save(next);
  }, []);

  const startGame = useCallback(() => {
    if (!save) return;
    const seed = createRandomSeed();
    const now = performance.now();
    setGame({
      seed,
      problems: generateSession(save.settings, new SeededRandom(seed)),
      index: 0,
      answers: [],
      questionStartedAt: now,
      startedAt: now,
      feedback: null,
      previous: null,
    });
    setElapsed(0);
    setSummary(null);
    setCapsuleReward(undefined);
    setScreen('play');
  }, [save]);

  const chooseAnswer = useCallback(
    (selectedAnswer: number) => {
      if (!game || !save || game.feedback) return;
      const problem = game.problems[game.index];
      if (!problem) return;
      const answer: AnswerRecord = {
        problemId: problem.id,
        skillKey: problem.skillKey,
        operation: problem.operation,
        left: problem.left,
        right: problem.right,
        choices: [...problem.choices],
        correctChoiceIndex: problem.correctChoiceIndex,
        selectedAnswer,
        correctAnswer: problem.correctAnswer,
        correct: selectedAnswer === problem.correctAnswer,
        responseMs: Math.max(0, performance.now() - game.questionStartedAt),
      };
      const nextAnswers = [...game.answers, answer];
      setGame({
        ...game,
        answers: nextAnswers,
        feedback: { selected: selectedAnswer, correct: answer.correct },
      });
      transitionTimer.current = window.setTimeout(() => {
        if (game.index === game.problems.length - 1) {
          const nextSummary = summarizeSession(
            game.problems,
            nextAnswers,
            save.settings,
            game.seed,
            clock,
          );
          const comparable = save.sessions.filter(
            (session) => JSON.stringify(session.settings) === JSON.stringify(nextSummary.settings),
          );
          const nextSave = applyCompletedSession(save, nextSummary, clock.today());
          const storedSummary = nextSave.sessions.at(-1) ?? nextSummary;
          commitSave(nextSave);
          setPreviousSessions(comparable);
          setSummary(storedSummary);
          setGame(null);
          setScreen('results');
        } else {
          setGame({
            ...game,
            index: game.index + 1,
            answers: nextAnswers,
            questionStartedAt: performance.now(),
            feedback: null,
            previous: { answer, prompt: formatProblem(problem) },
          });
        }
      }, answerFeedbackDelay(answer.correct));
    },
    [commitSave, game, save],
  );

  useEffect(() => {
    if (screen !== 'play' || !game || game.feedback) return;
    const handleKey = (event: KeyboardEvent) => {
      const index = Number(event.key) - 1;
      const choice = game.problems[game.index]?.choices[index];
      if (choice !== undefined) chooseAnswer(choice);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [chooseAnswer, game, screen]);

  if (showStateGallery) return <StateGallery />;
  if (save === undefined)
    return (
      <main className="loading-screen">
        <div className="loading-paw">🐾</div>
        <p>Opening Number Nook…</p>
      </main>
    );
  if (!save || screen === 'onboarding')
    return (
      <Onboarding
        onComplete={(name, starterId) => {
          const next = createInitialSave(name, starterId);
          commitSave(next);
          setScreen('home');
        }}
      />
    );

  if (screen === 'setup')
    return (
      <Setup
        settings={save.settings}
        onChange={(settings) => commitSave(updateSettings(save, settings))}
        onBack={() => setScreen('home')}
        onStart={startGame}
      />
    );
  if (screen === 'play' && game)
    return (
      <Play
        game={game}
        elapsed={elapsed}
        onAnswer={chooseAnswer}
        onExit={() => {
          setGame(null);
          setScreen('home');
        }}
      />
    );
  if (screen === 'results' && summary)
    return (
      <Results
        summary={summary}
        previous={previousSessions}
        onReplay={startGame}
        onHome={() => setScreen('home')}
        dailyRemaining={dailyCoinsRemaining(save, clock.today())}
        onCapsule={() => {
          setCapsuleReward(undefined);
          setScreen('capsule');
        }}
      />
    );
  if (screen === 'history') return <History save={save} onBack={() => setScreen('home')} />;
  if (screen === 'capsule')
    return (
      <Capsule
        save={save}
        reward={capsuleReward}
        onOpen={() => {
          if (save.coins < CAPSULE_COST) return;
          const reward = chooseCapsuleReward(
            catalog.collectibles,
            save.ownedCollectibleIds,
            new SeededRandom(createRandomSeed()),
          );
          if (!reward) {
            setCapsuleReward(null);
            return;
          }
          const next = {
            ...save,
            coins: save.coins - CAPSULE_COST,
            ownedCollectibleIds: [...save.ownedCollectibleIds, reward.id],
            economyEvents: [
              ...save.economyEvents,
              {
                id: `capsule:${clock.now()}:${reward.id}`,
                occurredAt: new Date(clock.now()).toISOString(),
                type: 'capsule_opened' as const,
                coinsSpent: CAPSULE_COST,
                collectibleId: reward.id,
              },
            ].slice(-500),
          };
          commitSave(next);
          setCapsuleReward(reward);
        }}
        onGallery={() => setScreen('gallery')}
        onBack={() => setScreen(summary ? 'results' : 'home')}
      />
    );
  if (screen === 'gallery')
    return (
      <Gallery
        save={save}
        onEquip={(id) => commitSave({ ...save, equippedCollectibleId: id })}
        onBack={() => setScreen('home')}
      />
    );
  return (
    <Home
      save={save}
      onPlay={startGame}
      onSetup={() => setScreen('setup')}
      onGallery={() => setScreen('gallery')}
      onHistory={() => setScreen('history')}
      onCapsule={() => {
        setSummary(null);
        setCapsuleReward(undefined);
        setScreen('capsule');
      }}
    />
  );
}
