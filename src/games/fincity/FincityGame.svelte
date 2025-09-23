<script lang="ts">
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';
	import { Button } from '$lib';
	import { telegramStore } from '$lib/stores/telegramStore';

	const dispatch = createEventDispatcher<{
		exit: void;
	}>();

	let mounted = false;
	let gameLoaded = false;
	let loadingProgress = 0;
	let FincityApp: any = null;
	let gameInstance: any = null;
	let cleanupFunctions: (() => void)[] = [];

	onMount(async () => {
		mounted = true;
		await loadFinCityGame();

		window.addEventListener('beforeunload', handleBeforeUnload);
		cleanupFunctions.push(() => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
		});
	});

	onDestroy(() => {
		performCleanup();
	});

	async function loadFinCityGame() {
		try {
			await import('./fincity.css');
			const { default: App } = await import('./App.svelte');
			FincityApp = App;
			gameLoaded = true;
			telegramStore.incrementGameCount();
		} catch (error) {
			console.error('Failed to load FinCity game:', error);
		}
	}

	function handleBeforeUnload() {
		performCleanup();
	}

	function performCleanup() {
		try {
			if (gameInstance?.destroy) {
				gameInstance.destroy();
			}

			if (gameInstance?.resourceManager?.unloadAll) {
				gameInstance.resourceManager.unloadAll();
			}

			if (gameInstance?.gameEngine?.destroy) {
				gameInstance.gameEngine.destroy();
			}

			cleanupFunctions.forEach(cleanup => {
				try {
					cleanup();
				} catch (error) {
					console.warn('Cleanup function failed:', error);
				}
			});
			cleanupFunctions.length = 0;

			if (typeof window !== 'undefined' && 'gc' in window) {
				setTimeout(() => {
					try {
						(window as any).gc();
					} catch {
						// GC недоступен
					}
				}, 100);
			}

			console.log('🧹 FinCity cleanup completed');
		} catch (error) {
			console.warn('Cleanup failed:', error);
		}
	}

	function handleExit() {
		performCleanup();
		dispatch('exit');
	}

	function handleGameExit() {
		performCleanup();
		dispatch('exit');
	}
</script>

<div class="fincity-wrapper">
	{#if !gameLoaded}
		<div class="loading-screen">
			<div class="loading-content">
				<div class="game-preview">
					<div class="preview-icon">
						<svg class="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
							<path d="M12 2L13.09 5.26L16 4L14.74 7.09L18 8L16.91 11.26L20 12L16.91 12.74L18 16L14.74 16.91L16 20L12.91 18.74L12 22L11.09 18.74L8 20L9.26 16.91L6 16L7.09 12.74L4 12L7.09 11.26L6 8L9.26 7.09L8 4L11.09 5.26L12 2Z"/>
						</svg>
					</div>
					<h2 class="font-heading text-h3 text-white mb-2">FinCity</h2>
					<p class="font-body text-body text-white/80">Загрузка игрового движка...</p>
				</div>

				<div class="loading-bar">
					<div class="loading-fill"></div>
				</div>

				<button
					class="back-button"
					on:click={handleExit}
					aria-label="Вернуться назад"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
					</svg>
				</button>
			</div>
		</div>
	{:else if FincityApp}
		<div class="game-container fincity-game" class:mounted>
			<button
				class="exit-button"
				on:click={handleExit}
				aria-label="Выйти из игры"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>

			<svelte:component this={FincityApp} on:exit={handleGameExit} />
		</div>
	{/if}
</div>

<style>
	.fincity-wrapper {
		width: 100%;
		height: 100vh;
		position: relative;
		overflow: hidden;
	}

	.loading-screen {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, var(--color-gpb-mint) 0%, var(--color-gpb-melissa) 100%);
		padding: 2rem;
		position: relative;
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
		animation: fadeInUp 0.6s ease-out;
	}

	.preview-icon {
		width: 80px;
		height: 80px;
		background: rgba(255, 255, 255, 0.2);
		border-radius: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 1rem;
		color: white;
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.3);
	}

	.loading-bar {
		width: 100%;
		height: 8px;
		background: rgba(255, 255, 255, 0.2);
		border-radius: 4px;
		overflow: hidden;
		margin-bottom: 2rem;
		position: relative;
	}

	.loading-fill {
		height: 100%;
		background: linear-gradient(90deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 1) 100%);
		border-radius: 4px;
		width: 0%;
		animation: loadingProgress 2s ease-in-out infinite;
	}

	.back-button {
		position: absolute;
		top: 2rem;
		left: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		border-radius: 12px;
		background: rgba(255, 255, 255, 0.2);
		color: white;
		border: none;
		cursor: pointer;
		transition: all 0.2s ease;
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.3);
		z-index: 10;
	}

	.back-button:hover {
		background: rgba(255, 255, 255, 0.3);
		transform: translateX(-2px);
	}

	.game-container {
		width: 100%;
		height: 100vh;
		position: relative;
		opacity: 0;
		transform: translateY(20px);
		transition: all 0.6s ease-out;
	}

	.game-container.mounted {
		opacity: 1;
		transform: translateY(0);
	}

	.exit-button {
		position: absolute;
		top: 1rem;
		right: 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		border-radius: 12px;
		background: rgba(0, 0, 0, 0.5);
		color: white;
		border: none;
		cursor: pointer;
		transition: all 0.2s ease;
		backdrop-filter: blur(10px);
		z-index: 1000;
	}

	.exit-button:hover {
		background: rgba(0, 0, 0, 0.7);
		transform: scale(1.05);
	}

	:global(.fincity-wrapper .app) {
		width: 100%;
		height: 100vh;
		overflow: hidden;
	}

	@keyframes fadeInUp {
		0% {
			opacity: 0;
			transform: translateY(20px);
		}
		100% {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes loadingProgress {
		0% {
			width: 0%;
		}
		50% {
			width: 70%;
		}
		100% {
			width: 100%;
		}
	}

	@media (max-width: 380px) {
		.loading-screen,
		.back-button {
			padding: 1rem;
		}

		.back-button {
			top: 1rem;
			left: 1rem;
			width: 40px;
			height: 40px;
		}

		.exit-button {
			top: 0.5rem;
			right: 0.5rem;
			width: 40px;
			height: 40px;
		}

		.preview-icon {
			width: 64px;
			height: 64px;
		}
	}
</style>