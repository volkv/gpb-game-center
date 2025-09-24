<script lang="ts">
  import { Loader2 } from 'lucide-svelte';
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

  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none backdrop-blur-sm hover-lift active-press';

  const variantClasses = {
    primary: 'btn-game-primary focus-game',
    secondary: 'btn-game-secondary focus-game',
    ghost: 'bg-transparent hover:bg-white/20 text-current focus-game',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg focus-game'
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm touch-target',
    md: 'px-6 py-3 text-base touch-target',
    lg: 'px-8 py-4 text-lg touch-target'
  };

  const disabledClasses = 'opacity-50 cursor-not-allowed transform-none hover:scale-100 hover:shadow-none';

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
    <Loader2 size={16} class="mr-2 animate-spin" />
  {/if}
  {@render children?.()}
</button>