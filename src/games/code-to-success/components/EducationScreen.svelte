<script lang="ts">
  import type { NovellaGameState, EducationScreen as EducationScreenData } from '../types';
  import { CompletionPath } from '../types';
  import {
    annaScenes,
    maximScenes,
    goodEducationScreen,
    badEducationScreen,
    maximGoodEducationScreen,
    maximBadEducationScreen
  } from '../data/scenario';

  interface Props {
    gameState: NovellaGameState;
    onRewardClaim: () => void;
    onExit: () => void;
  }

  let { gameState, onRewardClaim, onExit }: Props = $props();

  const isMaximScenario = $derived(gameState.selectedCharacter?.id === 'maxim');

  const educationData = $derived(() => {
    if (isMaximScenario) {
      return gameState.completionPath === CompletionPath.GOOD
        ? maximGoodEducationScreen
        : maximBadEducationScreen;
    }
    return gameState.completionPath === CompletionPath.GOOD
      ? goodEducationScreen
      : badEducationScreen;
  });

  const finalScene = $derived(() => {
    const scenes = isMaximScenario ? maximScenes : annaScenes;
    return scenes.find(scene => scene.id === gameState.currentSceneId);
  });

  const backgroundImage = $derived(finalScene()?.backgroundImage || '');

  const handleRewardClaim = () => {
    onRewardClaim();
  };

  const handleLearnMore = () => {
  };

  const handleExit = () => {
    onExit();
  };

  const handleKeydown = (event: KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  };
</script>

