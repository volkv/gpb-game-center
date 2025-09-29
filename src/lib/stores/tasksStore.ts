import { writable, derived } from 'svelte/store';
import { pointsStore } from './pointsStore';
import { getStoreValue } from '$lib/utils/storeHelpers';
import type { TasksState, Task, DailyReward, TaskStatus } from '$lib/types/Tasks';

function createTasksStore() {
	const initialDailyRewards: DailyReward[] = [
		{ day: 1, reward: 100, claimed: false, icon: '🎯', description: 'Добро пожаловать!' },
		{ day: 2, reward: 200, claimed: false, icon: '⭐', description: 'Второй день' },
		{ day: 3, reward: 300, claimed: false, icon: '💎', description: 'Третий день' },
		// { day: 4, reward: 500, claimed: false, icon: '🏆', description: 'Четвертый день' },
		// { day: 5, reward: 800, claimed: false, icon: '🔥', description: 'Пятый день' },
		// { day: 6, reward: 1000, claimed: false, icon: '👑', description: 'Шестой день' },
		// { day: 7, reward: 1500, claimed: false, icon: '🎊', description: 'Недельный бонус!' }
	];

	const initialState: TasksState = {
		tasks: [],
		dailyRewards: initialDailyRewards,
		currentDay: 1,
		lastLoginDate: null,
		totalTasksCompleted: 0,
		totalRewardsEarned: 0,
		streak: 0
	};

	const { subscribe, set, update } = writable<TasksState>(initialState);

	return {
		subscribe,

		initializeTasks: (tasks: Task[]) => {
			update(state => ({
				...state,
				tasks: tasks
			}));
		},

		completeTask: (taskId: string) => {
			let taskReward = 0;
			let taskTitle = '';

			update(state => {
				const taskIndex = state.tasks.findIndex(t => t.id === taskId);
				if (taskIndex === -1 || state.tasks[taskIndex].status === 'completed') {
					return state;
				}

				const updatedTasks = [...state.tasks];
				updatedTasks[taskIndex] = {
					...updatedTasks[taskIndex],
					status: 'completed'
				};

				taskReward = updatedTasks[taskIndex].reward;
				taskTitle = updatedTasks[taskIndex].title;

				return {
					...state,
					tasks: updatedTasks,
					totalTasksCompleted: state.totalTasksCompleted + 1,
					totalRewardsEarned: state.totalRewardsEarned + taskReward
				};
			});

			if (taskReward > 0) {
				pointsStore.addPoints(taskReward, `Задание: ${taskTitle}`, 'tasks');
			}

			return taskReward;
		},

		claimDailyReward: (day: number) => {
			let reward = 0;

			update(state => {
				if (day !== state.currentDay || day > state.dailyRewards.length) {
					return state;
				}

				const updatedRewards = state.dailyRewards.map(r =>
					r.day === day ? { ...r, claimed: true } : r
				);

				const dailyReward = state.dailyRewards.find(r => r.day === day);
				if (dailyReward && !dailyReward.claimed) {
					reward = dailyReward.reward;
				}

				return {
					...state,
					dailyRewards: updatedRewards,
					currentDay: Math.min(day + 1, 8),
					lastLoginDate: new Date().toISOString(),
					totalRewardsEarned: state.totalRewardsEarned + reward,
					streak: state.streak + 1
				};
			});

			if (reward > 0) {
				pointsStore.addPoints(reward, `Ежедневная награда: День ${day}`, 'daily');
			}

			return reward;
		},

		canClaimDailyReward: (day: number) => {
			const state = getStoreValue(tasksStore);
			const reward = state.dailyRewards.find(r => r.day === day);
			return day === state.currentDay && !!reward && !reward.claimed;
		},

		updateTaskStatus: (taskId: string, status: TaskStatus) => {
			update(state => {
				const updatedTasks = state.tasks.map(task =>
					task.id === taskId ? { ...task, status } : task
				);
				return {
					...state,
					tasks: updatedTasks
				};
			});
		},

		getTasksByCategory: (category: string) => {
			const state = getStoreValue(tasksStore);
			return state.tasks.filter(task => task.category === category);
		},

		getAvailableTasks: () => {
			const state = getStoreValue(tasksStore);
			return state.tasks.filter(task => task.status === 'available');
		},

		getCompletedTasks: () => {
			const state = getStoreValue(tasksStore);
			return state.tasks.filter(task => task.status === 'completed');
		},

		resetDailyRewards: () => {
			update(state => ({
				...state,
				dailyRewards: initialDailyRewards,
				currentDay: 1,
				streak: 0
			}));
		},

		reset: () => {
			set(initialState);
		}
	};
}

export const tasksStore = createTasksStore();

export const allTasks = derived(tasksStore, ($tasks) => $tasks.tasks);
export const availableTasks = derived(tasksStore, ($tasks) =>
	$tasks.tasks.filter(task => task.status === 'available')
);
export const completedTasks = derived(tasksStore, ($tasks) =>
	$tasks.tasks.filter(task => task.status === 'completed')
);
export const dailyRewards = derived(tasksStore, ($tasks) => $tasks.dailyRewards);
export const currentDay = derived(tasksStore, ($tasks) => $tasks.currentDay);
export const totalTasksCompleted = derived(tasksStore, ($tasks) => $tasks.totalTasksCompleted);
export const totalRewardsEarned = derived(tasksStore, ($tasks) => $tasks.totalRewardsEarned);
export const tasksStreak = derived(tasksStore, ($tasks) => $tasks.streak);