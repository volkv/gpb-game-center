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
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg'
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