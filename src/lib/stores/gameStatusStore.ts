import { writable, derived } from 'svelte/store';
import { gameStore } from './gameStore';
import { telegramUserName } from './telegramStore';
import { navigationStore, canGoBack } from './navigationStore';

export interface GameStatusState {
	isVisible: boolean;
	gameName: string | null;
	playerName: string;
	currentScore: number;
	showBackButton: boolean;
	showScore: boolean;
}

function createGameStatusStore() {
	const initialState: GameStatusState = {
		isVisible: false,
		gameName: null,
		playerName: 'Клиент',
		currentScore: 0,
		showBackButton: false,
		showScore: false
	};

	const { subscribe, set, update } = writable<GameStatusState>(initialState);

	return {
		subscribe,

		show: (options: {
			gameName: string;
			showScore?: boolean;
			showBackButton?: boolean;
		}) => {
			update(state => ({
				...state,
				isVisible: true,
				gameName: options.gameName,
				showScore: options.showScore ?? true,
				showBackButton: options.showBackButton ?? true
			}));
		},

		hide: () => {
			update(state => ({
				...state,
				isVisible: false,
				gameName: null,
				currentScore: 0
			}));
		},

		updateScore: (score: number) => {
			update(state => ({
				...state,
				currentScore: score
			}));
		},

		updatePlayerName: (name: string) => {
			update(state => ({
				...state,
				playerName: name
			}));
		},

		toggleBackButton: (show: boolean) => {
			update(state => ({
				...state,
				showBackButton: show
			}));
		},

		toggleScore: (show: boolean) => {
			update(state => ({
				...state,
				showScore: show
			}));
		},

		reset: () => {
			set(initialState);
		}
	};
}

export const gameStatusStore = createGameStatusStore();

export const gameStatusState = derived(
	[gameStatusStore, gameStore, telegramUserName, canGoBack],
	([$status, $game, $userName, $canGoBack]) => ({
		...$status,
		playerName: $userName || $status.playerName,
		currentScore: $game.gameState?.score.current ?? $status.currentScore,
		showBackButton: $canGoBack && $status.showBackButton,
		gameName: $game.currentGame?.name ?? $status.gameName
	})
);

export const isGameStatusVisible = derived(
	gameStatusStore,
	($status) => $status.isVisible
);

export const currentGameName = derived(
	gameStatusState,
	($status) => $status.gameName
);

export const currentPlayerName = derived(
	gameStatusState,
	($status) => $status.playerName
);

export const currentGameScore = derived(
	gameStatusState,
	($status) => $status.currentScore
);

export const shouldShowBackButton = derived(
	gameStatusState,
	($status) => $status.showBackButton
);

export const shouldShowScore = derived(
	gameStatusState,
	($status) => $status.showScore
);