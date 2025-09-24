<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'default' | 'elevated' | 'outlined';
    size?: 'sm' | 'md' | 'lg' | 'none';
    clickable?: boolean;
    onclick?: () => void;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    children?: Snippet;
    header?: Snippet;
    footer?: Snippet;
    class?: string;
  }

  let {
    variant = 'default',
    size = 'md',
    clickable = false,
    onclick,
    padding = 'md',
    children,
    header,
    footer,
    class: className = '',
    ...restProps
  }: Props = $props();

  const variantClasses = {
    default: 'game-card',
    elevated: 'game-card-elevated',
    outlined: 'game-card border-2 border-violet'
  };

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-width: 32rem'
  };

  const paddingClasses = {
    none: '',
    sm: 'p-sm',
    md: 'p-md',
    lg: 'p-lg'
  };

  const clickableClasses = 'cursor-pointer select-none focus:ring-2 focus:ring-violet/50 focus:outline-none';

  const cardClasses = $derived([
    variantClasses[variant],
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
    {#if header}
      <div class="card-header border-b border-henbane-30 pb-sm mb-sm">
        {@render header()}
      </div>
    {/if}

    <div class="card-content">
      {@render children?.()}
    </div>

    {#if footer}
      <div class="card-footer border-t border-henbane-30 pt-sm mt-sm">
        {@render footer()}
      </div>
    {/if}
  </button>
{:else}
  <div
    class={cardClasses}
    {...restProps}
  >
    {#if header}
      <div class="card-header border-b border-henbane-30 pb-sm mb-sm">
        {@render header()}
      </div>
    {/if}

    <div class="card-content">
      {@render children?.()}
    </div>

    {#if footer}
      <div class="card-footer border-t border-henbane-30 pt-sm mt-sm">
        {@render footer()}
      </div>
    {/if}
  </div>
{/if}