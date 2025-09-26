<script lang="ts">
  import { Loader2 } from 'lucide-svelte';

  interface Props {
    variant?: 'primary' | 'secondary' | 'accent';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    href?: string;
    type?: 'button' | 'submit' | 'reset';
    onclick?: (event: MouseEvent) => void;
    children?: any;
    class?: string;
    [key: string]: any;
  }

  let {
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    href,
    type = 'button',
    onclick,
    children,
    class: className = '',
    'aria-label': ariaLabel,
    ...restProps
  }: Props = $props();

  const baseClass = variant === 'primary' ? 'btn-game-primary' :
                    variant === 'secondary' ? 'btn-game-secondary' :
                    variant === 'accent' ? 'btn-game-primary' : 'btn-game-primary';
  const sizeClass = size !== 'md' ? 'btn-' + size : '';
  const classes = [baseClass, sizeClass, className].filter(Boolean).join(' ');

  function handleClick(event: MouseEvent) {
    if (disabled || loading) {
      event.preventDefault();
      return;
    }
    onclick?.(event);
  }
</script>

{#if href}
  <a
    {href}
    class={classes}
    class:opacity-50={disabled}
    class:cursor-not-allowed={disabled}
    onclick={handleClick}
    aria-label={ariaLabel}
    {...restProps}
  >
    {#if loading}
      <Loader2 size={16} class="mr-2 animate-spin" />
    {/if}
    {@render children?.()}
  </a>
{:else}
  <button
    {type}
    class={classes}
    class:opacity-50={disabled || loading}
    class:cursor-not-allowed={disabled}
    disabled={disabled || loading}
    onclick={handleClick}
    aria-label={ariaLabel}
    {...restProps}
  >
    {#if loading}
      <Loader2 size={16} class="mr-2 animate-spin" />
    {/if}
    {@render children?.()}
  </button>
{/if}