<script lang="ts">
  import { BellRing, X } from 'lucide-svelte';
  import { Button } from '$lib';

  interface Props {
    title: string;
    message: string;
    onDismiss?: () => void;
    onAction?: () => void;
    actionLabel?: string;
  }

  let { title, message, onDismiss, onAction, actionLabel = 'Вернуться к тренировке' }: Props = $props();
</script>

<aside class="reminder-banner" role="status" aria-live="assertive">
  <div class="reminder-banner__icon" aria-hidden="true">
    <BellRing size={18} />
  </div>

  <div class="reminder-banner__content">
    <p class="reminder-banner__title">{title}</p>
    <p class="reminder-banner__message text-balance">{message}</p>
  </div>

  <div class="reminder-banner__actions">
    <Button variant="secondary" size="sm" onclick={() => onAction?.()}>
      {actionLabel}
    </Button>
  </div>

  <button type="button" class="reminder-banner__close" onclick={() => onDismiss?.()} aria-label="Закрыть напоминание">
    <X size={16} aria-hidden="true" />
  </button>
</aside>

<style>
  .reminder-banner {
    display: grid;
    grid-template-columns: auto 1fr auto auto;
    gap: 0.75rem;
    align-items: center;
    padding: 0.85rem 1rem;
    border-radius: var(--radius-xl);
    border: 1px solid var(--color-border-muted);
    background: linear-gradient(135deg, rgba(55, 151, 211, 0.16), rgba(27, 76, 176, 0.1));
    box-shadow: var(--shadow-soft);
    position: relative;
  }

  .reminder-banner::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at top right, rgba(255, 255, 255, 0.25), transparent 60%);
    pointer-events: none;
  }

  .reminder-banner__icon {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-full);
    background: rgba(255, 255, 255, 0.65);
    display: grid;
    place-items: center;
    color: var(--color-brand-600);
  }

  .reminder-banner__content {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .reminder-banner__title {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--color-fg-primary);
  }

  .reminder-banner__message {
    margin: 0;
    color: var(--color-fg-secondary);
    font-size: 0.9rem;
  }

  .reminder-banner__actions {
    display: flex;
    align-items: center;
  }

  .reminder-banner__close {
    border: none;
    background: transparent;
    color: var(--color-fg-muted);
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    border-radius: var(--radius-full);
    cursor: pointer;
    transition: background-color 160ms ease, color 160ms ease;
  }

  .reminder-banner__close:hover,
  .reminder-banner__close:focus-visible {
    outline: none;
    background: rgba(255, 255, 255, 0.6);
    color: var(--color-brand-600);
  }


</style>
