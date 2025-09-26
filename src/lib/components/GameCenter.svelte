<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import { gameStore, currentGameState } from '$lib/stores/gameStore.js';
	import { navigateToGame } from '$lib/stores/navigationStore.js';
	import { telegramStore } from '$lib/stores/telegramStore.js';
	import { totalPoints } from '$lib/stores/pointsStore.js';
	import GameIcon from './GameIcon.svelte';
	import { getActiveGames, getComingSoonGames } from '$lib/data/games.js';
	import { Star, Clock, Trophy } from 'lucide-svelte';
	import type { Game } from '$lib/types/Game.js';

	const dispatch = createEventDispatcher<{ gameSelected: { game: Game } }>();

	let mounted = $state(false);
	let showContent = $state(false);
	let showStatsSection = $state(false);
	let showActiveSection = $state(false);
	let showComingSoonSection = $state(false);
	let activeGames: Game[] = $state([]);
	let comingSoonGames: Game[] = $state([]);

	// Статистика пользователя
	let totalPlayTime = $derived(247); // в минутах
	let completedGames = $derived(8);

	onMount(async () => {
		const allActiveGames = getActiveGames();
		const allComingSoonGames = getComingSoonGames();

		gameStore.setGames([...allActiveGames, ...allComingSoonGames]);

		activeGames = allActiveGames;
		comingSoonGames = allComingSoonGames;

		mounted = true;
		showContent = true;
		showStatsSection = true;
		showActiveSection = true;
		showComingSoonSection = true;
	});

	function handleGameClick(game: Game) {
		dispatch('gameSelected', { game });
		navigateToGame();
	}

	function handleGameHover() {
	}
</script>

<main class="game-container">
	{#if mounted}
		<header class="header">
			<h1 class="font-game-title" id="main-title">
				Игровой Центр
			</h1>
			<p class="subtitle font-ui-secondary" aria-describedby="main-title">
				Газпромбанка
			</p>
		</header>
	{/if}

	{#if showContent}
		<div class="content">
			{#if showStatsSection}
				<section class="stats-section section-spacing">
					<div class="stats-grid">
						<div class="score-display">
							<div class="flex items-center gap-2 mb-2">
								<Star size={20} class="text-gpb-gold neon-glow" />
								<span class="font-ui-secondary">Всего очков</span>
							</div>
							<div class="score-value">{$totalPoints.toLocaleString()}</div>
						</div>

						<div class="mini-stat">
							<Clock size={20} class="mini-stat-icon text-gpb-mint neon-glow" />
							<div class="mini-stat-value">{totalPlayTime}</div>
							<div class="mini-stat-label">Минут в игре</div>
						</div>

						<div class="mini-stat">
							<Trophy size={20} class="mini-stat-icon text-gpb-emerald neon-glow" />
							<div class="mini-stat-value">{completedGames}</div>
							<div class="mini-stat-label">Игр пройдено</div>
						</div>
					</div>
				</section>
			{/if}

			{#if showActiveSection}
				<section class="games-section section-spacing">
					<h2 class="font-section-title">
						Сейчас в игре
					</h2>
					<div class="games-grid">
						{#each activeGames as game, index}
							<div>
								<GameIcon
									{game}
									animationDelay={0}
									onclick={() => handleGameClick(game)}
									onhover={handleGameHover}
								/>
							</div>
						{/each}
					</div>
				</section>
			{/if}

			{#if showComingSoonSection}
				<section class="coming-soon-section section-spacing">
					<h2 class="font-section-title">
						Скоро в Центре
					</h2>
					<div class="coming-soon-grid">
						{#each comingSoonGames as game, index}
							<div>
								<GameIcon
									{game}
									animationDelay={0}
									onclick={() => handleGameClick(game)}
									onhover={handleGameHover}
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
	.game-container {
		padding-left: 1rem;
		padding-right: 1rem;
		padding-top: 1.5rem;
		padding-bottom: calc(88px + 1.5rem);
		background: linear-gradient(135deg, #1919EF 0%, #9B59B6 50%, #DD41DB 100%);
		color: white;
		position: relative;
		min-height: 100%;
	}

	.header {
		text-align: center;
		margin-bottom: 2rem;
		padding-top: 1rem;
		position: relative;
	}

	.subtitle {
		color: rgba(255, 255, 255, 0.9);
		font-size: 1.125rem;
		font-weight: 500;
		margin-top: 0.5rem;
		text-shadow: 0 2px 4px rgba(0,0,0,0.3);
	}

	.content {
		max-width: 28rem;
		margin-left: auto;
		margin-right: auto;
	}

	.stats-section {
		margin-bottom: 2rem;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
	}

	.stats-grid > .score-display {
		grid-column: span 3;
		text-align: center;
		padding: 1.5rem;
		border-radius: 1rem;
		background: linear-gradient(135deg, #FFD700 0%, #50C878 100%);
		color: white;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
		position: relative;
		overflow: hidden;
	}

	.stats-grid > .mini-stat {
		text-align: center;
	}

	.games-section,
	.coming-soon-section {
		margin-bottom: 2rem;
	}

	.games-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1rem;
	}

	.coming-soon-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
	}

	@media (max-width: 380px) {
		.game-container {
			padding-left: 0.75rem;
			padding-right: 0.75rem;
			padding-top: 1rem;
			padding-bottom: calc(88px + 1rem);
		}

		.stats-grid {
			grid-template-columns: 1fr;
			gap: 0.75rem;
		}

		.stats-grid > .score-display {
			grid-column: span 1;
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
			max-width: 32rem;
		}

		.stats-grid {
			gap: 1.5rem;
		}

		.games-grid {
			gap: 1.5rem;
		}

		.coming-soon-grid {
			gap: 1.5rem;
		}
	}

	@media (prefers-contrast: high) {
		.game-container {
			background-color: #000000;
			border: 2px solid white;
		}

		.subtitle {
			color: white;
		}
	}
</style>