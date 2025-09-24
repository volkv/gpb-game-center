<script lang="ts">
  import { Button } from '.';

  interface Props {
    onZoomIn: () => void;
    onZoomOut: () => void;
    canZoomIn: boolean;
    canZoomOut: boolean;
    class?: string;
  }

  let {
    onZoomIn,
    onZoomOut,
    canZoomIn,
    canZoomOut,
    class: className = ''
  }: Props = $props();
</script>

<div class="zoom-controls {className}">
  <Button
    variant="secondary"
    size="lg"
    onclick={onZoomIn}
    disabled={!canZoomIn}
    class="zoom-button zoom-in"
  >
    <span class="zoom-icon">+</span>
  </Button>

  <Button
    variant="secondary"
    size="lg"
    onclick={onZoomOut}
    disabled={!canZoomOut}
    class="zoom-button zoom-out"
  >
    <span class="zoom-icon">−</span>
  </Button>
</div>

<style>

  .zoom-controls {
    position: absolute;
    z-index: 50;
    bottom: 1.5rem;
    right: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    pointer-events: auto;
  }

  :global(.zoom-button) {
    min-width: 0;
    width: 3rem;
    height: 3rem;
    padding: 0;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(229, 231, 235, 0.5);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    transform: scale(1);
    transition: all 300ms;
    border-radius: 0.5rem;
  }

  :global(.zoom-button:hover) {
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    transform: scale(1.1);
  }

  :global(.zoom-button:active) {
    transform: scale(0.95);
  }

  :global(.zoom-button:disabled) {
    opacity: 0.4;
    cursor: not-allowed;
    transform: scale(1);
  }

  :global(.zoom-button:disabled:hover) {
    transform: scale(1);
  }

  .zoom-icon {
    font-size: 1.25rem;
    font-weight: 700;
    color: rgb(55, 65, 81);
    line-height: 1;
  }

  :global(.zoom-button:hover) .zoom-icon {
    color: rgb(17, 24, 39);
  }

  :global(.zoom-button:disabled) .zoom-icon {
    color: rgb(156, 163, 175);
  }

  @media (max-width: 640px) {
    .zoom-controls {
      bottom: 0.75rem;
      right: 0.75rem;
      gap: 0.375rem;
    }

    :global(.zoom-button) {
      width: 2.5rem;
      height: 2.5rem;
    }

    .zoom-icon {
      font-size: 1.125rem;
    }
  }

  @media (max-width: 400px) {
    .zoom-controls {
      bottom: 0.5rem;
      right: 0.5rem;
    }

    :global(.zoom-button) {
      width: 2.25rem;
      height: 2.25rem;
    }

    .zoom-icon {
      font-size: 1rem;
    }
  }
</style>