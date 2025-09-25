<script lang="ts">
	import { scale } from 'svelte/transition';
	import { spring } from 'svelte/motion';
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

	const springScale = spring(1, {
		stiffness: 0.3,
		damping: 0.8
	});

	let isPressed = false;
	let isHovered = false;

	function handleClick() {
		if (isActive) {
			isPressed = true;
			springScale.set(0.95);
			setTimeout(() => {
				springScale.set(1);
				isPressed = false;
			}, 150);
			onclick?.();
		}
	}

	function handleMouseEnter() {
		if (isActive) {
			isHovered = true;
			springScale.set(1.02);
			onhover?.();
		}
	}

	function handleMouseLeave() {
		if (isActive) {
			isHovered = false;
			if (!isPressed) {
				springScale.set(1);
			}
		}
	}
</script>

<div
	class="game-card {game.gradient?.includes('mint') ? 'gradient-cyber' : game.gradient?.includes('raspberry') ? 'gradient-power' : 'gradient-wealth'}"
	class:text-white={true}
	class:game-card-locked={!isActive}
	class:stagger-item={true}
	style="--animation-delay: {animationDelay}ms; transform: scale({$springScale}); {game.gradient ? `background: ${game.gradient};` : ''}"
	role="button"
	tabindex={isActive ? 0 : -1}
	aria-label={`${game.name}: ${game.shortDescription}${isComingSoon ? ' - скоро' : ''}`}
	onclick={handleClick}
	onkeydown={(e) => e.key === 'Enter' && handleClick()}
	onmouseenter={handleMouseEnter}
	onmouseleave={handleMouseLeave}
>
	<!-- Particles background -->
	<div class="particles-container">
		<div class="particle" style="left: 20%; top: 15%; animation-delay: 0s;"></div>
		<div class="particle" style="left: 80%; top: 25%; animation-delay: 1s;"></div>
		<div class="particle" style="left: 30%; top: 75%; animation-delay: 0.5s;"></div>
	</div>

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

			<!-- Progress bar based on completion rate -->
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

	<!-- Decorative elements -->
	<div class="decoration-orb bg-white/10 w-16 h-16 -top-2 -right-2"></div>
	<div class="decoration-orb bg-black/10 w-20 h-20 -bottom-4 -left-4"></div>
	<div class="decoration-shine"></div>
</div>

<style>
	/* Custom overrides for game cards that use global classes */
	.game-card {
		min-height: 160px;
		min-width: 44px;
		cursor: pointer;
		transition: all 300ms ease-out;
	}

	.game-card:not(.game-card-locked):hover {
		transform: translateY(-4px) scale(1.05);
		filter: drop-shadow(0 0 20px rgba(88, 255, 255, 0.4));
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
	}

	.game-card:not(.game-card-locked):active {
		transform: scale(0.95);
		transition-duration: 75ms;
	}

	.game-card-locked {
		opacity: 0.6;
		cursor: not-allowed;
		filter: grayscale(0.5);
	}

	.game-card-locked:hover {
		transform: scale(1);
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
	}

	/* Accessibility */
	@media (prefers-reduced-motion: reduce) {
		.game-card,
		.particles-container .particle,
		.decoration-orb,
		.decoration-shine {
			transition: none;
			animation: none;
		}
	}

	/* High contrast */
	@media (prefers-contrast: high) {
		.game-card {
			border: 2px solid white;
		}

		.game-card-locked {
			border: 2px solid #9CA3AF;
		}
	}
</style>
