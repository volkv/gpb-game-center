<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import GameCanvas from './components/ui/GameCanvas.svelte';
	import ActionButtons from './components/ui/ActionButtons.svelte';
	import BuildMenu from './components/ui/BuildMenu.svelte';
	import QuestLog from './components/ui/QuestLog.svelte';
	import Achievement from './components/ui/Achievement.svelte';
	import Settings from './components/ui/Settings.svelte';
	import Toast from './components/ui/Toast.svelte';
	import { modal } from './stores/ui';
	import type { GameEngine } from './components/game/GameEngine';

	const dispatch = createEventDispatcher<{
		exit: void;
	}>();

	let gameEngine: GameEngine | null = null;

	function handleGameReady(engine: GameEngine) {
		gameEngine = engine;
		console.log('FinCity game engine ready');
	}

	function handleExit() {
		dispatch('exit');
	}
</script>

<div class="app">
	<GameCanvas onGameReady={handleGameReady} />

	<ActionButtons class="game-action-buttons" />

	{#if $modal.isOpen && $modal.type === 'build_menu'}
		<BuildMenu {gameEngine} />
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

	:global(.game-action-buttons) {
		position: absolute;
		bottom: 1rem;
		left: 50%;
		transform: translateX(-50%);
		z-index: 10;
		width: auto;
		max-width: calc(100% - 2rem);
	}

	:global(body) {
		margin: 0;
		padding: 0;
		overflow: hidden;
	}
</style>