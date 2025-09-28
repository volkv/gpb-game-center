<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import { gameStore } from '$lib/stores/gameStore.js';
	import { navigateToGame } from '$lib/stores/navigationStore.js';
	import { totalPoints } from '$lib/stores/pointsStore.js';
	import GameIcon from './GameIcon.svelte';
	import { getActiveGames, getComingSoonGames } from '$lib/data/games.js';
	import { Clock, Trophy, Star } from 'lucide-svelte';
	import type { Game } from '$lib/types/Game.js';
	import StatsSection from './StatsSection.svelte';

	const dispatch = createEventDispatcher<{ gameSelected: { game: Game } }>();

	let mounted = $state(false);
	let showContent = $state(false);
	let activeGames: Game[] = $state([]);
	let comingSoonGames: Game[] = $state([]);

	let totalPlayTime = $derived(247);
	let completedGames = $derived(8);

	const statsMetrics = $derived([
		{ label: 'Минут в игре', value: totalPlayTime, icon: Clock },
		{ label: 'Игр пройдено', value: completedGames, icon: Trophy },
		{ label: 'Активных игр', value: activeGames.length, icon: Star }
	]);

	onMount(() => {
		const allActiveGames = getActiveGames();
		const allComingSoonGames = getComingSoonGames();

		gameStore.setGames([...allActiveGames, ...allComingSoonGames]);

		activeGames = allActiveGames;
		comingSoonGames = allComingSoonGames;

		mounted = true;
		showContent = true;
	});

	function handleGameClick(game: Game) {
		dispatch('gameSelected', { game });
		navigateToGame();
	}
</script>

<main class="game-center">
	{#if mounted}
		<section class="hero surface-contrast" aria-labelledby="game-center-title">
			<div>
				<div class="hero-copy">
					<p class="hero-eyebrow">Игровой центр</p>
					<h1 class="hero-title" id="game-center-title">Газпромбанка</h1>
					<p class="hero-subtitle text-balance">
						Игровые сценарии, которые закрепляют финансовые навыки и мотивируют клиентов на развитие.
					</p>
				</div>

				<div class="mt-5 hero-score" aria-live="polite">
					<div>
						<span class="hero-score__label">Всего очков</span>
						<div class="hero-score__value-wrapper">
					
							<span class="hero-score__value">{$totalPoints.toLocaleString()}</span>
							<Star size={20} aria-hidden="true" />
						</div>
					</div>
				</div>
			</div>
		</section>
	{/if}

	{#if showContent}
		<StatsSection ariaLabel="Статистика игрока" metrics={statsMetrics} columns={3} />

		<section class="section" aria-labelledby="active-games-heading">
			<div class="section-heading">
				<p class="section-heading__eyebrow">Коллекция</p>
				<h2 class="section-heading__title" id="active-games-heading">Доступны сейчас</h2>
			</div>
			<div class="games-grid" role="list">
				{#each activeGames as game (game.id)}
					<div class="games-grid__item" role="listitem">
						<GameIcon {game} onclick={() => handleGameClick(game)} />
					</div>
				{/each}
			</div>
		</section>

		{#if comingSoonGames.length}
			<section class="section" aria-labelledby="coming-soon-heading">
				<div class="section-heading">
					<p class="section-heading__eyebrow">Скоро</p>
					<h2 class="section-heading__title" id="coming-soon-heading">В разработке</h2>
				</div>
				<div class="games-grid games-grid--compact" role="list">
					{#each comingSoonGames as game (game.id)}
						<div class="games-grid__item" role="listitem">
							<GameIcon {game} onclick={() => handleGameClick(game)} />
						</div>
					{/each}
				</div>
			</section>
		{/if}
	{/if}
</main>

<style>
	.game-center {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		padding-bottom: calc(96px + 0.5rem);
	}

	.hero {
		display: flex;
		flex-direction: column;
		gap: 1.75rem;
		padding: 1.5rem;
	}

	.hero-copy {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.hero-eyebrow {
		font-size: 0.75rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.72);
	}

	.hero-title {
		font-family: var(--font-display);
		font-size: clamp(1.6rem, 1.3rem + 1vw, 2.05rem);
		font-weight: 700;
		letter-spacing: -0.01em;
		color: var(--color-fg-inverse);
		margin: 0;
	}

	.hero-subtitle {
		font-size: 0.95rem;
		color: rgba(255, 255, 255, 0.78);
		margin: 0;
		max-width: 28rem;
	}

	.hero-score {
		display: flex;
		justify-content: flex-start;
		padding: 0.75rem 1rem;
		border-radius: var(--radius-lg);
		background-color: rgba(255, 255, 255, 0.14);
		backdrop-filter: blur(6px);
	}

	.hero-score__label {
		letter-spacing: 0.08em;
		text-transform: uppercase;
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.7);
		display: block;
	}

	.hero-score__value {
		font-family: var(--font-display);
		font-size: clamp(1.75rem, 1.4rem + 1vw, 2.2rem);
		font-weight: 700;
		color: var(--color-fg-inverse);
	}

	.hero-score__value-wrapper {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.hero-score__value-wrapper :global(svg) {
		color: rgba(255, 255, 255, 0.82);
		flex-shrink: 0;
	}


	.section {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.games-grid {
		display: grid;
		gap: 1rem;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
	}

	.games-grid--compact {
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
	}

	.games-grid__item {
		list-style: none;
	}
</style>
