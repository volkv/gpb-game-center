export interface Reward {
	id: string;
	title: string;
	description: string;
	cost: number;
	category: string;
	icon: string;
	partner: string;
	isAvailable: boolean;
	validUntil?: Date;
	terms?: string;
	gradient?: string;
	themeColor?: string;
}

export interface RewardCategory {
	id: string;
	name: string;
	icon: string;
	rewards: Reward[];
}

export interface PointsState {
	totalPoints: number;
	earnedToday: number;
	earnedThisMonth: number;
	totalEarned: number;
	totalSpent: number;
}

export interface PurchaseTransaction {
	id: string;
	rewardId: string;
	rewardTitle: string;
	pointsSpent: number;
	purchaseDate: Date;
	status: 'completed' | 'pending' | 'cancelled';
}

export interface PointsHistory {
	id: string;
	type: 'earned' | 'spent';
	amount: number;
	description: string;
	date: Date;
	gameId?: string;
	rewardId?: string;
}