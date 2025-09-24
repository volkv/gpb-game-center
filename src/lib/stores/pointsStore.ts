import { writable, derived } from 'svelte/store';
import type { PointsState, PurchaseTransaction, PointsHistory } from '$lib/types/Points';

function createPointsStore() {
	const initialState: PointsState = {
		totalPoints: 15420,
		earnedToday: 150,
		earnedThisMonth: 2340,
		totalEarned: 18760,
		totalSpent: 3340
	};

	const { subscribe, set, update } = writable<PointsState>(initialState);

	const transactions = writable<PurchaseTransaction[]>([]);
	const history = writable<PointsHistory[]>([]);

	return {
		subscribe,
		transactions: {
			subscribe: transactions.subscribe
		},
		history: {
			subscribe: history.subscribe
		},

		addPoints: (amount: number, description: string, gameId?: string) => {
			const transaction: PointsHistory = {
				id: `earn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
				type: 'earned',
				amount,
				description,
				date: new Date(),
				gameId
			};

			update(state => ({
				...state,
				totalPoints: state.totalPoints + amount,
				earnedToday: state.earnedToday + amount,
				earnedThisMonth: state.earnedThisMonth + amount,
				totalEarned: state.totalEarned + amount
			}));

			history.update(hist => [transaction, ...hist]);
		},

		spendPoints: (amount: number, rewardId: string, rewardTitle: string): boolean => {
			let currentPoints: number;
			const unsubscribe = subscribe(state => {
				currentPoints = state.totalPoints;
			});
			unsubscribe();

			if (currentPoints! < amount) {
				return false;
			}

			const transaction: PurchaseTransaction = {
				id: `purchase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
				rewardId,
				rewardTitle,
				pointsSpent: amount,
				purchaseDate: new Date(),
				status: 'completed'
			};

			const historyTransaction: PointsHistory = {
				id: `spend_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
				type: 'spent',
				amount,
				description: `Покупка: ${rewardTitle}`,
				date: new Date(),
				rewardId
			};

			update(state => ({
				...state,
				totalPoints: state.totalPoints - amount,
				totalSpent: state.totalSpent + amount
			}));

			transactions.update(trans => [transaction, ...trans]);
			history.update(hist => [historyTransaction, ...hist]);

			return true;
		},

		canAfford: (amount: number): boolean => {
			let currentPoints: number;
			const unsubscribe = subscribe(state => {
				currentPoints = state.totalPoints;
			});
			unsubscribe();
			return currentPoints! >= amount;
		},

		reset: () => {
			set(initialState);
			transactions.set([]);
			history.set([]);
		}
	};
}

export const pointsStore = createPointsStore();

export const totalPoints = derived(pointsStore, ($points) => $points.totalPoints);
export const earnedToday = derived(pointsStore, ($points) => $points.earnedToday);
export const earnedThisMonth = derived(pointsStore, ($points) => $points.earnedThisMonth);
export const totalEarned = derived(pointsStore, ($points) => $points.totalEarned);
export const totalSpent = derived(pointsStore, ($points) => $points.totalSpent);