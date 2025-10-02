<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { GameLayout } from '$lib';
	import { match3Store, match3Selectors } from './gameState';
	import { initializeGameField } from './gameLogic';
	import { GAME_CONFIG } from './constants';
	import GameOverModal from './GameOverModal.svelte';
	import DemoHint from './DemoHint.svelte';
	import type { Position, CellType } from './types';

	import Accessibility from './components/Accessibility.svelte';
	import GameHeader from './components/GameHeader.svelte';
	import BoosterPanel from './components/BoosterPanel.svelte';
	import GameBoard from './components/GameBoard.svelte';
	import GameControls from './components/GameControls.svelte';

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

	let touchStartPos = $state<{ x: number; y: number } | null>(null);
	let touchStartCell = $state<Position | null>(null);
	const MIN_SWIPE_DISTANCE = 30;

	$effect(() => {
		gameState = $match3Store;
		selectors = $match3Selectors;
	});

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

	function handleTouchStart(event: TouchEvent, row: number, col: number) {
		if (gameState.isAnimating) return;

		const touch = event.touches[0];
		touchStartPos = { x: touch.clientX, y: touch.clientY };
		touchStartCell = { row, col };
	}

	function handleTouchMove(event: TouchEvent) {
		if (!touchStartPos || !touchStartCell) return;

		if (event.cancelable) {
			event.preventDefault();
		}
	}

	function handleTouchEnd(event: TouchEvent) {
		if (!touchStartPos || !touchStartCell) return;

		const touch = event.changedTouches[0];
		const dx = touch.clientX - touchStartPos.x;
		const dy = touch.clientY - touchStartPos.y;

		const absDx = Math.abs(dx);
		const absDy = Math.abs(dy);

		if (Math.max(absDx, absDy) < MIN_SWIPE_DISTANCE) {
			handleCellClick(touchStartCell.row, touchStartCell.col);
			touchStartPos = null;
			touchStartCell = null;
			return;
		}

		if (gameState.status !== 'playing') {
			touchStartPos = null;
			touchStartCell = null;
			return;
		}

		let targetCell: Position | null = null;

		if (absDx > absDy) {
			if (dx > 0) {
				targetCell = { row: touchStartCell.row, col: touchStartCell.col + 1 };
			} else {
				targetCell = { row: touchStartCell.row, col: touchStartCell.col - 1 };
			}
		} else {
			if (dy > 0) {
				targetCell = { row: touchStartCell.row + 1, col: touchStartCell.col };
			} else {
				targetCell = { row: touchStartCell.row - 1, col: touchStartCell.col };
			}
		}

		if (targetCell && targetCell.row >= 0 && targetCell.row < 8 && targetCell.col >= 0 && targetCell.col < 8) {
			match3Store.attemptSwap(touchStartCell, targetCell);
		}

		touchStartPos = null;
		touchStartCell = null;
	}

	const movesUsed = $derived(GAME_CONFIG.INITIAL_MOVES - gameState.moves);
</script>

<GameLayout gameName="Золотой Резерв" background="gradient-wealth" showScore={true}>
	<Accessibility {announcements} {gameState} />

	<main
		class="match3-container"
		aria-label="Игра Золотой Резерв. Используйте стрелки для навигации, Enter для выбора, Escape для отмены"
	>
		<div class="game-header p-4">
			<GameHeader score={gameState.score} moves={gameState.moves} targetScore={gameState.targetScore} />
			<BoosterPanel charge={gameState.booster.charge} boosterProgress={selectors.boosterProgress} />
		</div>

		<GameBoard
			field={gameState.field}
			status={gameState.status}
			currentFocusPosition={currentFocusPosition}
			explosionEffect={explosionEffect}
			scoreBoost={gameState.scoreBoost}
			onCellClick={handleCellClick}
			onKeyNavigation={handleKeyNavigation}
			onScoreBoostComplete={handleScoreBoostComplete}
			onExplosionComplete={() => explosionEffect = { active: false, x: 0, y: 0 }}
			onTouchStart={handleTouchStart}
			onTouchMove={handleTouchMove}
			onTouchEnd={handleTouchEnd}
		/>

		<GameControls
			onexit={handleExit}
			onBoosterClick={handleBoosterClick}
			canUseBooster={selectors.canUseBooster}
			status={gameState.status}
		/>
	</main>

	<DemoHint
		visible={selectors.showingDemoHint}
		hint={selectors.demoHint}
		step={selectors.currentDemoStep}
		onClose={handleDemoHintClose}
		onNext={handleDemoHintNext}
	/>

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

	.match3-container:focus {
		outline: 2px solid var(--color-gpb-blue);
		outline-offset: 2px;
	}
</style>
