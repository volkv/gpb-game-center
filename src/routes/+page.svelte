<script lang="ts">
	import { currentScreen } from '$lib/stores/navigationStore';
	import BankHome from '$lib/components/BankHome.svelte';
	import { slideInOut, reduceMotionTransition } from '$lib/utils/transitions.js';
	import type { Game } from '$lib/types/Game';
	import type GameCenter from '$lib/components/GameCenter.svelte';
	import type GameContainer from '$lib/components/GameContainer.svelte';

	let selectedGame = $state<Game | null>(null);
	let GameCenterComponent = $state<typeof GameCenter | null>(null);
	let GameContainerComponent = $state<typeof GameContainer | null>(null);
	let gameCenterLoadPromise: Promise<void> | null = null;
	let gameContainerLoadPromise: Promise<void> | null = null;
	let isGameCenterLoading = $state(false);
	let isGameContainerLoading = $state(false);

	const slideLeft = reduceMotionTransition(
		(node, params) => slideInOut(node, { ...params, x: -100 })
	);

	const slideRight = reduceMotionTransition(
		(node, params) => slideInOut(node, { ...params, x: 100 })
	);

	async function ensureGameCenterLoaded() {
		if (GameCenterComponent) return;
		if (gameCenterLoadPromise) {
			await gameCenterLoadPromise;
			return;
		}

		isGameCenterLoading = true;
		gameCenterLoadPromise = import('$lib/components/GameCenter.svelte')
			.then((module) => {
				GameCenterComponent = module.default;
			})
			.finally(() => {
				isGameCenterLoading = false;
				gameCenterLoadPromise = null;
			});

		await gameCenterLoadPromise;
	}

	async function ensureGameContainerLoaded() {
		if (GameContainerComponent) return;
		if (gameContainerLoadPromise) {
			await gameContainerLoadPromise;
			return;
		}

		isGameContainerLoading = true;
		gameContainerLoadPromise = import('$lib/components/GameContainer.svelte')
			.then((module) => {
				GameContainerComponent = module.default;
			})
			.finally(() => {
				isGameContainerLoading = false;
				gameContainerLoadPromise = null;
			});

		await gameContainerLoadPromise;
	}

	$effect(() => {
		if ($currentScreen === 'game-center') {
			ensureGameCenterLoaded();
		}
	});

	$effect(() => {
		if ($currentScreen === 'game' && selectedGame) {
			ensureGameContainerLoaded();
		}
	});

	function handleGameSelected(event: CustomEvent<{ game: Game }>) {
		selectedGame = event.detail.game;
		ensureGameContainerLoaded();
	}

	function handleGameExit() {
		selectedGame = null;
	}
</script>

<div class="screen-container">
	{#key $currentScreen}
		{#if $currentScreen === 'bank-home'}
			<div
				class="screen"
				in:slideRight={{ duration: 400, delay: 50 }}
				out:slideLeft={{ duration: 300 }}
			>
				<BankHome />
			</div>
		{:else if $currentScreen === 'game-center'}
			<div
				class="screen"
				in:slideRight={{ duration: 400, delay: 50 }}
				out:slideLeft={{ duration: 300 }}
			>
				{#if GameCenterComponent}
					<GameCenterComponent on:gameSelected={handleGameSelected} />
				{:else}
					<div class="lazy-fallback" aria-live="polite" aria-busy={isGameCenterLoading}>
						<div class="lazy-spinner" aria-hidden="true"></div>
						<p class="lazy-text">Загружаем игровой центр…</p>
					</div>
				{/if}
			</div>
		{:else if $currentScreen === 'game' && selectedGame}
			<div
				class="screen"
				in:slideLeft={{ duration: 400, delay: 50 }}
				out:slideRight={{ duration: 300 }}
			>
				{#if GameContainerComponent}
					<GameContainerComponent
						game={selectedGame}
						onexit={handleGameExit}
					/>
				{:else}
					<div class="lazy-fallback" aria-live="polite" aria-busy={isGameContainerLoading}>
						<div class="lazy-spinner" aria-hidden="true"></div>
						<p class="lazy-text">Готовим игру…</p>
					</div>
				{/if}
			</div>
		{:else}
			<div
				class="screen"
				in:slideRight={{ duration: 400, delay: 50 }}
				out:slideLeft={{ duration: 300 }}
			>
				<BankHome />
			</div>
		{/if}
	{/key}
</div>

<style>
	.screen-container {
		position: relative;
		width: 100%;
		height: 100%;
		min-height: 100%;
		overflow-x: hidden;
	}

	.screen {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		min-height: 100%;
		will-change: transform, opacity;
	}

	.lazy-fallback {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		gap: 0.75rem;
		color: rgb(51, 51, 51);
	}

	.lazy-spinner {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		border: 3px solid rgba(0, 0, 0, 0.08);
		border-top-color: rgba(25, 25, 239, 0.9);
		animation: lazy-spin 0.8s linear infinite;
	}

	.lazy-text {
		font-size: 0.9rem;
		font-weight: 500;
	}

	@keyframes lazy-spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.screen {
			will-change: auto;
		}
	}
</style>
