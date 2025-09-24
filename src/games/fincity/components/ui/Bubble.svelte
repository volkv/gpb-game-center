<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'info' | 'tag' | 'success' | 'warning' | 'error';
    size?: 'sm' | 'md' | 'lg';
    color?: 'violet' | 'mint' | 'raspberry' | 'emerald' | 'raspberry-light' | 'henbane' | 'lily' | 'orange';
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

  const baseClasses = 'inline-flex items-center justify-center font-ui-primary rounded-xl transition-all duration-300 ease-out backdrop-blur-sm neon-glow';

  const variantClasses = {
    info: 'glass-effect bg-gpb-violet/10 text-gpb-violet border border-gpb-violet/30',
    tag: 'glass-effect bg-gpb-mint/10 text-gpb-mint border border-gpb-mint/30',
    success: 'glass-effect bg-gpb-emerald/10 text-gpb-emerald border border-gpb-emerald/30',
    warning: 'glass-effect bg-gpb-orange/10 text-gpb-orange border border-gpb-orange/30',
    error: 'glass-effect bg-gpb-raspberry/10 text-gpb-raspberry border border-gpb-raspberry/30'
  };

  const colorClasses = {
    violet: 'glass-effect bg-gpb-violet/10 text-gpb-violet border border-gpb-violet/30',
    mint: 'glass-effect bg-gpb-mint/10 text-gpb-mint border border-gpb-mint/30',
    raspberry: 'glass-effect bg-gpb-raspberry/10 text-gpb-raspberry border border-gpb-raspberry/30',
    emerald: 'glass-effect bg-gpb-emerald/10 text-gpb-emerald border border-gpb-emerald/30',
    'raspberry-light': 'glass-effect bg-gpb-raspberry-light/10 text-gpb-raspberry-light border border-gpb-raspberry-light/30',
    henbane: 'glass-effect bg-gpb-gray-200/80 text-gpb-gray-800 border border-gpb-gray-300/50',
    lily: 'glass-effect bg-gpb-gray-50/90 text-gpb-black border border-gpb-gray-200/50',
    orange: 'glass-effect bg-gpb-orange/10 text-gpb-orange border border-gpb-orange/30'
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-2 text-sm gap-2',
    lg: 'px-4 py-3 text-base gap-3'
  };

  const interactiveClasses = 'cursor-pointer hover-lift active-press focus-game touch-target';

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
      <span class="font-badge opacity-80">{tag}</span>
    {/if}
    {@render children?.()}
  </button>
{:else}
  <div
    class={bubbleClasses}
    {...restProps}
  >
    {#if tag}
      <span class="font-badge opacity-80">{tag}</span>
    {/if}
    {@render children?.()}
  </div>
{/if}