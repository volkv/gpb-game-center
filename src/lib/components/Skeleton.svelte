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
    background:  #f3f4f6 ;
    background-size: 200% 100%;
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


</style>