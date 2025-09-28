import type { Cell, CellType, Position, ValidationResult, MatchClassification, MatchResult, MatchType } from './types';
import { GAME_CONFIG, CELL_TYPES, VALIDATION_MESSAGES, MATCH_CLASSIFICATIONS, BOOSTER_CHARGE_VALUES, BOOSTER_CONFIG } from './constants';

let cellIdCounter = 0;
let lastActionTime = 0;
const MIN_ACTION_INTERVAL = 150;

export function generateCellId(row: number, col: number): string {
	return `cell_${row}_${col}_${++cellIdCounter}`;
}

export function shouldAllowAction(): boolean {
	const now = Date.now();
	if (now - lastActionTime < MIN_ACTION_INTERVAL) {
		return false;
	}
	lastActionTime = now;
	return true;
}

export function resetActionThrottle(): void {
	lastActionTime = 0;
}

export function createEmptyField(): Cell[][] {
	const field: Cell[][] = [];

	for (let row = 0; row < GAME_CONFIG.FIELD_SIZE; row++) {
		field[row] = [];
		for (let col = 0; col < GAME_CONFIG.FIELD_SIZE; col++) {
			field[row][col] = createCell(row, col, getRandomCellType());
		}
	}

	return field;
}

export function createCell(row: number, col: number, type: CellType): Cell {
	return {
		type,
		id: generateCellId(row, col),
		position: { row, col },
		isSelected: false,
		isMatched: false,
		isHighlighted: false
	};
}

export function getRandomCellType(): CellType {
	const randomIndex = Math.floor(Math.random() * CELL_TYPES.length);
	return CELL_TYPES[randomIndex];
}

export function isValidPosition(position: Position): boolean {
	return (
		position.row >= 0 &&
		position.row < GAME_CONFIG.FIELD_SIZE &&
		position.col >= 0 &&
		position.col < GAME_CONFIG.FIELD_SIZE
	);
}

export function arePositionsAdjacent(pos1: Position, pos2: Position): boolean {
	const rowDiff = Math.abs(pos1.row - pos2.row);
	const colDiff = Math.abs(pos1.col - pos2.col);

	return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
}

export function validateCellSelection(
	field: Cell[][],
	selectedPos: Position | null,
	newPos: Position
): ValidationResult {
	if (!isValidPosition(newPos)) {
		return {
			isValid: false,
			error: VALIDATION_MESSAGES.INVALID_POSITION
		};
	}

	if (!selectedPos) {
		return { isValid: true };
	}

	if (!arePositionsAdjacent(selectedPos, newPos)) {
		return {
			isValid: false,
			error: VALIDATION_MESSAGES.CELLS_NOT_ADJACENT,
			suggestions: ['Выберите соседнюю клетку']
		};
	}

	return { isValid: true };
}

export function swapCells(field: Cell[][], pos1: Position, pos2: Position): Cell[][] {
	const newField = field.map(row => [...row]);

	const cell1 = { ...newField[pos1.row][pos1.col] };
	const cell2 = { ...newField[pos2.row][pos2.col] };

	cell1.position = pos2;
	cell2.position = pos1;
	cell1.id = generateCellId(pos2.row, pos2.col);
	cell2.id = generateCellId(pos1.row, pos1.col);

	newField[pos1.row][pos1.col] = cell2;
	newField[pos2.row][pos2.col] = cell1;

	return newField;
}

export function clearCellSelection(field: Cell[][]): Cell[][] {
	return field.map(row =>
		row.map(cell => ({
			...cell,
			isSelected: false,
			isHighlighted: false
		}))
	);
}

export function highlightCell(field: Cell[][], position: Position): Cell[][] {
	return field.map((row, rowIndex) =>
		row.map((cell, colIndex) => ({
			...cell,
			isSelected: rowIndex === position.row && colIndex === position.col,
			isHighlighted: rowIndex === position.row && colIndex === position.col
		}))
	);
}

export function getNeighborPositions(position: Position): Position[] {
	const neighbors: Position[] = [];
	const directions = [
		{ row: -1, col: 0 },
		{ row: 1, col: 0 },
		{ row: 0, col: -1 },
		{ row: 0, col: 1 }
	];

	directions.forEach(dir => {
		const newPos = {
			row: position.row + dir.row,
			col: position.col + dir.col
		};

		if (isValidPosition(newPos)) {
			neighbors.push(newPos);
		}
	});

	return neighbors;
}

const validationCache = new WeakMap<Cell[][], ValidationResult>();

