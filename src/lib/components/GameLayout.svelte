<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { gameStatusStore } from '$lib/stores/gameStatusStore';

	interface Props {
		children?: any;
		gameName: string;
		showScore?: boolean;
		showBackButton?: boolean;
		background?: 'gradient-power' | 'gradient-electric' | 'gradient-wealth' | 'gradient-mystery' | 'custom';
		customBackground?: string;
		class?: string;
	}

	let {
		children,
		gameName,
		showScore = true,
		showBackButton = true,
		background = 'gradient-electric',
		customBackground,
		class: className = ''
	}: Props = $props();

	onMount(() => {
		gameStatusStore.show({
			gameName,
			showScore,
			showBackButton
		});
	});

	onDestroy(() => {
		gameStatusStore.hide();
	});

	const backgroundClass = $derived(customBackground ? '' : background);
	const backgroundStyle = $derived(customBackground ? `background: ${customBackground}` : '');
</script>

<div class="game-layout {backgroundClass} {className}" style={backgroundStyle}>
	<div class="game-content">
		{@render children?.()}
	</div>
</div>

<style>
	.game-layout {
		position: relative;
		flex: 1;
		display: flex;
		flex-direction: column;

		color: white;
	}



	.game-content {
		position: relative;
		z-index: 2;
		width: 100%;
		flex: 1;
		display: flex;
		flex-direction: column;
		margin: 0 auto;

	}

	@keyframes sparkle {
		0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
		25% { transform: translate(10px, -10px) rotate(90deg) scale(1.1); }
		50% { transform: translate(-5px, 5px) rotate(180deg) scale(0.9); }
		75% { transform: translate(-10px, -5px) rotate(270deg) scale(1.05); }
	}

	.game-content {
		padding: 0.75rem;
	}


</style>
