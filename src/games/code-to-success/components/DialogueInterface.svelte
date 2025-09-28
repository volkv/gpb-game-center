<script lang="ts">
  import type { NovellaGameState, Scene, DialogueStep } from '../types';
  import { SpeakerType, ContinueAction } from '../types';
  import { scenes } from '../data/scenario';

  interface Props {
    gameState: NovellaGameState;
    onStateUpdate: (state: NovellaGameState) => void;
    onDialogueComplete: () => void;
  }

  let { gameState, onStateUpdate, onDialogueComplete }: Props = $props();

  let currentScene = $state<Scene | undefined>(undefined);
  let currentDialogueStep = $state<DialogueStep | null>(null);
  let currentDialogueIndex = $state(0);
  let backgroundImage = $state('');
  let characterImage = $state('');
  let speakerName = $state('');
  let isNarrator = $state(false);

  $effect(() => {
    currentScene = scenes.find(scene => scene.id === gameState.currentSceneId);
  });

  $effect(() => {
    if (!currentScene || !currentScene.dialogueSteps || !gameState.currentDialogueStepId) {
      currentDialogueStep = null;
      currentDialogueIndex = 0;
    } else {
      currentDialogueStep =
        currentScene.dialogueSteps.find(step => step.id === gameState.currentDialogueStepId) ?? null;
      currentDialogueIndex = currentScene.dialogueSteps.findIndex(step => step.id === gameState.currentDialogueStepId);
    }
  });

  $effect(() => {
    backgroundImage = currentDialogueStep?.backgroundImage || currentScene?.backgroundImage || '';
    characterImage = currentDialogueStep?.characterImage || '';
    isNarrator = currentDialogueStep?.speaker === SpeakerType.NARRATOR;

    if (!currentDialogueStep) {
      speakerName = '';
      return;
    }

    switch (currentDialogueStep.speaker) {
      case SpeakerType.ANNA:
        speakerName = 'Анна';
        break;
      case SpeakerType.MIKHAIL:
        speakerName = 'Михаил';
        break;
      case SpeakerType.FRAUDSTER:
        speakerName = 'Звонящий';
        break;
      case SpeakerType.PHONE:
        speakerName = 'Телефон';
        break;
      case SpeakerType.NARRATOR:
      default:
        speakerName = '';
        break;
    }
  });

  const continueToNextDialogue = () => {
    const activeScene = currentScene;
    const activeStep = currentDialogueStep;

    if (!activeStep || !activeScene) return;

    if (activeStep.nextStepId) {
      const updatedState = {
        ...gameState,
        currentDialogueStepId: activeStep.nextStepId
      };
      onStateUpdate(updatedState);
    } else if (activeStep.choiceId) {
      onDialogueComplete();
    } else if (activeScene.nextSceneId) {
      const nextScene = scenes.find(scene => scene.id === activeScene.nextSceneId);
      if (nextScene && nextScene.dialogueSteps && nextScene.dialogueSteps.length > 0) {
        const updatedScenes = gameState.visitedScenes.includes(activeScene.id)
          ? gameState.visitedScenes
          : [...gameState.visitedScenes, activeScene.id];

        const updatedState = {
          ...gameState,
          currentSceneId: nextScene.id,
          currentDialogueStepId: nextScene.dialogueSteps[0].id,
          visitedScenes: updatedScenes
        };
        onStateUpdate(updatedState);
      } else {
        onDialogueComplete();
      }
    } else if (activeScene.choices && activeScene.choices.length > 0) {
      onDialogueComplete();
    } else {
      onDialogueComplete();
    }
  };

  const handleScreenTap = () => {
    if (currentDialogueStep?.continueAction === ContinueAction.TAP) {
      continueToNextDialogue();
    }
  };

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleScreenTap();
    }
  };

  $effect(() => {
    if (!gameState.currentDialogueStepId && currentScene?.dialogueSteps?.length) {
      const firstStep = currentScene.dialogueSteps[0];
      const updatedState = {
        ...gameState,
        currentDialogueStepId: firstStep.id
      };
      onStateUpdate(updatedState);
    }
  });
</script>

