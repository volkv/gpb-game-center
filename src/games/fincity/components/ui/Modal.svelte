<script lang="ts">
  import { onMount } from 'svelte';

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
    sm: 'max-w-modal-sm',
    md: 'max-w-modal-md',
    lg: 'max-w-modal-lg'
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
    class="fixed top: 0 left-0 right-0 bottom-0 z-50 flex items-center justify-center padding: 1rem bg-cumin/80 backdrop-blur-md"
    onclick={handleOverlayClick}
    onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleOverlayClick(e as unknown as MouseEvent); } }}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    <div
      bind:this={modalElement}
      use:trapFocus
      class="relative w-full {sizeClasses[size]} bg-lily/95 backdrop-blur-md rounded-[var(--radius-lg)] shadow-xl modal-slide-up max-h-modal overflow-hidden flex flex-col border border-henbane-30 {className}"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {#if title || header}
        <div class="flex items-center justify-between p-md border-b border-henbane-30">
          <div class="flex-1">
            {#if header}
              {@render header()}
            {:else if title}
              <h2 id="modal-title" class="text-md text-black">
                {title}
              </h2>
            {/if}
          </div>

          {#if !persistent}
            <button
              type="button"
              class="ml-4 text-henbane hover:text-black transition-colors duration-[var(--duration-fast)]"
              onclick={onclose}
              aria-label="Закрыть"
            >
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          {/if}
        </div>
      {/if}

      <div class="flex-1 p-md overflow-y-auto">
        {@render children?.()}
      </div>

      {#if footer}
        <div class="flex items-center justify-end gap: 0.75rem p-md border-t border-henbane-30">
          {@render footer()}
        </div>
      {/if}
    </div>
  </div>
{/if}