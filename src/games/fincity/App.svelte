<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import GameCanvas from './components/ui/GameCanvas.svelte';
	import ActionButtons from './components/ui/ActionButtons.svelte';
	import BuildMenu from './components/ui/BuildMenu.svelte';
	import BuildingUpgrade from './components/ui/BuildingUpgrade.svelte';
	import BuildingInfo from './components/ui/BuildingInfo.svelte';
	import QuestLog from './components/ui/QuestLog.svelte';
	import Achievement from './components/ui/Achievement.svelte';
	import Settings from './components/ui/Settings.svelte';
	import Toast from './components/ui/Toast.svelte';
	import ResourcesBar from './components/ui/ResourcesBar.svelte';
	import { gameStatusStore } from '$lib/stores/gameStatusStore';
	import { modal } from './stores/ui';
	import type { GameEngine } from './components/game/GameEngine';

	interface Props {
		onexit?: () => void;
	}

	let { onexit }: Props = $props();

	let gameEngine = $state<GameEngine | null>(null);

	onMount(() => {
		gameStatusStore.show({
			gameName: 'FinCity',
			showScore: false,
			showBackButton: true
		});
	});

	onDestroy(() => {
		gameStatusStore.hide();
	});

	function handleGameReady(engine: GameEngine) {
		gameEngine = engine;
		console.log('FinCity game engine ready');
	}

	function handleExit() {
		gameStatusStore.hide();
		onexit?.();
	}
</script>

<div class="app">
	<div class="app__background"></div>
	<div class="app__overlay"></div>

	<div class="app__canvas-layer">
		<div class="app__canvas-frame">
			<GameCanvas class="app__canvas" onGameReady={handleGameReady} />
		</div>
	</div>

	<header class="app__overlay-top">
		<ResourcesBar class="app__resources" />
	</header>

	<footer class="app__overlay-bottom">
		<ActionButtons class="app__actions" />
	</footer>

	{#if $modal.isOpen && $modal.type === 'build_menu'}
		<BuildMenu {gameEngine} />
	{/if}

	{#if $modal.isOpen && $modal.type === 'building_upgrade'}
		<BuildingUpgrade />
	{/if}

	{#if $modal.isOpen && $modal.type === 'building_info'}
		<BuildingInfo />
	{/if}

	{#if $modal.isOpen && $modal.type === 'quest_log'}
		<QuestLog />
	{/if}

	{#if $modal.isOpen && $modal.type === 'achievements'}
		<Achievement />
	{/if}

	{#if $modal.isOpen && $modal.type === 'settings'}
		<Settings />
	{/if}

	<Toast />
</div>

<style>
	.app {
		position: relative;
		min-height: 100%;
		height: 100%;
		background: var(--color-surface-page);
		color: var(--color-fg-primary);
		
		--game-shell-max-width: 500px;
	}

	.app__background {
		position: absolute;
		inset: -20% -10%;
		background: var(--gradient-brand-hero);
		opacity: 0.78;
		filter: blur(40px);
		pointer-events: none;
	}

	.app__overlay {
		position: absolute;
		inset: 0;
		background-image:
			radial-gradient(180% 100% at 10% 0%, rgba(64, 214, 230, 0.18) 0%, transparent 52%),
			radial-gradient(130% 120% at 90% -10%, rgba(68, 80, 255, 0.18) 0%, transparent 60%),
			radial-gradient(110% 110% at 50% 120%, rgba(25, 25, 239, 0.12) 0%, transparent 55%);
		mix-blend-mode: lighten;
		opacity: 0.9;
		pointer-events: none;
	}

	.app__canvas-layer {
		position: relative;
		z-index: 0;
		width: 100%;
		height: 100%;
		min-height: 0;
		display: flex;
		justify-content: center;
		align-items: stretch;
		box-sizing: border-box;
	}

	.app__canvas-frame {
		position: relative;
		flex: 1;
		max-width: var(--game-shell-max-width, 1120px);
		border-radius: var(--radius-xl);
		border: 1px solid var(--color-border-muted);
		background: var(--color-surface-elevated);
		box-shadow: var(--shadow-hard);
		
		display: flex;
	}

	.app__canvas-frame::after {
		content: '';
		position: absolute;
		inset: 0;
		opacity: 0.18;
		background: linear-gradient(140deg, rgba(25, 25, 239, 0.12) 0%, rgba(31, 196, 217, 0.08) 65%, rgba(255, 255, 255, 0.12) 100%);
		pointer-events: none;
	}


	.app__overlay-top,
	.app__overlay-bottom {
		position: fixed;
		left: 0;
		width: 100%;
		display: flex;
		justify-content: center;
		pointer-events: none;
		z-index: 5;
	}

	.app__overlay-top {
		top: calc(100px + clamp(0.6rem, 1.8vw, 1.5rem));
	}

	.app__overlay-bottom {
		bottom: clamp(0.6rem, 1.8vw, 1.5rem);
	}

	.app__canvas-frame {
		border-radius: var(--radius-lg);
	}

	:global(body) {
		margin: 0;
		padding: 0;
		background-color: var(--color-surface-page);
		color: var(--color-fg-primary);
	}
</style>
