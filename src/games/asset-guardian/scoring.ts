import { writable, derived } from 'svelte/store';
import type {
	PlayerStats,
	HighScore,
	Achievement,
	ProgressData,
	ScoringEvent,
	LevelResult,
	GameSession
} from './types';
import { SCORE_VALUES, GAME_CONFIG } from './constants';

const STORAGE_KEY = 'asset-guardian-progress';
const DATA_VERSION = '1.0.0';
const MAX_HIGH_SCORES = 10;

class LocalStorageManager {
	private storageKey: string;

	constructor(key: string) {
		this.storageKey = key;
	}

	load<T>(defaultValue: T): T {
		try {
			const data = localStorage.getItem(this.storageKey);
			if (!data) return defaultValue;

			const parsed = JSON.parse(data);
			return this.validateAndMigrate(parsed, defaultValue);
		} catch (error) {
			console.warn(`[SCORING] Failed to load data from localStorage:`, error);
			return defaultValue;
		}
	}

	save<T>(data: T): boolean {
		try {
			const serialized = JSON.stringify(data);
			localStorage.setItem(this.storageKey, serialized);
			return true;
		} catch (error) {
			console.error(`[SCORING] Failed to save data to localStorage:`, error);
			return false;
		}
	}

	clear(): boolean {
		try {
			localStorage.removeItem(this.storageKey);
			return true;
		} catch (error) {
			console.error(`[SCORING] Failed to clear localStorage:`, error);
			return false;
		}
	}

	private validateAndMigrate<T>(data: any, defaultValue: T): T {
		if (!data || typeof data !== 'object') {
			return defaultValue;
		}

		if (data.version !== DATA_VERSION) {
			console.log(`[SCORING] Data version mismatch, migrating from ${data.version} to ${DATA_VERSION}`);
			return this.migrateData(data, defaultValue);
		}

		return data;
	}

	private migrateData<T>(oldData: any, defaultValue: T): T {
		return defaultValue;
	}
}

function createInitialPlayerStats(): PlayerStats {
	return {
		totalScore: 0,
		totalPlayTime: 0,
		levelsCompleted: 0,
		perfectRuns: 0,
		totalBonusesCollected: 0,
		totalTrapsHit: 0,
		averageScore: 0,
		bestSpeedRun: 0,
		favoriteLevel: 1,
		efficiency: 0,
		bankingProductsStudied: [],
		lastPlayedDate: Date.now(),
		totalSessions: 0,
		currentStreak: 0,
		bestStreak: 0,
	};
}

function createInitialProgressData(): ProgressData {
	return {
		version: DATA_VERSION,
		playerStats: createInitialPlayerStats(),
		highScores: {
			overall: [],
			byLevel: {},
			speedRuns: []
		},
		achievements: createAchievements(),
		unlockedContent: {
			levels: [1],
			achievements: [],
			titles: ['Новичок']
		},
		preferences: {
			gyroscopeEnabled: true,
			hapticFeedbackEnabled: true,
			soundEnabled: true,
			difficultyPreference: 'medium'
		},
		metadata: {
			createdAt: Date.now(),
			lastUpdatedAt: Date.now(),
			dataVersion: 1,
			migrationHistory: []
		}
	};
}

