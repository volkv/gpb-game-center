export enum NotificationType {
	DAILY_REWARD = 'daily_reward',
	STREAK_RISK = 'streak_risk',
	TASK_PROGRESS = 'task_progress',
	ACHIEVEMENT = 'achievement',
	POINTS_MILESTONE = 'points_milestone',
	NEW_GAME = 'new_game',
	WEEKLY_STATS = 'weekly_stats',
	GAME_RECOMMENDATION = 'game_recommendation'
}

export interface PlayerContext {
	userName: string;
	currentStreak: number;
	totalPoints: number;
	earnedToday: number;
	totalGamesPlayed: number;
	sessionCount: number;
	lastActiveDate: string | null;
	availableTasks: number;
	completedTasks: number;
	nextReward?: { day: number; amount: number };
	favoriteGame?: string;
}

interface NotificationContent {
	type: NotificationType;
	priority: number;
	title: string;
	message: string;
	emoji: string;
}

function generateDailyRewardNotification(ctx: PlayerContext): NotificationContent {
	const streakBonus = ctx.currentStreak > 3 ? ' 🔥' : '';
	return {
		type: NotificationType.DAILY_REWARD,
		priority: 10,
		emoji: '🎁',
		title: `${ctx.userName}, ежедневная награда ждёт!${streakBonus}`,
		message: `<b>День ${ctx.currentStreak}</b> — получи <b>+${ctx.nextReward?.amount || 100} баллов</b>\nТвоя серия: <b>${ctx.currentStreak} ${ctx.currentStreak === 1 ? 'день' : ctx.currentStreak < 5 ? 'дня' : 'дней'}</b> подряд!`
	};
}

function generateStreakRiskNotification(ctx: PlayerContext): NotificationContent {
	return {
		type: NotificationType.STREAK_RISK,
		priority: 9,
		emoji: '🔥',
		title: `Не потеряй серию в ${ctx.currentStreak} ${ctx.currentStreak === 1 ? 'день' : ctx.currentStreak < 5 ? 'дня' : 'дней'}!`,
		message: `<b>${ctx.userName}</b>, твоя серия под угрозой!\nЗаходи сегодня и получи награду за <b>День ${ctx.currentStreak}</b>`
	};
}

function generateTaskProgressNotification(ctx: PlayerContext): NotificationContent {
	return {
		type: NotificationType.TASK_PROGRESS,
		priority: 7,
		emoji: '⚡',
		title: 'Осталось совсем чуть-чуть!',
		message: `<b>${ctx.availableTasks} ${ctx.availableTasks === 1 ? 'задание' : ctx.availableTasks < 5 ? 'задания' : 'заданий'}</b> доступно для выполнения\nУже выполнено: <b>${ctx.completedTasks}</b> 🎯`
	};
}

function generatePointsMilestoneNotification(ctx: PlayerContext): NotificationContent {
	const nextMilestone = Math.ceil(ctx.totalPoints / 10000) * 10000;
	const toGo = nextMilestone - ctx.totalPoints;

	return {
		type: NotificationType.POINTS_MILESTONE,
		priority: 6,
		emoji: '💎',
		title: `До ${nextMilestone.toLocaleString()} баллов — всего ${toGo.toLocaleString()}!`,
		message: `Твой баланс: <b>${ctx.totalPoints.toLocaleString()} баллов</b>\nСегодня заработано: <b>+${ctx.earnedToday}</b> 📈`
	};
}

