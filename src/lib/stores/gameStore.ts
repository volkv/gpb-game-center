import { writable, derived } from 'svelte/store';
import type { Game, GameStatus } from '$lib/types/Game';
import type { GameState, GameSessionStatus, LoadingState } from '$lib/types/GameState';

export interface GameCenterState {
	games: Game[];
	currentGame: Game | null;
	gameState: GameState | null;
	loadingState: LoadingState;
	error: string | null;
}

function createGameStore() {
	const initialState: GameCenterState = {
		games: [],
		currentGame: null,
		gameState: null,
		loadingState: 'idle',
		error: null
	};

	const { subscribe, set, update } = writable<GameCenterState>(initialState);

	return {
		subscribe,

		setGames: (games: Game[]) => {
			update(state => ({
				...state,
				games,
				error: null
			}));
		},

		loadGame: async (gameId: string) => {
			update(state => ({
				...state,
				loadingState: 'loading',
				error: null
			}));

			try {
				const game = await getGameById(gameId);
				if (!game) {
					throw new Error(`Game with id ${gameId} not found`);
				}

				update(state => ({
					...state,
					currentGame: game,
					loadingState: 'loaded',
					gameState: createInitialGameState(gameId)
				}));
			} catch (error) {
				update(state => ({
					...state,
					loadingState: 'error',
					error: error instanceof Error ? error.message : 'Unknown error'
				}));
			}
		},

		startGame: (gameId: string) => {
			update(state => {
				if (!state.gameState || state.gameState.gameId !== gameId) {
					return state;
				}

				const updatedGameState: GameState = {
					...state.gameState,
					status: 'playing',
					time: {
						...state.gameState.time,
						startTime: new Date(),
						elapsed: 0
					}
				};

				return {
					...state,
					gameState: updatedGameState
				};
			});
		},

		updateGameState: (updater: (state: GameState) => GameState) => {
			update(state => {
				if (!state.gameState) return state;

				return {
					...state,
					gameState: updater(state.gameState)
				};
			});
		},

		completeGame: (results: GameState['results']) => {
			update(state => {
				if (!state.gameState) return state;

				const updatedGameState: GameState = {
					...state.gameState,
					status: 'completed',
					results,
					time: {
						...state.gameState.time,
						endTime: new Date()
					}
				};

				return {
					...state,
					gameState: updatedGameState
				};
			});
		},

		pauseGame: () => {
			update(state => {
				if (!state.gameState || state.gameState.status !== 'playing') {
					return state;
				}

				return {
					...state,
					gameState: {
						...state.gameState,
						status: 'paused'
					}
				};
			});
		},

		resumeGame: () => {
			update(state => {
				if (!state.gameState || state.gameState.status !== 'paused') {
					return state;
				}

				return {
					...state,
					gameState: {
						...state.gameState,
						status: 'playing'
					}
				};
			});
		},

		exitGame: () => {
			update(state => ({
				...state,
				currentGame: null,
				gameState: null,
				loadingState: 'idle'
			}));
		},

		clearError: () => {
			update(state => ({
				...state,
				error: null
			}));
		},

		reset: () => {
			set(initialState);
		}
	};
}

async function getGameById(gameId: string): Promise<Game | null> {
	const store = get(gameStore);
	return store.games.find(game => game.id === gameId) || null;
}

function createInitialGameState(gameId: string): GameState {
	return {
		status: 'idle',
		loadingState: 'idle',
		score: {
			current: 0,
			best: 0
		},
		progress: {
			currentLevel: 1,
			percentage: 0
		},
		time: {
			elapsed: 0
		},
		hints: 3,
		sessionId: generateSessionId(),
		gameId,
		gameData: {}
	};
}

function generateSessionId(): string {
	return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export const gameStore = createGameStore();

export const activeGames = derived(
	gameStore,
	($gameStore) => $gameStore.games.filter(game => game.status === 'active')
);

export const comingSoonGames = derived(
	gameStore,
	($gameStore) => $gameStore.games.filter(game => game.status === 'coming_soon')
);

export const currentGameState = derived(
	gameStore,
	($gameStore) => $gameStore.gameState
);

export const isGameLoading = derived(
	gameStore,
	($gameStore) => $gameStore.loadingState === 'loading'
);

export const isGameActive = derived(
	gameStore,
	($gameStore) => $gameStore.gameState?.status === 'playing'
);

function get<T>(store: { subscribe: (run: (value: T) => void) => () => void }): T {
	let value: T;
	store.subscribe((v) => value = v)();
	return value!;
}