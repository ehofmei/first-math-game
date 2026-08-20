import { useMemo, useState, type CSSProperties } from 'react';
import {
  getEligibleDialoguePhrases,
  rememberDialoguePhrase,
  selectCompanionDialogue,
} from '../companions/engine';
import { DIALOGUE_PHRASES } from '../companions/phrases';
import { getCompanionPersonality } from '../companions/personalities';
import {
  COMPANION_MOTIFS,
  DIALOGUE_CONTEXTS,
  MOTION_PROFILES,
  type CompanionMotif,
  type DialogueContext,
  type DialoguePhrase,
  type DialogueRequest,
  type MotionProfile,
  type ResultDialogueFacts,
  type SelectedDialogue,
} from '../companions/types';
import { catalog, getCollectibleImage, getCollection } from '../content/catalog';
import { companionThemeCssVariables } from '../content/theme';
import type { ArtStyle, CollectibleDefinition } from '../content/schema';
import { SeededRandom } from '../domain/random';

type PreviewWidth = 'phone' | 'tablet' | 'wide';

interface ResultControls {
  accuracy: number;
  firstRound: boolean;
  perfect: boolean;
  personalBest: boolean;
  accuracyImproved: boolean;
  paceImproved: boolean;
}

interface DrawDiagnostics {
  draws: number;
  uniquePhrases: number;
  consecutiveDuplicates: number;
  unresolvedTemplates: number;
  sourceCounts: Record<SelectedDialogue['source'], number>;
  conditionCounts: Record<string, number>;
  frequencies: readonly { id: string; count: number; text: string }[];
}

const companions = [...catalog.collectibles].sort((left, right) => {
  const leftCollection = getCollection(left.collectionId)?.sortOrder ?? 0;
  const rightCollection = getCollection(right.collectionId)?.sortOrder ?? 0;
  return leftCollection - rightCollection || left.sortOrder - right.sortOrder;
});

const DEFAULT_RESULT_CONTROLS: ResultControls = {
  accuracy: 0.8,
  firstRound: false,
  perfect: false,
  personalBest: false,
  accuracyImproved: false,
  paceImproved: false,
};

const CONTEXT_LABELS: Readonly<Record<DialogueContext, string>> = {
  home: 'Home',
  setup: 'Game setup',
  results: 'Round results',
  capsule: 'Companion Capsule',
  equip: 'Equip confirmation',
  progress: 'Play History',
};

const CONTEXT_HEADINGS: Readonly<Record<DialogueContext, string>> = {
  home: 'Welcome back',
  setup: 'Choose your challenge',
  results: 'Round complete!',
  capsule: 'A mystery is waiting',
  equip: 'By your side',
  progress: 'Your practice is adding up',
};

const OPERATION_OPTIONS = [
  { value: 'addition', label: 'Addition' },
  { value: 'subtraction', label: 'Subtraction' },
  { value: 'multiplication', label: 'Multiplication' },
  { value: 'division', label: 'Division' },
  { value: 'mixed', label: 'Mixed operations' },
  { value: 'none', label: 'No operation fact' },
] as const;

const phraseById = new Map<string, DialoguePhrase>(
  DIALOGUE_PHRASES.map((phrase) => [phrase.id, phrase]),
);

function emptyRecentQueues(): Record<DialogueContext, string[]> {
  return DIALOGUE_CONTEXTS.reduce(
    (queues, context) => ({ ...queues, [context]: [] }),
    {} as Record<DialogueContext, string[]>,
  );
}

function resultFacts(controls: ResultControls, operation: string): ResultDialogueFacts {
  const operationLabels =
    operation === 'mixed'
      ? ['addition', 'subtraction', 'multiplication', 'division']
      : operation === 'none'
        ? []
        : [operation];
  return {
    ...controls,
    completedQuestions: 20,
    operationLabels,
  };
}

