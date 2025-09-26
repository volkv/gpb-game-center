<script lang="ts">
	import { currentScreen } from '$lib/stores/navigationStore';
	import BankHome from '$lib/components/BankHome.svelte';
	import type { Game } from '$lib/types/Game';
	import type GameCenter from '$lib/components/GameCenter.svelte';
	import type GameContainer from '$lib/components/GameContainer.svelte';
	import type RewardsShop from '$lib/components/RewardsShop.svelte';
	import type Tasks from '$lib/components/Tasks.svelte';
	import TabNavigation from '$lib/components/TabNavigation.svelte';

	let selectedGame = $state<Game | null>(null);
	let GameCenterComponent = $state<typeof GameCenter | null>(null);
	let GameContainerComponent = $state<typeof GameContainer | null>(null);
	let RewardsShopComponent = $state<typeof RewardsShop | null>(null);
	let TasksComponent = $state<typeof Tasks | null>(null);
	let gameCenterLoadPromise: Promise<void> | null = null;
	let gameContainerLoadPromise: Promise<void> | null = null;
	let rewardsShopLoadPromise: Promise<void> | null = null;
	let tasksLoadPromise: Promise<void> | null = null;
	let isGameCenterLoading = $state(false);
	let isGameContainerLoading = $state(false);
	let isRewardsShopLoading = $state(false);
	let isTasksLoading = $state(false);


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

	async function ensureRewardsShopLoaded() {
		if (RewardsShopComponent) return;
		if (rewardsShopLoadPromise) {
			await rewardsShopLoadPromise;
			return;
		}

		isRewardsShopLoading = true;
		rewardsShopLoadPromise = import('$lib/components/RewardsShop.svelte')
			.then((module) => {
				RewardsShopComponent = module.default;
			})
			.finally(() => {
				isRewardsShopLoading = false;
				rewardsShopLoadPromise = null;
			});

		await rewardsShopLoadPromise;
	}

	async function ensureTasksLoaded() {
		if (TasksComponent) return;
		if (tasksLoadPromise) {
			await tasksLoadPromise;
			return;
		}

		isTasksLoading = true;
		tasksLoadPromise = import('$lib/components/Tasks.svelte')
			.then((module) => {
				TasksComponent = module.default;
			})
			.finally(() => {
				isTasksLoading = false;
				tasksLoadPromise = null;
			});

		await tasksLoadPromise;
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

	$effect(() => {
		if ($currentScreen === 'rewards-shop') {
			ensureRewardsShopLoaded();
		}
	});

	$effect(() => {
		if ($currentScreen === 'tasks') {
			ensureTasksLoaded();
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

{#key $currentScreen}
	{#if $currentScreen === 'bank-home'}
		<div>
			<BankHome />
		</div>
	{:else if $currentScreen === 'game-center'}
		<div>
			{#if GameCenterComponent}
				<GameCenterComponent on:gameSelected={handleGameSelected} />
			{:else}
				<div class="lazy-fallback" aria-live="polite" aria-busy={isGameCenterLoading}>
					<div class="lazy-spinner" aria-hidden="true"></div>
					<p class="lazy-text">Загружаем игровой центр…</p>
				</div>
			{/if}
		</div>
	{:else if $currentScreen === 'tasks'}
		<div>
			{#if TasksComponent}
				<TasksComponent />
			{:else}
				<div class="lazy-fallback" aria-live="polite" aria-busy={isTasksLoading}>
					<div class="lazy-spinner" aria-hidden="true"></div>
					<p class="lazy-text">Загружаем задания…</p>
				</div>
			{/if}
		</div>
	{:else if $currentScreen === 'rewards-shop'}
		<div>
			{#if RewardsShopComponent}
				<RewardsShopComponent />
			{:else}
				<div class="lazy-fallback" aria-live="polite" aria-busy={isRewardsShopLoading}>
					<div class="lazy-spinner" aria-hidden="true"></div>
					<p class="lazy-text">Загружаем магазин подарков…</p>
				</div>
			{/if}
		</div>
	{:else if $currentScreen === 'game' && selectedGame}
		<div>
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
		<div>
			<BankHome />
		</div>
	{/if}
{/key}

{#if $currentScreen === 'game-center' || $currentScreen === 'tasks' || $currentScreen === 'rewards-shop'}
	<TabNavigation />
{/if}

<style>

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

</style>
