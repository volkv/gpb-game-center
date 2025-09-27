<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import { gameStore } from '$lib/stores/gameStore.js';
	import { navigateToGame } from '$lib/stores/navigationStore.js';
	import { totalPoints } from '$lib/stores/pointsStore.js';
	import GameIcon from './GameIcon.svelte';
	import { getActiveGames, getComingSoonGames } from '$lib/data/games.js';
	import { Clock, Trophy, Star } from 'lucide-svelte';
	import type { Game } from '$lib/types/Game.js';

	const dispatch = createEventDispatcher<{ gameSelected: { game: Game } }>();

	let mounted = $state(false);
	let showContent = $state(false);
	let activeGames: Game[] = $state([]);
	let comingSoonGames: Game[] = $state([]);

	let totalPlayTime = $derived(247);
	let completedGames = $derived(8);

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
					<Star size={20} aria-hidden="true" />
					<div>
						<span class="hero-score__label">Всего очков</span>
						<span class="hero-score__value">{$totalPoints.toLocaleString()}</span>
					</div>
				</div>
			</div>
		</section>
	{/if}

	{#if showContent}
		<section class="stats surface-card" aria-label="Статистика игрока">
			<div class="stats-grid">
				<div class="metric-card">
					<Clock size={18} aria-hidden="true" />
					<div>
						<span class="metric-card__label">Минут в игре</span>
						<span class="metric-card__value">{totalPlayTime}</span>
					</div>
				</div>
				<div class="metric-card">
					<Trophy size={18} aria-hidden="true" />
					<div>
						<span class="metric-card__label">Игр пройдено</span>
						<span class="metric-card__value">{completedGames}</span>
					</div>
				</div>
				<div class="metric-card">
					<Star size={18} aria-hidden="true" />
					<div>
						<span class="metric-card__label">Активных игр</span>
						<span class="metric-card__value">{activeGames.length}</span>
					</div>
				</div>
			</div>
		</section>

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
	}

	.hero {
		display: flex;
		flex-direction: column;
		gap: 1.75rem;
		padding: 1.75rem;
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
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.75rem;
		align-items: center;
		padding: 0.75rem 1rem;
		border-radius: var(--radius-lg);
		background-color: rgba(255, 255, 255, 0.14);
		backdrop-filter: blur(6px);
	}

	.hero-score :global(svg) {
		color: rgba(255, 255, 255, 0.82);
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

	.stats {
		padding: 1.5rem;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 1rem;
	}

	.metric-card {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border-subtle);
		padding: 1rem;
		background: linear-gradient(135deg, rgba(6, 6, 152, 0.12) 0%, rgba(31, 196, 217, 0.08) 100%);
	}

	.metric-card:nth-child(2) {
		background: linear-gradient(135deg, rgba(31, 196, 217, 0.14) 0%, rgba(31, 196, 217, 0.05) 100%);
	}

	.metric-card:nth-child(3) {
		background: linear-gradient(135deg, rgba(6, 6, 152, 0.14) 0%, rgba(6, 6, 152, 0.05) 100%);
	}

	.metric-card :global(svg) {
		color: var(--color-brand-500);
	}

	.metric-card__label {
		display: block;
		font-size: 0.75rem;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--color-fg-muted);
	}

	.metric-card__value {
		font-family: var(--font-display);
		font-size: 1.35rem;
		font-weight: 600;
		color: var(--color-fg-primary);
	}

	.section {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.games-grid {
		display: grid;
		gap: 1.25rem;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
	}

	.games-grid--compact {
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
	}

	.games-grid__item {
		list-style: none;
	}

	@media (max-width: 420px) {
		.hero {
			padding: 1.5rem;
		}

		.stats {
			padding: 1.25rem;
		}

		.games-grid {
			grid-template-columns: 1fr;
		}
	}

	@media (min-width: 768px) {
		.hero {
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
		}

		.hero-score {
			max-width: 15rem;
		}
	}
</style>
