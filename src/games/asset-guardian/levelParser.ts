import type {
	LevelConfig,
	CellType,
	GridPosition,
	ValidationResult,
	Position
} from './types';
import {
	CELL_TYPES,
	GAME_CONFIG,
	SCORE_VALUES,
	VALIDATION_MESSAGES
} from './constants';

export interface LevelStats {
	totalCells: number;
	wallCount: number;
	emptyCells: number;
	bonusCount: number;
	trapCount: number;
	hasStart: boolean;
	hasFinish: boolean;
	estimatedScore: number;
	isReachable: boolean;
}

export interface ParsedLevel extends LevelConfig {
	stats: LevelStats;
	cellPositions: {
		start: GridPosition | null;
		finish: GridPosition | null;
		bonuses: GridPosition[];
		traps: GridPosition[];
		walls: GridPosition[];
	};
}

export function validateLevel(level: LevelConfig): ValidationResult {
	try {
		if (!level.grid || !Array.isArray(level.grid)) {
			return {
				isValid: false,
				error: VALIDATION_MESSAGES.INVALID_LEVEL,
				suggestions: ['Проверьте что grid является двумерным массивом']
			};
		}

		if (level.grid.length !== GAME_CONFIG.GRID_HEIGHT ||
			level.grid[0]?.length !== GAME_CONFIG.GRID_WIDTH) {
			return {
				isValid: false,
				error: 'Неверный размер сетки',
				suggestions: [`Сетка должна быть ${GAME_CONFIG.GRID_WIDTH}x${GAME_CONFIG.GRID_HEIGHT}`]
			};
		}

		let hasStart = false;
		let hasFinish = false;
		let startCount = 0;
		let finishCount = 0;

		for (let row = 0; row < level.grid.length; row++) {
			for (let col = 0; col < level.grid[row].length; col++) {
				const cellType = level.grid[row][col];

				if (!CELL_TYPES.includes(cellType)) {
					return {
						isValid: false,
						error: `Неизвестный тип ячейки: ${cellType} в позиции [${row}, ${col}]`,
						suggestions: [`Используйте типы: ${CELL_TYPES.join(', ')}`]
					};
				}

				if (cellType === 'start') {
					hasStart = true;
					startCount++;
				}
				if (cellType === 'finish') {
					hasFinish = true;
					finishCount++;
				}
			}
		}

		if (!hasStart) {
			return {
				isValid: false,
				error: 'Уровень должен иметь стартовую позицию',
				suggestions: ['Добавьте ячейку типа "start"']
			};
		}

		if (!hasFinish) {
			return {
				isValid: false,
				error: 'Уровень должен иметь финишную позицию',
				suggestions: ['Добавьте ячейку типа "finish"']
			};
		}

		if (startCount > 1) {
			return {
				isValid: false,
				error: 'Уровень должен иметь только одну стартовую позицию',
				suggestions: ['Оставьте только одну ячейку типа "start"']
			};
		}

		if (finishCount > 1) {
			return {
				isValid: false,
				error: 'Уровень должен иметь только одну финишную позицию',
				suggestions: ['Оставьте только одну ячейку типа "finish"']
			};
		}

		const startPosition = findCellPosition(level.grid, 'start');
		const finishPosition = findCellPosition(level.grid, 'finish');

		if (!startPosition || !finishPosition) {
			return {
				isValid: false,
				error: 'Не удалось найти стартовую или финишную позицию',
				suggestions: ['Проверьте корректность позиций start и finish']
			};
		}

		if (!isPositionReachable(level.grid, startPosition, finishPosition)) {
			return {
				isValid: false,
				error: 'Финиш недостижим от старта',
				suggestions: ['Убедитесь что есть путь от start к finish']
			};
		}

		return { isValid: true };

	} catch (error) {
		return {
			isValid: false,
			error: `Ошибка валидации: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
			suggestions: ['Проверьте структуру уровня']
		};
	}
}

export function parseLevel(level: LevelConfig): ParsedLevel {
	const stats = calculateLevelStats(level);
	const cellPositions = extractCellPositions(level.grid);

	return {
		...level,
		stats,
		cellPositions
	};
}

export function calculateLevelStats(level: LevelConfig): LevelStats {
	let wallCount = 0;
	let emptyCells = 0;
	let bonusCount = 0;
	let trapCount = 0;
	let hasStart = false;
	let hasFinish = false;

	const totalCells = GAME_CONFIG.GRID_WIDTH * GAME_CONFIG.GRID_HEIGHT;

	for (const row of level.grid) {
		for (const cell of row) {
			switch (cell) {
				case 'wall':
					wallCount++;
					break;
				case 'empty':
					emptyCells++;
					break;
				case 'start':
					hasStart = true;
					emptyCells++;
					break;
				case 'finish':
					hasFinish = true;
					emptyCells++;
					break;
				case 'cashback':
				case 'deposit':
					bonusCount++;
					emptyCells++;
					break;
				case 'trap_phishing':
				case 'trap_fraud':
					trapCount++;
					emptyCells++;
					break;
			}
		}
	}

	const estimatedScore = (bonusCount * SCORE_VALUES.BONUS_CASHBACK) +
						  (bonusCount * SCORE_VALUES.BONUS_DEPOSIT) / 2;

	const startPos = findCellPosition(level.grid, 'start');
	const finishPos = findCellPosition(level.grid, 'finish');
	const isReachable = startPos && finishPos ?
		isPositionReachable(level.grid, startPos, finishPos) : false;

	return {
		totalCells,
		wallCount,
		emptyCells,
		bonusCount,
		trapCount,
		hasStart,
		hasFinish,
		estimatedScore,
		isReachable
	};
}

export function extractCellPositions(grid: CellType[][]) {
	const positions = {
		start: null as GridPosition | null,
		finish: null as GridPosition | null,
		bonuses: [] as GridPosition[],
		traps: [] as GridPosition[],
		walls: [] as GridPosition[]
	};

	for (let row = 0; row < grid.length; row++) {
		for (let col = 0; col < grid[row].length; col++) {
			const cellType = grid[row][col];
			const position: GridPosition = { row, col };

			switch (cellType) {
				case 'start':
					positions.start = position;
					break;
				case 'finish':
					positions.finish = position;
					break;
				case 'cashback':
				case 'deposit':
					positions.bonuses.push(position);
					break;
				case 'trap_phishing':
				case 'trap_fraud':
					positions.traps.push(position);
					break;
				case 'wall':
					positions.walls.push(position);
					break;
			}
		}
	}

	return positions;
}

export function findCellPosition(grid: CellType[][], cellType: CellType): GridPosition | null {
	for (let row = 0; row < grid.length; row++) {
		for (let col = 0; col < grid[row].length; col++) {
			if (grid[row][col] === cellType) {
				return { row, col };
			}
		}
	}
	return null;
}

export function gridPositionToWorldPosition(
	gridPos: GridPosition,
	cellSize: number = GAME_CONFIG.CELL_SIZE
): Position {
	return {
		x: gridPos.col * cellSize + cellSize / 2,
		y: gridPos.row * cellSize + cellSize / 2
	};
}

export function worldPositionToGridPosition(
	worldPos: Position,
	cellSize: number = GAME_CONFIG.CELL_SIZE
): GridPosition {
	return {
		row: Math.floor(worldPos.y / cellSize),
		col: Math.floor(worldPos.x / cellSize)
	};
}

export function getCellTypeAtPosition(grid: CellType[][], position: GridPosition): CellType | null {
	if (position.row < 0 || position.row >= grid.length ||
		position.col < 0 || position.col >= grid[0].length) {
		return null;
	}
	return grid[position.row][position.col];
}

export function isPositionWalkable(grid: CellType[][], position: GridPosition): boolean {
	const cellType = getCellTypeAtPosition(grid, position);
	return cellType !== null && cellType !== 'wall';
}

export function getNeighbors(position: GridPosition): GridPosition[] {
	return [
		{ row: position.row - 1, col: position.col },
		{ row: position.row + 1, col: position.col },
		{ row: position.row, col: position.col - 1 },
		{ row: position.row, col: position.col + 1 }
	];
}

export function isPositionReachable(
	grid: CellType[][],
	start: GridPosition,
	target: GridPosition
): boolean {
	const visited = new Set<string>();
	const queue: GridPosition[] = [start];

	while (queue.length > 0) {
		const current = queue.shift()!;
		const key = `${current.row},${current.col}`;

		if (visited.has(key)) continue;
		visited.add(key);

		if (current.row === target.row && current.col === target.col) {
			return true;
		}

		for (const neighbor of getNeighbors(current)) {
			const neighborKey = `${neighbor.row},${neighbor.col}`;
			if (!visited.has(neighborKey) && isPositionWalkable(grid, neighbor)) {
				queue.push(neighbor);
			}
		}
	}

	return false;
}

export function calculateOptimalPath(
	grid: CellType[][],
	start: GridPosition,
	target: GridPosition
): GridPosition[] | null {
	const visited = new Set<string>();
	const queue: { position: GridPosition; path: GridPosition[] }[] = [
		{ position: start, path: [start] }
	];

	while (queue.length > 0) {
		const { position: current, path } = queue.shift()!;
		const key = `${current.row},${current.col}`;

		if (visited.has(key)) continue;
		visited.add(key);

		if (current.row === target.row && current.col === target.col) {
			return path;
		}

		for (const neighbor of getNeighbors(current)) {
			const neighborKey = `${neighbor.row},${neighbor.col}`;
			if (!visited.has(neighborKey) && isPositionWalkable(grid, neighbor)) {
				queue.push({
					position: neighbor,
					path: [...path, neighbor]
				});
			}
		}
	}

	return null;
}

export function estimateLevelDifficulty(level: LevelConfig): {
	difficulty: 'easy' | 'medium' | 'hard';
	score: number;
	factors: string[];
} {
	const stats = calculateLevelStats(level);
	const factors: string[] = [];
	let difficultyScore = 0;

	const densityRatio = stats.wallCount / stats.totalCells;
	if (densityRatio > 0.5) {
		difficultyScore += 2;
		factors.push('Высокая плотность стен');
	} else if (densityRatio > 0.3) {
		difficultyScore += 1;
		factors.push('Средняя плотность стен');
	}

	const trapRatio = stats.trapCount / stats.totalCells;
	if (trapRatio > 0.15) {
		difficultyScore += 3;
		factors.push('Много ловушек');
	} else if (trapRatio > 0.05) {
		difficultyScore += 1;
		factors.push('Умеренное количество ловушек');
	}

	const bonusRatio = stats.bonusCount / stats.totalCells;
	if (bonusRatio < 0.05) {
		difficultyScore += 2;
		factors.push('Мало бонусов');
	}

	if (level.timeLimit < 90) {
		difficultyScore += 2;
		factors.push('Ограниченное время');
	} else if (level.timeLimit < 120) {
		difficultyScore += 1;
		factors.push('Умеренное ограничение времени');
	}

	const startPos = findCellPosition(level.grid, 'start');
	const finishPos = findCellPosition(level.grid, 'finish');
	if (startPos && finishPos) {
		const path = calculateOptimalPath(level.grid, startPos, finishPos);
		if (path && path.length > 20) {
			difficultyScore += 1;
			factors.push('Длинный оптимальный путь');
		}
	}

	let estimatedDifficulty: 'easy' | 'medium' | 'hard';
	if (difficultyScore >= 6) {
		estimatedDifficulty = 'hard';
	} else if (difficultyScore >= 3) {
		estimatedDifficulty = 'medium';
	} else {
		estimatedDifficulty = 'easy';
	}

	return {
		difficulty: estimatedDifficulty,
		score: difficultyScore,
		factors
	};
}