import { writable, derived } from 'svelte/store';
import { gameStore } from '$lib/stores/gameStore';
import { pointsStore } from '$lib/stores/pointsStore';
import type { GameState } from '$lib/types/GameState';
import type {
	AssetGuardianGameState,
	Position,
	LevelConfig,
	GameSession,
	GyroscopeData,
	CollisionResult,
	VisualEffects,
	BankingProduct
} from './types';
import {
	GAME_CONFIG,
	BALL_CONFIG,
	PHYSICS_CONFIG,
	SCORE_VALUES,
	GYROSCOPE_CONFIG,
	BANKING_PRODUCTS
} from './constants';
import type { GyroscopeManager, FallbackInputManager } from './gyroscope';

function createAssetGuardianStore() {
	const createInitialSession = (): GameSession => ({
		sessionId: crypto.randomUUID(),
		startTime: Date.now(),
		level: 1,
		finalScore: 0,
		bonusesCollected: 0,
		trapsHit: 0,
		isCompleted: false
	});

	const createInitialBall = () => ({
		position: { x: GAME_CONFIG.WORLD_WIDTH / 2, y: GAME_CONFIG.WORLD_HEIGHT / 2 },
		velocity: { x: 0, y: 0 },
		radius: BALL_CONFIG.RADIUS,
		mass: BALL_CONFIG.MASS,
		isMoving: false,
		energy: BALL_CONFIG.INITIAL_ENERGY
	});

	const createInitialVisualEffects = (): VisualEffects => ({
		perspective: { x: 0, y: 0, intensity: 0 },
		shadow: { offsetX: 0, offsetY: 0, scaleY: 1, opacity: 0.3 },
		ballHighlight: { offsetX: 0, offsetY: 0, intensity: 0.7 }
	});

	const initialState: AssetGuardianGameState = {
		status: 'loading',
		currentLevel: null,
		ball: createInitialBall(),
		gravity: { x: 0, y: 0, intensity: PHYSICS_CONFIG.GRAVITY_STRENGTH },
		progress: {
			currentLevel: 1,
			score: 0,
			lives: GAME_CONFIG.INITIAL_LIVES,
			timeRemaining: GAME_CONFIG.LEVEL_TIME_LIMIT,
			bonusesCollected: 0,
			trapsHit: 0,
			perfectLevels: 0
		},
		visualEffects: createInitialVisualEffects(),
		gyroscope: {
			isSupported: false,
			isActive: false,
			calibration: null,
			currentData: null
		},
		physics: {
			worldBounds: {
				width: GAME_CONFIG.WORLD_WIDTH,
				height: GAME_CONFIG.WORLD_HEIGHT
			},
			friction: BALL_CONFIG.FRICTION_COEFFICIENT,
			restitution: BALL_CONFIG.RESTITUTION,
			airResistance: PHYSICS_CONFIG.AIR_RESISTANCE
		},
		ui: {
			showInstructions: false,
			showPauseMenu: false,
			showLevelComplete: false,
			showGameOver: false
		},
		session: createInitialSession()
	};

	const { subscribe, set, update } = writable<AssetGuardianGameState>(initialState);

	function syncWithMainStore(assetGuardianState: AssetGuardianGameState) {
		gameStore.updateGameState((gameState: GameState) => ({
			...gameState,
			score: {
				...gameState.score,
				current: assetGuardianState.progress.score
			},
			gameData: {
				...gameState.gameData,
				assetGuardian: assetGuardianState
			}
		}));
	}

	return {
		subscribe,

		initialize: (level: LevelConfig) => {
			const newState: AssetGuardianGameState = {
				...initialState,
				status: 'ready',
				currentLevel: level,
				ball: createInitialBall(),
				progress: {
					...initialState.progress,
					currentLevel: level.id,
					timeRemaining: level.timeLimit
				},
				session: createInitialSession()
			};
			set(newState);
			syncWithMainStore(newState);
		},

		startGame: () => {
			update(state => {
				const newState = {
					...state,
					status: 'playing' as const,
					session: {
						...state.session,
						startTime: Date.now()
					}
				};
				syncWithMainStore(newState);
				return newState;
			});
		},

		pauseGame: () => {
			update(state => {
				const newState = {
					...state,
					status: 'paused' as const,
					ui: {
						...state.ui,
						showPauseMenu: true
					}
				};
				syncWithMainStore(newState);
				return newState;
			});
		},

		resumeGame: () => {
			update(state => {
				const newState = {
					...state,
					status: 'playing' as const,
					ui: {
						...state.ui,
						showPauseMenu: false
					}
				};
				syncWithMainStore(newState);
				return newState;
			});
		},

		updateBallPosition: (position: Position, velocity: Position) => {
			update(state => {
				const newState = {
					...state,
					ball: {
						...state.ball,
						position,
						velocity,
						isMoving: Math.abs(velocity.x) > 0.1 || Math.abs(velocity.y) > 0.1
					}
				};
				syncWithMainStore(newState);
				return newState;
			});
		},

		updateGravity: (gravity: { x: number; y: number }) => {
			update(state => {
				const newState = {
					...state,
					gravity: {
						...state.gravity,
						x: gravity.x,
						y: gravity.y
					}
				};
				syncWithMainStore(newState);
				return newState;
			});
		},

		updateGyroscope: (data: GyroscopeData) => {
			update(state => {
				const newState = {
					...state,
					gyroscope: {
						...state.gyroscope,
						currentData: data,
						isActive: true
					}
				};
				syncWithMainStore(newState);
				return newState;
			});
		},

		calibrateGyroscope: (calibrationData: GyroscopeData) => {
			update(state => {
				const newState = {
					...state,
					gyroscope: {
						...state.gyroscope,
						calibration: calibrationData,
						isSupported: true
					}
				};
				syncWithMainStore(newState);
				return newState;
			});
		},

		handleCollision: (result: CollisionResult) => {
			update(state => {
				let scoreChange = 0;
				let livesChange = 0;
				let timeChange = 0;
				let bonusesCollected = state.progress.bonusesCollected;
				let trapsHit = state.progress.trapsHit;

				switch (result.type) {
					case 'bonus':
						scoreChange = result.value;
						bonusesCollected++;
						break;
					case 'trap':
						scoreChange = SCORE_VALUES.TRAP_PENALTY;
						livesChange = -1;
						trapsHit++;
						break;
					case 'finish':
						scoreChange = SCORE_VALUES.LEVEL_COMPLETE;
						break;
				}

				const newScore = Math.max(0, state.progress.score + scoreChange);
				const newLives = Math.max(0, state.progress.lives + livesChange);

				if (scoreChange > 0) {
					pointsStore.addPoints(
						scoreChange,
						`Хранитель Активов: ${result.type === 'bonus' ? 'Бонус' : 'Завершение уровня'}`,
						'asset-guardian'
					);
				}

				const newState = {
					...state,
					progress: {
						...state.progress,
						score: newScore,
						lives: newLives,
						bonusesCollected,
						trapsHit
					}
				};

				if (result.type === 'finish') {
					newState.status = 'completed';
					newState.ui.showLevelComplete = true;
				} else if (newLives <= 0) {
					newState.status = 'failed';
					newState.ui.showGameOver = true;
				}

				syncWithMainStore(newState);
				return newState;
			});
		},

		updateVisualEffects: (effects: Partial<VisualEffects>) => {
			update(state => {
				const newState = {
					...state,
					visualEffects: {
						...state.visualEffects,
						...effects
					}
				};
				syncWithMainStore(newState);
				return newState;
			});
		},

		updateTimeRemaining: (time: number) => {
			update(state => {
				const newState = {
					...state,
					progress: {
						...state.progress,
						timeRemaining: Math.max(0, time)
					}
				};

				if (newState.progress.timeRemaining <= 0 && state.status === 'playing') {
					newState.status = 'failed';
					newState.ui.showGameOver = true;
				}

				syncWithMainStore(newState);
				return newState;
			});
		},

		applyBankingProduct: (product: BankingProduct) => {
			update(state => {
				const newState = {
					...state,
					ui: {
						...state.ui,
						selectedBankingProduct: product.id
					}
				};

				switch (product.gameBonus.type) {
					case 'shield':
						break;
					case 'multiplier':
						break;
					case 'extra_life':
						newState.progress.lives += product.gameBonus.value;
						break;
					case 'slow_time':
						break;
				}

				pointsStore.addPoints(
					SCORE_VALUES.BANKING_LESSON_BONUS,
					`Хранитель Активов: Изучен продукт "${product.name}"`,
					'asset-guardian'
				);

				syncWithMainStore(newState);
				return newState;
			});
		},

		nextLevel: (level: LevelConfig) => {
			update(state => {
				const timeBonus = state.progress.timeRemaining * SCORE_VALUES.TIME_BONUS_PER_SECOND;
				const perfectLevel = state.progress.trapsHit === 0;
				const perfectBonus = perfectLevel ? SCORE_VALUES.PERFECT_LEVEL : 0;

				if (timeBonus > 0) {
					pointsStore.addPoints(timeBonus, 'Хранитель Активов: Бонус за время', 'asset-guardian');
				}
				if (perfectBonus > 0) {
					pointsStore.addPoints(perfectBonus, 'Хранитель Активов: Идеальное прохождение!', 'asset-guardian');
				}

				const newState = {
					...state,
					status: 'ready' as const,
					currentLevel: level,
					ball: createInitialBall(),
					progress: {
						...state.progress,
						currentLevel: level.id,
						score: state.progress.score + timeBonus + perfectBonus,
						timeRemaining: level.timeLimit,
						perfectLevels: state.progress.perfectLevels + (perfectLevel ? 1 : 0),
						bonusesCollected: 0,
						trapsHit: 0
					},
					ui: {
						...state.ui,
						showLevelComplete: false
					},
					visualEffects: createInitialVisualEffects()
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
					finalScore: state.progress.score,
					bonusesCollected: state.progress.bonusesCollected,
					trapsHit: state.progress.trapsHit,
					isCompleted: state.status === 'completed'
				};

				gameStore.updateGameState((gameState: GameState) => ({
					...gameState,
					gameData: {
						...gameState.gameData,
						assetGuardianSessions: [
							...(gameState.gameData?.assetGuardianSessions || []),
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

		setupGyroscopeManager: (gyroManager: GyroscopeManager) => {
			update(state => {
				const newState = {
					...state,
					gyroscope: {
						...state.gyroscope,
						isSupported: gyroManager.isSupported
					}
				};
				syncWithMainStore(newState);
				return newState;
			});
		},

		setupFallbackInput: (element: HTMLElement, fallbackManager: FallbackInputManager) => {
			update(state => {
				fallbackManager.start(element);
				const newState = {
					...state,
					gyroscope: {
						...state.gyroscope,
						isSupported: false
					}
				};
				syncWithMainStore(newState);
				return newState;
			});
		},

		updateGravityFromGyroscope: (gravity: { x: number; y: number }) => {
			update(state => {
				const smoothingFactor = GYROSCOPE_CONFIG.SMOOTHING_FACTOR;
				const smoothedGravity = {
					x: state.gravity.x * smoothingFactor + gravity.x * (1 - smoothingFactor),
					y: state.gravity.y * smoothingFactor + gravity.y * (1 - smoothingFactor)
				};

				const newState = {
					...state,
					gravity: {
						...state.gravity,
						x: smoothedGravity.x,
						y: smoothedGravity.y
					}
				};
				syncWithMainStore(newState);
				return newState;
			});
		},

		enableGyroscope: () => {
			update(state => {
				const newState = {
					...state,
					gyroscope: {
						...state.gyroscope,
						isActive: true
					}
				};
				syncWithMainStore(newState);
				return newState;
			});
		},

		disableGyroscope: () => {
			update(state => {
				const newState = {
					...state,
					gyroscope: {
						...state.gyroscope,
						isActive: false,
						currentData: null
					},
					gravity: {
						...state.gravity,
						x: 0,
						y: 0
					}
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

export const assetGuardianStore = createAssetGuardianStore();

export const assetGuardianSelectors = derived(
	assetGuardianStore,
	($assetGuardian) => ({
		isLoading: $assetGuardian.status === 'loading',
		isReady: $assetGuardian.status === 'ready',
		isPlaying: $assetGuardian.status === 'playing',
		isPaused: $assetGuardian.status === 'paused',
		isCompleted: $assetGuardian.status === 'completed',
		isFailed: $assetGuardian.status === 'failed',

		currentScore: $assetGuardian.progress.score,
		currentLevel: $assetGuardian.progress.currentLevel,
		livesRemaining: $assetGuardian.progress.lives,
		timeRemaining: $assetGuardian.progress.timeRemaining,

		ballPosition: $assetGuardian.ball.position,
		ballVelocity: $assetGuardian.ball.velocity,
		isBallMoving: $assetGuardian.ball.isMoving,

		gyroscopeSupported: $assetGuardian.gyroscope.isSupported,
		gyroscopeActive: $assetGuardian.gyroscope.isActive,
		currentGravity: $assetGuardian.gravity,

		showInstructions: $assetGuardian.ui.showInstructions,
		showPauseMenu: $assetGuardian.ui.showPauseMenu,
		showLevelComplete: $assetGuardian.ui.showLevelComplete,
		showGameOver: $assetGuardian.ui.showGameOver,

		sessionId: $assetGuardian.session.sessionId,
		sessionDuration: $assetGuardian.session.duration,
		bonusesCollected: $assetGuardian.progress.bonusesCollected,
		trapsHit: $assetGuardian.progress.trapsHit
	})
);