export function validateGameState(field: Cell[][], skipPositionCheck = false): ValidationResult {
	if (validationCache.has(field)) {
		return validationCache.get(field)!;
	}

	if (!Array.isArray(field) || field.length !== GAME_CONFIG.FIELD_SIZE) {
		const result = {
			isValid: false,
			error: 'Неверный размер игрового поля'
		};
		validationCache.set(field, result);
		return result;
	}

	for (let row = 0; row < GAME_CONFIG.FIELD_SIZE; row++) {
		const currentRow = field[row];
		if (!Array.isArray(currentRow) || currentRow.length !== GAME_CONFIG.FIELD_SIZE) {
			const result = {
				isValid: false,
				error: `Строка ${row} имеет неверный размер`
			};
			validationCache.set(field, result);
			return result;
		}

		for (let col = 0; col < GAME_CONFIG.FIELD_SIZE; col++) {
			const cell = currentRow[col];

			if (!cell || !CELL_TYPES.includes(cell.type)) {
				const result = {
					isValid: false,
					error: `Неверный тип клетки в позиции [${row}, ${col}]`
				};
				validationCache.set(field, result);
				return result;
			}

			if (!skipPositionCheck && (cell.position.row !== row || cell.position.col !== col)) {
				const result = {
					isValid: false,
					error: `Неверная позиция клетки [${row}, ${col}]`
				};
				validationCache.set(field, result);
				return result;
			}
		}
	}

	const result = { isValid: true };
	validationCache.set(field, result);
	return result;
}

const matchesCache = new WeakMap<Cell[][], Position[][]>();

export function findMatches(field: Cell[][]): Position[][] {
	if (matchesCache.has(field)) {
		return matchesCache.get(field)!;
	}

	const matches: Position[][] = [];
	const visited = new Set<number>();

	for (let row = 0; row < GAME_CONFIG.FIELD_SIZE; row++) {
		for (let col = 0; col < GAME_CONFIG.FIELD_SIZE; col++) {
			const positionIndex = row * GAME_CONFIG.FIELD_SIZE + col;

			if (visited.has(positionIndex)) continue;

			const position = { row, col };
			const horizontalMatch = findHorizontalMatch(field, position);
			const verticalMatch = findVerticalMatch(field, position);

			if (horizontalMatch.length >= GAME_CONFIG.MIN_MATCH_LENGTH) {
				matches.push(horizontalMatch);
				horizontalMatch.forEach(pos => visited.add(pos.row * GAME_CONFIG.FIELD_SIZE + pos.col));
			}

			if (verticalMatch.length >= GAME_CONFIG.MIN_MATCH_LENGTH) {
				matches.push(verticalMatch);
				verticalMatch.forEach(pos => visited.add(pos.row * GAME_CONFIG.FIELD_SIZE + pos.col));
			}
		}
	}

	matchesCache.set(field, matches);
	return matches;
}

export function findHorizontalMatch(field: Cell[][], startPos: Position): Position[] {
	const cellType = field[startPos.row][startPos.col].type;
	const match: Position[] = [startPos];

	for (let col = startPos.col + 1; col < GAME_CONFIG.FIELD_SIZE; col++) {
		if (field[startPos.row][col].type === cellType) {
			match.push({ row: startPos.row, col });
		} else {
			break;
		}
	}

	return match;
}

export function findVerticalMatch(field: Cell[][], startPos: Position): Position[] {
	const cellType = field[startPos.row][startPos.col].type;
	const match: Position[] = [startPos];

	for (let row = startPos.row + 1; row < GAME_CONFIG.FIELD_SIZE; row++) {
		if (field[row][startPos.col].type === cellType) {
			match.push({ row, col: startPos.col });
		} else {
			break;
		}
	}

	return match;
}

export function hasMatchAt(field: Cell[][], position: Position): boolean {
	const horizontalMatch = findHorizontalMatch(field, position);
	const verticalMatch = findVerticalMatch(field, position);

	return (
		horizontalMatch.length >= GAME_CONFIG.MIN_MATCH_LENGTH ||
		verticalMatch.length >= GAME_CONFIG.MIN_MATCH_LENGTH
	);
}

export function checkInitialMatches(field: Cell[][]): boolean {
	const matches = findMatches(field);
	return matches.length === 0;
}

export function generateField(): Cell[][] {
	let field: Cell[][];
	let attempts = 0;
	const maxAttempts = 50;

	do {
		field = createEmptyField();
		attempts++;
	} while (!checkInitialMatches(field) && attempts < maxAttempts);

	if (attempts >= maxAttempts) {
		field = forceGenerateValidField();
	}

	return field;
}

