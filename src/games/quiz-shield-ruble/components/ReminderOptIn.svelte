<script lang="ts">
  import { BellRing, BellOff, Info, Loader2 } from 'lucide-svelte';
  import { Button } from '$lib';
  import type { ReminderPermissionState } from '../notifications';

  interface Props {
    enabled: boolean;
    permission: ReminderPermissionState;
    isProcessing?: boolean;
    onEnable: () => void;
    onDisable: () => void;
    nextFireAt?: number;
  }

  let {
    enabled,
    permission,
    isProcessing = false,
    onEnable,
    onDisable,
    nextFireAt
  }: Props = $props();

  const permissionCopy: Record<ReminderPermissionState, { title: string; note?: string }> = {
    granted: {
      title: 'Уведомления включены — мы напомним вернутьcя к тренировке.',
      note: 'Можно закрывать игру: напоминания придут даже в WebView.'
    },
    denied: {
      title: 'Системные уведомления запрещены.',
      note: 'Откройте настройки браузера или приложения, чтобы разрешить уведомления и получать напоминания.'
    },
    default: {
      title: 'Мы попросим разрешение на уведомления при включении напоминаний.'
    },
    unsupported: {
      title: 'Уведомления недоступны в этой среде.',
      note: 'Мы покажем напоминание внутри игры при следующем запуске.'
    },
    unknown: {
      title: 'Хотите получать напоминания о повторной тренировке?' 
    }
  };

  const relativeHint = $derived(() => {
    if (!enabled || !nextFireAt) return null;
    const diff = Math.max(0, nextFireAt - Date.now());
    const hours = Math.round(diff / 3_600_000);

    if (hours <= 1) {
      return 'Следующее напоминание готово и появится совсем скоро.';
    }

    if (hours < 24) {
      return `Следующее напоминание через ~${hours} ч.`;
    }

    const days = Math.round(hours / 24);
    return `Следующее напоминание через ~${days} дн.`;
  });

  function handleToggle() {
    if (isProcessing) return;
    if (enabled) {
      onDisable?.();
    } else {
      onEnable?.();
    }
  }
</script>

<section class="reminder-optin surface-card" aria-live="polite">
  <header class="reminder-optin__header">
    <div class="reminder-optin__icon" aria-hidden="true">
      {#if enabled}
        <BellRing size={20} />
      {:else}
        <BellOff size={20} />
      {/if}
    </div>
    <div>
      <p class="reminder-optin__title text-balance">{permissionCopy[permission].title}</p>
      {#if permissionCopy[permission].note}
        <p class="reminder-optin__note text-balance">{permissionCopy[permission].note}</p>
      {/if}
    </div>
  </header>

  {#if relativeHint}
    <div class="reminder-optin__hint">
      <Info size={16} aria-hidden="true" />
      <span>{relativeHint}</span>
    </div>
  {/if}

  <footer class="reminder-optin__actions">
    <Button
      variant={enabled ? 'secondary' : 'primary'}
      size="md"
      onclick={handleToggle}
      disabled={isProcessing}
    >
      {#if isProcessing}
        <Loader2 size={16} class="reminder-optin__spinner" aria-hidden="true" />
        <span>{enabled ? 'Отключаем…' : 'Включаем…'}</span>
      {:else if enabled}
        <BellOff size={16} aria-hidden="true" />
        <span>Отключить напоминания</span>
      {:else}
        <BellRing size={16} aria-hidden="true" />
        <span>Включить напоминания</span>
      {/if}
    </Button>
  </footer>
</section>

<style>
  .reminder-optin {
    padding: 1.25rem;
    border-radius: var(--radius-xl);
    border: 1px solid var(--color-border-muted);
    background: var(--color-surface-card);
    display: flex;
    flex-direction: column;
    gap: 1rem;
    text-align: left;
  }

  .reminder-optin__header {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
  }

  .reminder-optin__icon {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-full);
    background: var(--layer-brand-080);
    color: var(--color-brand-600);
    display: grid;
    place-items: center;
    flex-shrink: 0;
  }

  .reminder-optin__title {
    margin: 0;
    font-weight: 600;
    color: var(--color-fg-primary);
    line-height: 1.35;
  }

  .reminder-optin__note {
    margin: 0.35rem 0 0;
    color: var(--color-fg-muted);
    font-size: 0.9rem;
  }

  .reminder-optin__hint {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    padding: 0.75rem;
    border-radius: var(--radius-lg);
    background: var(--color-surface-muted);
    color: var(--color-fg-secondary);
    font-size: 0.9rem;
  }

  .reminder-optin__actions {
    display: flex;
    justify-content: flex-start;
  }

</style>
