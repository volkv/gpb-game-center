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
		min-height: 100vh;
		position: relative;
		overflow: hidden;
		color: white;
		padding-top: 16px;
	}

	.game-layout::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
		animation: sparkle 12s linear infinite;
		pointer-events: none;
	}

	.game-content {
		position: relative;
		z-index: 2;
		width: 100%;
		max-width: 420px;
		margin: 0 auto;
		padding: 1rem;
	}

	@keyframes sparkle {
		0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
		25% { transform: translate(10px, -10px) rotate(90deg) scale(1.1); }
		50% { transform: translate(-5px, 5px) rotate(180deg) scale(0.9); }
		75% { transform: translate(-10px, -5px) rotate(270deg) scale(1.05); }
	}

	@media (max-width: 380px) {
		.game-content {
			padding: 0.75rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.game-layout::before {
			animation: none;
		}
	}
</style>