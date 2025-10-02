export enum NotificationType {
	DAILY_REWARD = 'daily_reward',
	STREAK_RISK = 'streak_risk',
	TASK_PROGRESS = 'task_progress',
	ACHIEVEMENT = 'achievement',
	POINTS_MILESTONE = 'points_milestone',
	NEW_GAME = 'new_game',
	WEEKLY_STATS = 'weekly_stats',
	GAME_RECOMMENDATION = 'game_recommendation',
	RETURN_AFTER_INACTIVITY = 'return_after_inactivity',
	ALMOST_LEVEL_UP = 'almost_level_up',
	NEW_BANK_PRODUCT = 'new_bank_product',
	WIN_STREAK = 'win_streak',
	BREAK_REMINDER = 'break_reminder'
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

function generateReturnAfterInactivityNotification(ctx: PlayerContext): NotificationContent {
	return {
		type: NotificationType.RETURN_AFTER_INACTIVITY,
		priority: 8,
		emoji: '🎮',
		title: 'Скучно без вас!',
		message: `<b>${ctx.userName}</b>, игры грустят в одиночестве!\n\nВернитесь и покажите им, кто тут босс! Ждем вас в Игровом Центре 😎`
	};
}

function generateAlmostLevelUpNotification(ctx: PlayerContext): NotificationContent {
	const pointsToNext = 100;
	return {
		type: NotificationType.ALMOST_LEVEL_UP,
		priority: 9,
		emoji: '🎯',
		title: 'Вы так близко к цели!',
		message: `Осталось всего <b>${pointsToNext} очков</b> до следующего уровня!\n\nЭто буквально одна игра. Не дайте победе ускользнуть ⚡`
	};
}

function generateNewBankProductNotification(): NotificationContent {
	return {
		type: NotificationType.NEW_BANK_PRODUCT,
		priority: 6,
		emoji: '🆕',
		title: 'Изучите новые возможности!',
		message: `Открыт новый банковский продукт!\n\nТолько для игроков Игрового Центра — первый доступ к изучению в интерактивной форме 📚`
	};
}

function generateWinStreakNotification(): NotificationContent {
	return {
		type: NotificationType.WIN_STREAK,
		priority: 7,
		emoji: '🔥',
		title: 'Вы в ударе!',
		message: `<b>5 побед подряд!</b> Кто-то сегодня проснулся чемпионом!\n\nПопробуйте новую игру и продолжите победную серию ⚡`
	};
}

function generateBreakReminderNotification(): NotificationContent {
	return {
		type: NotificationType.BREAK_REMINDER,
		priority: 4,
		emoji: '☕',
		title: 'Время сделать перерыв',
		message: `Вы играете уже <b>45 минут</b>. Отличная игровая сессия!\n\nСохраните прогресс и возвращайтесь позже 😊`
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
		generateGameRecommendationNotification(ctx),
		generateReturnAfterInactivityNotification(ctx),
		generateAlmostLevelUpNotification(ctx),
		generateNewBankProductNotification(),
		generateWinStreakNotification(),
		generateBreakReminderNotification()
	];

	notifications.sort((a, b) => b.priority - a.priority);

	const primary = notifications[0];
	const rest = notifications.slice(1);

	let message = `🔔 <b>Демонстрация Системы Push-Уведомлений</b>\n`;
	message += `<i>Игровой Центр Газпромбанка</i>\n\n`;
	message += `<b>━━━━━━━━━━━━━━━━</b>\n\n`;

	message += `<b>${primary.emoji} ${primary.title}</b>\n\n${primary.message}\n\n`;

	message += `<b>━━━━━━━━━━━━━━━━</b>\n\n`;

	rest.forEach(notif => {
		message += `<b>${notif.emoji} ${notif.title}</b>\n${notif.message}\n\n`;
	});

	message += `<b>━━━━━━━━━━━━━━━━</b>\n\n`;
	message += `📋 <b>Типы уведомлений в системе:</b>\n`;
	message += `• Ежедневные награды и стрики\n`;
	message += `• Напоминания о заданиях\n`;
	message += `• Достижения и прогресс\n`;
	message += `• Игровые триггеры (победы, почти-уровни)\n`;
	message += `• Новые продукты банка\n`;
	message += `• Напоминания о перерывах\n\n`;
	message += `⚙️ <b>Персонализация:</b>\n`;
	message += `• Адаптация времени под активность\n`;
	message += `• Максимум 3 уведомления в день\n`;
	message += `• Тихие часы: 23:00-8:00\n\n`;
	message += `💡 <i>Играй, учись и зарабатывай баллы!</i>\n`;
	message += `🎮 <b>Игровой Центр Газпромбанка</b>`;

	return message;
}