export function forceGenerateValidField(): Cell[][] {
	const field: Cell[][] = [];

	for (let row = 0; row < GAME_CONFIG.FIELD_SIZE; row++) {
		field[row] = [];
		for (let col = 0; col < GAME_CONFIG.FIELD_SIZE; col++) {
			const availableTypes = getAvailableTypesForPosition(field, row, col);
			const randomType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
			field[row][col] = createCell(row, col, randomType);
		}
	}

	return field;
}

export function getAvailableTypesForPosition(field: Cell[][], row: number, col: number): CellType[] {
	const forbiddenTypes = new Set<CellType>();

	if (col >= 2) {
		const type1 = field[row][col - 1]?.type;
		const type2 = field[row][col - 2]?.type;
		if (type1 === type2) {
			forbiddenTypes.add(type1);
		}
	}

	if (row >= 2) {
		const type1 = field[row - 1]?.[col]?.type;
		const type2 = field[row - 2]?.[col]?.type;
		if (type1 === type2) {
			forbiddenTypes.add(type1);
		}
	}

	return CELL_TYPES.filter(type => !forbiddenTypes.has(type));
}

export function shuffleField(field: Cell[][]): Cell[][] {
	const flatCells = field.flat().map(cell => cell.type);

	for (let i = flatCells.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[flatCells[i], flatCells[j]] = [flatCells[j], flatCells[i]];
	}

	const newField: Cell[][] = [];
	let index = 0;

	for (let row = 0; row < GAME_CONFIG.FIELD_SIZE; row++) {
		newField[row] = [];
		for (let col = 0; col < GAME_CONFIG.FIELD_SIZE; col++) {
			newField[row][col] = createCell(row, col, flatCells[index]);
			index++;
		}
	}

	return newField;
}

const possibleMovesCache = new WeakMap<Cell[][], boolean>();

export function hasPossibleMoves(field: Cell[][]): boolean {
	if (possibleMovesCache.has(field)) {
		return possibleMovesCache.get(field)!;
	}

	for (let row = 0; row < GAME_CONFIG.FIELD_SIZE; row++) {
		for (let col = 0; col < GAME_CONFIG.FIELD_SIZE; col++) {
			const position = { row, col };
			const neighbors = getNeighborPositions(position);

			for (const neighbor of neighbors) {
				if (wouldCreateMatch(field, position, neighbor)) {
					possibleMovesCache.set(field, true);
					return true;
				}
			}
		}
	}

	possibleMovesCache.set(field, false);
	return false;
}

export function wouldCreateMatch(field: Cell[][], pos1: Position, pos2: Position): boolean {
	if (!isValidPosition(pos1) || !isValidPosition(pos2)) {
		return false;
	}

	const type1 = field[pos1.row][pos1.col].type;
	const type2 = field[pos2.row][pos2.col].type;

	if (checkPatternMatch(field, pos1, type2) || checkPatternMatch(field, pos2, type1)) {
		return true;
	}

	return false;
}

function checkPatternMatch(field: Cell[][], position: Position, newType: CellType): boolean {
	const { row, col } = position;

	let horizontalCount = 1;
	for (let c = col - 1; c >= 0 && field[row][c].type === newType; c--) horizontalCount++;
	for (let c = col + 1; c < GAME_CONFIG.FIELD_SIZE && field[row][c].type === newType; c++) horizontalCount++;

	if (horizontalCount >= GAME_CONFIG.MIN_MATCH_LENGTH) return true;

	let verticalCount = 1;
	for (let r = row - 1; r >= 0 && field[r][col].type === newType; r--) verticalCount++;
	for (let r = row + 1; r < GAME_CONFIG.FIELD_SIZE && field[r][col].type === newType; r++) verticalCount++;

	return verticalCount >= GAME_CONFIG.MIN_MATCH_LENGTH;
}

export function isSwapResultingInMatch(field: Cell[][], pos1: Position, pos2: Position): boolean {
	return wouldCreateMatch(field, pos1, pos2);
}

export function isValidSwap(field: Cell[][], from: Position, to: Position): boolean {
	if (!isValidPosition(from) || !isValidPosition(to)) {
		return false;
	}

	if (!arePositionsAdjacent(from, to)) {
		return false;
	}

	return isSwapResultingInMatch(field, from, to);
}

export function performSwap(field: Cell[][], from: Position, to: Position): Cell[][] {
	if (!isValidSwap(field, from, to)) {
		return field;
	}

	return swapCells(field, from, to);
}

