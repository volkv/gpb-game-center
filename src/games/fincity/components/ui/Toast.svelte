<script lang="ts">
  import { onMount } from 'svelte';
  import Bubble from './Bubble.svelte';
  import Icon from './Icon.svelte';

  import type { Snippet } from 'svelte';

  interface Props {
    visible?: boolean;
    type?: 'success' | 'warning' | 'error' | 'info';
    title?: string;
    message?: string;
    duration?: number;
    dismissible?: boolean;
    onclose?: () => void;
    children?: Snippet;
    style?: string;
  }

  let {
    visible = false,
    type = 'info',
    title,
    message,
    duration = 5000,
    dismissible = true,
    onclose,
    children,
    style = ''
  }: Props = $props();

  let timeoutId: number;

  const typeConfig = {
    success: {
      variant: 'success' as const,
      icon: 'check' as const
    },
    warning: {
      variant: 'warning' as const,
      icon: 'menu' as const
    },
    error: {
      variant: 'error' as const,
      icon: 'close' as const
    },
    info: {
      variant: 'notification' as const,
      icon: 'menu' as const
    }
  };

  function handleClose() {
    if (onclose) {
      onclose();
    }
  }

  function startTimer() {
    if (duration > 0) {
      timeoutId = setTimeout(() => {
        handleClose();
      }, duration);
    }
  }

  function clearTimer() {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }

  onMount(() => {
    if (visible) {
      startTimer();
    }

    return () => {
      clearTimer();
    };
  });

  $effect(() => {
    if (visible) {
      startTimer();
    } else {
      clearTimer();
    }

    return () => {
      clearTimer();
    };
  });

  const config = $derived(typeConfig[type]);

  let showToast = $state(false);

  $effect(() => {
    if (visible) {
      // Добавляем небольшую задержку перед показом для анимации
      setTimeout(() => {
        showToast = true;
      }, 50);
    } else {
      showToast = false;
    }
  });
</script>

{#if showToast}
  <div
    class="toast-container"
    role="alert"
    aria-live="polite"
    onmouseenter={clearTimer}
    onmouseleave={startTimer}
    style={`${style} animation: toastFadeIn 0.3s ease-out;`}
  >
    <Bubble
      variant={config.variant}
      size="lg"
      class="shadow-2xl backdrop-blur-sm"
    >
      <div class="toast-content">
        <div class="toast-header">
          <Icon name={config.icon} size="sm" />

          <div class="toast-text">
            {#if title}
              <h4 class="toast-title text-body font-heading">
                {title}
              </h4>
            {/if}

            {#if message}
              <p class="toast-message text-body-sm">
                {message}
              </p>
            {:else if children}
              <div class="toast-message text-body-sm">
                {@render children()}
              </div>
            {/if}
          </div>

          {#if dismissible}
            <button
              type="button"
              class="toast-close"
              onclick={handleClose}
              aria-label="Закрыть уведомление"
            >
              <Icon name="close" size="sm" />
            </button>
          {/if}
        </div>

        {#if duration > 0}
          <div class="toast-progress">
            <div
              class="toast-progress-bar"
              style="animation: toastProgress {duration}ms linear;"
            ></div>
          </div>
        {/if}
      </div>
    </Bubble>
  </div>
{/if}

<style>

  .toast-container {
    @apply fixed top: 1rem right-4 z-50 max-w-sm w-full;
    @apply pointer-events-auto;
  }

  .toast-content {
    @apply space-y-3;
  }

  .toast-header {
    @apply flex items-start gap: 0.75rem;
  }

  .toast-text {
    @apply flex-1 space-y-1;
  }

  .toast-title {
    @apply leading-tight;
  }

  .toast-message {
    @apply opacity-90 leading-relaxed;
  }

  .toast-close {
    @apply flex-shrink-0 p-1 rounded-[var(--radius)] transition-all duration-[var(--duration-fast)];
    @apply hover:bg-black/10;
    @apply opacity-70 hover:opacity-100;
  }

  .toast-progress {
    @apply relative h-1 bg-black/10 rounded-full overflow-hidden;
  }

  .toast-progress-bar {
    @apply h-full bg-black/30 rounded-full;
    @apply transition-all ease-linear;
    width: 100%;
  }

  @keyframes toastProgress {
    from {
      width: 100%;
    }
    to {
      width: 0%;
    }
  }

  @media (max-width: 640px) {
    .toast-container {
      @apply top-2 right-2 left-2 max-w-none;
    }

    .toast-header {
      @apply gap-2;
    }
  }

  @media (max-width: 400px) {
    .toast-container {
      @apply top-1 right-1 left-1;
    }

    .toast-content {
      @apply gap: 0.5rem;
    }

    .toast-header {
      @apply gap-xs;
    }

    .toast-title {
      @apply text-body-sm;
    }

    .toast-message {
      @apply text-body-xs;
    }
  }

  @media (max-width: 320px) {
    .toast-container {
      @apply top-xs right-xs left-xs;
    }

    .toast-content {
      @apply space-y-xs;
    }

    .toast-header {
      @apply gap-xs;
    }
  }
</style>