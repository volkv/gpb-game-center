<script lang="ts">
	import { Button } from '$lib';
	import { Zap } from 'lucide-svelte';
	import type { Match3Status } from '../types';

	interface Props {
		onexit: () => void;
		onBoosterClick: () => void;
		canUseBooster: boolean;
		status: Match3Status;
	}

	let { onexit, onBoosterClick, canUseBooster, status }: Props = $props();
</script>

<div class="game-controls p-4">
	<div class="flex gap-3 justify-center">
		<Button
			variant="secondary"
			size="md"
			onclick={onexit}
			class="btn-game-secondary"
		>
			Выйти
		</Button>
		<Button
			variant="primary"
			size="md"
			disabled={!canUseBooster}
			onclick={onBoosterClick}
			class="btn-game-primary {canUseBooster ? 'booster-ready' : ''}"
		>
			<Zap size={18} class="mr-2" />
			{status === 'targeting' ? 'Выберите цель!' : canUseBooster ? 'Газпромбанк Бонус' : 'Копить энергию'}
		</Button>
	</div>
</div>

<style>
	.game-controls {
		flex-shrink: 0;
	}
</style>
