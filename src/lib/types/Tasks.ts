export type TaskStatus = 'available' | 'in_progress' | 'completed' | 'claimed';

export type TaskDifficulty = 'easy' | 'medium' | 'hard';

export interface Task {
	id: string;
	title: string;
	description: string;
	fullDescription: string;
	reward: number;
	difficulty: TaskDifficulty;
	status: TaskStatus;
	category: string;
	estimatedTime: string;
	productUrl?: string;
	productName?: string;
	icon: string;
	requirements: string[];
	gradient?: string;
	themeColor?: string;
}

export interface TaskCategory {
	id: string;
	name: string;
	icon: string;
	color: string;
	tasks: Task[];
}

export interface DailyReward {
	day: number;
	reward: number;
	claimed: boolean;
	icon: string;
	description: string;
}

export interface TasksState {
	tasks: Task[];
	dailyRewards: DailyReward[];
	currentDay: number;
	lastLoginDate: string | null;
	totalTasksCompleted: number;
	totalRewardsEarned: number;
	streak: number;
}

export interface TaskProgress {
	taskId: string;
	progress: number;
	maxProgress: number;
	completed: boolean;
	startedAt: Date;
	completedAt?: Date;
}