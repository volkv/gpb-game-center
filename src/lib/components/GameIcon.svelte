<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Game } from '$lib/types/Game.js';
	import { GAME_STATUS } from '$lib/utils/constants.js';
	import { ChevronRight, Star } from 'lucide-svelte';

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
		<div class="game-card__icon" aria-hidden="true" class:game-card__icon--placeholder={isComingSoon}>
			{#if isComingSoon}
				<div class="icon-placeholder">?</div>
			{:else}
				<img src={game.icon.url} alt={game.icon.alt} width="32" height="32" />
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
		<button class="game-card__button" disabled={!isActive} onclick={handleClick}>
			{isComingSoon ? 'Скоро' : 'Играть'}
		</button>
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
		overflow: hidden;
	}

	.game-card__icon img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	.game-card__icon--placeholder {
		background: var(--layer-brand-050);
	}

	.icon-placeholder {
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--color-fg-muted);
		opacity: 0.4;
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
		font-size: 0.65rem;
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

	.game-card__button {
		width: 100%;
		padding: 0.75rem 1rem;
		border: none;
		border-radius: var(--radius-lg);
		background: var(--game-accent);
		color: white;
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
		transition: opacity 160ms ease, transform 160ms ease;
	}

	.game-card__button:hover:not(:disabled) {
		opacity: 0.9;
		transform: scale(0.98);
	}

	.game-card__button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

</style>
