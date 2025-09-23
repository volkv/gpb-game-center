<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { scale } from 'svelte/transition';
	import { spring } from 'svelte/motion';
	import { LazyImage } from '$lib';
	import type { Game } from '$lib/types/Game.js';
	import { GAME_STATUS } from '$lib/utils/constants.js';

	export let game: Game;
	export let animationDelay: number = 0;

	const dispatch = createEventDispatcher<{
		click: { game: Game };
		hover: { game: Game };
	}>();

	$: isActive = game.status === GAME_STATUS.ACTIVE;
	$: isComingSoon = game.status === GAME_STATUS.COMING_SOON;

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
			dispatch('click', { game });
		}
	}

	function handleMouseEnter() {
		if (isActive) {
			isHovered = true;
			springScale.set(1.02);
			dispatch('hover', { game });
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
	class="game-icon"
	class:game-icon-inactive={!isActive}
	style="--animation-delay: {animationDelay}ms; transform: scale({$springScale})"
	role="button"
	tabindex={isActive ? 0 : -1}
	aria-label={`${game.name}: ${game.shortDescription}${isComingSoon ? ' - скоро' : ''}`}
	on:click={handleClick}
	on:keydown={(e) => e.key === 'Enter' && handleClick()}
	on:mouseenter={handleMouseEnter}
	on:mouseleave={handleMouseLeave}
>
	<div class="game-icon-background" style="background: {game.gradient}">
		{#if game.image}
			<div class="game-icon-image-overlay">
				<LazyImage
					src={game.image.src}
					alt={game.image.alt}
					class="game-background-image"
					loading="lazy"
				/>
			</div>
		{/if}

		<div class="game-icon-content">
			<div class="game-icon-symbol" style="color: {game.themeColor}">
				<svg
					class="icon"
					width="40"
					height="40"
					viewBox="0 0 40 40"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					{#if game.category === 'quiz'}
						<g>
							<path
								d="M20 4L25 16H35L27.5 23L30 35L20 28L10 35L12.5 23L5 16H15L20 4Z"
								fill="currentColor"
								fill-opacity="0.9"
							/>
							<circle cx="20" cy="20" r="8" fill="none" stroke="currentColor" stroke-width="2" opacity="0.6" />
							<path d="M16 18L19 21L24 16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.8" />
						</g>
					{:else if game.category === 'match3'}
						<g>
							<circle cx="14" cy="14" r="5" fill="currentColor" fill-opacity="0.8" />
							<circle cx="26" cy="14" r="5" fill="currentColor" fill-opacity="0.9" />
							<circle cx="20" cy="26" r="5" fill="currentColor" fill-opacity="0.7" />
							<path d="M14 14L26 14L20 26Z" stroke="currentColor" stroke-width="2" opacity="0.5" />
							<circle cx="20" cy="8" r="2" fill="currentColor" fill-opacity="0.6" />
							<circle cx="32" cy="20" r="2" fill="currentColor" fill-opacity="0.6" />
							<circle cx="8" cy="20" r="2" fill="currentColor" fill-opacity="0.6" />
						</g>
					{:else if game.category === 'crossword'}
						<g>
							<rect x="8" y="8" width="24" height="24" rx="2" fill="none" stroke="currentColor" stroke-width="2.5" />
							<line x1="13" y1="13" x2="27" y2="13" stroke="currentColor" stroke-width="2" />
							<line x1="13" y1="18" x2="22" y2="18" stroke="currentColor" stroke-width="2" />
							<line x1="16" y1="23" x2="27" y2="23" stroke="currentColor" stroke-width="2" />
							<line x1="13" y1="27" x2="20" y2="27" stroke="currentColor" stroke-width="2" />
							<circle cx="13" cy="13" r="1.5" fill="currentColor" />
							<circle cx="16" cy="18" r="1.5" fill="currentColor" />
							<circle cx="20" cy="23" r="1.5" fill="currentColor" />
						</g>
					{:else if game.category === 'educational'}
						<g>
							<path d="M20 6L30 12V28L20 34L10 28V12L20 6Z" fill="currentColor" fill-opacity="0.8" />
							<circle cx="20" cy="20" r="6" fill="none" stroke="currentColor" stroke-width="2.5" opacity="0.9" />
							<path d="M17 20L19 22L23 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
							<circle cx="15" cy="12" r="1.5" fill="currentColor" opacity="0.7" />
							<circle cx="25" cy="12" r="1.5" fill="currentColor" opacity="0.7" />
						</g>
					{:else}
						<rect x="10" y="10" width="20" height="20" rx="4" fill="currentColor" fill-opacity="0.8" />
					{/if}
				</svg>
			</div>
			<div class="game-info">
				<h3 class="game-title font-heading text-base font-semibold text-white mb-1">
					{game.name}
				</h3>
				<p class="game-subtitle font-body text-sm text-white text-opacity-90">
					{game.shortDescription}
				</p>
			</div>
		</div>
	</div>

	{#if isComingSoon}
		<div class="coming-soon-badge">
			<span class="badge-text font-body text-xs font-medium">Скоро</span>
		</div>
	{/if}

	{#if isActive}
		<div class="active-indicator"></div>
	{/if}
</div>

<style>
	.game-icon {
		position: relative;
		display: block;
		width: 100%;
		min-height: 120px;
		min-width: 44px;
		animation: slideUpBounce 0.6s ease-out;
		animation-delay: var(--animation-delay, 0ms);
		animation-fill-mode: both;
		cursor: pointer;
	}

	.game-icon-background {
		width: 100%;
		height: 100%;
		border-radius: 0.75rem;
		padding: 1.25rem;
		position: relative;
		overflow: hidden;
		transition: all 0.3s ease;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.game-icon-background::before {
		content: '';
		position: absolute;
		inset: 0;
		background: white;
		opacity: 0;
		transition: opacity 0.2s ease;
	}

	.game-icon:not(.game-icon-inactive) .game-icon-background:hover {
		box-shadow: 0 12px 24px -6px rgba(0, 0, 0, 0.2);
	}

	.game-icon:not(.game-icon-inactive):hover .game-icon-background::before {
		opacity: 0.1;
	}

	.game-icon:not(.game-icon-inactive):active .game-icon-background {
		box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.15);
	}

	.game-icon-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		height: 100%;
		position: relative;
		z-index: 2;
	}

	.game-icon-symbol {
		margin-bottom: 0.75rem;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
	}

	.icon {
		width: 40px;
		height: 40px;
	}

	.game-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.game-title {
		line-height: 1.2;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
	}

	.game-subtitle {
		line-height: 1.3;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
	}

	.coming-soon-badge {
		position: absolute;
		top: -0.375rem;
		right: -0.375rem;
		background: var(--color-gpb-mint);
		border-radius: 1rem;
		padding: 0.25rem 0.75rem;
		z-index: 10;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
	}

	.badge-text {
		color: var(--color-gpb-black);
		white-space: nowrap;
	}

	.active-indicator {
		position: absolute;
		bottom: 0.375rem;
		right: 0.375rem;
		width: 8px;
		height: 8px;
		background: var(--color-gpb-mint);
		border-radius: 50%;
		z-index: 10;
		animation: pulse 2s infinite;
	}

	.game-icon-inactive {
		pointer-events: none;
		cursor: default;
	}

	.game-icon-inactive .game-icon-background {
		filter: grayscale(1) opacity(0.6);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
	}

	.game-icon-inactive .game-icon-content {
		opacity: 0.7;
	}

	@keyframes slideUpBounce {
		0% {
			opacity: 0;
			transform: translateY(20px) scale(0.95);
		}
		60% {
			opacity: 1;
			transform: translateY(-4px) scale(1.02);
		}
		100% {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
			transform: scale(1);
		}
		50% {
			opacity: 0.5;
			transform: scale(1.2);
		}
	}
</style>