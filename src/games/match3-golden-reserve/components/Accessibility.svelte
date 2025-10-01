<script lang="ts">
	import type { Match3State } from '../types';

	interface Props {
		announcements: string;
		gameState: Match3State;
	}
	let { announcements, gameState }: Props = $props();

	function getGameStatusAnnouncement(): string {
		if (gameState.status === 'targeting') {
			return 'Режим нацеливания бустера. Выберите цель.';
		}
		if (gameState.status === 'completed') {
			return gameState.score >= gameState.targetScore ? 'Игра завершена. Победа!' : 'Игра завершена. Поражение.';
		}
		return `Очки: ${gameState.score}. Ходы: ${gameState.moves}. Заряд бустера: ${gameState.booster.charge} процентов.`;
	}
</script>

<!-- Screen Reader Announcements -->
<div
	aria-live="polite"
	aria-atomic="true"
	class="sr-only"
	role="status"
>
	{announcements}
</div>

<div
	aria-live="polite"
	aria-atomic="false"
	class="sr-only"
	role="status"
>
	{getGameStatusAnnouncement()}
</div>

<style>
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		border: 0;
	}
</style>
