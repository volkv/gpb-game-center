<script lang="ts">
  import type { NovellaGameState } from '../types';
  import { CompletionPath } from '../types';
  import { fade, fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { confettiEffects } from '$lib/utils/confetti';
  import { onMount } from 'svelte';

  interface Props {
    gameState: NovellaGameState;
    onRestart: () => void;
    onExit: () => void;
  }

  let { gameState, onRestart, onExit }: Props = $props();

  const isSuccess = $derived(gameState.completionPath === CompletionPath.GOOD);
  const resultIcon = $derived(isSuccess ? '🛡️' : '⚠️');
  const resultTitle = $derived(isSuccess ? 'Отлично! Вы избежали мошенничества!' : 'Увы, вы попались на уловку мошенников');
  const resultSubtitle = $derived(isSuccess
    ? 'Ваша бдительность спасла ваши деньги!'
    : 'Но это всего лишь игра - теперь вы знаете, как поступить правильно!'
  );

  const getScoreColor = (score: number): string => {
    if (score >= 100) return 'var(--color-accent-500)';
    if (score >= 50) return 'var(--color-brand-500)';
    return 'var(--color-state-warning)';
  };

  const getGradeText = (path: CompletionPath): string => {
    return path === CompletionPath.GOOD ? 'Кибер-защитник' : 'Начинающий пользователь';
  };

  const handleKeydown = (event: KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  };

  onMount(() => {
    confettiEffects.gameComplete(isSuccess);
  });
</script>

<div class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="results-title">
  <div class="modal-container" transition:fly="{{ y: 50, duration: 400, easing: cubicOut }}">

    <!-- Header with result icon -->
    <div class="results-header">
      <div class="result-icon" class:success={isSuccess} class:failure={!isSuccess}>
        {resultIcon}
      </div>
      <h1 id="results-title" class="result-title">
        {resultTitle}
      </h1>
      <p class="result-subtitle">
        {resultSubtitle}
      </p>
    </div>

    <!-- Score section -->
    <div class="score-section">
      <div class="score-circle" style="border-color: {getScoreColor(gameState.finalScore)}">
        <span class="score-number" style="color: {getScoreColor(gameState.finalScore)}">
          {gameState.finalScore}
        </span>
        <span class="score-label">очков</span>
      </div>
      <div class="grade-badge" class:success={isSuccess} class:failure={!isSuccess}>
        {getGradeText(gameState.completionPath)}
      </div>
    </div>

    <!-- Statistics -->
    <div class="stats-section">
      <div class="stat-item">
        <span class="stat-icon">🎯</span>
        <div class="stat-content">
          <span class="stat-label">Решений принято</span>
          <span class="stat-value">{gameState.choiceHistory.length}</span>
        </div>
      </div>
      <div class="stat-item">
        <span class="stat-icon">📚</span>
        <div class="stat-content">
          <span class="stat-label">Сцен пройдено</span>
          <span class="stat-value">{gameState.visitedScenes.length}</span>
        </div>
      </div>
      <div class="stat-item">
        <span class="stat-icon">🏆</span>
        <div class="stat-content">
          <span class="stat-label">Качество решений</span>
          <span class="stat-value">{isSuccess ? 'Отлично' : 'Можно лучше'}</span>
        </div>
      </div>
    </div>

    <!-- Action buttons -->
    <div class="action-buttons">
      <button
        type="button"
        class="btn-secondary"
        onclick={onRestart}
        onkeydown={(e) => handleKeydown(e, onRestart)}
        aria-label="Пройти игру заново"
      >
        🔄 Попробовать ещё раз
      </button>
      <button
        type="button"
        class="btn-primary"
        onclick={onExit}
        onkeydown={(e) => handleKeydown(e, onExit)}
        aria-label="Завершить игру и вернуться в центр"
      >
        Завершить игру
      </button>
    </div>

  </div>
</div>

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }

  .modal-container {
    background: linear-gradient(145deg,
      rgba(255, 255, 255, 0.98) 0%,
      rgba(255, 255, 255, 0.95) 100%
    );
    border-radius: var(--radius-xl);
    padding: 2rem;
    max-width: 420px;
    width: 100%;
    box-shadow:
      0 20px 40px rgba(0, 0, 0, 0.2),
      0 10px 20px rgba(0, 0, 0, 0.1);
    border: 2px solid var(--color-border-subtle);
    animation: modalFadeIn 0.6s ease-out;
  }

  .results-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .result-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    display: block;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
    animation: iconBounce 0.8s ease-out;
  }

  .result-icon.success {
    color: var(--color-accent-500);
  }

  .result-icon.failure {
    color: var(--color-state-warning);
  }

  .result-title {
    font-family: var(--font-heading);
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-fg-primary);
    margin: 0 0 0.75rem 0;
    line-height: 1.3;
  }

  .result-subtitle {
    font-family: var(--font-body);
    font-size: 1rem;
    color: var(--color-fg-secondary);
    line-height: 1.5;
    margin: 0;
  }

  .score-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: var(--layer-brand-050);
    border-radius: var(--radius-lg);
  }

  .score-circle {
    width: 120px;
    height: 120px;
    border: 6px solid;
    border-radius: var(--radius-full);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: var(--color-surface-card);
    box-shadow: var(--shadow-soft);
    animation: scoreCountUp 1s ease-out 0.3s both;
  }

  .score-number {
    font-family: var(--font-heading);
    font-size: 2rem;
    font-weight: 700;
    line-height: 1;
  }

  .score-label {
    font-family: var(--font-body);
    font-size: 0.875rem;
    color: var(--color-fg-muted);
    margin-top: 0.25rem;
  }

  .grade-badge {
    padding: 0.75rem 1.5rem;
    border-radius: var(--radius-full);
    font-family: var(--font-heading);
    font-size: 0.875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .grade-badge.success {
    background: var(--color-accent-500);
    color: white;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  .grade-badge.failure {
    background: var(--color-state-warning);
    color: white;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  .stats-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: var(--color-surface-card);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border-subtle);
  }

  .stat-icon {
    font-size: 1.5rem;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
  }

  .stat-content {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .stat-label {
    font-family: var(--font-body);
    font-size: 0.875rem;
    color: var(--color-fg-secondary);
  }

  .stat-value {
    font-family: var(--font-heading);
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-fg-primary);
  }

  .action-buttons {
    display: flex;
    gap: 1rem;
    flex-direction: column;
  }

  .action-buttons button {
    padding: 1rem 1.5rem;
    font-family: var(--font-heading);
    font-size: 1rem;
    font-weight: 600;
    border-radius: var(--radius-lg);
    border: 2px solid transparent;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .btn-primary {
    background: linear-gradient(135deg, var(--color-brand-500) 0%, var(--color-brand-600) 100%);
    color: var(--color-fg-inverse);
  }

  .btn-primary:hover,
  .btn-primary:focus-visible {
    background: linear-gradient(135deg, var(--color-brand-600) 0%, var(--color-brand-700) 100%);
    transform: translateY(-1px);
    box-shadow: var(--shadow-medium);
    outline: none;
  }

  .btn-secondary {
    background: var(--color-surface-card);
    color: var(--color-fg-secondary);
    border-color: var(--color-border-muted);
  }

  .btn-secondary:hover,
  .btn-secondary:focus-visible {
    background: var(--layer-brand-050);
    color: var(--color-brand-600);
    border-color: var(--color-brand-300);
    outline: none;
  }

  @keyframes modalFadeIn {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes iconBounce {
    0%, 60%, 100% {
      transform: translateY(0);
    }
    30% {
      transform: translateY(-10px);
    }
  }

  @keyframes scoreCountUp {
    from {
      transform: scale(0.8);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
</style>