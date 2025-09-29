<script lang="ts">
	import { currentScreen } from '$lib/stores/navigationStore';
	import BankHome from '$lib/components/BankHome.svelte';
	import type { Game } from '$lib/types/Game';
	import type GameCenter from '$lib/components/GameCenter.svelte';
	import type GameContainer from '$lib/components/GameContainer.svelte';
	import type RewardsShop from '$lib/components/RewardsShop.svelte';
	import type Tasks from '$lib/components/Tasks.svelte';
	import TabNavigation from '$lib/components/TabNavigation.svelte';
	import LoadingFallback from '$lib/components/LoadingFallback.svelte';
	import { createLazyLoader } from '$lib/utils/lazyLoader.svelte';

	let selectedGame = $state<Game | null>(null);

	const gameCenterLoader = createLazyLoader<typeof GameCenter>();
	const gameContainerLoader = createLazyLoader<typeof GameContainer>();
	const rewardsShopLoader = createLazyLoader<typeof RewardsShop>();
	const tasksLoader = createLazyLoader<typeof Tasks>();

	$effect(() => {
		if ($currentScreen === 'game-center') {
			gameCenterLoader.load(() => import('$lib/components/GameCenter.svelte'));
		}
	});

	$effect(() => {
		if ($currentScreen === 'game' && selectedGame) {
			gameContainerLoader.load(() => import('$lib/components/GameContainer.svelte'));
		}
	});

	$effect(() => {
		if ($currentScreen === 'rewards-shop') {
			rewardsShopLoader.load(() => import('$lib/components/RewardsShop.svelte'));
		}
	});

	$effect(() => {
		if ($currentScreen === 'tasks') {
			tasksLoader.load(() => import('$lib/components/Tasks.svelte'));
		}
	});

	function handleGameSelected(event: CustomEvent<{ game: Game }>) {
		selectedGame = event.detail.game;
		gameContainerLoader.load(() => import('$lib/components/GameContainer.svelte'));
	}

	function handleGameExit() {
		selectedGame = null;
	}
</script>

{#key $currentScreen}
	{#if $currentScreen === 'bank-home'}
		<BankHome />
	{:else if $currentScreen === 'game-center'}
		{#if gameCenterLoader.component}
			{@const Component = gameCenterLoader.component}
			<Component on:gameSelected={handleGameSelected} />
		{:else}
			<LoadingFallback message="Загружаем игровой центр…" isLoading={gameCenterLoader.isLoading} />
		{/if}
	{:else if $currentScreen === 'tasks'}
		{#if tasksLoader.component}
			{@const Component = tasksLoader.component}
			<Component />
		{:else}
			<LoadingFallback message="Загружаем задания…" isLoading={tasksLoader.isLoading} />
		{/if}
	{:else if $currentScreen === 'rewards-shop'}
		{#if rewardsShopLoader.component}
			{@const Component = rewardsShopLoader.component}
			<Component />
		{:else}
			<LoadingFallback message="Загружаем магазин подарков…" isLoading={rewardsShopLoader.isLoading} />
		{/if}
	{:else if $currentScreen === 'game' && selectedGame}
		{#if gameContainerLoader.component}
			{@const Component = gameContainerLoader.component}
			<Component game={selectedGame} onexit={handleGameExit} />
		{:else}
			<LoadingFallback message="Готовим игру…" isLoading={gameContainerLoader.isLoading} />
		{/if}
	{:else}
		<BankHome />
	{/if}
{/key}

{#if $currentScreen === 'game-center' || $currentScreen === 'tasks' || $currentScreen === 'rewards-shop'}
	<TabNavigation />
{/if}
