<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { telegramStore } from '$lib/stores/telegramStore';
	import App from './App.svelte';

	interface Props {
		onexit?: () => void;
	}

	let { onexit }: Props = $props();

	let gameInstance: any = $state(null);
	let cleanupFunctions: (() => void)[] = $state([]);

	onMount(() => {
		telegramStore.incrementGameCount();

		window.addEventListener('beforeunload', handleBeforeUnload);
		cleanupFunctions.push(() => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
		});
	});

	onDestroy(() => {
		performCleanup();
	});

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
					} catch {}
				}, 100);
			}

			console.log('🧹 FinCity cleanup completed');
		} catch (error) {
			console.warn('Cleanup failed:', error);
		}
	}

	function handleGameExit() {
		performCleanup();
		onexit?.();
	}
</script>

<App onexit={handleGameExit} />
