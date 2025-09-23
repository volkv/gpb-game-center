<script lang="ts">
  import { fade, scale } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';

  interface Props {
    open?: boolean;
    title?: string;
    showClose?: boolean;
    closeOnBackdrop?: boolean;
    closeOnEscape?: boolean;
    size?: 'sm' | 'md' | 'lg' | 'full';
    children?: any;
    footer?: any;
    onClose?: () => void;
    class?: string;
  }

  let {
    open = false,
    title,
    showClose = true,
    closeOnBackdrop = true,
    closeOnEscape = true,
    size = 'md',
    children,
    footer,
    onClose,
    class: className = '',
    ...restProps
  }: Props = $props();

  let dialog: HTMLDialogElement = $state()!

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    full: 'max-w-full mx-4'
  };

  const sizeClass = sizeClasses[size];

  function handleClose() {
    onClose?.();
  }

  function handleBackdropClick(event: MouseEvent) {
    if (closeOnBackdrop && event.target === event.currentTarget) {
      handleClose();
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (closeOnEscape && event.key === 'Escape') {
      handleClose();
    }
  }

  $effect(() => {
    if (open) {
      dialog?.showModal();
    } else {
      dialog?.close();
    }
  });
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <dialog
    bind:this={dialog}
    class="fixed inset-0 z-50 flex items-end justify-center p-4 bg-transparent backdrop:bg-black backdrop:bg-opacity-50"
    onclick={handleBackdropClick}
    {...restProps}
    transition:fade={{ duration: 200 }}
  >
    <div
      role="dialog"
      aria-modal="true"
      tabindex="-1"
      class={`w-full ${sizeClass} bg-white rounded-2xl shadow-xl transform transition-transform duration-300 ${className}`}
      transition:scale={{ duration: 300, easing: quintOut, start: 0.9 }}
      onclick={(e) => e.stopPropagation()}
    >
      {#if title || showClose}
        <div class="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
          {#if title}
            <h2 class="font-heading text-h4 text-gpb-black">{title}</h2>
          {:else}
            <div></div>
          {/if}

          {#if showClose}
            <button
              type="button"
              class="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-200"
              onclick={handleClose}
              aria-label="Закрыть модальное окно"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          {/if}
        </div>
      {/if}

      <div class="p-6 font-body text-body text-gray-700">
        {@render children?.()}
      </div>

      {#if footer}
        <div class="flex justify-end space-x-3 p-6 pt-4 border-t border-gray-100">
          {@render footer?.()}
        </div>
      {/if}
    </div>
  </dialog>
{/if}