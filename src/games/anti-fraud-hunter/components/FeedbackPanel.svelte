<script lang="ts">
  import { AlertTriangle, CheckCircle, Clock, Sparkles } from 'lucide-svelte';

  interface Props {
    lastAnswer: boolean | null;
    expectedFraudStatus: boolean;
    explanation: string;
    streak: number;
  }

  let { lastAnswer, expectedFraudStatus, explanation, streak }: Props = $props();
</script>

<article class="feedback-panel surface-card" aria-live="polite">
  <div
    class={`feedback-icon ${
      lastAnswer === expectedFraudStatus
        ? 'feedback-icon--success'
        : lastAnswer === null
          ? 'feedback-icon--warning'
          : 'feedback-icon--error'
    }`}
  >
    {#if lastAnswer === null}
      <Clock size={28} aria-hidden="true" />
    {:else if lastAnswer === expectedFraudStatus}
      <CheckCircle size={28} aria-hidden="true" />
    {:else}
      <AlertTriangle size={28} aria-hidden="true" />
    {/if}
  </div>

  <div class="feedback-copy">
    <h2 class="feedback-title">
      {#if lastAnswer === null}
        Время истекло
      {:else if lastAnswer === expectedFraudStatus}
        Верный ответ
      {:else}
        Ошибка
      {/if}
    </h2>
    <p class="feedback-text">{explanation}</p>
  </div>

  <div class="feedback-status">
    <span class="feedback-status__label">Правильный ответ</span>
    <span class={`feedback-status__value ${expectedFraudStatus ? 'is-fraud' : 'is-safe'}`}>
      {expectedFraudStatus ? 'Мошенник' : 'Безопасно'}
    </span>
  </div>

  {#if streak > 1 && lastAnswer === expectedFraudStatus}
    <span class="streak-chip">
      <Sparkles size={16} aria-hidden="true" />
      Серия: {streak}
    </span>
  {/if}
</article>

<style>
  .feedback-panel {
    padding: clamp(1.6rem, 1.2rem + 1.5vw, 2.1rem);
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    align-items: center;
    text-align: center;
    border-radius: var(--radius-xl);
    border: 1px solid var(--color-border-muted);
    background: var(--color-surface-card);
    box-shadow: var(--shadow-soft);
  }

  .feedback-icon {
    width: 72px;
    height: 72px;
    border-radius: var(--radius-full);
    display: grid;
    place-items: center;
    color: var(--color-fg-on-brand);
  }

  .feedback-icon--success {
    background: var(--gradient-brand-soft);
  }

  .feedback-icon--warning {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--color-state-warning) 80%, transparent) 0%,
      color-mix(in srgb, var(--color-state-warning) 60%, transparent) 100%
    );
  }

  .feedback-icon--error {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--color-state-danger) 85%, transparent) 0%,
      color-mix(in srgb, var(--color-state-danger) 60%, transparent) 100%
    );
  }

  .feedback-title {
    margin: 0;
    font-family: var(--font-display);
    font-size: 1.35rem;
    color: var(--color-fg-primary);
  }

  .feedback-text {
    margin: 0;
    font-size: 0.95rem;
    color: var(--color-fg-muted);
    max-width: 38ch;
  }

  .feedback-status {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    align-items: center;
  }

  .feedback-status__label {
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-fg-muted);
  }

  .feedback-status__value {
    font-family: var(--font-display);
    font-size: 1.1rem;
    padding: 0.35rem 1.1rem;
    border-radius: var(--radius-full);
  }

  .feedback-status__value.is-fraud {
    background: color-mix(in srgb, var(--color-state-danger) 18%, transparent);
    color: var(--color-state-danger);
  }

  .feedback-status__value.is-safe {
    background: color-mix(in srgb, var(--color-accent-500) 18%, transparent);
    color: var(--color-accent-600);
  }

  .streak-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.35rem 0.9rem;
    border-radius: var(--radius-full);
    background: var(--layer-brand-150);
    color: var(--color-fg-on-brand);
    font-size: 0.85rem;
    font-weight: 600;
  }
</style>
