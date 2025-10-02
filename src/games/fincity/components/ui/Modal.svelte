<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, scale } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { X } from 'lucide-svelte';
  import type { Snippet } from 'svelte';

  interface Props {
    open?: boolean;
    onclose?: () => void;
    title?: string;
    size?: 'sm' | 'md' | 'lg';
    persistent?: boolean;
    children?: Snippet;
    header?: Snippet;
    footer?: Snippet;
    class?: string;
  }

  let {
    open = false,
    onclose,
    title,
    size = 'md',
    persistent = false,
    children,
    header,
    footer,
    class: className = ''
  }: Props = $props();

  let modalElement = $state<HTMLDivElement>();
  let overlayElement = $state<HTMLDivElement>();

  const sizeClasses = {
    sm: 'modal-game--sm',
    md: 'modal-game--md',
    lg: 'modal-game--lg'
  };

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && !persistent && onclose) {
      onclose();
    }
  }

  function handleOverlayClick(event: MouseEvent) {
    if (event.target === overlayElement && !persistent && onclose) {
      onclose();
    }
  }

  function trapFocus(element: HTMLElement) {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    function handleTabKey(e: KeyboardEvent) {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement?.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement?.focus();
            e.preventDefault();
          }
        }
      }
    }

    element.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return {
      destroy() {
        element.removeEventListener('keydown', handleTabKey);
      }
    };
  }

  onMount(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = '';
    };
  });

  $effect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeydown);
    } else {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeydown);
    }

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeydown);
    };
  });
</script>

<style>
	.modal-overlay-game {
		position: fixed;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: clamp(1rem, 3vw, 2.75rem);
		background: color-mix(in srgb, var(--color-neutral-900) 74%, transparent 26%);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		z-index: 110;
		overflow-y: auto;
	}

	.modal-game {
		position: relative;
		width: min(680px, 100%);
		max-height: calc(100vh - clamp(2.5rem, 6vh, 4.5rem));
		display: flex;
		flex-direction: column;
		border-radius: calc(var(--radius-xl) + 4px);
		border: 1px solid var(--color-border-muted);
		background: color-mix(in srgb, var(--color-surface-card) 96%, white 4%);
		box-shadow: var(--shadow-hard);
		
	}

	.modal-game--sm {
		width: min(420px, 100%);
	}

	.modal-game--md {
		width: min(560px, 100%);
	}

	.modal-game--lg {
		width: min(760px, 100%);
	}

	.modal-header-game {
		position: relative;
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: clamp(0.75rem, 1.5vw, 1.25rem);
		padding: clamp(1.1rem, 1.8vw, 1.6rem) clamp(1.25rem, 2vw, 1.8rem);
		border-bottom: 1px solid var(--color-border-subtle);

	}

	.modal-title-game {
		margin: 0;
		font-family: var(--font-display);
		font-size: clamp(1.25rem, 1.8vw, 1.6rem);
		font-weight: 700;
		letter-spacing: -0.015em;
		color: var(--color-fg-primary);
	}

	.modal-content-game {
		flex: 1;
		overflow-y: auto;
		padding: clamp(1.1rem, 2vw, 1.75rem);
		display: flex;
		flex-direction: column;
		gap: clamp(0.85rem, 1.5vw, 1.25rem);
		background-color: color-mix(in srgb, var(--color-surface-card) 92%, white 8%);
	}

	.modal-footer-game {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		padding: clamp(1rem, 1.6vw, 1.35rem);
		border-top: 1px solid var(--color-border-subtle);
		background-color: color-mix(in srgb, var(--color-neutral-50) 72%, white 28%);
	}

	.modal-footer-game :global(.btn-game-secondary),
	.modal-footer-game :global(.btn-game-primary) {
		flex: 1 1 auto;
	}

	.btn-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.25rem;
		height: 2.25rem;
		border-radius: var(--radius-lg);
		border: 1px solid transparent;
		background: color-mix(in srgb, var(--color-neutral-50) 80%, white 20%);
		color: var(--color-fg-primary);
		cursor: pointer;
		transition: background-color 160ms ease, box-shadow 160ms ease, transform 160ms ease;
	}

	.btn-icon:hover {
		background: color-mix(in srgb, var(--color-neutral-50) 65%, white 35%);
		transform: translateY(-1px);
	}

	.btn-icon:focus-visible,
	.focus-game {
		outline: none;
		box-shadow: var(--shadow-focus);
	}

	.touch-target {
		min-width: 44px;
		min-height: 44px;
	}

	.modal-overlay-game {
		padding: clamp(0.75rem, 4vw, 1.5rem);
	}

	.modal-game {
		width: 100%;
		max-height: calc(100vh - clamp(1.5rem, 6vw, 2.5rem));
	}

	.modal-header-game {
		padding: 1rem 1.25rem;
	}

	.modal-footer-game {
		flex-direction: column;
	}

	.modal-footer-game :global(button) {
		width: 100%;
	}

</style>

{#if open}
  <div
    bind:this={overlayElement}
    class="modal-overlay-game"
    onclick={handleOverlayClick}
    onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleOverlayClick(e as unknown as MouseEvent); } }}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
    transition:fade={{ duration: 300 }}
  >
    <div
      bind:this={modalElement}
      use:trapFocus
      class="modal-game {sizeClasses[size]} {className}"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      tabindex="-1"
      transition:scale={{ duration: 400, easing: quintOut, start: 0.9 }}
      onclick={(e) => e.stopPropagation()}
      onkeydown={() => {}}
    >
      {#if title || header}
        <div class="modal-header-game">
          <div class="relative z-10">
            {#if header}
              {@render header()}
            {:else if title}
              <h2 id="modal-title" class="modal-title-game">
                {title}
              </h2>
            {/if}
          </div>

          {#if !persistent}
            <button
              type="button"
              class="btn-icon touch-target focus-game absolute top-4 right-4 z-20"
              onclick={onclose}
              aria-label="Закрыть модальное окно"
            >
              <X size={20} />
            </button>
          {/if}
        </div>
      {/if}

      <div class="modal-content-game">
        {@render children?.()}
      </div>

      {#if footer}
        <div class="modal-footer-game">
          {@render footer()}
        </div>
      {/if}
    </div>
  </div>
{/if}
