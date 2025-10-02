<script lang="ts">
  import { Button } from '$lib';
  import { characters } from '../data/scenario';
  import type { Character } from '../types';

  interface Props {
    onCharacterSelect: (character: Character) => void;
  }

  let { onCharacterSelect }: Props = $props();

  const handleCharacterSelect = (character: Character) => {
    if (!character.isAvailable) return;
    onCharacterSelect(character);
  };

  const handleKeydown = (event: KeyboardEvent, character: Character) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleCharacterSelect(character);
    }
  };
</script>

<div class="character-selection" role="main">
  <div class="character-selection__header">
    <h1 class="character-selection__title" id="character-selection-title">
      Выберите персонажа
    </h1>
    <p class="character-selection__subtitle" aria-describedby="character-selection-title">
      Проживите финансовые вызовы от лица обычных людей
    </p>
  </div>

  <div
    class="character-selection__grid"
    role="radiogroup"
    aria-labelledby="character-selection-title"
    aria-describedby="character-selection-instructions"
  >
    <div id="character-selection-instructions" class="sr-only">
      Выберите персонажа для начала интерактивной истории. Используйте стрелки для навигации и Enter для выбора.
    </div>

    {#each characters.filter(c => c.id !== 'fraudster') as character, index}
      <div
        class="character-card"
        class:character-card--available={character.isAvailable}
        class:character-card--disabled={!character.isAvailable}
        role="radio"
        aria-checked="false"
        aria-disabled={!character.isAvailable}
        tabindex={character.isAvailable ? (index === 0 ? 0 : -1) : -1}
        onclick={() => handleCharacterSelect(character)}
        onkeydown={(e) => handleKeydown(e, character)}
        aria-labelledby="character-name-{character.id}"
        aria-describedby="character-details-{character.id}"
      >
        <div class="character-card__image">
          <img
            src={character.avatar}
            alt=""
            role="presentation"
            onerror={(event) => {
              const image = event.currentTarget as HTMLImageElement;
              image.style.display = 'none';
              const placeholder = image.nextElementSibling as HTMLElement | null;
              if (placeholder) {
                placeholder.style.display = 'flex';
              }
            }}
          />
          <div class="character-card__placeholder" aria-hidden="true">
            <div class="character-card__placeholder-icon">
              {character.name.charAt(0)}
            </div>
          </div>
        </div>

        <div class="character-card__content">
          <h3 class="character-card__name" id="character-name-{character.id}">
            {character.name}
          </h3>
          <p class="character-card__profession">
            {character.profession}, {character.age} лет
          </p>
          <p class="character-card__description" id="character-details-{character.id}">
            {character.description}
          </p>

          {#if character.isAvailable}
            <Button
              variant="primary"
              onclick={() => handleCharacterSelect(character)}
              aria-label="Выбрать персонажа {character.name}"
            >
              Выбрать персонажа
            </Button>
          {:else}
            <Button
              variant="secondary"
              disabled={true}
              aria-label="Персонаж {character.name} пока недоступен"
            >
              Скоро
            </Button>
          {/if}
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .character-selection {
    padding: 1.25rem 1rem;
    max-width: 480px;
    margin: 0 auto;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }


  .character-selection__header {
    text-align: center;
    margin-bottom: 1.5rem;
  }

  .character-selection__title {
    font-family: var(--font-heading);
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-fg-primary);
    margin: 0 0 0.5rem 0;
    line-height: 1.2;
  }

  .character-selection__subtitle {
    font-family: var(--font-body);
    font-size: 0.9rem;
    color: var(--color-fg-secondary);
    line-height: 1.5;
    opacity: 0.9;
    margin: 0;
  }

  .character-selection__grid {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .character-card {
    background: var(--color-surface-card);
    border-radius: var(--radius-lg);
    padding: 1rem;
    box-shadow: var(--shadow-soft);
    transition: all 0.2s ease;
    border: 1px solid var(--color-border-subtle);
    position: relative;
  }

  .character-card--available {
    cursor: pointer;
  }

  .character-card--available:hover,
  .character-card--available:focus-visible {
    transform: translateY(-2px);
    box-shadow: var(--shadow-medium);
    border-color: var(--color-brand-400);
    outline: none;
  }

  .character-card--available:focus-visible {
    border-color: var(--color-accent-500);
    box-shadow: var(--shadow-focus);
  }

  .character-card--disabled {
    opacity: 0.6;
    pointer-events: none;
  }

  .character-card__image {
    position: relative;
    width: 64px;
    height: 64px;
    margin: 0 auto 0.75rem;
    border-radius: var(--radius-full);
    background: var(--color-neutral-100);
    box-shadow: var(--shadow-soft);
  }

  .character-card__image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: opacity 0.2s ease;
    border-radius: 50%;
  }

  .character-card__placeholder {
    display: none;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    align-items: center;
    justify-content: center;
    background: var(--gradient-brand-soft);
    border-radius: var(--radius-full);
  }

  .character-card__placeholder-icon {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--color-fg-inverse);
    font-family: var(--font-heading);
  }

  .character-card__content {
    text-align: center;
  }

  .character-card__name {
    font-family: var(--font-heading);
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--color-fg-primary);
    margin: 0 0 0.25rem 0;
  }

  .character-card__profession {
    font-family: var(--font-body);
    font-size: 0.85rem;
    color: var(--color-brand-600);
    font-weight: 500;
    margin: 0 0 0.5rem 0;
  }

  .character-card__description {
    font-family: var(--font-body);
    font-size: 0.85rem;
    color: var(--color-fg-secondary);
    line-height: 1.5;
    margin: 0 0 1rem 0;
  }



</style>
