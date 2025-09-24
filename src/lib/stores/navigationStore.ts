import { writable, derived } from 'svelte/store';

export type Screen = 'bank-home' | 'game-center' | 'game' | 'rewards-shop' | 'loading' | 'error';

export interface NavigationState {
	currentScreen: Screen;
	previousScreen: Screen | null;
	history: Screen[];
	modalOpen: boolean;
	modalContent: string | null;
	isTransitioning: boolean;
	canGoBack: boolean;
}

export interface NavigationOptions {
	replace?: boolean;
	animate?: boolean;
	clearHistory?: boolean;
}

function createNavigationStore() {
	const initialState: NavigationState = {
		currentScreen: 'bank-home',
		previousScreen: null,
		history: ['bank-home'],
		modalOpen: false,
		modalContent: null,
		isTransitioning: false,
		canGoBack: false
	};

	const { subscribe, set, update } = writable<NavigationState>(initialState);

	return {
		subscribe,

		navigateTo: (screen: Screen, options: NavigationOptions = {}) => {
			update(state => {
				const { replace = false, clearHistory = false } = options;

				let newHistory = clearHistory ? [screen] : [...state.history];

				if (replace) {
					newHistory[newHistory.length - 1] = screen;
				} else {
					if (state.currentScreen !== screen) {
						newHistory.push(screen);
					}
				}

				return {
					...state,
					previousScreen: state.currentScreen,
					currentScreen: screen,
					history: newHistory,
					canGoBack: newHistory.length > 1 && !clearHistory,
					isTransitioning: false
				};
			});
		},

		goBack: () => {
			update(state => {
				if (state.history.length <= 1) {
					return state;
				}

				const newHistory = [...state.history];
				newHistory.pop();

				const previousScreen = newHistory[newHistory.length - 1];

				return {
					...state,
					previousScreen: state.currentScreen,
					currentScreen: previousScreen,
					history: newHistory,
					canGoBack: newHistory.length > 1,
					isTransitioning: false
				};
			});
		},

		openModal: (content: string) => {
			update(state => ({
				...state,
				modalOpen: true,
				modalContent: content
			}));
		},

		closeModal: () => {
			update(state => ({
				...state,
				modalOpen: false,
				modalContent: null
			}));
		},

		toggleModal: (content?: string) => {
			update(state => {
				if (state.modalOpen) {
					return {
						...state,
						modalOpen: false,
						modalContent: null
					};
				} else {
					return {
						...state,
						modalOpen: true,
						modalContent: content || null
					};
				}
			});
		},

		setTransitioning: (isTransitioning: boolean) => {
			update(state => ({
				...state,
				isTransitioning
			}));
		},

		clearHistory: () => {
			update(state => ({
				...state,
				history: [state.currentScreen],
				canGoBack: false
			}));
		},

		reset: () => {
			set(initialState);
		},

		getCurrentScreen: () => {
			let currentScreen: Screen;
			const unsubscribe = subscribe(state => {
				currentScreen = state.currentScreen;
			});
			unsubscribe();
			return currentScreen!;
		}
	};
}

export const navigationStore = createNavigationStore();

export const currentScreen = derived(
	navigationStore,
	($nav) => $nav.currentScreen
);

export const canGoBack = derived(
	navigationStore,
	($nav) => $nav.canGoBack
);

export const isModalOpen = derived(
	navigationStore,
	($nav) => $nav.modalOpen
);

export const modalContent = derived(
	navigationStore,
	($nav) => $nav.modalContent
);

export const isTransitioning = derived(
	navigationStore,
	($nav) => $nav.isTransitioning
);

export const isGameScreen = derived(
	navigationStore,
	($nav) => $nav.currentScreen === 'game'
);

export const isGameCenterScreen = derived(
	navigationStore,
	($nav) => $nav.currentScreen === 'game-center'
);

export const isRewardsShopScreen = derived(
	navigationStore,
	($nav) => $nav.currentScreen === 'rewards-shop'
);

export const navigationHistory = derived(
	navigationStore,
	($nav) => $nav.history
);

export function navigateToGame() {
	navigationStore.navigateTo('game');
}

export function navigateToGameCenter() {
	navigationStore.navigateTo('game-center', { clearHistory: true });
}

export function navigateToBankHome() {
	navigationStore.navigateTo('bank-home', { clearHistory: true });
}

export function navigateToLoading() {
	navigationStore.navigateTo('loading');
}

export function navigateToError() {
	navigationStore.navigateTo('error');
}

export function goBack() {
	navigationStore.goBack();
}

export function navigateToRewardsShop() {
	navigationStore.navigateTo('rewards-shop', { clearHistory: true });
}