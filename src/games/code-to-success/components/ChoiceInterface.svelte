<script lang="ts">
import type { NovellaGameState, Choice, ChoiceOption, Scene } from '../types';
  import { scenes } from '../data/scenario';

  interface Props {
    gameState: NovellaGameState;
    onChoiceSelect: (choiceOption: ChoiceOption) => void;
  }

  let { gameState, onChoiceSelect }: Props = $props();

  let currentScene = $state<Scene | undefined>(undefined);
  let currentChoice = $state<Choice | null>(null);
  let backgroundImage = $state('');

  $effect(() => {
    currentScene = scenes.find(scene => scene.id === gameState.currentSceneId);
  });

  $effect(() => {
    if (!currentScene || !currentScene.choices || !gameState.currentDialogueStepId) {
      currentChoice = null;
      return;
    }

    const dialogueStep = currentScene.dialogueSteps.find(
      step => step.id === gameState.currentDialogueStepId
    );

    if (!dialogueStep || !dialogueStep.choiceId) {
      currentChoice = null;
      return;
    }

    currentChoice = currentScene.choices.find(choice => choice.id === dialogueStep.choiceId) ?? null;
  });

  $effect(() => {
    backgroundImage = currentScene?.backgroundImage || '';
  });

  const handleOptionSelect = (option: ChoiceOption) => {
    onChoiceSelect(option);
  };
</script>

<div class="choice-interface">
  {#if backgroundImage}
    <div class="background-container">
      <img
        src={backgroundImage}
        alt="Фон сцены"
        class="background-image"
        onerror={(event) => {
          const image = event.currentTarget as HTMLImageElement;
          image.style.display = 'none';
        }}
      />
    </div>
  {/if}

  {#if currentChoice}
    <div class="choice-content">
      <div class="choice-panel surface-card">
        <div class="choice-panel__header">
          <h2 class="choice-panel__title">{currentChoice.title}</h2>
          <p class="choice-panel__text">{currentChoice.text}</p>
        </div>

        <div class="choice-grid" role="group" aria-label="Выберите вариант действий">
          {#each currentChoice.options as option, index}
            <button
              type="button"
              class="choice-button choice-button--{option.consequence}"
              onclick={() => handleOptionSelect(option)}
              aria-describedby="choice-desc-{option.id}"
            >
              <span class="choice-button__text">{option.text}</span>
              {#if option.description}
                <span class="choice-button__description" id="choice-desc-{option.id}">
                  {option.description}
                </span>
              {/if}
            </button>
          {/each}
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .choice-interface {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 100%;
    display: flex;
    flex-direction: column;
  }


  .background-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
  }

  .background-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    filter: brightness(0.7) blur(1px);
  }

  .choice-content {
    position: relative;
    z-index: 2;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
  }

  .choice-panel {
    width: 100%;
    max-width: 480px;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.97) 0%,
      rgba(255, 255, 255, 0.99) 100%
    );
    backdrop-filter: blur(16px);
    border-radius: var(--radius-xl);
    padding: 2rem 1.5rem;
    box-shadow: var(--shadow-hard);
    border: 2px solid var(--color-border-subtle);
    animation: choicePanelFadeIn 0.6s ease-out;
  }

  .choice-panel__header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .choice-panel__title {
    font-family: var(--font-heading);
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-brand-600);
    margin: 0 0 1rem 0;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  .choice-panel__text {
    font-family: var(--font-body);
    font-size: 1.125rem;
    line-height: 1.6;
    color: var(--color-fg-primary);
    margin: 0;
  }

  .choice-grid {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .choice-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 1.25rem 1.5rem;
    border-radius: var(--radius-lg);
    border: 2px solid var(--color-border-muted);
    background: var(--color-surface-card);
    color: var(--color-fg-primary);
    font-family: var(--font-body);
    cursor: pointer;
    transition: transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease, background-color 200ms ease;
    min-height: 80px;
    text-align: center;
    animation: choiceButtonFadeIn 0.4s ease-out forwards;
    opacity: 0;
  }

  .choice-button:nth-child(1) { animation-delay: 0.1s; }
  .choice-button:nth-child(2) { animation-delay: 0.2s; }
  .choice-button:nth-child(3) { animation-delay: 0.3s; }

  .choice-button:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-medium);
  }

  .choice-button:focus-visible {
    outline: none;
    box-shadow: var(--shadow-focus);
  }

  .choice-button:active {
    transform: translateY(0);
  }

  .choice-button__text {
    font-family: var(--font-heading);
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.4;
  }

  .choice-button__description {
    font-family: var(--font-body);
    font-size: 0.875rem;
    color: var(--color-fg-muted);
    line-height: 1.3;
    max-width: 30ch;
  }

  .choice-button--good {
    border-color: color-mix(in srgb, var(--color-accent-500) 45%, transparent);
    background: color-mix(in srgb, var(--color-accent-500) 8%, var(--color-surface-card));
    color: var(--color-accent-700);
  }

  .choice-button--good:hover {
    border-color: var(--color-accent-500);
    background: color-mix(in srgb, var(--color-accent-500) 15%, var(--color-surface-card));
  }

  .choice-button--bad {
    border-color: color-mix(in srgb, var(--color-state-danger) 45%, transparent);
    background: color-mix(in srgb, var(--color-state-danger) 8%, var(--color-surface-card));
    color: var(--color-state-danger);
  }

  .choice-button--bad:hover {
    border-color: var(--color-state-danger);
    background: color-mix(in srgb, var(--color-state-danger) 15%, var(--color-surface-card));
  }

  .choice-button--neutral {
    border-color: color-mix(in srgb, var(--color-brand-500) 45%, transparent);
    background: color-mix(in srgb, var(--color-brand-500) 8%, var(--color-surface-card));
    color: var(--color-brand-700);
  }

  .choice-button--neutral:hover {
    border-color: var(--color-brand-500);
    background: color-mix(in srgb, var(--color-brand-500) 15%, var(--color-surface-card));
  }

  .choice-button--good .choice-button__description {
    color: color-mix(in srgb, var(--color-accent-600) 80%, var(--color-fg-muted));
  }

  .choice-button--bad .choice-button__description {
    color: color-mix(in srgb, var(--color-state-danger) 80%, var(--color-fg-muted));
  }

  .choice-button--neutral .choice-button__description {
    color: color-mix(in srgb, var(--color-brand-600) 80%, var(--color-fg-muted));
  }

  @keyframes choicePanelFadeIn {
    from {
      opacity: 0;
      transform: translateY(30px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes choiceButtonFadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }



</style>
