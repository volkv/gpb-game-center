<script lang="ts">
  interface Props {
    gradient?: boolean;
    gradientType?: 'electric' | 'power' | 'wealth' | 'mystery';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    decorative?: boolean;
    children?: any;
    class?: string;
  }

  let {
    gradient = false,
    gradientType = 'electric',
    padding = 'md',
    decorative = false,
    children,
    class: className = '',
    ...restProps
  }: Props = $props();

  const baseClass = 'game-card';
  const gradientClass = gradient ? `gradient-${gradientType}` : '';
  const paddingClass = padding !== 'none' ? `p-${padding === 'sm' ? '3' : padding === 'md' ? '4' : '6'}` : '';

  const classes = [baseClass, gradientClass, paddingClass, className].filter(Boolean).join(' ');
</script>

<div
  class={classes}
  {...restProps}
>
  {#if decorative}
    <div class="decoration-shine"></div>
  {/if}

  <div class="game-card-content">
    {@render children?.()}
  </div>
</div>