<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    type?: 'button' | 'submit' | 'reset';
    onclick?: () => void;
    class?: string;
    children?: Snippet;
  }

  let {
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    type = 'button',
    onclick,
    class: className = '',
    children,
    ...restProps
  }: Props = $props();

  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-[var(--radius-lg)] transition-all duration-150 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 backdrop-blur-sm';

  const variantClasses = {
    primary: 'btn-primary focus:ring-violet',
    secondary: 'btn-secondary focus:ring-henbane',
    ghost: 'bg-transparent hover:bg-lily-20 text-black focus:ring-violet',
    danger: 'bg-raspberry hover:opacity-90 text-white focus:ring-raspberry shadow-lg'
  };

  const sizeClasses = {
    sm: 'px-4 py-3 text-xs touch-target',
    md: 'px-6 py-3 text-sm touch-target',
    lg: 'px-8 py-4 text-base touch-target-lg'
  };

  const disabledClasses = 'opacity-50 cursor-not-allowed transform-none hover:scale-100';

  const buttonClasses = $derived([
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    disabled || loading ? disabledClasses : '',
    className
  ].filter(Boolean).join(' '));
</script>

<button
  {type}
  class={buttonClasses}
  disabled={disabled || loading}
  onclick={onclick}
  {...restProps}
>
  {#if loading}
    <svg class="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  {/if}
  {@render children?.()}
</button>