function generateAchievementNotification(ctx: PlayerContext): NotificationContent {
	const achievements = [
		{ threshold: 5, title: 'Начинающий игрок', emoji: '🎮' },
		{ threshold: 10, title: 'Опытный инвестор', emoji: '📊' },
		{ threshold: 20, title: 'Финансовый эксперт', emoji: '💼' },
		{ threshold: 50, title: 'Мастер финансов', emoji: '👑' }
	];

	const current = achievements.find(a => ctx.totalGamesPlayed >= a.threshold);
	const next = achievements.find(a => a.threshold > ctx.totalGamesPlayed);

	if (next) {
		const toGo = next.threshold - ctx.totalGamesPlayed;
		return {
			type: NotificationType.ACHIEVEMENT,
			priority: 5,
			emoji: next.emoji,
			title: `До звания "${next.title}" — ${toGo} ${toGo === 1 ? 'игра' : toGo < 5 ? 'игры' : 'игр'}!`,
			message: `Пройдено игр: <b>${ctx.totalGamesPlayed}</b>\nТекущее звание: <b>${current?.title || 'Новичок'}</b> ${current?.emoji || '🌟'}`
		};
	}

	return {
		type: NotificationType.ACHIEVEMENT,
		priority: 8,
		emoji: '🏆',
		title: `Поздравляем с достижением!`,
		message: `Получено звание: <b>"${current?.title || 'Финансовый гуру'}"</b> ${current?.emoji || '👑'}\nИгр пройдено: <b>${ctx.totalGamesPlayed}</b>`
	};
}

function generateGameRecommendationNotification(ctx: PlayerContext): NotificationContent {
	const games = [
		{ name: 'Щит и Рубль', desc: 'Защита от мошенников', emoji: '🛡️' },
		{ name: 'ФинСити', desc: 'Построй финансовую империю', emoji: '🏙️' },
		{ name: 'Хранитель Активов', desc: 'Гироскоп-лабиринт', emoji: '🎯' },
		{ name: 'Золотой Запас', desc: 'Match-3 головоломка', emoji: '💰' }
	];

	const game = games[Math.floor(Math.random() * games.length)];

	return {
		type: NotificationType.GAME_RECOMMENDATION,
		priority: 4,
		emoji: game.emoji,
		title: `Попробуй "${game.name}"!`,
		message: `${game.desc}\nСреднее время игры: <b>5-10 минут</b> ⏱️`
	};
}

function generateWeeklyStatsNotification(ctx: PlayerContext): NotificationContent {
	return {
		type: NotificationType.WEEKLY_STATS,
		priority: 3,
		emoji: '📊',
		title: 'Твоя статистика за неделю',
		message: `<b>Визитов:</b> ${ctx.sessionCount}\n<b>Игр пройдено:</b> ${ctx.totalGamesPlayed}\n<b>Баллов заработано:</b> ${ctx.totalPoints.toLocaleString()}\n\nПродолжай в том же духе! 💪`
	};
}

export function getDemoNotificationMessage(
	userName: string,
	context?: Partial<PlayerContext>
): string {
	const ctx: PlayerContext = {
		userName,
		currentStreak: context?.currentStreak || 3,
		totalPoints: context?.totalPoints || 15420,
		earnedToday: context?.earnedToday || 250,
		totalGamesPlayed: context?.totalGamesPlayed || 12,
		sessionCount: context?.sessionCount || 8,
		lastActiveDate: context?.lastActiveDate || new Date().toISOString(),
		availableTasks: context?.availableTasks || 5,
		completedTasks: context?.completedTasks || 3,
		nextReward: context?.nextReward || { day: 4, amount: 500 },
		favoriteGame: context?.favoriteGame || 'ФинСити'
	};

	const notifications: NotificationContent[] = [
		generateDailyRewardNotification(ctx),
		generateStreakRiskNotification(ctx),
		generateTaskProgressNotification(ctx),
		generatePointsMilestoneNotification(ctx),
		generateAchievementNotification(ctx),
		generateGameRecommendationNotification(ctx)
	];

	notifications.sort((a, b) => b.priority - a.priority);

	const primary = notifications[0];
	const secondary = notifications.slice(1, 3);

	let message = `<b>${primary.emoji} ${primary.title}</b>\n\n${primary.message}\n\n`;

	message += `<b>━━━━━━━━━━━━━━━━</b>\n\n`;

	secondary.forEach(notif => {
		message += `<b>${notif.emoji} ${notif.title}</b>\n${notif.message}\n\n`;
	});

	message += `<b>━━━━━━━━━━━━━━━━</b>\n\n`;
	message += `💡 <i>Играй, учись и зарабатывай баллы!</i>\n`;
	message += `🎮 <b>Игровой Центр Газпромбанка</b>`;

	return message;
}