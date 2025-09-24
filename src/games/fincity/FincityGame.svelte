<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Button, GameLayout } from '$lib';
	import { telegramStore } from '$lib/stores/telegramStore';

	interface Props {
		onexit?: () => void;
	}

	let { onexit }: Props = $props();

	let mounted = $state(false);
	let gameLoaded = $state(false);
	let loadingProgress = $state(0);
	let FincityApp: any = $state(null);
	let gameInstance: any = $state(null);
	let cleanupFunctions: (() => void)[] = $state([]);

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
		onexit?.();
	}

	function handleGameExit() {
		performCleanup();
		onexit?.();
	}
</script>

<div class="fincity-wrapper">
	{#if !gameLoaded}
		<GameLayout gameName="FinCity" background="gradient-wealth" showScore={false} showBackButton={true}>
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
			</div>
		</GameLayout>
	{:else if FincityApp}
		<div class="game-container fincity-game" class:mounted>
			{#if FincityApp}
				{@const GameApp = FincityApp}
				<GameApp onexit={handleGameExit} />
			{/if}
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

	.loading-content {
		max-width: 400px;
		width: 100%;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 60vh;
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


	.game-container {
		width: 100%;
		height: calc(100vh - 64px);
		position: relative;
		opacity: 0;
		transform: translateY(20px);
		transition: all 0.6s ease-out;
	}

	.game-container.mounted {
		opacity: 1;
		transform: translateY(0);
	}


	:global(.fincity-wrapper .app) {
		width: 100%;
		height: 100vh;
		overflow: hidden;
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

		.preview-icon {
			width: 64px;
			height: 64px;
		}
	}
</style>