export function generateDemoField(): Cell[][] {
	const field: Cell[][] = [];

	for (let row = 0; row < GAME_CONFIG.FIELD_SIZE; row++) {
		field[row] = [];
		for (let col = 0; col < GAME_CONFIG.FIELD_SIZE; col++) {
			field[row][col] = createCell(row, col, 'coin');
		}
	}

	field[0][0] = createCell(0, 0, 'emerald');
	field[0][1] = createCell(0, 1, 'emerald');
	field[0][2] = createCell(0, 2, 'emerald');
	field[0][3] = createCell(0, 3, 'emerald');
	field[0][4] = createCell(0, 4, 'sapphire');

	field[1][0] = createCell(1, 0, 'gold');
	field[1][1] = createCell(1, 1, 'sapphire');
	field[1][2] = createCell(1, 2, 'gold');
	field[1][3] = createCell(1, 3, 'coin');
	field[1][4] = createCell(1, 4, 'emerald');

	field[2][0] = createCell(2, 0, 'emerald');
	field[2][1] = createCell(2, 1, 'gold');
	field[2][2] = createCell(2, 2, 'emerald');
	field[2][3] = createCell(2, 3, 'gold');
	field[2][4] = createCell(2, 4, 'gold');

	field[3][0] = createCell(3, 0, 'sapphire');
	field[3][1] = createCell(3, 1, 'coin');
	field[3][2] = createCell(3, 2, 'sapphire');
	field[3][3] = createCell(3, 3, 'sapphire');
	field[3][4] = createCell(3, 4, 'sapphire');

	field[4][2] = createCell(4, 2, 'gold');
	field[4][3] = createCell(4, 3, 'gold');
	field[4][4] = createCell(4, 4, 'gold');

	field[5][2] = createCell(5, 2, 'emerald');
	field[5][3] = createCell(5, 3, 'coin');
	field[5][4] = createCell(5, 4, 'emerald');

	field[6][0] = createCell(6, 0, 'gold');
	field[6][1] = createCell(6, 1, 'emerald');
	field[6][2] = createCell(6, 2, 'sapphire');
	field[6][3] = createCell(6, 3, 'sapphire');
	field[6][4] = createCell(6, 4, 'coin');

	field[7][0] = createCell(7, 0, 'sapphire');
	field[7][1] = createCell(7, 1, 'coin');
	field[7][2] = createCell(7, 2, 'coin');
	field[7][3] = createCell(7, 3, 'emerald');
	field[7][4] = createCell(7, 4, 'gold');

	for (let row = 0; row < GAME_CONFIG.FIELD_SIZE; row++) {
		for (let col = 5; col < GAME_CONFIG.FIELD_SIZE; col++) {
			const randomType = CELL_TYPES[Math.floor(Math.random() * CELL_TYPES.length)];
			field[row][col] = createCell(row, col, randomType);
		}
	}

	return field;
}

export function getDemoRecommendedMove(step: number): { from: Position; to: Position } | null {
	switch (step) {
		case 1:
			return {
				from: { row: 0, col: 4 },
				to: { row: 1, col: 4 }
			};
		case 2:
			return {
				from: { row: 3, col: 1 },
				to: { row: 3, col: 2 }
			};
		default:
			return null;
	}
}

export function initializeGameField(): Cell[][] {
	let field = generateField();
	let attempts = 0;
	const maxAttempts = 10;

	while (attempts < maxAttempts) {
		if (checkInitialMatches(field)) {
			return field;
		}

		field = generateField();
		attempts++;
	}

	return field;
}

export function removeMatches(field: Cell[][], matchPositions: Position[][]): Cell[][] {
	const newField = field.map(row => row.map(cell => ({ ...cell })));
	const toRemove = new Set<number>();

	matchPositions.forEach(match => {
		match.forEach(pos => {
			toRemove.add(pos.row * GAME_CONFIG.FIELD_SIZE + pos.col);
		});
	});

	toRemove.forEach(positionIndex => {
		const row = Math.floor(positionIndex / GAME_CONFIG.FIELD_SIZE);
		const col = positionIndex % GAME_CONFIG.FIELD_SIZE;
		if (newField[row] && newField[row][col]) {
			newField[row][col].isMatched = true;
		}
	});

	return newField;
}

