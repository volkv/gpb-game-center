<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'info' | 'tag' | 'success' | 'warning' | 'error';
    size?: 'sm' | 'md' | 'lg';
    color?: 'violet' | 'mint' | 'raspberry' | 'melissa' | 'sakura' | 'henbane' | 'lily' | 'cumin';
    tag?: string;
    interactive?: boolean;
    onclick?: () => void;
    class?: string;
    children?: Snippet;
  }

  let {
    variant = 'info',
    size = 'md',
    color,
    tag,
    interactive = false,
    onclick,
    class: className = '',
    children,
    ...restProps
  }: Props = $props();

  const baseClasses = 'inline-flex items-center justify-center font-body rounded-[var(--radius-lg)] transition-all duration-[var(--duration-fast)] backdrop-blur-sm';

  const variantClasses = {
    info: 'bubble-info',
    tag: 'bubble-tag',
    success: 'bg-melissa-10 text-black border border-melissa-30',
    warning: 'bg-sakura-10 text-black border border-sakura-30',
    error: 'bg-raspberry-10 text-black border border-raspberry-30'
  };

  const colorClasses = {
    violet: 'bg-violet-10 text-violet border border-violet-30',
    mint: 'bg-mint-10 text-mint border border-mint-30',
    raspberry: 'bg-raspberry-10 text-raspberry border border-raspberry-30',
    melissa: 'bg-melissa-10 text-melissa border border-melissa-30',
    sakura: 'bg-sakura-10 text-sakura border border-sakura-30',
    henbane: 'bg-henbane-10 text-henbane border border-henbane-30',
    lily: 'bg-lily text-black border border-lily-30',
    cumin: 'bg-cumin/10 text-cumin border border-cumin/30'
  };

  const sizeClasses = {
    sm: 'px-sm py-1 text-xs gap-xs',
    md: 'px-md py-2 text-sm gap-sm',
    lg: 'px-lg py-3 text-base gap: 1rem'
  };

  const interactiveClasses = 'cursor-pointer hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-violet/50';

  const bubbleClasses = $derived([
    baseClasses,
    color ? colorClasses[color] : variantClasses[variant],
    sizeClasses[size],
    interactive ? interactiveClasses : '',
    className
  ].filter(Boolean).join(' '));
</script>

{#if interactive || onclick}
  <button
    class={bubbleClasses}
    onclick={onclick}
    {...restProps}
  >
    {#if tag}
      <span class="text-xs font-heading uppercase tracking-wider opacity-80">{tag}</span>
    {/if}
    {@render children?.()}
  </button>
{:else}
  <div
    class={bubbleClasses}
    {...restProps}
  >
    {#if tag}
      <span class="text-xs font-heading uppercase tracking-wider opacity-80">{tag}</span>
    {/if}
    {@render children?.()}
  </div>
{/if}