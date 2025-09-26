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
    elevated: 'game-card game-card--elevated',
    outlined: 'game-card game-card--outlined'
  };

  const gradientClasses = {
    electric: 'gradient-electric text-white',
    power: 'gradient-power text-white',
    wealth: 'gradient-wealth text-white',
    mystery: 'gradient-mystery text-white'
  };

  const sizeClasses = {
    sm: 'game-card--sm',
    md: 'game-card--md',
    lg: 'game-card--lg'
  };

  const paddingClasses = {
    none: '',
    sm: 'game-card--padding-sm',
    md: 'game-card--padding-md',
    lg: 'game-card--padding-lg'
  };

  const clickableClasses = 'game-card--clickable';

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

<style>
	.game-card {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		border-radius: var(--radius-xl);
		border: 1px solid var(--color-border-subtle);
		background: color-mix(in srgb, var(--color-surface-card) 96%, white 4%);
		box-shadow: var(--shadow-soft);
		transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
		overflow: hidden;
	}

	.game-card--elevated {
		box-shadow: var(--shadow-medium);
	}

	.game-card--outlined {
		border: 1px solid var(--color-border-strong);
	}

	.game-card--sm {
		max-width: 420px;
	}

	.game-card--md {
		max-width: 640px;
	}

	.game-card--lg {
		max-width: 880px;
	}

	.game-card--padding-sm {
		padding: 0.9rem;
	}

	.game-card--padding-md {
		padding: 1.1rem;
	}

	.game-card--padding-lg {
		padding: 1.5rem;
	}

	.game-card--clickable {
		cursor: pointer;
		user-select: none;
	}

	.game-card--clickable:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-medium);
		border-color: var(--layer-brand-150);
	}

	.game-card--clickable:focus-visible {
		outline: none;
		box-shadow: var(--shadow-focus);
	}

	.game-card-content {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.game-card-header,
	.game-card-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
	}

	.game-card-footer {
		margin-top: 0.5rem;
	}

	.particles-container {
		position: absolute;
		inset: 0;
		pointer-events: none;
		opacity: 0.25;
	}

	.particle {
		position: absolute;
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--color-brand-300);
		opacity: 0.35;
		animation: cardParticle 6s ease-in-out infinite;
	}

	.particle:nth-child(2) {
		top: 30%;
		left: 70%;
		animation-delay: 1s;
	}

	.particle:nth-child(3) {
		top: 65%;
		left: 20%;
		animation-delay: 2s;
	}

	@keyframes cardParticle {
		0%, 100% {
			transform: translate3d(0, 0, 0) scale(0.8);
			opacity: 0.4;
		}
		50% {
			transform: translate3d(12px, -10px, 0) scale(1.1);
			opacity: 1;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.game-card,
		.game-card--clickable,
		.particle {
			transition: none;
			animation: none;
		}
	}
</style>
