<script lang="ts">
  interface Props {
    gradient?: boolean;
    gradientType?: 'electric' | 'power' | 'wealth' | 'mystery';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    decorative?: boolean;
    clickable?: boolean;
    onclick?: () => void;
    children?: any;
    class?: string;
  }

  let {
    gradient = false,
    gradientType = 'electric',
    padding = 'md',
    decorative = false,
    clickable = false,
    onclick,
    children,
    class: className = '',
    ...restProps
  }: Props = $props();

  const baseClass = 'game-card';
  const gradientClass = gradient ? `gradient-${gradientType}` : '';
  const paddingClass = padding !== 'none' ? `p-${padding === 'sm' ? '3' : padding === 'md' ? '4' : '6'}` : '';
  const clickableClass = clickable ? 'game-card--clickable' : '';

  const classes = [baseClass, gradientClass, paddingClass, clickableClass, className].filter(Boolean).join(' ');

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
    class={classes}
    onclick={handleClick}
    onkeydown={handleKeydown}
    {...restProps}
  >
    <div class="game-card-content">
      {@render children?.()}
    </div>
  </button>
{:else}
  <div
    class={classes}
    {...restProps}
  >
    <div class="game-card-content">
      {@render children?.()}
    </div>
  </div>
{/if}

<style>
  .game-card {
    position: relative;
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border-subtle);
    background: var(--color-surface-card);
    box-shadow: var(--shadow-soft);
    transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
  }

  @media (min-width: 640px) {
    .game-card {
      border-radius: var(--radius-xl);
    }
  }

  .game-card--clickable {
    cursor: pointer;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }

  .game-card--clickable:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-medium);
    border-color: var(--layer-brand-150);
  }

  .game-card--clickable:active {
    transform: translateY(0);
    box-shadow: var(--shadow-soft);
  }

  .game-card--clickable:focus-visible {
    outline: none;
    box-shadow: var(--shadow-focus);
  }

  .game-card-content {
    position: relative;
    z-index: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    .game-card--clickable:hover {
      transform: none;
    }
  }
</style>