import { writable, derived } from 'svelte/store';
import { gameStore } from '$lib/stores/gameStore';
import { pointsStore } from '$lib/stores/pointsStore';
import type { GameState } from '$lib/types/GameState';
import type { Match3GameState, Position, Cell, BoosterState, GameSession, GameStatus } from './types';
import { GAME_CONFIG, SCORE_VALUES, ANIMATION_DURATIONS } from './constants';
import {
	isValidSwap,
	performSwap,
	findMatches,
	clearCellSelection,
	highlightCell,
	cascadeMatches,
	applyBooster,
	dropCells,
	generateDemoField,
	getDemoRecommendedMove,
	shouldAllowAction,
	handleNoMovesAvailable,
	markCellsAsSwapping,
	clearSwappingFlags
} from './gameLogic';

function createMatch3Store() {
	const createInitialSession = (): GameSession => ({
		startTime: Date.now(),
		totalMoves: 0,
		finalScore: 0,
		isCompleted: false,
		bestCombo: 0,
		boosterUsed: false
	});

	const initialState: Match3GameState = {
		field: [],
		selectedCell: null,
		score: 0,
		moves: GAME_CONFIG.INITIAL_MOVES,
		status: 'playing',
		booster: {
			charge: 0,
			isActive: false,
			isReady: false
		},
		targetScore: GAME_CONFIG.TARGET_SCORE,
		isAnimating: false,
		scoreBoost: {
			amount: 0,
			visible: false
		},
		demo: {
			isActive: false,
			currentStep: 0,
			currentHint: '',
			recommendedMove: null,
			showingHint: false
		},
		session: createInitialSession()
	};

	const { subscribe, set, update } = writable<Match3GameState>(initialState);

	function syncWithMainStore(match3State: Match3GameState) {
		gameStore.updateGameState((gameState: GameState) => ({
			...gameState,
			score: {
				...gameState.score,
				current: match3State.score
			},
			gameData: {
				...gameState.gameData,
				match3: match3State
			}
		}));
	}

	return {
		subscribe,

		initialize: (field: Cell[][]) => {
			const newState: Match3GameState = {
				...initialState,
				field,
				session: createInitialSession()
			};
			set(newState);
			syncWithMainStore(newState);
		},

		updateField: (field: Cell[][]) => {
			update(state => {
				if (state.field === field) return state;
				const newState = { ...state, field };
				syncWithMainStore(newState);
				return newState;
			});
		},

		selectCell: (position: Position | null) => {
			update(state => {
				const newState = { ...state, selectedCell: position };
				syncWithMainStore(newState);
				return newState;
			});
		},

		updateScore: (points: number) => {
			update(state => {
				const newState = { ...state, score: state.score + points };

				if (points >= 200) {
					newState.scoreBoost = {
						amount: points,
						visible: true
					};
				}

				if (points > 0) {
					pointsStore.addPoints(points, `Золотой Запас: ${points} очков`, 'match3-golden-reserve');
				}

				syncWithMainStore(newState);
				return newState;
			});
		},

		showScoreBoost: (amount: number) => {
			update(state => {
				const newState = {
					...state,
					scoreBoost: {
						amount,
						visible: true
					}
				};
				syncWithMainStore(newState);
				return newState;
			});
		},

		hideScoreBoost: () => {
			update(state => {
				const newState = {
					...state,
					scoreBoost: {
						amount: 0,
						visible: false
					}
				};
				syncWithMainStore(newState);
				return newState;
			});
		},

		decrementMoves: () => {
			update(state => {
				const newState = { ...state, moves: state.moves - 1 };

				if (newState.moves <= 0) {
					newState.status = 'completed';
				}

				syncWithMainStore(newState);
				return newState;
			});
		},

		updateBooster: (charge: number) => {
			update(state => {
				const newCharge = Math.min(GAME_CONFIG.BOOSTER_MAX_CHARGE, state.booster.charge + charge);
				const isReady = newCharge >= GAME_CONFIG.BOOSTER_MAX_CHARGE;

				const newState = {
					...state,
					booster: {
						...state.booster,
						charge: newCharge,
						isReady
					}
				};

				syncWithMainStore(newState);
				return newState;
			});
		},

		activateBooster: () => {
			update(state => {
				if (!state.booster.isReady) return state;

				const newState = {
					...state,
					status: 'targeting' as const,
					booster: {
						...state.booster,
						isActive: true
					}
				};

				syncWithMainStore(newState);
				return newState;
			});
		},

		useBooster: () => {
			update(state => {
				const newState: Match3GameState = {
					...state,
					status: 'playing',
					booster: {
						charge: 0,
						isActive: false,
						isReady: false
					}
				};

				syncWithMainStore(newState);
				return newState;
			});
		},

		setAnimating: (isAnimating: boolean) => {
			update(state => {
				const newState = { ...state, isAnimating };
				syncWithMainStore(newState);
				return newState;
			});
		},

		checkWinCondition: () => {
			update(state => {
				if (state.score >= state.targetScore) {
					const bonusPoints = Math.max(0, state.score - state.targetScore) + 500;
					if (bonusPoints > 0) {
						pointsStore.addPoints(bonusPoints, 'Золотой Запас: Бонус за победу!', 'match3-golden-reserve');
					}

				const newState: Match3GameState = {
					...state,
					status: 'completed',
					session: {
						...state.session,
						isCompleted: true
					}
				};
					syncWithMainStore(newState);
					setTimeout(() => match3Store.finishSession(), 100);
					return newState;
				}
				return state;
			});
		},

		attemptSwap: (from: Position, to: Position) => {
			update(state => {
				if (state.isAnimating || state.status !== 'playing' || !shouldAllowAction()) {
					return state;
				}

				if (!isValidSwap(state.field, from, to)) {
					const newField = clearCellSelection(state.field);
					const newState = {
						...state,
						field: newField,
						selectedCell: null
					};
					syncWithMainStore(newState);
					return newState;
				}

				const fieldWithSwappingMarks = markCellsAsSwapping(state.field, from, to);
				const clearedSelectionField = clearCellSelection(fieldWithSwappingMarks);

				const intermediateState = {
					...state,
					field: clearedSelectionField,
					isAnimating: true,
					selectedCell: null
				};
				syncWithMainStore(intermediateState);

				setTimeout(() => {
					update(currentState => {
						const swappedField = performSwap(currentState.field, from, to);
						const fieldWithoutSwappingFlags = clearSwappingFlags(swappedField);

						const { field: finalField, totalResult } = cascadeMatches(fieldWithoutSwappingFlags);

						if (totalResult.score > 0) {
							pointsStore.addPoints(totalResult.score, `Золотой Запас: Комбинация (${totalResult.score} очков)`, 'match3-golden-reserve');
						}

						const checkedField = handleNoMovesAvailable(finalField);

						const newState = {
							...currentState,
							field: checkedField,
							selectedCell: null,
							score: currentState.score + totalResult.score,
							moves: currentState.moves - 1,
							booster: {
								...currentState.booster,
								charge: Math.min(GAME_CONFIG.BOOSTER_MAX_CHARGE, currentState.booster.charge + totalResult.boosterCharge),
								isReady: (currentState.booster.charge + totalResult.boosterCharge) >= GAME_CONFIG.BOOSTER_MAX_CHARGE
							},
							isAnimating: false,
							scoreBoost: totalResult.score >= 200 ? {
								amount: totalResult.score,
								visible: true
							} : currentState.scoreBoost
						};

						if (!newState.demo.isActive) {
							if (newState.moves <= 0 && newState.score < newState.targetScore) {
								newState.status = 'completed';
							} else if (newState.score >= newState.targetScore) {
								newState.status = 'completed';
							}
						}

						if (newState.demo.isActive && totalResult.score > 0) {
							if (newState.demo.currentStep === 1 && newState.booster.charge >= 30) {
								setTimeout(() => match3Store.nextDemoStep(), 1000);
							} else if (newState.demo.currentStep === 2 && newState.booster.isReady) {
								setTimeout(() => match3Store.nextDemoStep(), 1000);
							}
						}

						syncWithMainStore(newState);
						return newState;
					});
				}, ANIMATION_DURATIONS.CELL_SWAP);

				return intermediateState;
			});
		},

		highlightSelectedCell: () => {
			update(state => {
				if (!state.selectedCell) {
					return state;
				}

				const newField = highlightCell(state.field, state.selectedCell);
				const newState = { ...state, field: newField };
				syncWithMainStore(newState);
				return newState;
			});
		},

		clearSelection: () => {
			update(state => {
				const newField = clearCellSelection(state.field);
				const newState = {
					...state,
					field: newField,
					selectedCell: null
				};
				syncWithMainStore(newState);
				return newState;
			});
		},

		applyBooster: (targetPosition: Position) => {
			update(state => {
				if (state.status !== 'targeting' || !state.booster.isActive) {
					return state;
				}

				const explodedField = applyBooster(state.field, targetPosition.row, targetPosition.col);
				const droppedField = dropCells(explodedField);
				const { field: finalField, totalResult } = cascadeMatches(droppedField);

				const boosterScore = SCORE_VALUES.BOOSTER_USE;
				const totalScore = boosterScore + totalResult.score;
				const calculatedScore = state.score + totalScore;

				let finalScore = calculatedScore;
				let finalStatus: GameStatus = 'playing';
				let finalDemo = state.demo;

				if (!state.demo.isActive) {
					if (calculatedScore >= state.targetScore) {
						finalStatus = 'completed';
					}
				} else {
					finalDemo = {
						...state.demo,
						isActive: false,
						showingHint: false
					};
					finalStatus = 'completed';
					if (calculatedScore < state.targetScore) {
						finalScore = state.targetScore;
					}
				}

				const newState: Match3GameState = {
					...state,
					field: finalField,
					selectedCell: null,
					status: finalStatus,
					score: finalScore,
					booster: {
						charge: 0,
						isActive: false,
						isReady: false
					},
					isAnimating: false,
					scoreBoost: totalScore >= 200 ? {
						amount: totalScore,
						visible: true
					} : state.scoreBoost,
					demo: finalDemo
				};

				syncWithMainStore(newState);
				return newState;
			});
		},

		enableDemoMode: () => {
			update(state => {
				const demoField = generateDemoField();
				const recommendedMove = getDemoRecommendedMove(1);

				const newState = {
					...initialState,
					field: demoField,
					demo: {
						isActive: true,
						currentStep: 1,
						currentHint: 'Найдите и соедините 4 изумруда в ряд! Это даст вам много очков и зарядит бустер.',
						recommendedMove,
						showingHint: true
					}
				};

				if (recommendedMove) {
					const highlightedField = newState.field.map((row, rowIndex) =>
						row.map((cell, colIndex) => ({
							...cell,
							isRecommended:
								(rowIndex === recommendedMove.from.row && colIndex === recommendedMove.from.col) ||
								(rowIndex === recommendedMove.to.row && colIndex === recommendedMove.to.col)
						}))
					);
					newState.field = highlightedField;
				}

				syncWithMainStore(newState);
				return newState;
			});
		},

		nextDemoStep: () => {
			update(state => {
				if (!state.demo.isActive) return state;

				const nextStep = state.demo.currentStep + 1;
				let newHint = '';
				let recommendedMove: { from: Position; to: Position } | null = null;

				switch (nextStep) {
					case 2:
						newHint = 'Отлично! Теперь создайте еще одну большую комбинацию из 4+ элементов для полной зарядки бустера!';
						recommendedMove = null;
						break;
					case 3:
						newHint = 'Великолепно! Бустер заряжен! Нажмите на кнопку "Газпромбанк Бонус" и выберите цель для взрыва.';
						recommendedMove = null;
						break;
					default:
						newHint = '';
						recommendedMove = null;
				}

				const newState = {
					...state,
					demo: {
						...state.demo,
						currentStep: nextStep,
						currentHint: newHint,
						recommendedMove,
						showingHint: newHint !== ''
					}
				};

				let newField = state.field.map(row =>
					row.map(cell => ({ ...cell, isRecommended: false }))
				);

				if (recommendedMove) {
					newField = newField.map((row, rowIndex) =>
						row.map((cell, colIndex) => ({
							...cell,
							isRecommended:
								recommendedMove && typeof recommendedMove === 'object' && 'from' in recommendedMove && 'to' in recommendedMove
									? (rowIndex === (recommendedMove as any).from.row && colIndex === (recommendedMove as any).from.col) ||
									  (rowIndex === (recommendedMove as any).to.row && colIndex === (recommendedMove as any).to.col)
									: false
						}))
					);
				}

				newState.field = newField;
				syncWithMainStore(newState);
				return newState;
			});
		},

		hideDemoHint: () => {
			update(state => {
				const newState = {
					...state,
					demo: {
						...state.demo,
						showingHint: false
					}
				};
				syncWithMainStore(newState);
				return newState;
			});
		},

		finishSession: () => {
			update(state => {
				const sessionDuration = Date.now() - state.session.startTime;
				const completedSession: GameSession = {
					...state.session,
					endTime: Date.now(),
					duration: sessionDuration,
					finalScore: state.score,
					isCompleted: state.score >= state.targetScore,
					totalMoves: GAME_CONFIG.INITIAL_MOVES - state.moves
				};

				gameStore.updateGameState((gameState: GameState) => ({
					...gameState,
					gameData: {
						...gameState.gameData,
						match3Sessions: [
							...(gameState.gameData?.match3Sessions || []),
							completedSession
						]
					}
				}));

				const newState = {
					...state,
					session: completedSession
				};

				syncWithMainStore(newState);
				return newState;
			});
		},

		reset: () => {
			const newState = { ...initialState, session: createInitialSession() };
			set(newState);
			syncWithMainStore(newState);
		}
	};
}

