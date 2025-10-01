<script lang="ts">
  import { Smartphone } from 'lucide-svelte';
  import type { SMSMessage } from '../types';

  interface Props {
    currentMessage: SMSMessage;
    levelProgress: number;
    messagesCount: number;
  }

  let { currentMessage, levelProgress, messagesCount }: Props = $props();

  const difficultyCopy: Record<SMSMessage['difficulty'], string> = {
    easy: 'Начальный риск',
    medium: 'Повышенный риск',
    hard: 'Высокий риск'
  };
</script>

<article class="message-panel surface-card" aria-labelledby={`message-title-${currentMessage.id}`}>
  <div class="message-panel__header">
    <div class="message-panel__sender">
      <span class="chip chip--sender">{currentMessage.sender}</span>
      <span class="message-panel__difficulty">{difficultyCopy[currentMessage.difficulty]}</span>
    </div>
    <div class="message-panel__progress">
      <span class="progress-label">Сообщение</span>
      <span class="progress-value">{levelProgress}/{messagesCount}</span>
    </div>
  </div>

  <div class="message-panel__body">
    <h2 id={`message-title-${currentMessage.id}`} class="message-panel__title">Новая SMS</h2>
    <p class="message-text text-balance">{currentMessage.text}</p>
  </div>

  <div class="message-panel__device" aria-hidden="true">
    <Smartphone size={46} />
  </div>
</article>

<style>
  .message-panel {
    padding: clamp(1.5rem, 1rem + 2vw, 2rem);
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    border-radius: var(--radius-xl);
    border: 1px solid var(--color-border-muted);
    background: var(--color-surface-card);
    box-shadow: var(--shadow-soft);
  }

  .message-panel::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at top right, var(--layer-brand-150), transparent 55%);
    pointer-events: none;
  }

  .message-panel__header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
  }

  .message-panel__sender {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
  }

  .chip--sender {
    background: var(--layer-brand-100);
    color: var(--color-brand-700);
  }

  .message-panel__difficulty {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.75rem;
    border-radius: var(--radius-full);
    background: var(--color-surface-muted);
    color: var(--color-fg-secondary);
    font-size: 0.75rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .message-panel__progress {
    display: flex;
    align-items: baseline;
    gap: 0.35rem;
    font-size: 0.85rem;
    color: var(--color-fg-muted);
  }

  .progress-label {
    letter-spacing: 0.04em;
    text-transform: uppercase;
    font-size: 0.72rem;
  }

  .progress-value {
    font-family: var(--font-display);
    font-size: 1rem;
    color: var(--color-fg-primary);
  }

  .message-panel__title {
    margin: 0;
    font-size: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-fg-muted);
  }

  .message-text {
    margin: 0;
    font-size: 1.05rem;
    line-height: 1.5;
    color: var(--color-fg-primary);
  }

  .message-panel__device {
    position: absolute;
    right: clamp(1.5rem, 4vw, 2.5rem);
    bottom: clamp(1.25rem, 4vw, 2rem);
    color: color-mix(in srgb, var(--color-brand-500) 18%, transparent);
  }

  @media (max-width: 640px) {
    .message-panel__device {
      display: none;
    }
  }
</style>
