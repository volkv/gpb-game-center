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
  @reference "../../../../app.css";
  .zoom-controls {
    position: absolute !important;
    z-index: 50 !important;
    bottom: 1.5rem !important;
    right: 1.5rem !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 0.5rem !important;
    pointer-events: auto !important;
  }

  :global(.zoom-button) {
    @apply !min-w-0 !w-12 !h-12 !p-0;
    @apply bg-white/95 backdrop-blur-md;
    @apply border border-gray-200/50 shadow-lg hover:shadow-xl;
    @apply transform transition-all duration-300;
    @apply hover:scale-110 active:scale-95;
    @apply touch-target;
  }

  :global(.zoom-button:disabled) {
    @apply opacity-40 cursor-not-allowed;
    @apply transform-none hover:scale-100;
  }

  .zoom-icon {
    @apply text-xl font-bold text-gray-700;
    @apply leading-none;
  }

  :global(.zoom-button:hover) .zoom-icon {
    @apply text-gray-900;
  }

  :global(.zoom-button:disabled) .zoom-icon {
    @apply text-gray-400;
  }

  @media (max-width: 640px) {
    .zoom-controls {
      @apply bottom-3 right-3 gap-mobile;
    }

    :global(.zoom-button) {
      @apply !w-10 !h-10 touch-target-sm;
    }

    .zoom-icon {
      @apply text-lg;
    }
  }

  @media (max-width: 400px) {
    .zoom-controls {
      @apply bottom-2 right-2;
    }

    :global(.zoom-button) {
      @apply !w-9 !h-9;
    }

    .zoom-icon {
      @apply text-base;
    }
  }
</style>