function buildRequest(
  companion: CollectibleDefinition,
  context: DialogueContext,
  controls: ResultControls,
  operation: string,
  recentPhraseIds: readonly string[],
  seed: number,
): DialogueRequest {
  return {
    companionId: companion.id,
    companionName: companion.name,
    context,
    facts: {
      operationLabel: operation === 'mixed' || operation === 'none' ? undefined : operation,
      result: resultFacts(controls, operation),
    },
    recentPhraseIds,
    random: new SeededRandom(seed),
  };
}

function conditionCategory(phrase: DialoguePhrase | undefined): string {
  const condition = phrase?.condition;
  if (!condition) return 'general';
  if (condition.firstRound) return 'first round';
  if (condition.perfect) return 'perfect';
  if (condition.personalBest) return 'personal best';
  if (condition.accuracyImproved) return 'accuracy improved';
  if (condition.paceImproved) return 'pace improved';
  if (condition.minimumAccuracy !== undefined) return 'accuracy threshold';
  return 'general';
}

function drawSample(
  companion: CollectibleDefinition,
  context: DialogueContext,
  controls: ResultControls,
  operation: string,
  seed: number,
  draws = 50,
): DrawDiagnostics {
  let recent: string[] = [];
  let previousId: string | undefined;
  let consecutiveDuplicates = 0;
  let unresolvedTemplates = 0;
  const frequencies = new Map<string, { count: number; text: string }>();
  const sourceCounts: Record<SelectedDialogue['source'], number> = {
    global: 0,
    voice: 0,
    signature: 0,
  };
  const conditionCounts: Record<string, number> = {};

  for (let index = 0; index < draws; index += 1) {
    const selection = selectCompanionDialogue(
      buildRequest(companion, context, controls, operation, recent, seed + index),
    );
    if (selection.id === previousId) consecutiveDuplicates += 1;
    if (/\{[^}]+\}/.test(selection.text)) unresolvedTemplates += 1;
    const current = frequencies.get(selection.id);
    frequencies.set(selection.id, {
      count: (current?.count ?? 0) + 1,
      text: selection.text,
    });
    sourceCounts[selection.source] += 1;
    const category = conditionCategory(phraseById.get(selection.id));
    conditionCounts[category] = (conditionCounts[category] ?? 0) + 1;
    recent = rememberDialoguePhrase(recent, selection.id);
    previousId = selection.id;
  }

  return {
    draws,
    uniquePhrases: frequencies.size,
    consecutiveDuplicates,
    unresolvedTemplates,
    sourceCounts,
    conditionCounts,
    frequencies: [...frequencies.entries()]
      .map(([id, value]) => ({ id, ...value }))
      .sort((left, right) => right.count - left.count || left.id.localeCompare(right.id)),
  };
}

function contextDescription(context: DialogueContext): string {
  switch (context) {
    case 'home':
      return 'A welcoming message for a return visit.';
    case 'setup':
      return 'A calm prompt before choosing round settings.';
    case 'results':
      return 'A truthful response to the selected result facts.';
    case 'capsule':
      return 'A curious line beside the unopened capsule.';
    case 'equip':
      return 'A friendly introduction after changing companions.';
    case 'progress':
      return 'A reflective message beside practice history.';
  }
}

