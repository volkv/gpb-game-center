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

  const baseClass = 'bubble';

  const variantClasses = {
    info: 'bubble--info',
    tag: 'bubble--tag',
    success: 'bubble--success',
    warning: 'bubble--warning',
    error: 'bubble--error'
  } satisfies Record<Props['variant'], string>;

  const colorClasses = {
    violet: 'bubble--violet',
    mint: 'bubble--mint',
    raspberry: 'bubble--raspberry',
    emerald: 'bubble--emerald',
    'raspberry-light': 'bubble--raspberry-light',
    henbane: 'bubble--henbane',
    lily: 'bubble--lily',
    orange: 'bubble--orange'
  };

  const sizeClasses = {
    sm: 'bubble--sm',
    md: 'bubble--md',
    lg: 'bubble--lg'
  };

  const interactiveClasses = 'bubble--interactive';

  const bubbleClasses = $derived([
    baseClass,
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

<style>
	.bubble {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		border-radius: var(--radius-full);
		border: 1px solid var(--color-border-subtle);
		background: color-mix(in srgb, var(--color-neutral-50) 84%, white 16%);
		color: var(--color-fg-primary);
		font-weight: 600;
		font-size: 0.9rem;
		line-height: 1;
		transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
	}

	.bubble--sm {
		padding: 0.35rem 0.65rem;
		font-size: 0.75rem;
	}

	.bubble--md {
		padding: 0.45rem 0.85rem;
		font-size: 0.85rem;
	}

	.bubble--lg {
		padding: 0.6rem 1rem;
		font-size: 0.95rem;
	}

	.bubble--interactive {
		cursor: pointer;
	}

	.bubble--interactive:hover {
		transform: translateY(-1px);
		box-shadow: var(--shadow-soft);
		border-color: var(--layer-brand-150);
	}

	.bubble--interactive:focus-visible {
		outline: none;
		box-shadow: var(--shadow-focus);
	}

	.bubble--info {
		background: color-mix(in srgb, var(--color-brand-50) 65%, white 35%);
		border-color: rgba(25, 25, 239, 0.2);
		color: var(--color-brand-600);
	}

	.bubble--tag {
		background: color-mix(in srgb, var(--color-accent-100) 65%, white 35%);
		border-color: rgba(31, 196, 217, 0.28);
		color: var(--color-accent-600);
	}

	.bubble--success,
	.bubble--emerald {
		background: color-mix(in srgb, rgba(43, 180, 138, 0.12) 40%, white 60%);
		border-color: rgba(43, 180, 138, 0.28);
		color: var(--color-accent-600);
	}

	.bubble--warning,
	.bubble--orange {
		background: color-mix(in srgb, rgba(226, 165, 58, 0.12) 40%, white 60%);
		border-color: rgba(226, 165, 58, 0.3);
		color: var(--color-gpb-gold);
	}

	.bubble--error,
	.bubble--raspberry {
		background: color-mix(in srgb, rgba(209, 60, 106, 0.12) 40%, white 60%);
		border-color: rgba(209, 60, 106, 0.28);
		color: rgba(209, 60, 106, 1);
	}

	.bubble--mint {
		background: color-mix(in srgb, rgba(31, 196, 217, 0.12) 40%, white 60%);
		border-color: rgba(31, 196, 217, 0.28);
		color: var(--color-accent-600);
	}

	.bubble--violet {
		background: color-mix(in srgb, rgba(68, 80, 255, 0.12) 40%, white 60%);
		border-color: rgba(68, 80, 255, 0.28);
		color: var(--color-brand-600);
	}

	.bubble--raspberry-light {
		background: color-mix(in srgb, rgba(232, 137, 181, 0.12) 40%, white 60%);
		border-color: rgba(232, 137, 181, 0.28);
		color: rgba(209, 60, 106, 0.85);
	}

	.bubble--henbane {
		background: color-mix(in srgb, var(--color-neutral-100) 70%, white 30%);
		border-color: var(--color-border-muted);
		color: var(--color-fg-secondary);
	}

	.bubble--lily {
		background: var(--color-surface-muted);
		border-color: var(--color-border-subtle);
		color: var(--color-fg-primary);
	}

	@media (prefers-reduced-motion: reduce) {
		.bubble {
			transition: none;
		}
	}
</style>
