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
	<ResourcesBar />

	<div class="game-content">
		<GameCanvas onGameReady={handleGameReady} />
	</div>

	<ActionButtons class="game-action-buttons" />

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
		width: 100%;
		height: 100vh;
		overflow: hidden;
		position: relative;
		background: #2d5a3d;
		display: flex;
		flex-direction: column;
	}

	.game-content {
		position: absolute;
		top: 64px; /* Space for StatusBar + ResourcesBar */
		left: 0;
		right: 0;
		bottom: 0;
		width: 100%;
		height: calc(100vh - 64px);
	}

	:global(.game-action-buttons) {
		position: fixed;
		bottom: 1rem;
		left: 50%;
		transform: translateX(-50%);
		z-index: 100;
		width: auto;
		max-width: calc(100% - 2rem);
	}

	:global(body) {
		margin: 0;
		padding: 0;
		overflow: hidden;
	}
</style>