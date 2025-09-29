<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Game } from '$lib/types/Game.js';
	import { GAME_STATUS } from '$lib/utils/constants.js';
	import { Shield, Gem, BookOpen, GraduationCap, Building, ChevronRight, Star } from 'lucide-svelte';

	interface Props {
		game: Game;
		animationDelay?: number;
		onclick?: () => void;
		onhover?: () => void;
	}

	let { game, onclick, onhover }: Props = $props();

	const dispatch = createEventDispatcher<{ click: { game: Game }; hover: { game: Game } }>();

	let isActive = $derived(game.status === GAME_STATUS.ACTIVE);
	let isComingSoon = $derived(game.status === GAME_STATUS.COMING_SOON);

	function getGameIcon(category: string) {
		switch (category) {
			case 'quiz':
				return Shield;
			case 'match3':
				return Gem;
			case 'crossword':
				return BookOpen;
			case 'educational':
				return GraduationCap;
			default:
				return Building;
		}
	}

	let GameIconComponent = $derived(getGameIcon(game.category));

	function handleClick() {
		if (isActive) {
			onclick?.();
			dispatch('click', { game });
		}
	}

	function handleMouseEnter() {
		if (isActive) {
			onhover?.();
			dispatch('hover', { game });
		}
	}
</script>

<div
	class="game-card"
	class:game-card--disabled={!isActive}
	style={`--game-gradient: ${game.gradient ?? 'linear-gradient(135deg, rgba(6,6,152,0.16) 0%, rgba(31,196,217,0.12) 100%)'}; --game-accent: ${game.themeColor ?? 'var(--color-brand-500)'};`}
	role="button"
	tabindex={isActive ? 0 : -1}
	aria-label={`${game.name}: ${game.shortDescription}${isComingSoon ? ' — скоро' : ''}`}
	onclick={handleClick}
	onkeydown={(e) => e.key === 'Enter' && handleClick()}
	onmouseenter={handleMouseEnter}
>
	<div class="game-card__header">
		<div class="game-card__icon" aria-hidden="true">
			{#if GameIconComponent}
				{@const IconComponent = GameIconComponent}
				<IconComponent size={28} stroke-width={1.8} />
			{/if}
		</div>
		<div class="game-card__header-content">
			<h3 class="game-card__title">{game.name}</h3>
			<p class="game-card__subtitle">{game.shortDescription}</p>
		</div>
		{#if isComingSoon}
			<span class="game-card__badge game-card__badge--muted">Скоро</span>
		{:else if game.name === 'Щит и Рубль'}
			<span class="game-card__badge">В фокусе</span>
		{:else if game.name === 'Золотой Запас'}
			<span class="game-card__badge game-card__badge--outline">Новое</span>
		{:else}
			<!-- <span class="game-card__badge game-card__badge--outline">Новое</span> -->
		{/if}
	</div>

	<div class="game-card__body">
		<p class="game-card__description">{game.description}</p>
	</div>

	<div class="game-card__footer">
		<div class="progress" aria-hidden="true">
			<div class="progress__fill" style={`width: ${Math.round(game.metrics.completionRate * 100)}%;`}></div>
		</div>
		<div class="game-card__meta">
			<span class="game-card__meta-item">
				<Star class="shrink-0" size={14} aria-hidden="true" />
				{game.relatedProducts[0]?.name || 'Банковский продукт'}
			</span>
			<ChevronRight size={16} aria-hidden="true" />
		</div>
	</div>
</div>

<style>
	.game-card {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1.25rem;
		border-radius: var(--radius-xl);
	border: 1px solid var(--color-border-muted);
		background: var(--color-surface-card);
		box-shadow: var(--shadow-soft);
		transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
		cursor: pointer;
		height: 100%;
	}

	.game-card::before {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
		opacity: 0.18;
		background: var(--game-gradient);
		pointer-events: none;
	}

	.game-card:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-medium);
		border-color: var(--layer-brand-150);
	}

	.game-card:focus-visible {
		outline: none;
		box-shadow: var(--shadow-focus);
	}

	.game-card--disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
		box-shadow: none;
	}

	.game-card--disabled:hover {
		transform: none;
		box-shadow: none;
	}

	.game-card__header {
		display: flex;
		align-items: flex-start;
		gap: 0.85rem;
	}

	.game-card__icon {
		width: 48px;
		height: 48px;
		flex-shrink: 0;
		border-radius: var(--radius-lg);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--game-accent);
		background: var(--layer-brand-050);
	}

	.game-card__icon :global(svg) {
		color: inherit;
	}

	.game-card__header-content {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		flex: 1;
		min-width: 0;
	}

	.game-card__badge {
		display: inline-flex;
		align-items: center;
		align-self: flex-start;
		flex-shrink: 0;
		gap: 0.35rem;
		padding: 0.25rem 0.65rem;
		border-radius: var(--radius-full);
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		background: var(--layer-brand-100);
		color: var(--game-accent);
	}

	.game-card__badge--outline {
		background: transparent;
		border: 1px solid var(--layer-brand-150);
	}

	.game-card__badge--muted {
		background: var(--color-neutral-100);
		color: var(--color-fg-secondary);
	}

	.game-card__title {
		margin: 0;
		font-family: var(--font-display);
		font-size: 1.05rem;
		font-weight: 600;
		line-height: 1.3;
		color: var(--color-fg-primary);
	}

	.game-card__subtitle {
		margin: 0;
		font-size: 0.8rem;
		line-height: 1.4;
		color: var(--color-fg-muted);
	}

	.game-card__body {
		display: flex;
		flex-direction: column;
	}

	.game-card__description {
		margin: 0;
		font-size: 0.875rem;
		line-height: 1.5;
		color: var(--color-fg-secondary);
	}

	.game-card__footer {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-top: auto;
	}

	.progress {
		height: 6px;
		border-radius: 999px;
		background: var(--color-neutral-100);
		
	}

	.progress__fill {
		height: 100%;
		border-radius: inherit;
		background: var(--game-accent);
	}

	.game-card__meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		font-size: 0.85rem;
		color: var(--color-fg-secondary);
	}

	.game-card__meta-item {
		display: inline-flex;
		align-items: center;
		gap: 0.75rem;
	}

	.game-card__meta :global(svg) {
		color: var(--color-fg-muted);
	}

	.game-card--disabled .progress__fill {
		background: var(--color-neutral-300);
	}

</style>
