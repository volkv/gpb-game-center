<script lang="ts">
	import { currentScreen } from '$lib/stores/navigationStore';
	import GameCenter from '$lib/components/GameCenter.svelte';
	import GameContainer from '$lib/components/GameContainer.svelte';
	import BankHome from '$lib/components/BankHome.svelte';
	import { slideInOut, reduceMotionTransition } from '$lib/utils/transitions.js';
	import type { Game } from '$lib/types/Game';

	let selectedGame: Game | null = null;
	let previousScreen = $currentScreen;

	$: if ($currentScreen !== previousScreen) {
		previousScreen = $currentScreen;
	}

	const slideLeft = reduceMotionTransition(
		(node, params) => slideInOut(node, { ...params, x: -100 })
	);

	const slideRight = reduceMotionTransition(
		(node, params) => slideInOut(node, { ...params, x: 100 })
	);

	function handleGameSelected(event: CustomEvent<{ game: Game }>) {
		selectedGame = event.detail.game;
	}

	function handleGameExit() {
		selectedGame = null;
	}
</script>

<div class="screen-container">
	{#key $currentScreen}
		{#if $currentScreen === 'bank-home'}
			<div
				class="screen"
				in:slideRight={{ duration: 400, delay: 50 }}
				out:slideLeft={{ duration: 300 }}
			>
				<BankHome />
			</div>
		{:else if $currentScreen === 'game-center'}
			<div
				class="screen"
				in:slideRight={{ duration: 400, delay: 50 }}
				out:slideLeft={{ duration: 300 }}
			>
				<GameCenter on:gameSelected={handleGameSelected} />
			</div>
		{:else if $currentScreen === 'game' && selectedGame}
			<div
				class="screen"
				in:slideLeft={{ duration: 400, delay: 50 }}
				out:slideRight={{ duration: 300 }}
			>
				<GameContainer game={selectedGame} on:exit={handleGameExit} />
			</div>
		{:else}
			<div
				class="screen"
				in:slideRight={{ duration: 400, delay: 50 }}
				out:slideLeft={{ duration: 300 }}
			>
				<BankHome />
			</div>
		{/if}
	{/key}
</div>

<style>
	.screen-container {
		position: relative;
		width: 100%;
		min-height: 100vh;
		overflow-x: hidden;
	}

	.screen {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		min-height: 100vh;
		will-change: transform, opacity;
	}

	@media (prefers-reduced-motion: reduce) {
		.screen {
			will-change: auto;
		}
	}
</style>
