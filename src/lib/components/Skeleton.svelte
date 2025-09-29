<script lang="ts">
  interface Props {
    variant: 'line' | 'circle' | 'rectangle';
    width?: string;
    height?: string;
    class?: string;
  }
  let { variant, width, height, class: className = '' }: Props = $props();
</script>

<div
  class="skeleton skeleton-{variant} {className}"
  style:width={width}
  style:height={height}
  aria-hidden="true"
></div>

<style>
  .skeleton {
    background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
    background-size: 200% 100%;
    animation: skeleton-loading 1.5s infinite;
  }

  .skeleton-line {
    border-radius: 999px;
    height: 12px;
  }

  .skeleton-circle {
    border-radius: 50%;
  }

  .skeleton-rectangle {
    border-radius: 6px;
  }

  @keyframes skeleton-loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
</style>