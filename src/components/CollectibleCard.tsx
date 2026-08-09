import type { CollectibleDefinition } from '../content/schema';

interface CollectibleCardProps {
  collectible: CollectibleDefinition;
  owned: boolean;
  equipped?: boolean;
  selected?: boolean;
  compact?: boolean;
  onSelect?: () => void;
}

export function CollectibleCard({
  collectible,
  owned,
  equipped = false,
  selected = false,
  compact = false,
  onSelect,
}: CollectibleCardProps) {
  const content = (
    <>
      <div className={`collectible-art ${owned ? '' : 'collectible-art--locked'}`}>
        <img
          src={`${import.meta.env.BASE_URL}${collectible.image}`}
          alt={owned ? collectible.altText : ''}
        />
        {!owned && (
          <span className="lock-mark" aria-hidden="true">
            ?
          </span>
        )}
      </div>
      <div className="collectible-copy">
        <div className="collectible-heading">
          <strong>{owned ? collectible.name : 'Mystery companion'}</strong>
          {collectible.kind === 'guest' && owned && <span className="guest-badge">Guest</span>}
        </div>
        <span className={`rarity rarity--${collectible.rarity}`}>{collectible.rarity}</span>
        {!compact && owned && <p>{collectible.description}</p>}
        {equipped && <span className="equipped-label">By your side</span>}
      </div>
    </>
  );

  if (onSelect) {
    return (
      <button
        className={`collectible-card ${compact ? 'collectible-card--compact' : ''} ${selected ? 'collectible-card--selected' : ''}`}
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        aria-label={`${collectible.name}${equipped ? ', equipped' : ''}`}
      >
        {content}
      </button>
    );
  }

  return (
    <article className={`collectible-card ${compact ? 'collectible-card--compact' : ''}`}>
      {content}
    </article>
  );
}
