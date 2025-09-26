<script lang="ts">
  import { X } from 'lucide-svelte';

  interface Props {
    open?: boolean;
    title?: string;
    showClose?: boolean;
    closeOnBackdrop?: boolean;
    closeOnEscape?: boolean;
    size?: 'sm' | 'md' | 'lg';
    success?: boolean;
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
    success = false,
    children,
    footer,
    onClose,
    class: className = ''
  }: Props = $props();

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg'
  };

  const sizeClass = sizeClasses[size];

  function handleClose() {
    if (success) return;
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
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <div
    class="modal-backdrop"
    onclick={handleBackdropClick}
    onkeydown={(e) => e.key === 'Escape' && handleClose()}
    role="dialog"
    aria-modal="true"
    aria-labelledby={title ? "modal-title" : undefined}
    tabindex="-1"
  >
    <div class={`modal-content ${sizeClass} ${className}`} class:success>
      {#if title || showClose}
        <div class="modal-header">
          {#if showClose}
            <button
              type="button"
              class="close-button"
              onclick={handleClose}
              disabled={success}
              aria-label="Закрыть"
            >
              <X size={20} />
            </button>
          {/if}
        </div>
      {/if}

      <div class="modal-body">
        {#if title && !success}
          <h2 id="modal-title" class="modal-title">{title}</h2>
        {/if}
        {@render children?.()}
      </div>

      {#if footer}
        <div class="modal-footer">
          {@render footer?.()}
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    box-sizing: border-box;
  }

  .modal-content {
    background: white;
    border-radius: 1.5rem;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    position: relative;
  }

  .modal-content.success {
    background: linear-gradient(135deg, var(--color-gpb-emerald) 0%, #45b369 100%);
    color: white;
  }

  .modal-content.max-w-sm {
    max-width: 400px;
  }

  .modal-content.max-w-md {
    max-width: 500px;
  }

  .modal-content.max-w-lg {
    max-width: 600px;
  }

  .modal-header {
    padding: 1.5rem 1.5rem 0;
    display: flex;
    justify-content: flex-end;
  }

  .close-button {
    background: none;
    border: none;
    padding: 0.5rem;
    border-radius: 50%;
    cursor: pointer;
    color: var(--color-gpb-gray-600);
  }

  .close-button:hover {
    background: var(--color-gpb-gray-100);
    color: var(--color-gpb-gray-800);
  }

  .close-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .modal-body {
    padding: 0 1.5rem 1.5rem;
  }

  .modal-title {
    font-family: var(--font-heading);
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-gpb-black);
    margin: 0 0 1rem;
    line-height: 1.2;
  }

  .modal-footer {
    padding: 1.5rem;
    border-top: 1px solid var(--color-gpb-gray-200);
    display: flex;
    gap: 1rem;
  }

  @media (max-width: 480px) {
    .modal-backdrop {
      padding: 0.5rem;
    }

    .modal-content {
      border-radius: 1rem;
    }

    .modal-header,
    .modal-body,
    .modal-footer {
      padding: 1rem;
    }
  }
</style>