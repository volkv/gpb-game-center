<script lang="ts">
  interface Props {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    color?: 'violet' | 'mint' | 'raspberry' | 'white';
    variant?: 'circle' | 'dots' | 'pulse';
    class?: string;
  }

  let {
    size = 'md',
    color = 'violet',
    variant = 'circle',
    class: className = '',
    ...restProps
  }: Props = $props();

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    violet: 'text-gpb-violet',
    mint: 'text-gpb-mint',
    raspberry: 'text-gpb-raspberry',
    white: 'text-white'
  };

  const sizeClass = sizeClasses[size];
  const colorClass = colorClasses[color];
  const classes = [sizeClass, colorClass, className].filter(Boolean).join(' ');
</script>

{#if variant === 'circle'}
  <div class="inline-flex items-center justify-center" {...restProps}>
    <svg class={classes + ' animate-spin'} fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  </div>
{:else if variant === 'dots'}
  <div class="inline-flex space-x-1" {...restProps}>
    <div class={`${sizeClass} ${colorClass} rounded-full animate-bounce`} style="animation-delay: -0.3s; background-color: currentColor;"></div>
    <div class={`${sizeClass} ${colorClass} rounded-full animate-bounce`} style="animation-delay: -0.15s; background-color: currentColor;"></div>
    <div class={`${sizeClass} ${colorClass} rounded-full animate-bounce`} style="background-color: currentColor;"></div>
  </div>
{:else if variant === 'pulse'}
  <div class="inline-flex items-center justify-center" {...restProps}>
    <div class={`${sizeClass} ${colorClass} rounded-full animate-pulse`} style="background-color: currentColor;"></div>
  </div>
{/if}