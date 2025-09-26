<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { LazyImage } from '$lib';
	import type { Game } from '$lib/types/Game.js';
	import { GAME_STATUS } from '$lib/utils/constants.js';
	import { Shield, Gem, BookOpen, GraduationCap, Building, ChevronRight, Star } from 'lucide-svelte';

	interface Props {
		game: Game;
		animationDelay?: number;
		onclick?: () => void;
		onhover?: () => void;
	}

	let { game, animationDelay = 0, onclick, onhover }: Props = $props();

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
		}
	}

	function handleMouseEnter() {
		if (isActive) {
			onhover?.();
		}
	}

	function handleMouseLeave() {
	}
</script>

<div
	class="game-card {game.gradient?.includes('mint') ? 'gradient-cyber' : game.gradient?.includes('raspberry') ? 'gradient-power' : 'gradient-wealth'}"
	class:text-white={true}
	class:game-card-locked={!isActive}
	style="{game.gradient ? `background: ${game.gradient};` : ''}"
	role="button"
	tabindex={isActive ? 0 : -1}
	aria-label={`${game.name}: ${game.shortDescription}${isComingSoon ? ' - скоро' : ''}`}
	onclick={handleClick}
	onkeydown={(e) => e.key === 'Enter' && handleClick()}
	onmouseenter={handleMouseEnter}
	onmouseleave={handleMouseLeave}
>
	<div class="game-card-content">
		<div class="game-card-header">
			<div class="game-card-icon neon-glow">
				{#if GameIconComponent}
					{@const IconComponent = GameIconComponent}
					<IconComponent size={32} class="text-white" />
				{/if}
			</div>
			{#if isComingSoon}
				<div class="badge-locked">
					Скоро
				</div>
			{:else if game.name === 'Щит и Рубль'}
				<div class="badge-hot">
					HOT
				</div>
			{:else}
				<div class="badge-new">
					НОВОЕ
				</div>
			{/if}
		</div>

		<div>
			<h3 class="font-card-title">{game.name}</h3>
			<p class="font-card-subtitle mb-3">{game.shortDescription}</p>

			<div class="progress-bar mb-3">
				<div class="progress-fill" style="width: {game.metrics.completionRate * 100}%"></div>
			</div>

			<div class="game-card-footer">
				<div class="flex items-center gap-1">
					<Star size={12} class="fill-current text-gpb-gold" />
					<span>{game.relatedProducts[0]?.name || 'Банковский продукт'}</span>
				</div>
				<ChevronRight size={16} class="opacity-60" />
			</div>
		</div>
	</div>
</div>

<style>
	.game-card {
		min-height: 160px;
		min-width: 44px;
		cursor: pointer;
	}

	.game-card-locked {
		opacity: 0.6;
		cursor: not-allowed;
		filter: grayscale(0.5);
	}

	@media (prefers-contrast: high) {
		.game-card {
			border: 2px solid white;
		}

		.game-card-locked {
			border: 2px solid #9CA3AF;
		}
	}
</style>