<script lang="ts">
	import { Coins, Gem, Crown } from 'lucide-svelte';
	import type { Cell, CellType, Position, Match3Status } from '../types';
	import ScoreBoost from '../ScoreBoost.svelte';
	import ParticleEffect from '../ParticleEffect.svelte';

	interface Props {
		field: Cell[][];
		status: Match3Status;
		currentFocusPosition: Position | null;
		explosionEffect: { active: boolean, x: number, y: number };
		scoreBoost: { amount: number, visible: boolean };
		onCellClick: (row: number, col: number) => void;
		onKeyNavigation: (event: KeyboardEvent) => void;
		onScoreBoostComplete: () => void;
		onExplosionComplete: () => void;
		onTouchStart: (event: TouchEvent, row: number, col: number) => void;
		onTouchMove: (event: TouchEvent) => void;
		onTouchEnd: (event: TouchEvent) => void;
	}

	let {
		field,
		status,
		currentFocusPosition,
		explosionEffect,
		scoreBoost,
		onCellClick,
		onKeyNavigation,
		onScoreBoostComplete,
		onExplosionComplete,
		onTouchStart,
		onTouchMove,
		onTouchEnd
	}: Props = $props();

	let matchParticles = $state<Array<{ x: number, y: number, active: boolean, id: string }>>([]);
	let boardShaking = $state(false);

	$effect(() => {
		const gameBoard = document.querySelector('.game-board');
		if (!gameBoard) return;

		const cellSize = gameBoard.clientWidth / 8;
		let hasMatches = false;

		field.forEach((row, rowIndex) => {
			row.forEach((cell, colIndex) => {
				if (cell.isExploding || cell.isFading) {
					hasMatches = true;
					const existingParticle = matchParticles.find(p => p.id === `${rowIndex}-${colIndex}`);
					if (!existingParticle) {
						const x = (colIndex + 0.5) * cellSize;
						const y = (rowIndex + 0.5) * cellSize;
						matchParticles = [...matchParticles, { x, y, active: true, id: `${rowIndex}-${colIndex}` }];

						setTimeout(() => {
							matchParticles = matchParticles.filter(p => p.id !== `${rowIndex}-${colIndex}`);
						}, 400);
					}
				}
			});
		});

		if (hasMatches && !boardShaking) {
			boardShaking = true;
			setTimeout(() => {
				boardShaking = false;
			}, 300);
		}
	});

	const iconMap: Record<CellType, typeof Coins> = {
		coin: Coins,
		gold: Crown,
		sapphire: Gem,
		emerald: Gem
	};

	function getCellTypeName(cellType: CellType): string {
		switch (cellType) {
			case 'coin': return 'Монета';
			case 'gold': return 'Золото';
			case 'sapphire': return 'Сапфир';
			case 'emerald': return 'Изумруд';
			default: return 'Неизвестно';
		}
	}

	function getCellColor(cellType: CellType): string {
		switch (cellType) {
			case 'coin': return 'text-gpb-gold';
			case 'gold': return 'text-gpb-gold';
			case 'sapphire': return 'text-gpb-blue';
			case 'emerald': return 'text-gpb-mint';
			default: return 'text-gpb-gray-600';
		}
	}
</script>