export function CompanionLab() {
  const [companionId, setCompanionId] = useState(companions[0]!.id);
  const [context, setContext] = useState<DialogueContext>('home');
  const [operation, setOperation] = useState('addition');
  const [controls, setControls] = useState(DEFAULT_RESULT_CONTROLS);
  const [artStyle, setArtStyle] = useState<ArtStyle>('sticker');
  const selectedCompanion = useMemo(
    () => companions.find(({ id }) => id === companionId) ?? companions[0]!,
    [companionId],
  );
  const personality = getCompanionPersonality(selectedCompanion.id)!;
  const [motion, setMotion] = useState<MotionProfile>(personality.motion);
  const [motif, setMotif] = useState<CompanionMotif>(personality.motif);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [previewWidth, setPreviewWidth] = useState<PreviewWidth>('wide');
  const [seed, setSeed] = useState(2_026_081_9);
  const [recentByContext, setRecentByContext] = useState(emptyRecentQueues);
  const [diagnostics, setDiagnostics] = useState<DrawDiagnostics | null>(null);
  const [copyStatus, setCopyStatus] = useState('Nothing copied yet.');

  const recentPhraseIds = recentByContext[context];
  const request = useMemo(
    () => buildRequest(selectedCompanion, context, controls, operation, recentPhraseIds, seed),
    [selectedCompanion, context, controls, operation, recentPhraseIds, seed],
  );
  const selection = useMemo(() => selectCompanionDialogue(request), [request]);
  const eligibleCount = useMemo(() => getEligibleDialoguePhrases(request).length, [request]);
  const selectedPhrase = phraseById.get(selection.id);
  const themeStyle = companionThemeCssVariables(selectedCompanion.theme) as CSSProperties;
  const image = `${import.meta.env.BASE_URL}${getCollectibleImage(selectedCompanion, artStyle)}`;

  const chooseCompanion = (nextId: string) => {
    const nextCompanion = companions.find(({ id }) => id === nextId) ?? companions[0]!;
    const nextPersonality = getCompanionPersonality(nextCompanion.id)!;
    setCompanionId(nextCompanion.id);
    setMotion(nextPersonality.motion);
    setMotif(nextPersonality.motif);
    setDiagnostics(null);
  };

  const nextPhrase = () => {
    setRecentByContext((current) => ({
      ...current,
      [context]: rememberDialoguePhrase(current[context], selection.id),
    }));
    setSeed((current) => current + 1);
    setDiagnostics(null);
  };

  const clearRecent = () => {
    setRecentByContext((current) => ({ ...current, [context]: [] }));
    setCopyStatus(`Cleared the ${CONTEXT_LABELS[context]} recent queue.`);
  };

  const runDrawSample = () => {
    setDiagnostics(drawSample(selectedCompanion, context, controls, operation, seed, 50));
  };

  const snapshot = useMemo(
    () =>
      JSON.stringify(
        {
          request: {
            companionId: selectedCompanion.id,
            companionName: selectedCompanion.name,
            context,
            facts: request.facts,
            recentPhraseIds,
            seed,
          },
          presentation: {
            artStyle,
            motion,
            motif,
            reducedMotion,
            previewWidth,
            largeText,
          },
          output: selection,
          eligiblePhraseCount: eligibleCount,
          diagnostics,
        },
        null,
        2,
      ),
    [
      selectedCompanion,
      context,
      request.facts,
      recentPhraseIds,
      seed,
      artStyle,
      motion,
      motif,
      reducedMotion,
      previewWidth,
      largeText,
      selection,
      eligibleCount,
      diagnostics,
    ],
  );

  const copySnapshot = async () => {
    try {
      await navigator.clipboard.writeText(snapshot);
      setCopyStatus('Copied the exact request, presentation settings, and output JSON.');
    } catch {
      setCopyStatus('Clipboard access was blocked. Expand the JSON and copy it manually.');
    }
  };

  return (
    <main className="state-gallery companion-lab page-shell">
      <header className="page-header">
        <div>
          <span className="eyebrow">Development only</span>
          <h1>Number Nook Companion Lab</h1>
          <p>
            Stress-test personality, dialogue, repetition, and motion without reading or changing
            player progress.
          </p>
          <nav className="lab-links" aria-label="Development labs">
            <a href="?dev=states">State gallery</a>
            <a href="?dev=sounds">Sound Lab</a>
            <a href="?dev=art">Art Lab</a>
            <a href="?dev=themes">Theme Lab</a>
            <a href={import.meta.env.BASE_URL}>Playable app</a>
          </nav>
        </div>
      </header>

      <section className="panel companion-lab-controls" aria-labelledby="dialogue-scenario-heading">
        <div className="art-section-heading">
          <div>
            <span className="eyebrow">Selection request</span>
            <h2 id="dialogue-scenario-heading">Dialogue scenario</h2>
            <p>Every change produces a deterministic preview from the displayed seed.</p>
          </div>
          <span className="mode-pill">{eligibleCount} eligible lines</span>
        </div>

        <div className="companion-lab-field-grid">
          <label className="sound-field" htmlFor="companion-lab-companion">
            <span>Companion</span>
            <select
              id="companion-lab-companion"
              value={selectedCompanion.id}
              onChange={(event) => chooseCompanion(event.currentTarget.value)}
            >
              {companions.map((companion) => (
                <option key={companion.id} value={companion.id}>
                  {companion.name} · {getCollection(companion.collectionId)?.name}
                </option>
              ))}
            </select>
          </label>

          <label className="sound-field" htmlFor="companion-lab-context">
            <span>Dialogue context</span>
            <select
              id="companion-lab-context"
              value={context}
              onChange={(event) => {
                setContext(event.currentTarget.value as DialogueContext);
                setDiagnostics(null);
              }}
            >
              {DIALOGUE_CONTEXTS.map((value) => (
                <option key={value} value={value}>
                  {CONTEXT_LABELS[value]}
                </option>
              ))}
            </select>
          </label>

          <label className="sound-field" htmlFor="companion-lab-operation">
            <span>Operation fact</span>
            <select
              id="companion-lab-operation"
              value={operation}
              onChange={(event) => {
                setOperation(event.currentTarget.value);
                setDiagnostics(null);
              }}
            >
              {OPERATION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="sound-field" htmlFor="companion-lab-seed">
            <span>Random seed</span>
            <input
              id="companion-lab-seed"
              type="number"
              step="1"
              value={seed}
              onChange={(event) => {
                setSeed(Number(event.currentTarget.value) || 1);
                setDiagnostics(null);
              }}
            />
          </label>
        </div>

        <fieldset className="companion-lab-facts" disabled={context !== 'results'}>
          <legend>Round-result facts</legend>
          <label className="companion-lab-accuracy" htmlFor="companion-lab-accuracy">
            <span>Accuracy</span>
            <input
              id="companion-lab-accuracy"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={controls.accuracy}
              onChange={(event) => {
                const accuracy = Number(event.currentTarget.value);
                setControls((current) => ({
                  ...current,
                  accuracy,
                  perfect: accuracy === 1 ? current.perfect : false,
                }));
                setDiagnostics(null);
              }}
            />
            <output>{Math.round(controls.accuracy * 100)}%</output>
          </label>
          <div className="companion-lab-checks">
            {(
              [
                ['firstRound', 'First round'],
                ['perfect', 'Perfect round'],
                ['personalBest', 'Personal best'],
                ['accuracyImproved', 'Accuracy improved'],
                ['paceImproved', 'Pace improved'],
              ] as const
            ).map(([key, label]) => (
              <label key={key}>
                <input
                  type="checkbox"
                  checked={controls[key]}
                  onChange={(event) => {
                    const checked = event.currentTarget.checked;
                    setControls((current) => ({
                      ...current,
                      [key]: checked,
                      ...(key === 'perfect' && checked ? { accuracy: 1 } : {}),
                    }));
                    setDiagnostics(null);
                  }}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      <section className="panel companion-lab-controls" aria-labelledby="presentation-heading">
        <div className="art-section-heading">
          <div>
            <span className="eyebrow">Visual experiment</span>
            <h2 id="presentation-heading">Presentation controls</h2>
            <p>Overrides affect only this preview. Choosing a companion restores its defaults.</p>
          </div>
        </div>
        <div className="companion-lab-field-grid">
          <label className="sound-field" htmlFor="companion-lab-art">
            <span>Art style</span>
            <select
              id="companion-lab-art"
              value={artStyle}
              onChange={(event) => setArtStyle(event.currentTarget.value as ArtStyle)}
            >
              <option value="sticker">Polished Sticker</option>
              <option value="classic">Simple SVG</option>
            </select>
          </label>
          <label className="sound-field" htmlFor="companion-lab-motion">
            <span>Motion profile</span>
            <select
              id="companion-lab-motion"
              value={motion}
              onChange={(event) => setMotion(event.currentTarget.value as MotionProfile)}
            >
              {MOTION_PROFILES.map((profile) => (
                <option key={profile} value={profile}>
                  {profile}
                </option>
              ))}
            </select>
          </label>
          <label className="sound-field" htmlFor="companion-lab-motif">
            <span>Decorative motif</span>
            <select
              id="companion-lab-motif"
              value={motif}
              onChange={(event) => setMotif(event.currentTarget.value as CompanionMotif)}
            >
              {COMPANION_MOTIFS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="sound-field" htmlFor="companion-lab-width">
            <span>Preview width</span>
            <select
              id="companion-lab-width"
              value={previewWidth}
              onChange={(event) => setPreviewWidth(event.currentTarget.value as PreviewWidth)}
            >
              <option value="phone">Phone · 390 px</option>
              <option value="tablet">Tablet · 768 px</option>
              <option value="wide">Wide · 100%</option>
            </select>
          </label>
        </div>
        <div className="companion-lab-checks companion-lab-checks--presentation">
          <label>
            <input
              type="checkbox"
              checked={reducedMotion}
              onChange={(event) => setReducedMotion(event.currentTarget.checked)}
            />
            <span>Simulate reduced motion</span>
          </label>
          <label>
            <input
              type="checkbox"
              checked={largeText}
              onChange={(event) => setLargeText(event.currentTarget.checked)}
            />
            <span>Large-text stress test</span>
          </label>
        </div>
      </section>

      <section className="panel companion-lab-stage-panel" aria-labelledby="live-preview-heading">
        <div className="art-section-heading">
          <div>
            <span className="eyebrow">Live rendering</span>
            <h2 id="live-preview-heading">{CONTEXT_LABELS[context]} preview</h2>
            <p>{contextDescription(context)}</p>
          </div>
          <div className="companion-lab-badges">
            <span className="mode-pill">{selection.source}</span>
            <span className="mode-pill">{conditionCategory(selectedPhrase)}</span>
          </div>
        </div>

        <div className="companion-lab-preview-scroll">
          <article
            className={`companion-lab-preview companion-lab-preview--${previewWidth} companion-lab-preview--${context} ${reducedMotion ? 'companion-lab-preview--reduced' : ''} ${largeText ? 'companion-lab-preview--large-text' : ''}`}
            style={themeStyle}
            data-testid="companion-preview"
          >
            <div className="companion-lab-preview__glow" aria-hidden="true" />
            <div className="companion-lab-preview__heading">
              <span className="eyebrow">{CONTEXT_LABELS[context]}</span>
              <h3>{CONTEXT_HEADINGS[context]}</h3>
            </div>
            <div className="companion-dialogue-layout">
              <div
                className={`companion-lab-portrait companion-motion--${motion}`}
                data-motion={motion}
              >
                <span
                  className={`companion-motif companion-motif--${motif}`}
                  data-motif={motif}
                  aria-hidden="true"
                >
                  <i />
                  <i />
                  <i />
                </span>
                <img src={image} alt={selectedCompanion.altText} />
              </div>
              <blockquote className="companion-speech-bubble" data-testid="companion-dialogue">
                <p>{selection.text}</p>
                <footer data-testid="companion-dialogue-name">{selectedCompanion.name}</footer>
              </blockquote>
            </div>
            {context === 'results' && (
              <div className="companion-lab-result-strip">
                <strong>{Math.round(controls.accuracy * 100)}% accuracy</strong>
                <span>20 questions</span>
                <span>Practice complete</span>
              </div>
            )}
          </article>
        </div>

        <div className="companion-lab-actions">
          <button className="primary-button" type="button" onClick={nextPhrase}>
            Next phrase
          </button>
          <button className="secondary-button" type="button" onClick={runDrawSample}>
            Draw 50
          </button>
          <button className="text-button" type="button" onClick={clearRecent}>
            Clear recent queue
          </button>
          <button className="text-button" type="button" onClick={() => void copySnapshot()}>
            Copy request + output JSON
          </button>
        </div>
        <p className="companion-lab-copy-status" role="status">
          {copyStatus}
        </p>

        <div className="companion-lab-meta-grid">
          <article>
            <span>Phrase ID</span>
            <strong data-testid="selected-phrase-id">{selection.id}</strong>
          </article>
          <article>
            <span>Voice profile</span>
            <strong>
              {personality.primaryVoice}
              {personality.secondaryVoice ? ` + ${personality.secondaryVoice}` : ''}
            </strong>
          </article>
          <article>
            <span>Recent queue</span>
            <strong data-testid="recent-count">{recentPhraseIds.length} / 8</strong>
          </article>
        </div>

        <div className="companion-lab-recent" aria-label="Recent phrase IDs">
          {recentPhraseIds.length === 0 ? (
            <span className="companion-lab-empty">No recent lines in this context yet.</span>
          ) : (
            recentPhraseIds.map((id) => <code key={id}>{id}</code>)
          )}
        </div>

        <div className="companion-lab-stress-grid">
          <article>
            <span className="eyebrow">Compact portrait</span>
            <div className="companion-lab-compact">
              <div
                className={`companion-lab-compact__art companion-motion--${motion} ${reducedMotion ? 'companion-motion--reduced' : ''}`}
              >
                <span className={`companion-motif companion-motif--${motif}`} aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                <img src={image} alt="" />
              </div>
              <span>96 px</span>
            </div>
          </article>
          <article>
            <span className="eyebrow">Long-line stress</span>
            <div className="companion-speech-bubble companion-speech-bubble--stress">
              <p>
                {selectedCompanion.name} noticed how carefully you explored every question in this
                challenging round.
              </p>
            </div>
          </article>
        </div>

        <details className="sound-recipe">
          <summary>View request and output JSON</summary>
          <pre>{snapshot}</pre>
        </details>
      </section>

      {diagnostics && (
        <section className="panel companion-lab-diagnostics" aria-labelledby="diagnostics-heading">
          <div className="art-section-heading">
            <div>
              <span className="eyebrow">Deterministic sample</span>
              <h2 id="diagnostics-heading">Draw 50 diagnostics</h2>
              <p>
                Seeds {seed}–{seed + diagnostics.draws - 1}, with an isolated eight-line recent
                queue.
              </p>
            </div>
            <span className="mode-pill">{diagnostics.draws} draws</span>
          </div>

          <div className="companion-lab-diagnostic-cards">
            <article data-testid="diagnostic-unique">
              <span>Unique phrases</span>
              <strong>{diagnostics.uniquePhrases}</strong>
            </article>
            <article data-testid="diagnostic-duplicates">
              <span>Consecutive duplicates</span>
              <strong>{diagnostics.consecutiveDuplicates}</strong>
            </article>
            <article data-testid="diagnostic-unresolved">
              <span>Unresolved templates</span>
              <strong>{diagnostics.unresolvedTemplates}</strong>
            </article>
          </div>

          <div className="companion-lab-summary-grid">
            <article>
              <h3>Source mix</h3>
              <dl>
                {Object.entries(diagnostics.sourceCounts).map(([label, count]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{count}</dd>
                  </div>
                ))}
              </dl>
            </article>
            <article>
              <h3>Condition mix</h3>
              <dl>
                {Object.entries(diagnostics.conditionCounts).map(([label, count]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{count}</dd>
                  </div>
                ))}
              </dl>
            </article>
          </div>

          <div className="companion-lab-frequency-table">
            <table>
              <caption>Phrase frequency</caption>
              <thead>
                <tr>
                  <th scope="col">Phrase</th>
                  <th scope="col">Rendered text</th>
                  <th scope="col">Count</th>
                </tr>
              </thead>
              <tbody>
                {diagnostics.frequencies.map((frequency) => (
                  <tr key={frequency.id}>
                    <th scope="row">{frequency.id}</th>
                    <td>{frequency.text}</td>
                    <td>{frequency.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}