function createAchievements(): Record<string, Achievement> {
	const achievements: Record<string, Achievement> = {};

	const achievementDefinitions = [
		{
			id: 'first_steps',
			name: 'Первые шаги',
			description: 'Завершите свой первый уровень',
			icon: '👶',
			category: 'exploration' as const,
			rarity: 'common' as const,
			condition: { type: 'total_levels' as const, value: 1, operator: '>=' as const },
			reward: { type: 'points' as const, value: 100, description: 'Бонус новичка' }
		},
		{
			id: 'perfect_guardian',
			name: 'Идеальный хранитель',
			description: 'Пройдите уровень без единой ловушки',
			icon: '💎',
			category: 'efficiency' as const,
			rarity: 'rare' as const,
			condition: { type: 'perfect_runs' as const, value: 1, operator: '>=' as const },
			reward: { type: 'points' as const, value: 500, description: 'Мастерство защиты' }
		},
		{
			id: 'speed_demon',
			name: 'Скоростной демон',
			description: 'Завершите уровень за 30 секунд',
			icon: '⚡',
			category: 'speed' as const,
			rarity: 'rare' as const,
			condition: { type: 'speed' as const, value: 30, operator: '<=' as const },
			reward: { type: 'points' as const, value: 750, description: 'Молниеносность' }
		},
		{
			id: 'banking_scholar',
			name: 'Знаток банковского дела',
			description: 'Изучите все банковские продукты',
			icon: '🎓',
			category: 'banking' as const,
			rarity: 'epic' as const,
			condition: { type: 'banking_products' as const, value: 4, operator: '>=' as const },
			reward: { type: 'title' as const, value: 0, description: 'Титул: Финансовый эксперт' }
		},
		{
			id: 'high_roller',
			name: 'Крупный игрок',
			description: 'Наберите 10,000 очков за одну игру',
			icon: '💰',
			category: 'score' as const,
			rarity: 'epic' as const,
			condition: { type: 'score' as const, value: 10000, operator: '>=' as const },
			reward: { type: 'points' as const, value: 2000, description: 'Финансовый магнат' }
		},
		{
			id: 'fraud_fighter',
			name: 'Борец с мошенничеством',
			description: 'Избегните 50 ловушек',
			icon: '🛡️',
			category: 'banking' as const,
			rarity: 'rare' as const,
			condition: { type: 'total_levels' as const, value: 50, operator: '>=' as const },
			reward: { type: 'points' as const, value: 1000, description: 'Защитник активов' }
		},
		{
			id: 'streak_master',
			name: 'Мастер серий',
			description: 'Пройдите 5 уровней подряд идеально',
			icon: '🔥',
			category: 'streak' as const,
			rarity: 'epic' as const,
			condition: { type: 'streak' as const, value: 5, operator: '>=' as const },
			reward: { type: 'title' as const, value: 0, description: 'Титул: Непобедимый' }
		},
		{
			id: 'completionist',
			name: 'Перфекционист',
			description: 'Завершите все 10 уровней',
			icon: '🏆',
			category: 'exploration' as const,
			rarity: 'legendary' as const,
			condition: { type: 'total_levels' as const, value: 10, operator: '>=' as const },
			reward: { type: 'title' as const, value: 0, description: 'Титул: Мастер защиты активов' }
		},
		{
			id: 'efficiency_expert',
			name: 'Эксперт эффективности',
			description: 'Достигните 90% эффективности',
			icon: '📊',
			category: 'efficiency' as const,
			rarity: 'epic' as const,
			condition: { type: 'total_levels' as const, value: 90, operator: '>=' as const },
			reward: { type: 'points' as const, value: 1500, description: 'Стратег-аналитик' }
		},
		{
			id: 'investment_guru',
			name: 'Гуру инвестиций',
			description: 'Соберите 100 бонусов депозитов',
			icon: '📈',
			category: 'banking' as const,
			rarity: 'rare' as const,
			condition: { type: 'total_levels' as const, value: 100, operator: '>=' as const },
			reward: { type: 'points' as const, value: 800, description: 'Инвестиционный эксперт' }
		},
		{
			id: 'cashback_collector',
			name: 'Коллекционер кэшбэка',
			description: 'Соберите 100 бонусов кэшбэка',
			icon: '💳',
			category: 'banking' as const,
			rarity: 'rare' as const,
			condition: { type: 'total_levels' as const, value: 100, operator: '>=' as const },
			reward: { type: 'points' as const, value: 800, description: 'Мастер кэшбэка' }
		},
		{
			id: 'marathon_runner',
			name: 'Марафонец',
			description: 'Играйте 60 минут суммарно',
			icon: '🏃',
			category: 'exploration' as const,
			rarity: 'rare' as const,
			condition: { type: 'total_levels' as const, value: 3600, operator: '>=' as const },
			reward: { type: 'points' as const, value: 1200, description: 'Выносливость активов' }
		},
		{
			id: 'vault_master',
			name: 'Мастер сейфов',
			description: 'Дойдите до финиша 25 раз',
			icon: '🔐',
			category: 'exploration' as const,
			rarity: 'epic' as const,
			condition: { type: 'total_levels' as const, value: 25, operator: '>=' as const },
			reward: { type: 'title' as const, value: 0, description: 'Титул: Хранитель сокровищ' }
		},
		{
			id: 'legend',
			name: 'Легенда',
			description: 'Разблокируйте все достижения',
			icon: '👑',
			category: 'exploration' as const,
			rarity: 'legendary' as const,
			condition: { type: 'total_levels' as const, value: 100, operator: '>=' as const },
			reward: { type: 'title' as const, value: 0, description: 'Титул: Легенда защиты активов' }
		}
	];

	achievementDefinitions.forEach(def => {
		achievements[def.id] = {
			...def,
			isUnlocked: false,
			progress: 0,
			maxProgress: def.condition.value
		};
	});

	return achievements;
}

