<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import { loadGameComponent, getGameLoadError, canRetryGameLoad, retryGameLoad } from '$lib/utils/gameLoader';
	import { gameStore, currentGameState } from '$lib/stores/gameStore';
	import { navigationStore, navigateToGameCenter, goBack } from '$lib/stores/navigationStore';
	import { LoadingSpinner, Button } from '$lib';
	import { isOnline, NetworkError, createRetryHandler } from '$lib/utils/offline';
	import type { Game } from '$lib/types/Game';
	import type { ComponentType } from 'svelte';

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
		navigateToGameCenter();
	}

	let loadError = $derived(getGameLoadError(game.id));
</script>

<div class="game-container" class:mounted>
	{#if isLoading}
		<div class="loading-screen">
			<div class="loading-content">
				<div class="game-preview">
					<div class="preview-icon" style="background: {game.gradient}">
						<div class="icon-placeholder">
							<svg class="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
								<path d="M12 2L13.09 5.26L16 4L14.74 7.09L18 8L16.91 11.26L20 12L16.91 12.74L18 16L14.74 16.91L16 20L12.91 18.74L12 22L11.09 18.74L8 20L9.26 16.91L6 16L7.09 12.74L4 12L7.09 11.26L6 8L9.26 7.09L8 4L11.09 5.26L12 2Z"/>
							</svg>
						</div>
					</div>

					<div class="preview-info">
						<h2 class="font-heading text-h3 text-gpb-black mb-1">{game.name}</h2>
						<p class="font-body text-body text-gray-600">{game.shortDescription}</p>
					</div>
				</div>

				<div class="loading-indicator">
					<div class="loading-bar">
						<div class="loading-fill" style="width: {loadingProgress}%"></div>
					</div>
					<p class="loading-text font-body text-body-sm text-gray-600">{loadingStage}</p>
				</div>

				<div class="loading-skeleton">
					<div class="skeleton-header">
						<div class="skeleton-circle"></div>
						<div class="skeleton-lines">
							<div class="skeleton-line skeleton-line-lg"></div>
							<div class="skeleton-line skeleton-line-sm"></div>
						</div>
					</div>

					<div class="skeleton-content">
						<div class="skeleton-line skeleton-line-full"></div>
						<div class="skeleton-line skeleton-line-xl"></div>
						<div class="skeleton-line skeleton-line-md"></div>
						<div class="skeleton-line skeleton-line-lg"></div>
					</div>

					<div class="skeleton-buttons">
						<div class="skeleton-button skeleton-button-primary"></div>
						<div class="skeleton-button skeleton-button-secondary"></div>
					</div>
				</div>

				<div class="loading-spinner-container">
					<LoadingSpinner size="md" color="violet" />
				</div>
			</div>

			<button
				class="back-button loading-back"
				onclick={handleBack}
				aria-label="Вернуться назад"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
				</svg>
			</button>
		</div>
	{:else if loadingError}
		<div class="error-screen">
			<div class="error-content">
				<div class="error-icon">
					<svg class="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
							  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				</div>

				<h2 class="font-heading text-h3 text-gpb-black mb-2">
					{isOfflineError ? 'Нет подключения' : 'Ошибка загрузки'}
				</h2>

				<p class="error-message font-body text-body text-gray-700 mb-4">
					{loadingError}
				</p>

				{#if isOfflineError}
					<div class="offline-indicator">
						<div class="offline-icon">
							<svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
									  d="M18.364 5.636l-12.728 12.728m0 0L18.364 5.636m-12.728 12.728L18.364 18.364" />
							</svg>
						</div>
						<p class="font-body text-body-sm text-gray-500">
							Статус подключения: {$isOnline ? 'Подключено' : 'Отключено'}
						</p>
					</div>
				{/if}

				{#if loadError}
					<div class="error-details">
						<p class="font-body text-body-sm text-gray-600 mb-2">
							Попытка {loadError.retryCount} из 3
						</p>
						<p class="font-body text-caption text-gray-500">
							{new Date(loadError.timestamp).toLocaleTimeString()}
						</p>
					</div>
				{/if}

				<div class="error-actions">
					{#if canRetry}
						<Button variant="primary" onclick={handleRetry}>
							{retryCount > 0 ? 'Попробовать снова' : 'Повторить'}
						</Button>
					{/if}

					<Button variant="secondary" onclick={handleBack}>
						Вернуться назад
					</Button>
				</div>
			</div>
		</div>
	{:else if gameComponent}
	
			{#if gameComponent}
				{@const GameComponent = gameComponent}
				<GameComponent onexit={handleGameExit} />
			{/if}
	
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

	.loading-screen {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: linear-gradient(to bottom, #ffffff 0%, var(--color-gpb-lily) 100%);
		position: relative;
		padding: 2rem 1rem;
	}

	.loading-content {
		max-width: 400px;
		width: 100%;
		text-align: center;
	}

	.game-preview {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 3rem;
		animation: fadeIn 0.6s ease-out;
	}

	.preview-icon {
		width: 80px;
		height: 80px;
		border-radius: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 1rem;
		position: relative;
		
		box-shadow: 0 8px 24px -6px rgba(0, 0, 0, 0.2);
	}

	.icon-placeholder {
		color: white;
		opacity: 0.9;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
	}

	.preview-info h2 {
		background: linear-gradient(135deg, var(--color-gpb-violet) 0%, var(--color-gpb-raspberry) 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.loading-indicator {
		margin-bottom: 3rem;
		animation: fadeIn 0.6s ease-out 0.2s both;
	}

	.loading-bar {
		width: 100%;
		height: 8px;
		background: var(--color-gpb-lily);
		border-radius: 4px;
		
		margin-bottom: 1rem;
		position: relative;
	}

	.loading-fill {
		height: 100%;
		background: linear-gradient(90deg, var(--color-gpb-mint) 0%, var(--color-gpb-emerald) 100%);
		border-radius: 4px;
		transition: width 0.3s ease;
		position: relative;
	}

	.loading-fill::after {
		content: '';
		position: absolute;
		top: 0;
		right: 0;
		width: 20px;
		height: 100%;
		background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 100%);
		animation: shimmer 1.5s infinite;
	}

	.loading-text {
		text-align: center;
		font-weight: 500;
	}

	.loading-skeleton {
		margin-bottom: 2rem;
		animation: fadeIn 0.6s ease-out 0.4s both;
	}

	.skeleton-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.skeleton-circle {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
		background-size: 200% 100%;
		animation: skeleton-loading 1.5s infinite;
	}

	.skeleton-lines {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.skeleton-line {
		height: 12px;
		border-radius: 6px;
		background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
		background-size: 200% 100%;
		animation: skeleton-loading 1.5s infinite;
	}

	.skeleton-line-sm { width: 60%; }
	.skeleton-line-md { width: 75%; }
	.skeleton-line-lg { width: 85%; }
	.skeleton-line-xl { width: 90%; }
	.skeleton-line-full { width: 100%; }

	.skeleton-content {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-bottom: 2rem;
	}

	.skeleton-buttons {
		display: flex;
		gap: 1rem;
		justify-content: center;
	}

	.skeleton-button {
		height: 44px;
		border-radius: 12px;
		background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
		background-size: 200% 100%;
		animation: skeleton-loading 1.5s infinite;
	}

	.skeleton-button-primary {
		width: 120px;
	}

	.skeleton-button-secondary {
		width: 100px;
	}

	.loading-spinner-container {
		margin-top: 1rem;
		animation: fadeIn 0.6s ease-out 0.6s both;
	}

	.back-button {
		position: absolute;
		top: 1rem;
		left: 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		border-radius: 12px;
		background: rgba(255, 255, 255, 0.9);
		color: var(--color-gpb-violet);
		border: 1px solid rgba(25, 25, 239, 0.1);
		cursor: pointer;
		transition: all 0.2s ease;
		backdrop-filter: blur(10px);
		z-index: 10;
	}

	.back-button:hover {
		background: rgba(255, 255, 255, 1);
		border-color: var(--color-gpb-violet);
		transform: translateX(-2px);
		box-shadow: 0 4px 12px rgba(25, 25, 239, 0.15);
	}

	.loading-back {
		animation: fadeInLeft 0.6s ease-out 0.8s both;
	}

	.error-screen {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: linear-gradient(to bottom, #ffffff 0%, var(--color-gpb-lily) 100%);
		position: relative;
		padding: 2rem 1rem;
	}

	.error-content {
		max-width: 400px;
		width: 100%;
		text-align: center;
		background: white;
		border-radius: 16px;
		padding: 2rem;
		box-shadow: 0 8px 24px -6px rgba(0, 0, 0, 0.1);
		border: 1px solid var(--color-gpb-viola);
		animation: errorBounceIn 0.6s ease-out;
	}

	.error-icon {
		margin-bottom: 1.5rem;
		display: flex;
		justify-content: center;
	}

	.error-message {
		background: rgba(239, 68, 68, 0.05);
		border: 1px solid rgba(239, 68, 68, 0.1);
		border-radius: 8px;
		padding: 1rem;
		text-align: left;
	}

	.error-details {
		background: #f9fafb;
		border-radius: 8px;
		padding: 1rem;
		margin-bottom: 1.5rem;
	}

	.error-actions {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.offline-indicator {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 1rem;
		background: #f9fafb;
		border-radius: 8px;
		margin-bottom: 1.5rem;
	}

	.offline-icon {
		display: flex;
		align-items: center;
		justify-content: center;
	}




	@keyframes fadeInLeft {
		0% {
			opacity: 0;
			transform: translateX(-20px);
		}
		100% {
			opacity: 1;
			transform: translateX(0);
		}
	}

	@keyframes shimmer {
		0% { transform: translateX(-100%); }
		100% { transform: translateX(100%); }
	}

	@keyframes skeleton-loading {
		0% { background-position: 200% 0; }
		100% { background-position: -200% 0; }
	}

	@keyframes errorBounceIn {
		0% {
			opacity: 0;
			transform: scale(0.3) translateY(30px);
		}
		50% {
			transform: scale(1.05) translateY(-5px);
		}
		70% {
			transform: scale(0.9) translateY(2px);
		}
		100% {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}

	@keyframes gameSlideIn {
		0% {
			opacity: 0;
			transform: translateX(100%);
		}
		100% {
			opacity: 1;
			transform: translateX(0);
		}
	}
		.back-button {
			top: 1rem;
			left: 1rem;
			width: 40px;
			height: 40px;
		}

		.preview-icon {
			width: 64px;
			height: 64px;
		}
	
</style>
