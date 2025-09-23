<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';
	import { gameStore } from '$lib/stores/gameStore.js';
	import { navigateToGame } from '$lib/stores/navigationStore.js';
	import GameIcon from './GameIcon.svelte';
	import { getActiveGames, getComingSoonGames } from '$lib/data/games.js';
	import { staggeredFadeIn, scaleAndSlide } from '$lib/utils/transitions.js';
	import type { Game } from '$lib/types/Game.js';

	const dispatch = createEventDispatcher<{
		gameSelected: { game: Game };
	}>();

	let mounted = false;
	let showContent = false;
	let showActiveSection = false;
	let showComingSoonSection = false;
	let activeGames: Game[] = [];
	let comingSoonGames: Game[] = [];

	onMount(async () => {
		const allActiveGames = getActiveGames();
		const allComingSoonGames = getComingSoonGames();

		gameStore.setGames([...allActiveGames, ...allComingSoonGames]);

		activeGames = allActiveGames;
		comingSoonGames = allComingSoonGames;

		mounted = true;

		setTimeout(() => {
			showContent = true;
		}, 100);

		setTimeout(() => {
			showActiveSection = true;
		}, 300);

		setTimeout(() => {
			showComingSoonSection = true;
		}, 500);
	});

	function handleGameClick(event: CustomEvent<{ game: Game }>) {
		const { game } = event.detail;

		if (game.status === 'active') {
			dispatch('gameSelected', { game });
			navigateToGame();
		}
	}

	function handleGameHover(event: CustomEvent<{ game: Game }>) {
		const { game } = event.detail;
		// Game hover analytics could be added here
	}
</script>

<main class="game-center">
	{#if mounted}
	<header class="header" in:fade={{ duration: 600 }}>
		<h1 class="title font-heading text-h1 text-gpb-black" id="main-title">
			Игровой Центр
		</h1>
		<p class="subtitle font-body text-body text-gray-600" aria-describedby="main-title">
			Газпромбанка
		</p>
	</header>
	{/if}

	{#if showContent}
		<div class="content" in:scaleAndSlide={{ delay: 200, duration: 500, y: 20 }}>
			{#if showActiveSection}
				<section class="games-section" in:staggeredFadeIn={{ delay: 100, duration: 400 }}>
					<h2 class="section-title font-heading text-h3 text-gpb-black mb-4">
						Сейчас в игре
					</h2>
					<div class="games-grid">
						{#each activeGames as game, index}
							<div in:staggeredFadeIn={{ delay: index * 150, duration: 600 }}>
								<GameIcon
									{game}
									animationDelay={0}
									on:click={handleGameClick}
									on:hover={handleGameHover}
								/>
							</div>
						{/each}
					</div>
				</section>
			{/if}

			{#if showComingSoonSection}
				<section class="coming-soon-section" in:staggeredFadeIn={{ delay: 200, duration: 400 }}>
					<h2 class="section-title font-heading text-h3 text-gpb-black mb-4">
						Скоро в Центре
					</h2>
					<div class="coming-soon-grid">
						{#each comingSoonGames as game, index}
							<div in:staggeredFadeIn={{ delay: (index + activeGames.length) * 150, duration: 600 }}>
								<GameIcon
									{game}
									animationDelay={0}
									on:click={handleGameClick}
									on:hover={handleGameHover}
								/>
							</div>
						{/each}
					</div>
				</section>
			{/if}
		</div>
	{/if}
</main>

<style>
	.game-center {
		min-height: 100vh;
		padding: 2rem 1.5rem;
		background: linear-gradient(to bottom, #ffffff 0%, var(--color-gpb-lily) 100%);
		will-change: transform;
	}

	.header {
		text-align: center;
		margin-bottom: 3rem;
		padding-top: 1rem;
	}

	.title {
		font-size: 2rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
		background: linear-gradient(135deg, var(--color-gpb-violet) 0%, var(--color-gpb-raspberry) 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		line-height: 1.2;
	}

	.subtitle {
		font-size: 1.125rem;
		color: var(--color-gpb-henbane);
		font-weight: 500;
	}

	.content {
		max-width: 420px;
		margin: 0 auto;
		will-change: transform, opacity;
	}

	.games-section {
		margin-bottom: 3rem;
		will-change: transform, opacity;
	}

	.coming-soon-section {
		will-change: transform, opacity;
	}

	.section-title {
		font-size: 1.375rem;
		font-weight: 600;
		color: var(--color-gpb-black);
		margin-bottom: 1.25rem;
		line-height: 1.3;
		letter-spacing: -0.01em;
	}

	.games-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1rem;
	}

	.coming-soon-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.games-grid > div,
	.coming-soon-grid > div {
		will-change: transform, opacity;
	}

	@media (prefers-reduced-motion: reduce) {
		.game-center,
		.content,
		.games-section,
		.coming-soon-section,
		.games-grid > div,
		.coming-soon-grid > div {
			will-change: auto;
		}
	}

	@media (max-width: 380px) {
		.game-center {
			padding: 1.5rem 1rem;
		}

		.header {
			margin-bottom: 2.5rem;
		}

		.title {
			font-size: 1.75rem;
		}

		.subtitle {
			font-size: 1rem;
		}

		.section-title {
			font-size: 1.25rem;
		}

		.coming-soon-grid {
			grid-template-columns: 1fr;
			gap: 0.75rem;
		}

		.games-grid {
			gap: 0.75rem;
		}
	}

	@media (min-width: 440px) {
		.content {
			max-width: 440px;
		}

		.games-grid {
			gap: 1.25rem;
		}

		.coming-soon-grid {
			gap: 1.25rem;
		}
	}
</style>