<div class="education-screen" role="main" style="background-image: url({backgroundImage})">
  <div class="education-content">
    <div class="success-badge" role="banner">
      <div class="badge-icon" aria-hidden="true">🛡️</div>
      <h1 class="success-title" id="education-title">
        {educationData().title}
      </h1>
      <div class="sr-only">
        Поздравляем! Вы успешно завершили сценарий и получили образовательную информацию.
      </div>
    </div>

    <div class="summary-section surface-card" role="region" aria-labelledby="summary-heading">
      <h2 class="section-title" id="summary-heading">Что произошло?</h2>
      <p class="summary-text">{educationData().summary}</p>
    </div>

    <div class="decision-section surface-card" role="region" aria-labelledby="decision-heading">
      <h2 class="section-title" id="decision-heading">Правильное решение</h2>
      <p class="decision-text">{educationData().correctDecision}</p>
    </div>

    <div class="reward-section surface-card" role="region" aria-labelledby="reward-heading">
      <div class="reward-info">
        <span class="reward-icon" aria-hidden="true">🏆</span>
        <div class="reward-details">
          <span class="reward-label" id="reward-heading">Заработано очков:</span>
          <span class="reward-points" aria-describedby="reward-heading">
            {gameState.finalScore}
          </span>
        </div>
      </div>
    </div>

    {#if educationData().productIntegration}
      <div
        class="product-section surface-card"
        role="region"
        aria-labelledby="product-heading"
      >
        <h2 class="section-title" id="product-heading">
          {educationData().productIntegration.title}
        </h2>
        <p class="product-description">
          {educationData().productIntegration.description}
        </p>

        <button
          type="button"
          class="btn-secondary learn-more-btn"
          onclick={handleLearnMore}
          onkeydown={(e) => handleKeydown(e, handleLearnMore)}
          disabled={!educationData().productIntegration.isActive}
          aria-describedby="product-heading"
          aria-label={educationData().productIntegration.isActive
            ? `${educationData().productIntegration.buttonText} - узнать больше о продукте`
            : `${educationData().productIntegration.buttonText} - функция пока недоступна`}
        >
          {educationData().productIntegration.buttonText}
        </button>
      </div>
    {/if}

    <div class="action-buttons" role="group" aria-label="Действия по завершению">
      <button
        type="button"
        class="btn-primary claim-btn"
        onclick={handleRewardClaim}
        onkeydown={(e) => handleKeydown(e, handleRewardClaim)}
        aria-label="Забрать награду {gameState.finalScore} очков и завершить игру"
      >
        Забрать награду
      </button>
      <button
        type="button"
        class="btn-outline exit-btn"
        onclick={handleExit}
        onkeydown={(e) => handleKeydown(e, handleExit)}
        aria-label="Выйти из игры и вернуться в игровой центр"
      >
        Вернуться в Игровой Центр
      </button>
    </div>
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

  .education-screen {
    flex: 1;
    background-color: var(--color-neutral-900);
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    padding: 2rem 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow-y: auto;
    position: relative;
  }

  .education-screen::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg,
      rgba(5, 7, 19, 0.75) 0%,
      rgba(5, 7, 19, 0.85) 50%,
      rgba(5, 7, 19, 0.9) 100%
    );
    pointer-events: none;
  }


  .education-content {
    width: 100%;
    max-width: 400px;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    position: relative;
    z-index: 1;
  }

  .success-badge {
    text-align: center;
    padding: 2rem 1rem;
    border-radius: var(--radius-xl);
    background: var(--gradient-brand-soft);
    box-shadow: var(--shadow-soft);
  }

  .badge-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  }

  .success-title {
    font-family: var(--font-heading);
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-fg-inverse);
    margin: 0;
    line-height: 1.3;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  .surface-card {
    background: var(--color-surface-card);
    border-radius: var(--radius-xl);
    padding: 1.5rem;
    box-shadow: var(--shadow-soft);
    border: 1px solid var(--color-border-subtle);
    transition: box-shadow 0.2s ease;
  }

  .surface-card:focus-within {
    box-shadow: var(--shadow-medium);
  }

  .section-title {
    font-family: var(--font-heading);
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--color-fg-primary);
    margin: 0 0 1rem 0;
  }

  .summary-text,
  .decision-text {
    font-family: var(--font-body);
    font-size: 1rem;
    color: var(--color-fg-secondary);
    line-height: 1.5;
    margin: 0;
  }

  .reward-section {
    background: var(--gradient-accent-soft);
    color: var(--color-fg-inverse);
    border: 1px solid var(--color-accent-300);
  }

  .reward-info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .reward-icon {
    font-size: 2rem;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
  }

  .reward-details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .reward-label {
    font-family: var(--font-body);
    font-size: 0.875rem;
    opacity: 0.9;
  }

  .reward-points {
    font-family: var(--font-heading);
    font-size: 1.5rem;
    font-weight: 700;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  .product-description {
    font-family: var(--font-body);
    font-size: 0.875rem;
    color: var(--color-fg-secondary);
    line-height: 1.4;
    margin: 0 0 1rem 0;
  }

  .learn-more-btn {
    width: 100%;
    font-family: var(--font-body);
    transition: all 0.2s ease;
  }

  .learn-more-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 1rem;
  }

  .claim-btn,
  .exit-btn {
    width: 100%;
    padding: 1rem;
    font-family: var(--font-heading);
    font-size: 1rem;
    font-weight: 600;
    border-radius: var(--radius-lg);
    transition: all 0.2s ease;
    border: 2px solid transparent;
    cursor: pointer;
  }

  .claim-btn {
    background: linear-gradient(135deg, var(--color-brand-500) 0%, var(--color-brand-600) 100%);
    color: var(--color-fg-inverse);
  }

  .claim-btn:hover,
  .claim-btn:focus-visible {
    background: linear-gradient(135deg, var(--color-brand-600) 0%, var(--color-brand-700) 100%);
    transform: translateY(-1px);
    box-shadow: var(--shadow-medium);
    outline: none;
  }

  .claim-btn:focus-visible {
    box-shadow: var(--shadow-focus);
  }

  .exit-btn {
    background: var(--color-surface-card);
    color: var(--color-fg-secondary);
    border-color: var(--color-border-muted);
  }

  .exit-btn:hover,
  .exit-btn:focus-visible {
    background: var(--layer-brand-050);
    color: var(--color-brand-600);
    border-color: var(--color-brand-300);
    outline: none;
  }

  .exit-btn:focus-visible {
    box-shadow: var(--shadow-focus);
  }



</style>
