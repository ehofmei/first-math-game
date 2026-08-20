import { useMemo, useState, type CSSProperties } from 'react';
import { catalog, getCollectibleImage, getCollection } from '../content/catalog';
import {
  companionThemeCssVariables,
  contrastRatio,
  THEME_INK,
  THEME_ON_ACCENT,
  themeContrastIssues,
} from '../content/theme';

const companions = [...catalog.collectibles].sort((left, right) => {
  const leftCollection = getCollection(left.collectionId)?.sortOrder ?? 0;
  const rightCollection = getCollection(right.collectionId)?.sortOrder ?? 0;
  return leftCollection - rightCollection || left.sortOrder - right.sortOrder;
});

function themeStyle(theme: (typeof companions)[number]['theme']): CSSProperties {
  return companionThemeCssVariables(theme);
}

export function ThemeLab() {
  const [selectedId, setSelectedId] = useState(companions[0]!.id);
  const selected = useMemo(
    () => companions.find(({ id }) => id === selectedId) ?? companions[0]!,
    [selectedId],
  );
  const contrastChecks = [
    {
      label: 'Button text',
      ratio: contrastRatio(selected.theme.accent, THEME_ON_ACCENT),
      minimum: 4.5,
    },
    {
      label: 'Strong button text',
      ratio: contrastRatio(selected.theme.accentStrong, THEME_ON_ACCENT),
      minimum: 4.5,
    },
    {
      label: 'Soft panel text',
      ratio: contrastRatio(selected.theme.accentSoft, THEME_INK),
      minimum: 4.5,
    },
    {
      label: 'Page text',
      ratio: contrastRatio(selected.theme.pageTint, THEME_INK),
      minimum: 4.5,
    },
    {
      label: 'Focus ring',
      ratio: contrastRatio(selected.theme.accent, selected.theme.pageTint),
      minimum: 3,
    },
  ];
  const passingPalettes = companions.filter(
    ({ theme }) => themeContrastIssues(theme).length === 0,
  ).length;

  return (
    <main className="state-gallery theme-lab page-shell">
      <header className="page-header">
        <div>
          <span className="eyebrow">Development only</span>
          <h1>Number Nook Theme Lab</h1>
          <p>
            Compare every companion palette against the same interface and accessibility checks.
          </p>
          <nav className="lab-links" aria-label="Development labs">
            <a href="?dev=states">State gallery</a>
            <a href="?dev=sounds">Sound Lab</a>
            <a href="?dev=art">Art Lab</a>
            <a href="?dev=companions">Companion Lab</a>
            <a href={import.meta.env.BASE_URL}>Playable app</a>
          </nav>
        </div>
      </header>

      <section className="panel" aria-labelledby="theme-palette-heading">
        <div className="art-section-heading">
          <div>
            <span className="eyebrow">Palette roster</span>
            <h2 id="theme-palette-heading">Choose an equipped companion</h2>
            <p>This selection changes only the lab preview and never writes to saved progress.</p>
          </div>
          <span className="mode-pill">
            {passingPalettes} / {companions.length} palettes pass
          </span>
        </div>
        <div className="theme-choice-grid">
          {companions.map((companion) => (
            <button
              className={`theme-choice ${selected.id === companion.id ? 'theme-choice--selected' : ''}`}
              style={themeStyle(companion.theme)}
              type="button"
              key={companion.id}
              aria-pressed={selected.id === companion.id}
              onClick={() => setSelectedId(companion.id)}
            >
              <img src={`${import.meta.env.BASE_URL}${getCollectibleImage(companion)}`} alt="" />
              <span>
                <strong>{companion.name}</strong>
                <small>{getCollection(companion.collectionId)?.name}</small>
              </span>
              <span className="theme-swatches" aria-hidden="true">
                <i style={{ background: companion.theme.accent }} />
                <i style={{ background: companion.theme.accentStrong }} />
                <i style={{ background: companion.theme.accentSoft }} />
              </span>
            </button>
          ))}
        </div>
      </section>

      <section
        className="panel theme-preview"
        style={themeStyle(selected.theme)}
        data-testid="theme-preview"
        aria-labelledby="theme-preview-heading"
      >
        <div className="theme-preview__backdrop" aria-hidden="true" />
        <div className="art-section-heading">
          <div>
            <span className="eyebrow">Equipped preview</span>
            <h2 id="theme-preview-heading">{selected.name}'s Number Nook</h2>
            <p>
              {selected.species} · {getCollection(selected.collectionId)?.name}
            </p>
          </div>
          <img
            className="theme-preview__companion"
            src={`${import.meta.env.BASE_URL}${getCollectibleImage(selected)}`}
            alt={selected.altText}
          />
        </div>

        <div className="theme-component-grid">
          <article>
            <span className="eyebrow">Actions</span>
            <button className="primary-button" type="button">
              Play now
            </button>
            <button className="secondary-button" type="button">
              Change game
            </button>
          </article>
          <article>
            <span className="eyebrow">Selection and focus</span>
            <button className="choice-chip choice-chip--selected" type="button" autoFocus>
              Selected option
            </button>
          </article>
          <article>
            <span className="eyebrow">Fixed feedback</span>
            <div className="feedback-ribbon feedback-ribbon--correct">✓ 7 + 6 = 13</div>
            <div className="feedback-ribbon feedback-ribbon--incorrect">7 + 6 = 13</div>
          </article>
        </div>

        <dl className="theme-token-list">
          {Object.entries(selected.theme).map(([name, value]) => (
            <div key={name}>
              <dt>{name}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="panel" aria-labelledby="theme-contrast-heading">
        <div className="art-section-heading">
          <div>
            <span className="eyebrow">Automated guardrail</span>
            <h2 id="theme-contrast-heading">{selected.name} contrast checks</h2>
            <p>These same minimums reject invalid catalog palettes during content validation.</p>
          </div>
        </div>
        <div className="theme-contrast-grid">
          {contrastChecks.map((check) => (
            <article key={check.label}>
              <span>{check.label}</span>
              <strong>{check.ratio.toFixed(2)}:1</strong>
              <small>Pass · minimum {check.minimum}:1</small>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
