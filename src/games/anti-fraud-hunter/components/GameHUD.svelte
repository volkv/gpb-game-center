<script lang="ts">
  import { Clock, Heart } from 'lucide-svelte';
  import { Counter } from '$lib';

  interface Props {
    lives: number;
    score: number;
    level: number;
    totalLevels: number;
    timeRemaining: number;
    timePerMessage: number;
  }

  let { lives, score, level, totalLevels, timeRemaining, timePerMessage }: Props = $props();

  const timePercentage = $derived((timeRemaining / timePerMessage) * 100);
  const isLowTime = $derived(timePercentage < 30);
</script>

<header class="game-hud surface-card">
  <div class="hud-section">
    <div class="hud-lives">
      {#each Array(3) as _, i}
        <Heart size={16} class={`hud-heart ${i < lives ? 'hud-heart--active' : ''}`} aria-hidden="true" />
      {/each}
    </div>
  </div>
  <div class="hud-section">
    <Counter value={score} class="hud-counter" />
  </div>
  <div class="hud-section">
    <span class="hud-section__value">{level}/{totalLevels}</span>
  </div>
  <div class="hud-section hud-section--timer">
    <div class={`timer-display ${isLowTime ? 'timer-display--warning' : ''}`}>
      <Clock size={16} aria-hidden="true" />
      <span class="timer-display__value">{timeRemaining}с</span>
    </div>
    <div class="timer-progress">
      <div
        class={`timer-progress__fill ${isLowTime ? 'timer-progress__fill--warning' : ''}`}
        style="width: {timePercentage}%"
        role="progressbar"
        aria-valuenow={timeRemaining}
        aria-valuemin={0}
        aria-valuemax={timePerMessage}
        aria-label="Оставшееся время"
      ></div>
    </div>
  </div>
</header>

<style>
  .game-hud {
    padding: 0.75rem 1rem;
    display: grid;
    gap: 0.75rem;
    grid-template-columns: auto 1fr auto auto;
    align-items: center;
    border-radius: var(--radius-xl);
    border: 1px solid var(--color-border-muted);
    background: var(--color-surface-card);
    box-shadow: var(--shadow-soft);
  }

  .hud-section {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .hud-section__value {
    font-family: var(--font-display);
    font-size: 1rem;
    color: var(--color-fg-primary);
  }

  .hud-section--timer {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .hud-lives {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
  }

  :global(svg.hud-heart) {
    color: var(--color-border-muted);
    transition: transform 160ms ease, color 160ms ease;
  }

  :global(svg.hud-heart--active) {
    color: var(--color-state-danger);
    transform: scale(1.05);
  }

  .hud-counter {
    font-size: 1.1rem;
  }

  .timer-display {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.3rem 0.75rem;
    border-radius: var(--radius-full);
    background: var(--layer-brand-050);
    color: var(--color-brand-700);
    font-weight: 600;
    font-size: 0.9rem;
    white-space: nowrap;
    transition: all 200ms ease;
    align-self: flex-start;
  }

  .timer-display--warning {
    background: color-mix(in srgb, var(--color-state-danger) 12%, transparent);
    color: var(--color-state-danger);
    animation: pulse-timer 1s ease-in-out infinite;
  }

  .timer-display__value {
    font-family: var(--font-display);
    font-size: 1rem;
  }

  .timer-progress {
    width: 100%;
    height: 6px;
    border-radius: var(--radius-full);
    background: var(--color-surface-muted);
    overflow: hidden;
    position: relative;
  }

  .timer-progress__fill {
    height: 100%;
    border-radius: var(--radius-full);
    background: linear-gradient(90deg, #1919EF 0%, #58FFFF 100%);
    transition: width 1s linear, background 300ms ease;
    position: relative;
    overflow: hidden;
  }

  .timer-progress__fill::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.3) 50%,
      transparent 100%
    );
    animation: shimmer-progress 2s infinite;
  }

  .timer-progress__fill--warning {
    background: linear-gradient(90deg, #d13c6a 0%, #ff6b9d 100%);
  }

  @keyframes pulse-timer {
    0%,
    100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.02);
      opacity: 0.9;
    }
  }

  @keyframes shimmer-progress {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }

  @media (max-width: 640px) {
    .game-hud {
      grid-template-columns: 1fr;
      gap: 0.5rem;
    }

    .hud-section {
      justify-content: space-between;
    }

    .hud-section--timer {
      grid-column: 1;
    }
  }
</style>
