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
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    background: rgba(10, 19, 48, 0.5);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    z-index: 1000;
    box-sizing: border-box;
  }

  .modal-content {
    background: var(--color-surface-card);
    border-radius: var(--radius-xl);
    border: 1px solid var(--color-border-muted);
    width: 100%;
    max-height: 88vh;
    overflow-y: auto;
    box-shadow: var(--shadow-hard);
    position: relative;
    color: var(--color-fg-primary);
  }

  .modal-content.success {
    background: var(--color-surface-card);
    border-color: color-mix(in srgb, var(--color-state-success) 45%, var(--color-border-muted) 55%);
    box-shadow: 0 18px 38px color-mix(in srgb, var(--color-state-success) 18%, transparent);
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
    display: flex;
    justify-content: flex-end;
    padding: 1.25rem 1.5rem 0;
  }

  .close-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--radius-lg);
    color: var(--color-fg-muted);
    cursor: pointer;
    transition: color 140ms ease, border-color 140ms ease, background-color 140ms ease;
  }

  .close-button:hover {
    background: var(--color-neutral-100);
    border-color: var(--color-border-muted);
    color: var(--color-fg-secondary);
  }

  .close-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .modal-body {
    padding: 0 1.5rem 1.5rem;
  }

  .modal-title {
    font-family: var(--font-display);
    font-size: 1.35rem;
    font-weight: 600;
    color: var(--color-fg-primary);
    margin: 0 0 1rem;
    letter-spacing: -0.01em;
  }

  .modal-footer {
    padding: 1.25rem 1.5rem 1.5rem;
    border-top: 1px solid var(--color-border-subtle);
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    padding: 1rem;
  }

  .modal-backdrop {
    padding: 0.5rem;
  }

  .modal-content {
    border-radius: 1rem;
  }

  .modal-header {
    padding: 1rem;
  }

  .modal-body {
    padding: 1rem;
  }
</style>
