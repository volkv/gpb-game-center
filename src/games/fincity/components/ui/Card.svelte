<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'default' | 'elevated' | 'outlined';
    size?: 'sm' | 'md' | 'lg' | 'none';
    gradient?: 'electric' | 'power' | 'wealth' | 'mystery' | null;
    decorative?: boolean;
    particles?: boolean;
    clickable?: boolean;
    onclick?: () => void;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    children?: Snippet;
    header?: Snippet;
    footer?: Snippet;
    class?: string;
    style?: string;
  }

  let {
    variant = 'default',
    size = 'md',
    gradient = null,
    decorative = false,
    particles = false,
    clickable = false,
    onclick,
    padding = 'md',
    children,
    header,
    footer,
    class: className = '',
    style = '',
    ...restProps
  }: Props = $props();

  const variantClasses = {
    default: 'game-card',
    elevated: 'game-card shadow-xl',
    outlined: 'game-card border-2 border-gpb-violet'
  };

  const gradientClasses = {
    electric: 'gradient-electric text-white',
    power: 'gradient-power text-white',
    wealth: 'gradient-wealth text-white',
    mystery: 'gradient-mystery text-white'
  };

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl'
  };

  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  const clickableClasses = 'cursor-pointer select-none focus-game hover-lift active-press';

  const cardClasses = $derived([
    variantClasses[variant],
    gradient ? gradientClasses[gradient] : '',
    size !== 'none' ? sizeClasses[size] : '',
    clickable ? clickableClasses : '',
    padding !== 'none' ? paddingClasses[padding] : '',
    className
  ].filter(Boolean).join(' '));

  function handleClick() {
    if (clickable && onclick) {
      onclick();
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (clickable && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      handleClick();
    }
  }
</script>

{#if clickable}
  <button
    type="button"
    class={cardClasses}
    onclick={handleClick}
    onkeydown={handleKeydown}
    {...restProps}
  >
    {#if particles}
      <div class="particles-container">
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
      </div>
    {/if}

    {#if decorative}
      <div class="decoration-shine"></div>
      <div class="decoration-orb w-16 h-16 top-2 right-2 bg-white/10"></div>
    {/if}

    <div class="game-card-content relative z-10">
      {#if header}
        <div class="game-card-header">
          {@render header()}
        </div>
      {/if}

      <div class="flex-1">
        {@render children?.()}
      </div>

      {#if footer}
        <div class="game-card-footer mt-4">
          {@render footer()}
        </div>
      {/if}
    </div>
  </button>
{:else}
  <div
    class={cardClasses}
    style={style}
    {...restProps}
  >
    {#if particles}
      <div class="particles-container">
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
      </div>
    {/if}

    {#if decorative}
      <div class="decoration-shine"></div>
      <div class="decoration-orb w-16 h-16 top-2 right-2 bg-white/10"></div>
    {/if}

    <div class="game-card-content relative z-10">
      {#if header}
        <div class="game-card-header">
          {@render header()}
        </div>
      {/if}

      <div class="flex-1">
        {@render children?.()}
      </div>

      {#if footer}
        <div class="game-card-footer mt-4">
          {@render footer()}
        </div>
      {/if}
    </div>
  </div>
{/if}