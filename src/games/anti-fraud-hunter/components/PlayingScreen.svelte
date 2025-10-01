<script lang="ts">
  import { AlertTriangle, CheckCircle } from 'lucide-svelte';
  import type { SMSMessage } from '../types';
  import GameHUD from './GameHUD.svelte';
  import MessagePanel from './MessagePanel.svelte';
  import FeedbackPanel from './FeedbackPanel.svelte';

  interface Props {
    lives: number;
    score: number;
    level: number;
    totalLevels: number;
    timeRemaining: number;
    currentLevelConfig: { messagesCount: number; timePerMessage: number };
    currentMessage: SMSMessage | null;
    showResult: boolean;
    lastAnswer: boolean | null;
    expectedFraudStatus: boolean | null;
    streak: number;
    levelProgress: number;
    onAnswer: (isFraud: boolean) => void;
  }

  let {
    lives,
    score,
    level,
    totalLevels,
    timeRemaining,
    currentLevelConfig,
    currentMessage,
    showResult,
    lastAnswer,
    expectedFraudStatus,
    streak,
    levelProgress,
    onAnswer
  }: Props = $props();
</script>

<section class="game-stage game-stage--playing" aria-live="polite">
  <GameHUD
    {lives}
    {score}
    {level}
    {totalLevels}
    timeRemaining={timeRemaining}
    timePerMessage={currentLevelConfig.timePerMessage}
  />

  {#if currentMessage && !showResult}
    <MessagePanel
      {currentMessage}
      levelProgress={levelProgress}
      messagesCount={currentLevelConfig.messagesCount}
    />

    <div class="decision-grid" role="group" aria-label="Выберите, мошенничество это или нет">
      <button
        type="button"
        class="decision-button decision-button--fraud"
        onclick={() => onAnswer(true)}
      >
        <AlertTriangle size={20} aria-hidden="true" />
        <span>Мошенник</span>
      </button>
      <button
        type="button"
        class="decision-button decision-button--safe"
        onclick={() => onAnswer(false)}
      >
        <CheckCircle size={20} aria-hidden="true" />
        <span>Безопасно</span>
      </button>
    </div>
  {:else if showResult && currentMessage && expectedFraudStatus !== null}
    <FeedbackPanel
      {lastAnswer}
      {expectedFraudStatus}
      explanation={currentMessage.explanation}
      {streak}
    />
  {/if}
</section>

<style>
  .game-stage {
    width: min(720px, 100%);
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .decision-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1rem;
  }

  .decision-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.85rem 1.5rem;
    border-radius: var(--radius-lg);
    border: 1px solid transparent;
    font-family: var(--font-display);
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 160ms ease, box-shadow 160ms ease, transform 160ms ease;
  }

  .decision-button:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-soft);
  }

  .decision-button:focus-visible {
    outline: none;
    box-shadow: var(--shadow-focus);
  }

  .decision-button--fraud {
    background: linear-gradient(135deg, #d13c6a 0%, #c73360 100%);
    color: var(--color-fg-inverse);
  }

  .decision-button--fraud:hover {
    background: linear-gradient(135deg, #c73360 0%, #b82c56 100%);
  }

  .decision-button--safe {
    background: linear-gradient(135deg, #0fa9c2 0%, #1fc4d9 100%);
    color: var(--color-fg-inverse);
  }

  .decision-button--safe:hover {
    background: linear-gradient(135deg, #0e98ad 0%, #1caebd 100%);
  }

  @media (max-width: 640px) {
    .decision-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