export const match3Store = createMatch3Store();

export const match3Selectors = derived(
	match3Store,
	($match3) => ({
		isGameActive: $match3.status === 'playing',
		isTargeting: $match3.status === 'targeting',
		isCompleted: $match3.status === 'completed',
		canUseBooster: $match3.booster.isReady && !$match3.isAnimating,
		progress: Math.min(100, ($match3.score / $match3.targetScore) * 100),
		boosterProgress: ($match3.booster.charge / GAME_CONFIG.BOOSTER_MAX_CHARGE) * 100,
		remainingMoves: $match3.moves,
		currentScore: $match3.score,
		isDemoActive: $match3.demo.isActive,
		currentDemoStep: $match3.demo.currentStep,
		demoHint: $match3.demo.currentHint,
		showingDemoHint: $match3.demo.showingHint,
		recommendedMove: $match3.demo.recommendedMove
	})
);

const stateValidationCache = new WeakMap<Match3GameState, boolean>();

export const validateGameState = (state: Match3GameState): boolean => {
	if (stateValidationCache.has(state)) {
		return stateValidationCache.get(state)!;
	}

	const isValid = (
		Array.isArray(state.field) &&
		state.field.length === GAME_CONFIG.FIELD_SIZE &&
		state.field.every(row => Array.isArray(row) && row.length === GAME_CONFIG.FIELD_SIZE) &&
		state.score >= 0 &&
		state.moves >= 0 &&
		state.booster.charge >= 0 &&
		state.booster.charge <= GAME_CONFIG.BOOSTER_MAX_CHARGE
	);

	stateValidationCache.set(state, isValid);
	return isValid;
};