export function classifyMatches(matches: Position[][]): MatchResult {
	let totalScore = 0;
	let totalBoosterCharge = 0;

	matches.forEach(match => {
		const length = Math.min(match.length, 5);
		const classification = MATCH_CLASSIFICATIONS[length] || MATCH_CLASSIFICATIONS[5];

		totalScore += classification.points;
		totalBoosterCharge += classification.boosterBonus;
	});

	return {
		matches: matches.map(match => ({
			cells: [],
			type: match.length > 3 ? 'horizontal' : 'horizontal',
			length: match.length
		})),
		score: totalScore,
		boosterCharge: totalBoosterCharge
	};
}

export function dropCells(field: Cell[][]): Cell[][] {
	const newField = field.map(row => [...row]);

	for (let col = 0; col < GAME_CONFIG.FIELD_SIZE; col++) {
		let writePos = GAME_CONFIG.FIELD_SIZE - 1;

		for (let row = GAME_CONFIG.FIELD_SIZE - 1; row >= 0; row--) {
			if (!newField[row][col].isMatched) {
				if (writePos !== row) {
					newField[writePos][col] = {
						...newField[row][col],
						position: { row: writePos, col },
						id: generateCellId(writePos, col)
					};
				}
				writePos--;
			}
		}

		while (writePos >= 0) {
			newField[writePos][col] = createCell(writePos, col, getRandomCellType());
			writePos--;
		}
	}

	return newField;
}

export function processMatches(field: Cell[][], matches: Position[][]): { field: Cell[][], result: MatchResult } {
	if (matches.length === 0) {
		return { field, result: { matches: [], score: 0, boosterCharge: 0 } };
	}

	const matchResult = classifyMatches(matches);
	const fieldWithRemovedMatches = removeMatches(field, matches);
	const droppedField = dropCells(fieldWithRemovedMatches);

	return { field: droppedField, result: matchResult };
}

export function cascadeMatches(initialField: Cell[][]): { field: Cell[][], totalResult: MatchResult } {
	let field = initialField;
	let totalScore = 0;
	let totalBoosterCharge = 0;
	let allMatches: any[] = [];

	while (true) {
		const matches = findMatches(field);
		if (matches.length === 0) break;

		const { field: newField, result } = processMatches(field, matches);
		field = newField;
		totalScore += result.score;
		totalBoosterCharge += result.boosterCharge;
		allMatches.push(...result.matches);
	}

	return {
		field,
		totalResult: {
			matches: allMatches,
			score: totalScore,
			boosterCharge: totalBoosterCharge
		}
	};
}

export function chargeBooster(matchType: MatchType): number {
	switch (matchType) {
		case 'match_4':
			return BOOSTER_CHARGE_VALUES.MATCH_4;
		case 'match_5_plus':
			return BOOSTER_CHARGE_VALUES.MATCH_5_PLUS;
		case 'l_shape':
		case 't_shape':
			return BOOSTER_CHARGE_VALUES.L_T_SHAPES;
		case 'match_3':
		default:
			return 0;
	}
}

export function determineMatchType(matchLength: number): MatchType {
	if (matchLength >= 5) {
		return 'match_5_plus';
	} else if (matchLength === 4) {
		return 'match_4';
	} else {
		return 'match_3';
	}
}

export function getExplosionPositions(targetRow: number, targetCol: number): Position[] {
	const positions: Position[] = [];
	const radius = BOOSTER_CONFIG.EXPLOSION_RADIUS;

	for (let row = targetRow - radius; row <= targetRow + radius; row++) {
		for (let col = targetCol - radius; col <= targetCol + radius; col++) {
			const position = { row, col };
			if (isValidPosition(position)) {
				positions.push(position);
			}
		}
	}

	return positions;
}

export function applyBooster(field: Cell[][], targetRow: number, targetCol: number): Cell[][] {
	if (!isValidPosition({ row: targetRow, col: targetCol })) {
		return field;
	}

	const newField = field.map(row => row.map(cell => ({ ...cell })));
	const explosionPositions = getExplosionPositions(targetRow, targetCol);

	explosionPositions.forEach(position => {
		if (newField[position.row] && newField[position.row][position.col]) {
			newField[position.row][position.col].isMatched = true;
		}
	});

	return newField;
}

export function autoShuffle(field: Cell[][]): Cell[][] {
	const shuffledField = shuffleField(field);
	let attempts = 0;
	const maxAttempts = 10;

	while (!hasPossibleMoves(shuffledField) && attempts < maxAttempts) {
		return autoShuffle(shuffledField);
	}

	return shuffledField;
}

export function handleNoMovesAvailable(field: Cell[][]): Cell[][] {
	if (!hasPossibleMoves(field)) {
		return autoShuffle(field);
	}
	return field;
}