<div class="game-board-wrapper">
	<div
		class="game-board {status === 'targeting' ? 'targeting-mode' : ''} {boardShaking ? 'shaking' : ''}"
		style="position: relative;"
		role="grid"
		aria-label="Игровое поле 8 на 8 клеток"
		aria-rowcount="8"
		aria-colcount="8"
		onkeydown={onKeyNavigation}
	>
		{#each field as row, rowIndex}
			{#each row as cell, colIndex}
				{@const IconComponent = iconMap[cell.type]}
				<div
					class="game-cell {cell.isSelected ? 'selected' : ''} {cell.isRecommended ? 'recommended' : ''} {cell.isFalling ? 'falling' : ''} {cell.isBouncing ? 'bouncing' : ''} {cell.isFading ? 'fading' : ''} {cell.isAppearing ? 'appearing' : ''} {cell.isSwapping ? `swapping swap-${cell.swapDirection}` : ''} {cell.isExploding ? 'exploding' : ''} {currentFocusPosition && currentFocusPosition.row === rowIndex && currentFocusPosition.col === colIndex ? 'keyboard-focus' : ''}"
					style="animation-delay: {cell.animationDelay || 0}ms"
					onclick={() => onCellClick(rowIndex, colIndex)}
					ontouchstart={(event) => onTouchStart(event, rowIndex, colIndex)}
					ontouchmove={onTouchMove}
					ontouchend={onTouchEnd}
					onkeydown={(event) => {
						if (event.key === 'Enter' || event.key === ' ') {
							event.preventDefault();
							onCellClick(rowIndex, colIndex);
						}
					}}
					role="gridcell"
					tabindex={currentFocusPosition && currentFocusPosition.row === rowIndex && currentFocusPosition.col === colIndex ? 0 : -1}
					aria-label={`${getCellTypeName(cell.type)} в позиции ${rowIndex + 1}, ${colIndex + 1}${cell.isSelected ? '. Выбрана' : ''}${cell.isRecommended ? '. Рекомендуемая' : ''}`}
					aria-selected={cell.isSelected}
					aria-describedby={cell.isRecommended ? 'recommended-hint' : undefined}
				>
					{#if IconComponent}
						<IconComponent
							size={24}
							class="cell-icon {getCellColor(cell.type)} {cell.isExploding || cell.isFading ? 'icon-exploding' : ''}"
						/>
					{/if}
				</div>
			{/each}
		{/each}

		<ScoreBoost
			amount={scoreBoost.amount}
			visible={scoreBoost.visible}
			onComplete={onScoreBoostComplete}
		/>

		<ParticleEffect
			x={explosionEffect.x}
			y={explosionEffect.y}
			active={explosionEffect.active}
			onComplete={onExplosionComplete}
		/>

		{#each matchParticles as particle (particle.id)}
			<ParticleEffect
				x={particle.x}
				y={particle.y}
				active={particle.active}
				onComplete={() => {}}
			/>
		{/each}
	</div>
</div>

<style>
	.game-board-wrapper {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
	}

	.game-board {
		display: grid;
		grid-template-columns: repeat(8, 1fr);
		grid-template-rows: repeat(8, 1fr);
		gap: 4px;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 1rem;
		padding: 0.75rem;
		backdrop-filter: blur(8px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		width: 100%;

		aspect-ratio: 1;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
		touch-action: none;
		user-select: none;
	}

	.game-cell {
		background: rgba(255, 255, 255, 0.9);
		border-radius: 0.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		user-select: none;
		position: relative;
		aspect-ratio: 1;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.3);
		transition: all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1);
		backdrop-filter: blur(2px);
		will-change: transform, box-shadow;
	}

	.game-cell:hover {
		transform: translateY(-3px) scale(1.05);
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
		background: rgba(255, 255, 255, 0.95);
		border-color: rgba(31, 196, 217, 0.4);
	}

	.game-cell:active {
		transform: translateY(-1px) scale(0.98);
		transition-duration: 0.1s;
	}

	.game-cell.selected {
		background: rgba(31, 196, 217, 0.2);
		border: 2px solid var(--color-gpb-mint);
		box-shadow: 0 0 15px rgba(31, 196, 217, 0.4);
		animation: selected-pulse 1.5s ease-in-out infinite;
	}

	.game-cell.recommended {
		background: rgba(255, 215, 0, 0.2);
		border: 2px solid var(--color-gpb-gold);
		box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
		animation: recommended-glow 2s ease-in-out infinite;
		position: relative;
		z-index: 5;
	}

	.game-cell.recommended::before {
		content: '';
		position: absolute;
		top: -4px;
		left: -4px;
		right: -4px;
		bottom: -4px;
		border: 2px solid var(--color-gpb-gold);
		border-radius: 0.5rem;
		animation: recommended-ring 2s ease-in-out infinite;
		pointer-events: none;
	}

	@keyframes selected-pulse {
		0%, 100% {
			border-color: var(--color-gpb-mint);
			box-shadow: 0 0 15px rgba(31, 196, 217, 0.4);
		}
		50% {
			border-color: var(--color-gpb-blue);
			box-shadow: 0 0 25px rgba(31, 196, 217, 0.7);
		}
	}

	.game-cell.swapping {
		z-index: 10;
		animation-duration: 0.3s;
		animation-timing-function: cubic-bezier(0.4, 0.0, 0.2, 1);
		animation-fill-mode: forwards;
	}

	.game-cell.swap-up {
		animation-name: swap-up;
	}

	.game-cell.swap-down {
		animation-name: swap-down;
	}

	.game-cell.swap-left {
		animation-name: swap-left;
	}

	.game-cell.swap-right {
		animation-name: swap-right;
	}

	@keyframes swap-up {
		0% {
			transform: translateY(0) scale(1) rotate(0deg);
			z-index: 10;
		}
		30% {
			transform: translateY(-15%) scale(1.15) rotate(-5deg);
			box-shadow: 0 12px 32px rgba(31, 196, 217, 0.4);
		}
		60% {
			transform: translateY(-80%) scale(1.1) rotate(3deg);
			box-shadow: 0 8px 24px rgba(31, 196, 217, 0.3);
		}
		100% {
			transform: translateY(-100%) scale(1) rotate(0deg);
			box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
		}
	}

	@keyframes swap-down {
		0% {
			transform: translateY(0) scale(1) rotate(0deg);
			z-index: 10;
		}
		30% {
			transform: translateY(15%) scale(1.15) rotate(5deg);
			box-shadow: 0 12px 32px rgba(31, 196, 217, 0.4);
		}
		60% {
			transform: translateY(80%) scale(1.1) rotate(-3deg);
			box-shadow: 0 8px 24px rgba(31, 196, 217, 0.3);
		}
		100% {
			transform: translateY(100%) scale(1) rotate(0deg);
			box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
		}
	}

	@keyframes swap-left {
		0% {
			transform: translateX(0) scale(1) rotate(0deg);
			z-index: 10;
		}
		30% {
			transform: translateX(-15%) scale(1.15) rotate(-5deg);
			box-shadow: 0 12px 32px rgba(31, 196, 217, 0.4);
		}
		60% {
			transform: translateX(-80%) scale(1.1) rotate(3deg);
			box-shadow: 0 8px 24px rgba(31, 196, 217, 0.3);
		}
		100% {
			transform: translateX(-100%) scale(1) rotate(0deg);
			box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
		}
	}

	@keyframes swap-right {
		0% {
			transform: translateX(0) scale(1) rotate(0deg);
			z-index: 10;
		}
		30% {
			transform: translateX(15%) scale(1.15) rotate(5deg);
			box-shadow: 0 12px 32px rgba(31, 196, 217, 0.4);
		}
		60% {
			transform: translateX(80%) scale(1.1) rotate(-3deg);
			box-shadow: 0 8px 24px rgba(31, 196, 217, 0.3);
		}
		100% {
			transform: translateX(100%) scale(1) rotate(0deg);
			box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
		}
	}

	.game-board.shaking {
		animation: board-shake 0.3s cubic-bezier(0.36, 0.07, 0.19, 0.97);
	}

	@keyframes board-shake {
		0%, 100% {
			transform: translate(0, 0);
		}
		10% {
			transform: translate(-2px, 1px);
		}
		20% {
			transform: translate(2px, -1px);
		}
		30% {
			transform: translate(-2px, -1px);
		}
		40% {
			transform: translate(2px, 1px);
		}
		50% {
			transform: translate(-1px, 2px);
		}
		60% {
			transform: translate(1px, -2px);
		}
		70% {
			transform: translate(-1px, -2px);
		}
		80% {
			transform: translate(1px, 2px);
		}
		90% {
			transform: translate(-1px, 1px);
		}
	}

	.targeting-mode {
		cursor: crosshair;
	}

	.targeting-mode .game-cell {
		cursor: crosshair;
		transition: all 0.2s ease, box-shadow 0.2s ease;
	}

	.targeting-mode .game-cell:hover {
		background: rgba(255, 215, 0, 0.3);
		border: 2px solid var(--color-gpb-gold);
		box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
		transform: scale(1.05);
	}


	.game-cell.falling {
		animation: cell-fall 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
	}

	.game-cell.bouncing {
		animation: cell-bounce 0.15s ease-out;
	}

	.game-cell.exploding {
		animation: cell-explode 0.4s cubic-bezier(0.6, 0.04, 0.98, 0.335) forwards;
		z-index: 15;
	}

	.game-cell.fading {
		animation: match-fade 0.35s ease-out forwards;
		z-index: 15;
	}

	.game-cell.appearing {
		animation: cell-appear 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	@keyframes cell-explode {
		0% {
			transform: scale(1) rotate(0deg);
			opacity: 1;
			background: rgba(255, 255, 255, 0.9);
		}
		15% {
			transform: scale(1.25) rotate(5deg);
			opacity: 1;
			background: rgba(255, 215, 0, 0.9);
			box-shadow: 0 0 30px rgba(255, 215, 0, 0.8), inset 0 0 20px rgba(255, 255, 255, 0.5);
		}
		40% {
			transform: scale(1.4) rotate(-5deg);
			opacity: 0.9;
			background: rgba(31, 196, 217, 0.8);
			box-shadow: 0 0 40px rgba(31, 196, 217, 0.8), inset 0 0 30px rgba(255, 255, 255, 0.6);
		}
		70% {
			transform: scale(0.8) rotate(10deg);
			opacity: 0.5;
			background: rgba(31, 196, 217, 0.4);
			box-shadow: 0 0 20px rgba(31, 196, 217, 0.4);
		}
		100% {
			transform: scale(0.3) rotate(20deg);
			opacity: 0;
			background: rgba(31, 196, 217, 0.2);
			box-shadow: 0 0 5px rgba(31, 196, 217, 0.2);
		}
	}

	@keyframes cell-fall {
		0% {
			transform: translateY(-100%);
			opacity: 0.7;
		}
		70% {
			transform: translateY(5%);
			opacity: 1;
		}
		100% {
			transform: translateY(0%);
			opacity: 1;
		}
	}

	@keyframes cell-bounce {
		0% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.1);
		}
		100% {
			transform: scale(1);
		}
	}

	@keyframes match-fade {
		0% {
			transform: scale(1) rotate(0deg);
			opacity: 1;
			background: rgba(255, 255, 255, 0.9);
			filter: brightness(1);
		}
		25% {
			transform: scale(1.15) rotate(3deg);
			opacity: 0.95;
			background: rgba(255, 215, 0, 0.7);
			box-shadow: 0 0 25px rgba(255, 215, 0, 0.7);
			filter: brightness(1.3);
		}
		60% {
			transform: scale(1.25) rotate(-3deg);
			opacity: 0.6;
			background: rgba(31, 196, 217, 0.5);
			box-shadow: 0 0 30px rgba(31, 196, 217, 0.6);
			filter: brightness(1.5);
		}
		85% {
			transform: scale(0.7) rotate(5deg);
			opacity: 0.3;
			background: rgba(31, 196, 217, 0.3);
			box-shadow: 0 0 15px rgba(31, 196, 217, 0.3);
			filter: brightness(1.2);
		}
		100% {
			transform: scale(0.4) rotate(10deg);
			opacity: 0;
			background: rgba(31, 196, 217, 0.1);
			box-shadow: none;
			filter: brightness(1);
		}
	}

	@keyframes cell-appear {
		0% {
			transform: translateY(-50px) scale(0.3);
			opacity: 0;
		}
		60% {
			transform: translateY(5px) scale(1.1);
			opacity: 0.8;
		}
		100% {
			transform: translateY(0) scale(1);
			opacity: 1;
		}
	}

	@keyframes recommended-glow {
		0%, 100% {
			box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
			border-color: var(--color-gpb-gold);
		}
		50% {
			box-shadow: 0 0 30px rgba(255, 215, 0, 0.8);
			border-color: var(--color-gpb-gold);
		}
	}

	@keyframes recommended-ring {
		0%, 100% {
			opacity: 0.6;
			transform: scale(1);
		}
		50% {
			opacity: 1;
			transform: scale(1.05);
		}
	}

	.game-cell.keyboard-focus {
		outline: 3px solid var(--color-gpb-mint);
		outline-offset: 2px;
		z-index: 10;
		box-shadow: 0 0 0 6px rgba(31, 196, 217, 0.3);
	}

	:global(.cell-icon) {
		transition: all 0.2s ease;
	}

	:global(.cell-icon.icon-exploding) {
		animation: icon-glow 0.4s ease-out forwards;
	}

	@keyframes icon-glow {
		0% {
			filter: brightness(1) drop-shadow(0 0 0 transparent);
			transform: scale(1) rotate(0deg);
		}
		25% {
			filter: brightness(2) drop-shadow(0 0 8px rgba(255, 215, 0, 0.8));
			transform: scale(1.3) rotate(10deg);
		}
		50% {
			filter: brightness(2.5) drop-shadow(0 0 12px rgba(31, 196, 217, 0.9));
			transform: scale(1.4) rotate(-10deg);
		}
		75% {
			filter: brightness(1.5) drop-shadow(0 0 6px rgba(31, 196, 217, 0.6));
			transform: scale(1.1) rotate(5deg);
		}
		100% {
			filter: brightness(0.5) drop-shadow(0 0 0 transparent);
			transform: scale(0.5) rotate(20deg);
			opacity: 0;
		}
	}

	@media (prefers-contrast: high) {
		.game-cell {
			border: 2px solid;
			background: window;
			color: windowtext;
		}

		.game-cell.selected {
			border-color: highlight;
			background: highlight;
			color: highlighttext;
		}

		.game-cell.keyboard-focus {
			outline: 3px solid highlight;
		}
	}
</style>
