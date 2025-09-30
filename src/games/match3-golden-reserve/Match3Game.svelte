<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Coins, Gem, Crown, Zap, Clock, Trophy } from 'lucide-svelte';
	import { Button, Counter, Badge, GameLayout } from '$lib';
	import { match3Store, match3Selectors } from './gameState';
	import { initializeGameField } from './gameLogic';
	import { GAME_CONFIG } from './constants';
	import GameOverModal from './GameOverModal.svelte';
	import ScoreBoost from './ScoreBoost.svelte';
	import ParticleEffect from './ParticleEffect.svelte';
	import DemoHint from './DemoHint.svelte';
	import type { CellType, Position } from './types';

	interface Props {
		onexit?: () => void;
	}

	let { onexit }: Props = $props();

	let mounted = $state(false);
	let gameState = $state($match3Store);
	let selectors = $state($match3Selectors);
	let explosionEffect = $state({ active: false, x: 0, y: 0 });
	let currentFocusPosition = $state<Position | null>(null);
	let announcements = $state('');

	$effect(() => {
		gameState = $match3Store;
		selectors = $match3Selectors;
	});

	const iconMap: Record<CellType, typeof Coins> = {
		coin: Coins,
		gold: Crown,
		sapphire: Gem,
		emerald: Gem
	};

	onMount(() => {
		mounted = true;
		match3Store.enableDemoMode();
	});

	onDestroy(() => {
		match3Store.reset();
	});

	function announceToScreenReader(message: string) {
		announcements = message;
		setTimeout(() => { announcements = ''; }, 1000);
	}

	function handleKeyNavigation(event: KeyboardEvent) {
		if (gameState.isAnimating || gameState.status === 'completed') return;

		if (!currentFocusPosition) {
			currentFocusPosition = { row: 0, col: 0 };
			return;
		}

		const { row, col } = currentFocusPosition;
		let newRow = row;
		let newCol = col;

		switch (event.key) {
			case 'ArrowUp':
				newRow = Math.max(0, row - 1);
				break;
			case 'ArrowDown':
				newRow = Math.min(7, row + 1);
				break;
			case 'ArrowLeft':
				newCol = Math.max(0, col - 1);
				break;
			case 'ArrowRight':
				newCol = Math.min(7, col + 1);
				break;
			case 'Enter':
			case ' ':
				event.preventDefault();
				handleCellClick(row, col);
				return;
			case 'Escape':
				if (gameState.selectedCell) {
					match3Store.selectCell(null);
					announceToScreenReader('Выбор отменён');
				}
				return;
			default:
				return;
		}

		if (newRow !== row || newCol !== col) {
			currentFocusPosition = { row: newRow, col: newCol };
			const cellType = gameState.field[newRow][newCol].type;
			const cellName = getCellTypeName(cellType);
			announceToScreenReader(`${cellName} в позиции ${newRow + 1}, ${newCol + 1}`);
		}
	}

	function getCellTypeName(cellType: CellType): string {
		switch (cellType) {
			case 'coin': return 'Монета';
			case 'gold': return 'Золото';
			case 'sapphire': return 'Сапфир';
			case 'emerald': return 'Изумруд';
			default: return 'Неизвестно';
		}
	}

	function getGameStatusAnnouncement(): string {
		if (gameState.status === 'targeting') {
			return 'Режим нацеливания бустера. Выберите цель.';
		}
		if (gameState.status === 'completed') {
			return gameState.score >= gameState.targetScore ? 'Игра завершена. Победа!' : 'Игра завершена. Поражение.';
		}
		return `Очки: ${gameState.score}. Ходы: ${gameState.moves}. Заряд бустера: ${gameState.booster.charge} процентов.`;
	}

	function handleCellClick(row: number, col: number) {
		if (gameState.isAnimating) return;

		const position = { row, col };
		currentFocusPosition = position;

		if (gameState.status === 'targeting') {
			announceToScreenReader('Применяем бустер');
			const gameBoard = document.querySelector('.game-board');
			if (gameBoard) {
				const cellSize = gameBoard.clientWidth / 8;
				const x = (col + 0.5) * cellSize;
				const y = (row + 0.5) * cellSize;

				explosionEffect = { active: true, x, y };

				setTimeout(() => {
					match3Store.applyBooster(position);
					explosionEffect = { active: false, x: 0, y: 0 };
				}, 200);
			}
			return;
		}

		if (gameState.status !== 'playing') return;

		if (!gameState.selectedCell) {
			match3Store.selectCell(position);
			const cellType = gameState.field[row][col].type;
			announceToScreenReader(`Выбрана клетка: ${getCellTypeName(cellType)}`);
		} else if (gameState.selectedCell.row === row && gameState.selectedCell.col === col) {
			match3Store.selectCell(null);
			announceToScreenReader('Выбор отменён');
		} else {
			match3Store.attemptSwap(gameState.selectedCell, position);
			announceToScreenReader('Попытка обмена');
		}
	}

	function formatTime(seconds: number) {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
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

	function handleRestart() {
		const field = initializeGameField();
		match3Store.initialize(field);
	}

	function handleExit() {
		onexit?.();
	}

	function handleScoreBoostComplete() {
		match3Store.hideScoreBoost();
	}

	function handleBoosterClick() {
		if (selectors.canUseBooster) {
			match3Store.activateBooster();
		}
	}

	function handleDemoHintClose() {
		match3Store.hideDemoHint();
	}

	function handleDemoHintNext() {
		match3Store.hideDemoHint();
	}

	const movesUsed = $derived(GAME_CONFIG.INITIAL_MOVES - gameState.moves);
</script>

<GameLayout gameName="Золотой Резерв" background="gradient-wealth" showScore={true}>
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
	<div
		class="match3-container"
		role="application"
		aria-label="Игра Золотой Резерв. Используйте стрелки для навигации, Enter для выбора, Escape для отмены"
	>
		<!-- Game Header -->
		<div class="game-header p-4">
			<div class="stats-bar glass-effect rounded-2xl p-4 text-gpb-gray-900 mb-4">
				<div class="flex justify-between items-center">
					<div class="stat-item">
						<Coins size={20} class="text-gpb-gold" />
						<div class="stat-content">
							<div class="stat-value animated-score">
								<Counter value={gameState.score} target={gameState.score} duration={800} animated={true} />
							</div>
							<div class="stat-label">Очки</div>
						</div>
					</div>

					<div class="stat-item">
						<Zap size={20} class="text-gpb-violet" />
						<div class="stat-content">
							<div class="stat-value">{gameState.moves}</div>
							<div class="stat-label">Ходы</div>
						</div>
					</div>

					<div class="stat-item">
						<Trophy size={20} class="text-gpb-emerald" />
						<div class="stat-content">
							<div class="stat-value">{gameState.targetScore}</div>
							<div class="stat-label">Цель</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Booster Panel -->
			<div class="booster-panel glass-effect rounded-2xl p-4 text-gpb-gray-900 mb-4">
				<h3 class="font-card-title mb-3 flex items-center gap-2">
					<Zap size={20} class="text-gpb-mint" />
					Газпромбанк Бонус
				</h3>
				<div class="booster-charge-bar">
					<div class="charge-progress" style="width: {selectors.boosterProgress}%"></div>
				</div>
				<div class="text-xs text-gpb-gray-600 mt-2">
					Заряд: {gameState.booster.charge}/100
				</div>
			</div>
		</div>

		<!-- Game Board -->
		<div class="game-board-wrapper">
			<div
				class="game-board {gameState.status === 'targeting' ? 'targeting-mode' : ''}"
				style="position: relative;"
				role="grid"
				aria-label="Игровое поле 8 на 8 клеток"
				aria-rowcount="8"
				aria-colcount="8"
			>
				{#each gameState.field as row, rowIndex}
					{#each row as cell, colIndex}
						{@const IconComponent = iconMap[cell.type]}
						<div
							class="game-cell {cell.isSelected ? 'selected' : ''} {cell.isRecommended ? 'recommended' : ''} {cell.isFalling ? 'falling' : ''} {cell.isBouncing ? 'bouncing' : ''} {cell.isFading ? 'fading' : ''} {cell.isAppearing ? 'appearing' : ''} {currentFocusPosition && currentFocusPosition.row === rowIndex && currentFocusPosition.col === colIndex ? 'keyboard-focus' : ''}"
							style="animation-delay: {cell.animationDelay || 0}ms"
							onclick={() => handleCellClick(rowIndex, colIndex)}
							onkeydown={(event) => {
								if (event.key === 'Enter' || event.key === ' ') {
									event.preventDefault();
									handleCellClick(rowIndex, colIndex);
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
									class="cell-icon {getCellColor(cell.type)}"
								/>
							{/if}
						</div>
					{/each}
				{/each}

				<!-- Score Boost Animation -->
				<ScoreBoost
					amount={gameState.scoreBoost.amount}
					visible={gameState.scoreBoost.visible}
					onComplete={handleScoreBoostComplete}
				/>

				<!-- Particle Explosion Effect -->
				<ParticleEffect
					x={explosionEffect.x}
					y={explosionEffect.y}
					active={explosionEffect.active}
					onComplete={() => explosionEffect = { active: false, x: 0, y: 0 }}
				/>
			</div>
		</div>

		<!-- Game Controls -->
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
					disabled={!selectors.canUseBooster}
					onclick={handleBoosterClick}
					class="btn-game-primary {selectors.canUseBooster ? 'booster-ready' : ''}"
				>
					<Zap size={18} class="mr-2" />
					{gameState.status === 'targeting' ? 'Выберите цель!' : selectors.canUseBooster ? 'Газпромбанк Бонус' : 'Копить энергию'}
				</Button>
			</div>

			<div class="demo-hint glass-effect rounded-xl p-4 mt-4 text-center text-gpb-gray-700">
				<p class="text-sm">
					<strong>Итерация 10:</strong> Финальная полировка и интеграция! Оптимизированы алгоритмы, добавлена поддержка скрин-ридеров, клавиатурная навигация и интеграция с системой очков. Улучшен баланс, оптимизированы анимации и добавлена защита от спама. Игра готова к production!
				</p>
			</div>
		</div>
	</div>

	<!-- Demo Hint Modal -->
	<DemoHint
		visible={selectors.showingDemoHint}
		hint={selectors.demoHint}
		step={selectors.currentDemoStep}
		onClose={handleDemoHintClose}
		onNext={handleDemoHintNext}
	/>

	<!-- Game Over Modal -->
	<GameOverModal
		open={gameState.status === 'completed'}
		score={gameState.score}
		targetScore={gameState.targetScore}
		movesUsed={movesUsed}
		initialMoves={GAME_CONFIG.INITIAL_MOVES}
		status={gameState.status}
		isDemoMode={selectors.isDemoActive}
		onRestart={handleRestart}
		onExit={handleExit}
	/>
</GameLayout>

<style>
	.match3-container {
		display: flex;
		flex-direction: column;
		flex: 1;
		height: 100%;
		min-height: 0;
	}

	.game-header {
		flex-shrink: 0;
	}

	.stats-bar {
		backdrop-filter: blur(8px);
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.stat-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.stat-content {
		text-align: left;
	}

	.stat-value {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-gpb-gray-900);
		line-height: 1;
		margin-bottom: 0.25rem;
		transition: all 0.3s ease;
	}

	.animated-score {
		position: relative;
	}

	.animated-score::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(90deg,
			transparent 0%,
			rgba(31, 196, 217, 0.3) 50%,
			transparent 100%);
		opacity: 0;
		animation: score-flash 0.6s ease-out;
		pointer-events: none;
	}

	.stat-label {
		font-size: 0.75rem;
		color: var(--color-gpb-gray-600);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.booster-panel {
		backdrop-filter: blur(8px);
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.booster-charge-bar {
		width: 100%;
		height: 8px;
		background: rgba(255, 255, 255, 0.3);
		border-radius: 4px;
		overflow: hidden;
	}

	.charge-progress {
		height: 100%;
		background: linear-gradient(90deg, var(--color-gpb-mint), var(--color-gpb-blue));
		transition: width 0.6s cubic-bezier(0.4, 0.0, 0.2, 1);
		position: relative;
		overflow: hidden;
	}

	.charge-progress::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
		animation: charge-wave 2s infinite;
	}

	.charge-progress::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg,
			rgba(255, 255, 255, 0.2) 0%,
			transparent 50%,
			rgba(255, 255, 255, 0.2) 100%);
		animation: shimmer 3s infinite;
	}

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
		max-width: 320px;
		aspect-ratio: 1;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
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


	.game-controls {
		flex-shrink: 0;
	}

	.demo-hint {
		backdrop-filter: blur(8px);
		border: 1px solid rgba(255, 255, 255, 0.2);
	}




	@keyframes pulse-glow {
		0%, 100% {
			box-shadow: 0 0 15px rgba(31, 196, 217, 0.4), 0 0 30px rgba(31, 196, 217, 0.2);
		}
		50% {
			box-shadow: 0 0 25px rgba(31, 196, 217, 0.7), 0 0 50px rgba(31, 196, 217, 0.4);
		}
	}

	@keyframes booster-shimmer {
		0% {
			background-position: -200% 0;
		}
		100% {
			background-position: 200% 0;
		}
	}

	@keyframes shimmer-sweep {
		0% {
			left: -100%;
		}
		100% {
			left: 100%;
		}
	}

	@keyframes rotate-border {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
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

	@keyframes swap-animation {
		0% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.1) rotate(5deg);
		}
		100% {
			transform: scale(1);
		}
	}

	@keyframes invalid-shake {
		0%, 100% {
			transform: translateX(0);
		}
		10%, 30%, 50%, 70%, 90% {
			transform: translateX(-4px);
		}
		20%, 40%, 60%, 80% {
			transform: translateX(4px);
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

	.game-cell.fading {
		animation: match-fade 0.3s ease-out forwards;
	}

	.game-cell.appearing {
		animation: cell-appear 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	@keyframes explosion-effect {
		0% {
			transform: scale(1);
			background: rgba(255, 255, 255, 0.9);
		}
		25% {
			transform: scale(1.3);
			background: rgba(255, 215, 0, 0.9);
			box-shadow: 0 0 40px rgba(255, 215, 0, 0.9);
		}
		50% {
			transform: scale(1.5);
			background: rgba(255, 140, 0, 0.8);
			box-shadow: 0 0 50px rgba(255, 140, 0, 0.8);
		}
		75% {
			transform: scale(1.2);
			background: rgba(255, 69, 0, 0.7);
			box-shadow: 0 0 60px rgba(255, 69, 0, 0.7);
		}
		100% {
			transform: scale(0);
			background: rgba(255, 0, 0, 0.5);
			box-shadow: 0 0 80px rgba(255, 0, 0, 0.5);
			opacity: 0;
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
			transform: scale(1);
			opacity: 1;
			background: rgba(255, 255, 255, 0.9);
		}
		50% {
			transform: scale(1.2);
			opacity: 0.7;
			background: rgba(31, 196, 217, 0.6);
			box-shadow: 0 0 20px rgba(31, 196, 217, 0.6);
		}
		100% {
			transform: scale(0.8);
			opacity: 0;
			background: rgba(31, 196, 217, 0.3);
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

	@keyframes charge-wave {
		0% {
			left: -100%;
		}
		100% {
			left: 100%;
		}
	}

	@keyframes shimmer {
		0% {
			transform: translateX(-100%);
		}
		100% {
			transform: translateX(100%);
		}
	}

	@keyframes score-flash {
		0% {
			opacity: 0;
			transform: translateX(-100%);
		}
		50% {
			opacity: 1;
			transform: translateX(0%);
		}
		100% {
			opacity: 0;
			transform: translateX(100%);
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

	.game-cell.keyboard-focus {
		outline: 3px solid var(--color-gpb-mint);
		outline-offset: 2px;
		z-index: 10;
		box-shadow: 0 0 0 6px rgba(31, 196, 217, 0.3);
	}

	.match3-container:focus {
		outline: 2px solid var(--color-gpb-blue);
		outline-offset: 2px;
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