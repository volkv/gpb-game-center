<script lang="ts">
  import { fade, scale } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { X } from 'lucide-svelte';

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
    class="modal-overlay-game"
    onclick={handleBackdropClick}
    {...restProps}
    transition:fade={{ duration: 300 }}
  >
    <div
      role="dialog"
      aria-modal="true"
      tabindex="-1"
      class={`modal-game ${sizeClass} ${className}`}
      transition:scale={{ duration: 400, easing: quintOut, start: 0.9 }}
      onclick={(e) => e.stopPropagation()}
    >
      {#if title || showClose}
        <div class="modal-header-game">
          {#if title}
            <h2 class="modal-title-game">{title}</h2>
          {/if}

          {#if showClose}
            <button
              type="button"
              class="btn-icon touch-target focus-game absolute top-4 right-4 z-20"
              onclick={handleClose}
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
          {@render footer?.()}
        </div>
      {/if}
    </div>
  </dialog>
{/if}