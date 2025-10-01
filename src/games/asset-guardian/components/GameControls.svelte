<script lang="ts">
	import { Pause } from 'lucide-svelte';
	import { Button } from '$lib';

	type Props = {
		isPlaying: boolean;
		onPause: () => void;
		onExit: () => void;
	};

	let { isPlaying, onPause, onExit }: Props = $props();
</script>

<div class="game-controls p-4">
	{#if isPlaying}
		<div class="flex gap-3 justify-center mb-4">
			<Button
				variant="secondary"
				size="md"
				onclick={onPause}
				class="btn-game-secondary"
			>
				<Pause size={18} class="mr-2" />
				Пауза
			</Button>
			<Button
				variant="secondary"
				size="md"
				onclick={onExit}
				class="btn-game-secondary"
			>
				Выйти
			</Button>
		</div>
	{/if}
</div>

<style>
	.game-controls {
		flex-shrink: 0;
	}
</style>