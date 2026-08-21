import { getCompanionPersonality } from '../companions/personalities';
import type { DialogueContext, SelectedDialogue } from '../companions/types';
import { getCollectibleImage } from '../content/catalog';
import type { ArtStyle, CollectibleDefinition } from '../content/schema';

export type CompanionDialogueVariant = DialogueContext;

export function CompanionDialogue({
  companion,
  artStyle,
  dialogue,
  variant,
  decorativePortrait = false,
}: {
  companion: CollectibleDefinition;
  artStyle: ArtStyle;
  dialogue: SelectedDialogue;
  variant: CompanionDialogueVariant;
  decorativePortrait?: boolean;
}) {
  const personality = getCompanionPersonality(companion.id);
  const motion = personality?.motion ?? 'calm-float';
  const motif = personality?.motif;

  return (
    <div
      className={`player-companion-dialogue player-companion-dialogue--${variant}`}
      data-testid={`player-companion-dialogue-${variant}`}
      data-dialogue-id={dialogue.id}
      data-dialogue-context={dialogue.context}
    >
      <div className={`player-companion-dialogue__portrait companion-motion--${motion}`}>
        {motif && (
          <span className={`companion-motif companion-motif--${motif}`} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        )}
        <img
          src={`${import.meta.env.BASE_URL}${getCollectibleImage(companion, artStyle)}`}
          alt={decorativePortrait ? '' : companion.altText}
        />
      </div>
      <div
        className="player-companion-dialogue__bubble"
        data-testid="player-companion-dialogue-bubble"
        aria-live={variant === 'results' || variant === 'equip' ? 'polite' : undefined}
      >
        <p data-testid="player-companion-dialogue-text">{dialogue.text}</p>
        <span>{companion.name}</span>
      </div>
    </div>
  );
}
