<script lang="ts">
	import { onMount } from 'svelte';
	import { loadGameComponent, getGameLoadError, canRetryGameLoad } from '$lib/utils/gameLoader';
	import { gameStore } from '$lib/stores/gameStore';
	import { goBack } from '$lib/stores/navigationStore';
	import { isOnline, NetworkError, createRetryHandler } from '$lib/utils/offline';
	import type { Game } from '$lib/types/Game';
	import type { ComponentType } from 'svelte';
	import GameLoadingScreen from './game-container/GameLoadingScreen.svelte';
	import GameErrorScreen from './game-container/GameErrorScreen.svelte';

	interface Props {
		game: Game;
		onexit?: () => void;
		ongameLoaded?: (event: CustomEvent<{ game: Game; component: ComponentType }>) => void;
	}

	let { game, onexit, ongameLoaded }: Props = $props();

	let mounted = $state(false);
	let gameComponent = $state<ComponentType | null>(null);
	let isLoading = $state(true);
	let loadingError = $state<string | null>(null);
	let canRetry = $state(true);
	let retryCount = $state(0);
	let loadingProgress = $state(0);
	let loadingStage = $state('Подготовка...');
	let isOfflineError = $state(false);

	const loadingStages = [
		'Подготовка...',
		'Загрузка компонента...',
		'Инициализация игры...',
		'Запуск...'
	];

	const retryHandler = createRetryHandler(3, 1000);

	onMount(async () => {
		mounted = true;
		await startGameLoading();
	});

	async function startGameLoading() {
		isLoading = true;
		loadingError = null;
		loadingProgress = 0;
		retryCount = 0;
		isOfflineError = false;

		try {
			const component = await retryHandler(async () => {
				if (!$isOnline) {
					throw new NetworkError('Нет подключения к интернету', true);
				}

				await gameStore.loadGame(game.id);
				await simulateLoadingProgress();
				return await loadGameComponent(game);
			});
			gameComponent = component;
			isLoading = false;

			ongameLoaded?.(new CustomEvent('gameLoaded', { detail: { game, component } }));
		} catch (error) {
			console.error('Failed to load game:', error);
			isLoading = false;

			if (error instanceof NetworkError && error.isOffline) {
				isOfflineError = true;
				loadingError = 'Нет подключения к интернету. Проверьте соединение и попробуйте снова.';
			} else {
				loadingError = error instanceof Error ? error.message : 'Неизвестная ошибка';
			}

			canRetry = canRetryGameLoad(game.id) || isOfflineError;
		}
	}

	async function simulateLoadingProgress() {
		for (let i = 0; i < loadingStages.length; i++) {
			loadingStage = loadingStages[i];
			loadingProgress = ((i + 1) / loadingStages.length) * 80;
			await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));
		}
		loadingProgress = 100;
	}

	async function handleRetry() {
		if (!canRetryGameLoad(game.id)) return;

		retryCount++;
		await startGameLoading();
	}

	function handleBack() {
		gameStore.exitGame();
		onexit?.();
		goBack();
	}

	function handleGameExit() {
		gameStore.exitGame();
		onexit?.();
		goBack();
	}

	let loadError = $derived(getGameLoadError(game.id));
</script>

<div class="game-container" class:mounted>
	{#if isLoading}
		<GameLoadingScreen
			{game}
			{loadingProgress}
			{loadingStage}
			onback={handleBack}
		/>
	{:else if loadingError}
		<GameErrorScreen
			{loadingError}
			{isOfflineError}
			isOnline={$isOnline}
			{loadError}
			{canRetry}
			{retryCount}
			onretry={handleRetry}
			onback={handleBack}
		/>
	{:else if gameComponent}
		{@const GameComponent = gameComponent}
		<GameComponent onexit={handleGameExit} />
	{/if}
</div>

<style>
	.game-container {
		width: 100%;
		height: 100%;
		min-height: 0;
		opacity: 0;
		transform: translateY(20px);
		transition: all 0.6s ease-out;
		position: relative;
		display: flex;
		flex-direction: column;
	}

	.game-container.mounted {
		opacity: 1;
		transform: translateY(0);
	}

	.game-container > :global(*) {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
	}
</style>