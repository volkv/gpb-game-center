<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { Button } from '$lib';
	import type { Snippet } from 'svelte';

	interface Props {
		gameTitle: string;
		gameId: string;
		children: Snippet;
		exitButton?: Snippet;
		showExitButton?: boolean;
	}

	let { 
		gameTitle, 
		gameId, 
		children, 
		exitButton,
		showExitButton = true 
	}: Props = $props();

	const dispatch = createEventDispatcher<{
		exit: void;
		mounted: void;
	}>();

	let mounted = $state(false);

	onMount(() => {
		mounted = true;
		dispatch('mounted');
	});

	function handleExit() {
		dispatch('exit');
	}
</script>

<div class="game-base" class:mounted>
	{#if showExitButton}
		<header class="game-header">
			<h1 class="game-title font-heading text-h2 text-gpb-black">
				{gameTitle}
			</h1>
			
			{#if exitButton}
				{@render exitButton()}
			{:else}
				<Button 
					variant="secondary" 
					size="sm" 
					onclick={handleExit}
					class="exit-button"
				>
					← Назад
				</Button>
			{/if}
		</header>
	{/if}

	<main class="game-content">
		{@render children()}
	</main>
</div>

<style>
	.game-base {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		background: linear-gradient(to bottom, #ffffff 0%, var(--color-gpb-lily) 100%);
		opacity: 0;
		transform: translateY(20px);
		transition: opacity 300ms ease-out, transform 300ms ease-out;
	}

	.game-base.mounted {
		opacity: 1;
		transform: translateY(0);
	}

	.game-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1.5rem;
		background: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(8px);
		border-bottom: 1px solid rgba(0, 0, 0, 0.05);
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.game-title {
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--color-gpb-black);
		margin: 0;
		flex: 1;
	}

	.game-content {
		flex: 1;
		padding: 1.5rem;
		overflow-y: auto;
	}

	:global(.exit-button) {
		flex-shrink: 0;
		margin-left: 1rem;
	}


</style>
