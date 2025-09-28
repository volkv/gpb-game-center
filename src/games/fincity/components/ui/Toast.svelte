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

  let timeoutId: ReturnType<typeof setTimeout>;

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
      variant: 'info' as const,
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
    class="fincity-toast-container"
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
      <div class="fincity-toast-content">
        <div class="fincity-toast-header">
          <Icon name={config.icon} size="sm" />

          <div class="fincity-toast-text">
            {#if title}
              <h4 class="fincity-toast-title text-body font-heading">
                {title}
              </h4>
            {/if}

            {#if message}
              <p class="fincity-toast-message text-body-sm">
                {message}
              </p>
            {:else if children}
              <div class="fincity-toast-message text-body-sm">
                {@render children()}
              </div>
            {/if}
          </div>

          {#if dismissible}
            <button
              type="button"
              class="fincity-toast-close"
              onclick={handleClose}
              aria-label="Закрыть уведомление"
            >
              <Icon name="close" size="sm" />
            </button>
          {/if}
        </div>

        {#if duration > 0}
          <div class="fincity-toast-progress">
            <div
              class="fincity-toast-progress-bar"
              style="animation: toastProgress {duration}ms linear;"
            ></div>
          </div>
        {/if}
      </div>
    </Bubble>
  </div>
{/if}

<style>
	.fincity-toast-container {
		position: fixed;
		bottom: clamp(1rem, 2vw, 1.75rem);
		right: clamp(1rem, 2vw, 1.75rem);
		z-index: 140;
		max-width: min(320px, 100vw - 2rem);
	}

	.fincity-toast-content {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	.fincity-toast-header {
		display: flex;
		align-items: flex-start;
		gap: 0.65rem;
	}

	.fincity-toast-text {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.fincity-toast-title {
		margin: 0;
		font-family: var(--font-display);
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-fg-primary);
	}

	.fincity-toast-message {
		margin: 0;
		font-size: 0.85rem;
		color: var(--color-fg-secondary);
	}

	.fincity-toast-close {
		margin-left: auto;
		background: none;
		border: 0;
		color: var(--color-fg-muted);
		cursor: pointer;
		border-radius: var(--radius-lg);
		width: 32px;
		height: 32px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		transition: background-color 160ms ease, color 160ms ease;
	}

	.fincity-toast-close:hover {
		background: color-mix(in srgb, var(--color-neutral-50) 70%, white 30%);
		color: var(--color-fg-primary);
	}

	.fincity-toast-progress {
		width: 100%;
		height: 0.35rem;
		border-radius: var(--radius-full);
		background: color-mix(in srgb, var(--color-neutral-100) 70%, white 30%);
		
	}

	.fincity-toast-progress-bar {
		height: 100%;
		border-radius: inherit;
		background: linear-gradient(90deg, var(--color-brand-500) 0%, var(--color-accent-400) 100%);
	}

	.fincity-toast-container {
		left: 1rem;
		right: 1rem;
		bottom: 1rem;
	}

	@keyframes toastFadeIn {
		0% {
			opacity: 0;
			transform: translateY(12px);
		}
		100% {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