function createScoringStore() {
	const storageManager = new LocalStorageManager(STORAGE_KEY);
	const initialData = storageManager.load(createInitialProgressData());

	const { subscribe, set, update } = writable<ProgressData>(initialData);

	function saveProgress(data: ProgressData) {
		data.metadata.lastUpdatedAt = Date.now();
		storageManager.save(data);
	}

	function calculateEfficiency(bonuses: number, traps: number): number {
		const total = bonuses + traps;
		if (total === 0) return 100;
		return Math.round((bonuses / total) * 100);
	}

	function updatePlayerStats(sessionResult: GameSession, levelResult: LevelResult) {
		update(data => {
			const stats = data.playerStats;

			stats.totalScore += sessionResult.finalScore;
			stats.totalPlayTime += sessionResult.duration || 0;
			stats.totalSessions += 1;
			stats.lastPlayedDate = Date.now();
			stats.totalBonusesCollected += sessionResult.bonusesCollected;
			stats.totalTrapsHit += sessionResult.trapsHit;

			if (levelResult.completed) {
				stats.levelsCompleted += 1;

				if (levelResult.rating === 3) {
					stats.perfectRuns += 1;
					stats.currentStreak += 1;
					stats.bestStreak = Math.max(stats.bestStreak, stats.currentStreak);
				} else {
					stats.currentStreak = 0;
				}
			} else {
				stats.currentStreak = 0;
			}

			const speedTime = levelResult.timeUsed;
			if (levelResult.completed && (stats.bestSpeedRun === 0 || speedTime < stats.bestSpeedRun)) {
				stats.bestSpeedRun = speedTime;
			}

			stats.averageScore = stats.totalSessions > 0 ? Math.round(stats.totalScore / stats.totalSessions) : 0;
			stats.efficiency = calculateEfficiency(stats.totalBonusesCollected, stats.totalTrapsHit);

			if (levelResult.bankingLessonLearned && sessionResult.bankingProductInteraction) {
				if (!stats.bankingProductsStudied.includes(sessionResult.bankingProductInteraction)) {
					stats.bankingProductsStudied.push(sessionResult.bankingProductInteraction);
				}
			}

			const newData = { ...data, playerStats: stats };
			saveProgress(newData);
			return newData;
		});
	}

	function addHighScore(sessionResult: GameSession, levelResult: LevelResult) {
		update(data => {
			const highScore: HighScore = {
				score: sessionResult.finalScore,
				level: sessionResult.level,
				date: Date.now(),
				timeUsed: levelResult.timeUsed,
				perfectRun: levelResult.rating === 3,
				difficulty: 'medium',
				playerStats: {
					bonusesCollected: sessionResult.bonusesCollected,
					trapsHit: sessionResult.trapsHit,
					bankingLessonCompleted: levelResult.bankingLessonLearned
				}
			};

			data.highScores.overall.push(highScore);
			data.highScores.overall.sort((a, b) => b.score - a.score);
			data.highScores.overall = data.highScores.overall.slice(0, MAX_HIGH_SCORES);

			const levelHighScores = data.highScores.byLevel[sessionResult.level];
			if (!levelHighScores || highScore.score > levelHighScores.score) {
				data.highScores.byLevel[sessionResult.level] = highScore;
			}

			if (levelResult.completed && levelResult.timeUsed < 60) {
				data.highScores.speedRuns.push(highScore);
				data.highScores.speedRuns.sort((a, b) => a.timeUsed - b.timeUsed);
				data.highScores.speedRuns = data.highScores.speedRuns.slice(0, MAX_HIGH_SCORES);
			}

			const newData = { ...data };
			saveProgress(newData);
			return newData;
		});
	}

	function checkAchievements(sessionResult: GameSession, levelResult: LevelResult) {
		update(data => {
			const stats = data.playerStats;
			const newUnlocks: string[] = [];

			Object.values(data.achievements).forEach(achievement => {
				if (achievement.isUnlocked) return;

				let progress = 0;
				let shouldUnlock = false;

				switch (achievement.condition.type) {
					case 'score':
						progress = sessionResult.finalScore;
						break;
					case 'perfect_runs':
						progress = stats.perfectRuns;
						break;
					case 'speed':
						progress = levelResult.timeUsed;
						shouldUnlock = levelResult.completed;
						break;
					case 'banking_products':
						progress = stats.bankingProductsStudied.length;
						break;
					case 'streak':
						progress = stats.currentStreak;
						break;
					case 'total_levels':
						progress = stats.levelsCompleted;
						break;
				}

				achievement.progress = progress;

				const conditionMet = evaluateCondition(progress, achievement.condition.operator, achievement.condition.value);

				if (conditionMet && shouldUnlock !== false) {
					achievement.isUnlocked = true;
					achievement.unlockedAt = Date.now();
					achievement.progress = achievement.maxProgress;
					newUnlocks.push(achievement.id);

					data.unlockedContent.achievements.push(achievement.id);

					if (achievement.reward.type === 'title') {
						data.unlockedContent.titles.push(achievement.reward.description);
					}
				}
			});

			if (newUnlocks.length > 0) {
				console.log(`🏆 [ACHIEVEMENTS] Unlocked ${newUnlocks.length} achievements:`, newUnlocks);
			}

			const newData = { ...data };
			saveProgress(newData);
			return newData;
		});
	}

	function evaluateCondition(value: number, operator: string, target: number): boolean {
		switch (operator) {
			case '>=': return value >= target;
			case '>': return value > target;
			case '==': return value === target;
			case '<=': return value <= target;
			case '<': return value < target;
			default: return false;
		}
	}

	function recordScoringEvent(event: ScoringEvent) {
		console.log(`📊 [SCORING] Event recorded:`, event);
	}

	function exportProgress(): string {
		let currentData: ProgressData = createInitialProgressData();
		subscribe(data => { currentData = data; })();
		return JSON.stringify(currentData, null, 2);
	}

	function importProgress(jsonData: string): boolean {
		try {
			const importedData = JSON.parse(jsonData);
			if (importedData.version && importedData.playerStats) {
				set(importedData);
				saveProgress(importedData);
				return true;
			}
			return false;
		} catch {
			return false;
		}
	}

	function resetProgress() {
		const freshData = createInitialProgressData();
		set(freshData);
		saveProgress(freshData);
		console.log('🔄 [SCORING] Progress reset');
	}

	function getAchievementProgress() {
		let currentData: ProgressData = createInitialProgressData();
		subscribe(data => { currentData = data; })();

		const total = Object.keys(currentData.achievements).length;
		const unlocked = Object.values(currentData.achievements).filter(a => a.isUnlocked).length;

		return { unlocked, total, percentage: Math.round((unlocked / total) * 100) };
	}

	return {
		subscribe,
		updatePlayerStats,
		addHighScore,
		checkAchievements,
		recordScoringEvent,
		exportProgress,
		importProgress,
		resetProgress,
		getAchievementProgress
	};
}

export const scoringStore = createScoringStore();

export const scoringSelectors = derived(
	scoringStore,
	($scoring) => ({
		playerStats: $scoring.playerStats,
		highScores: $scoring.highScores,
		achievements: $scoring.achievements,
		unlockedAchievements: Object.values($scoring.achievements).filter(a => a.isUnlocked),
		pendingAchievements: Object.values($scoring.achievements).filter(a => !a.isUnlocked),
		achievementProgress: Object.values($scoring.achievements).filter(a => !a.isUnlocked).length > 0
			? Object.values($scoring.achievements).filter(a => a.isUnlocked).length / Object.values($scoring.achievements).length * 100
			: 100,
		bestScore: $scoring.highScores.overall[0]?.score || 0,
		bestSpeedRun: $scoring.playerStats.bestSpeedRun,
		currentStreak: $scoring.playerStats.currentStreak,
		bestStreak: $scoring.playerStats.bestStreak,
		totalPlayTime: $scoring.playerStats.totalPlayTime,
		efficiency: $scoring.playerStats.efficiency,
		bankingExpertise: $scoring.playerStats.bankingProductsStudied.length,
		preferences: $scoring.preferences
	})
);