<div
  class="dialogue-interface"
  role="button"
  tabindex="0"
  onclick={handleScreenTap}
  onkeydown={handleKeydown}
  aria-label="Нажмите для продолжения диалога"
>
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

  {#if characterImage}
    <div class="character-container">
      <img
        src={characterImage}
        alt={speakerName}
        class="character-image"
        onerror={(event) => {
          const image = event.currentTarget as HTMLImageElement;
          image.style.display = 'none';
        }}
      />
    </div>
  {/if}

  {#if currentDialogueStep}
    <div class="dialogue-window" class:dialogue-window--narrator={isNarrator}>
      {#if !isNarrator && speakerName}
        <div class="dialogue-speaker">
          {speakerName}
        </div>
      {/if}

      <div class="dialogue-text" class:dialogue-text--narrator={isNarrator}>
        {currentDialogueStep.text}
      </div>

      <div class="dialogue-continue">
        <div class="dialogue-continue-hint">
          Нажмите для продолжения
        </div>
      </div>
    </div>
  {/if}

  <div class="progress-indicator">
    {#if currentScene && currentScene.dialogueSteps}
      <div class="progress-dots">
        {#each currentScene.dialogueSteps as step, index}
          <div
            class="progress-dot"
            class:progress-dot--active={index === currentDialogueIndex}
            class:progress-dot--completed={index < currentDialogueIndex}
          ></div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .dialogue-interface {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 100%;
    display: flex;
    flex-direction: column;
    cursor: pointer;
    user-select: none;
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
  }

  .character-container {
    position: absolute;
    right: 2rem;
    top: 50%;
    transform: translateY(-50%);
    z-index: 2;
    max-width: 300px;
    max-height: 400px;
    animation: characterFadeIn 0.6s ease-out;
  }

  .character-image {
    width: 100%;
    height: auto;
    object-fit: contain;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-medium);
  }

  .dialogue-window {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 3;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.96) 0%,
      rgba(255, 255, 255, 0.98) 100%
    );
    backdrop-filter: blur(16px);
    border-top-left-radius: var(--radius-xl);
    border-top-right-radius: var(--radius-xl);
    padding: 2rem 1.5rem 1.5rem;
    box-shadow: var(--shadow-hard);
    border-top: 2px solid var(--color-border-subtle);
    animation: dialogueFadeIn 0.4s ease-out;
  }

  .dialogue-window--narrator {
    background: var(--gradient-brand-soft);
    border-top-color: var(--color-accent-300);
  }

  .dialogue-speaker {
    font-family: var(--font-heading);
    font-size: 1rem;
    font-weight: 700;
    color: var(--color-brand-600);
    margin: 0 0 0.75rem 0;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .dialogue-text {
    font-family: var(--font-body);
    font-size: 1.125rem;
    line-height: 1.6;
    color: var(--color-fg-primary);
    margin: 0 0 1rem 0;
    min-height: 3rem;
  }

  .dialogue-text--narrator {
    color: var(--color-fg-inverse);
    font-style: italic;
    text-align: center;
    font-size: 1rem;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  .dialogue-continue {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .dialogue-continue-hint {
    font-family: var(--font-body);
    font-size: 0.875rem;
    color: var(--color-fg-muted);
    opacity: 0.7;
    animation: pulse 2s infinite;
  }

  .dialogue-window--narrator .dialogue-continue-hint {
    color: var(--color-accent-200);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  .progress-indicator {
    position: absolute;
    top: 2rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 4;
  }

  .progress-dots {
    display: flex;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(8px);
    border-radius: var(--radius-full);
    box-shadow: var(--shadow-soft);
  }

  .progress-dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: var(--radius-full);
    background: var(--color-neutral-300);
    transition: all 0.3s ease;
  }

  .progress-dot--active {
    background: var(--color-brand-500);
    transform: scale(1.2);
  }

  .progress-dot--completed {
    background: var(--color-accent-500);
  }

  @keyframes characterFadeIn {
    from {
      opacity: 0;
      transform: translateY(-50%) translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateY(-50%) translateX(0);
    }
  }

  @keyframes dialogueFadeIn {
    from {
      opacity: 0;
      transform: translateY(100%);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 0.7;
    }
    50% {
      opacity: 1;
    }
  }



</style>
