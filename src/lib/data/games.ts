import type { Game } from '$lib/types/Game.js';
import { GAME_TYPES, GAME_CATEGORIES, GAME_STATUS } from '$lib/utils/constants.js';

export const GAMES_DATA: Game[] = [
	{
		id: GAME_TYPES.QUIZ_SHIELD_RUBLE,
		name: 'Щит и Рубль',
		description: 'Интерактивный квиз по финансовой безопасности. Научитесь распознавать мошенников и защищать свои деньги.',
		shortDescription: 'Квиз по безопасности',
		category: GAME_CATEGORIES.QUIZ,
		status: GAME_STATUS.ACTIVE,

		icon: {
			url: '/games/quiz-shield-ruble/icon.svg',
			alt: 'Иконка Щит и Рубль',
			width: 64,
			height: 64
		},
		gradient: 'linear-gradient(135deg, var(--color-gpb-mint) 0%, var(--color-gpb-emerald) 100%)',
		themeColor: 'var(--color-gpb-mint)',

		metrics: {
			averagePlayTime: 300,
			completionRate: 0.85,
			difficulty: 'medium',
			maxScore: 500,
			averageScore: 380
		},
		estimatedDuration: 5,

		relatedProducts: [
			{
				id: 'secure-card',
				name: 'Безопасная карта',
				description: 'Дебетовая карта с повышенным уровнем защиты',
				url: '/products/secure-card',
				category: 'card'
			}
		],

		version: '1.0.0',
		createdAt: new Date('2024-01-15'),
		updatedAt: new Date('2024-01-20'),
		componentPath: '/games/quiz-shield-ruble/QuizGame.svelte',
		locale: 'ru'
	},

	{
		id: GAME_TYPES.MATCH3_GOLDEN_RESERVE,
		name: 'Золотой Запас',
		description: 'Головоломка в стиле "три в ряд" с финансовыми символами. Собирайте комбинации и изучайте инвестиционные инструменты.',
		shortDescription: 'Головоломка',
		category: GAME_CATEGORIES.MATCH3,
		status: GAME_STATUS.ACTIVE,

		icon: {
			url: '/games/match3-golden-reserve/icon.svg',
			alt: 'Иконка Золотой Запас',
			width: 64,
			height: 64
		},
		gradient: 'linear-gradient(135deg, var(--color-gpb-raspberry) 0%, var(--color-gpb-violet) 100%)',
		themeColor: 'var(--color-gpb-raspberry)',

		metrics: {
			averagePlayTime: 480,
			completionRate: 0.72,
			difficulty: 'hard',
			maxScore: 1500,
			averageScore: 850
		},
		estimatedDuration: 8,

		relatedProducts: [
			{
				id: 'investment-portfolio',
				name: 'Инвестиционный портфель',
				description: 'Индивидуальные инвестиционные решения',
				url: '/products/investment',
				category: 'investment'
			}
		],

		version: '1.0.0',
		createdAt: new Date('2024-01-10'),
		updatedAt: new Date('2024-01-18'),
		componentPath: '/games/match3-golden-reserve/Match3Demo.svelte',
		locale: 'ru'
	},

	{
		id: GAME_TYPES.CROSSWORD_FINANCIAL,
		name: 'Финансовый Кроссворд',
		description: 'Интеллектуальная игра в стиле Wordle с финансовыми терминами. Развивайте финансовую грамотность играя.',
		shortDescription: 'Интеллектуальная игра',
		category: GAME_CATEGORIES.CROSSWORD,
		status: GAME_STATUS.ACTIVE,

		icon: {
			url: '/games/crossword-financial/icon.svg',
			alt: 'Иконка Финансовый Кроссворд',
			width: 64,
			height: 64
		},
		gradient: 'linear-gradient(135deg, var(--color-gpb-violet) 0%, var(--color-gpb-orange) 100%)',
		themeColor: 'var(--color-gpb-violet)',

		metrics: {
			averagePlayTime: 360,
			completionRate: 0.78,
			difficulty: 'medium',
			maxScore: 600,
			averageScore: 420
		},
		estimatedDuration: 6,

		relatedProducts: [
			{
				id: 'savings-deposit',
				name: 'Накопительный вклад',
				description: 'Выгодные условия для сбережений',
				url: '/products/deposit',
				category: 'deposit'
			}
		],

		version: '1.0.0',
		createdAt: new Date('2024-01-12'),
		updatedAt: new Date('2024-01-22'),
		componentPath: '/games/crossword-financial/CrosswordDemo.svelte',
		locale: 'ru'
	},

	{
		id: GAME_TYPES.DETECTIVE_BANKING,
		name: 'Банковский Детектив',
		description: 'Расследование финансовых дел. Изучайте банковские операции, раскрывайте схемы мошенничества и становитесь экспертом.',
		shortDescription: 'Расследование',
		category: GAME_CATEGORIES.EDUCATIONAL,
		status: GAME_STATUS.COMING_SOON,

		icon: {
			url: '/games/detective-banking/icon.svg',
			alt: 'Иконка Банковский Детектив',
			width: 64,
			height: 64
		},
		gradient: 'linear-gradient(135deg, var(--color-gpb-mint) 0%, var(--color-gpb-violet) 100%)',
		themeColor: 'var(--color-gpb-iris)',

		metrics: {
			averagePlayTime: 720,
			completionRate: 0.0,
			difficulty: 'hard',
			maxScore: 1000,
			averageScore: 0
		},
		estimatedDuration: 12,

		relatedProducts: [
			{
				id: 'fraud-protection',
				name: 'Защита от мошенничества',
				description: 'Комплексная защита ваших средств',
				url: '/products/fraud-protection',
				category: 'service'
			}
		],

		version: '1.0.0',
		createdAt: new Date('2024-02-01'),
		updatedAt: new Date('2024-02-01'),
		componentPath: '/games/detective-banking/DetectiveGame.svelte',
		locale: 'ru'
	},

	{
		id: GAME_TYPES.INVESTMENT_STRATEGY,
		name: 'Инвестиционная Стратегия',
		description: 'Экономическая стратегия для изучения инвестиционных инструментов. Управляйте портфелем и достигайте финансовых целей.',
		shortDescription: 'Экономическая игра',
		category: GAME_CATEGORIES.EDUCATIONAL,
		status: GAME_STATUS.COMING_SOON,

		icon: {
			url: '/games/investment-strategy/icon.svg',
			alt: 'Иконка Инвестиционная Стратегия',
			width: 64,
			height: 64
		},
		gradient: 'linear-gradient(135deg, var(--color-gpb-raspberry) 0%, var(--color-gpb-raspberry-light) 100%)',
		themeColor: 'var(--color-gpb-raspberry)',

		metrics: {
			averagePlayTime: 900,
			completionRate: 0.0,
			difficulty: 'hard',
			maxScore: 2000,
			averageScore: 0
		},
		estimatedDuration: 15,

		relatedProducts: [
			{
				id: 'investment-account',
				name: 'Инвестиционный счёт',
				description: 'Торговля ценными бумагами',
				url: '/products/investment-account',
				category: 'investment'
			}
		],

		version: '1.0.0',
		createdAt: new Date('2024-02-05'),
		updatedAt: new Date('2024-02-05'),
		componentPath: '/games/investment-strategy/StrategyGame.svelte',
		locale: 'ru'
	},

	{
		id: GAME_TYPES.FINCITY,
		name: 'FinCity',
		description: 'Стройте и развивайте финансовый город. Изучайте банковские продукты через игровой процесс и создавайте процветающую финансовую экосистему.',
		shortDescription: 'Городской симулятор',
		category: GAME_CATEGORIES.EDUCATIONAL,
		status: GAME_STATUS.ACTIVE,

		icon: {
			url: '/games/fincity/icon.svg',
			alt: 'Иконка FinCity',
			width: 64,
			height: 64
		},
		gradient: 'linear-gradient(135deg, var(--color-gpb-mint) 0%, var(--color-gpb-emerald) 100%)',
		themeColor: 'var(--color-gpb-mint)',

		metrics: {
			averagePlayTime: 1200,
			completionRate: 0.82,
			difficulty: 'medium',
			maxScore: 5000,
			averageScore: 3200
		},
		estimatedDuration: 20,

		relatedProducts: [
			{
				id: 'city-savings',
				name: 'Накопительный счёт',
				description: 'Сохраняйте и приумножайте средства',
				url: '/products/savings',
				category: 'deposit'
			},
			{
				id: 'investment-portfolio',
				name: 'Инвестиционный портфель',
				description: 'Индивидуальные инвестиционные решения',
				url: '/products/investment',
				category: 'investment'
			},
			{
				id: 'business-banking',
				name: 'Бизнес-банкинг',
				description: 'Финансовые решения для бизнеса',
				url: '/products/business',
				category: 'service'
			}
		],

		version: '1.0.0',
		createdAt: new Date('2024-02-10'),
		updatedAt: new Date('2024-02-10'),
		componentPath: '/games/fincity/FincityGame.svelte',
		locale: 'ru'
	},

	{
		id: GAME_TYPES.ANTI_FRAUD_HUNTER,
		name: 'Охотник за мошенниками',
		description: 'Реакционная игра по распознаванию мошеннических SMS. Научитесь быстро отличать опасные сообщения от безопасных уведомлений банка.',
		shortDescription: 'Анти-фрод аркада',
		category: GAME_CATEGORIES.ACTION,
		status: GAME_STATUS.ACTIVE,

		icon: {
			url: '/games/anti-fraud-hunter/icon.svg',
			alt: 'Иконка Охотник за мошенниками',
			width: 64,
			height: 64
		},
		gradient: 'linear-gradient(135deg, var(--color-gpb-raspberry) 0%, var(--color-gpb-violet) 100%)',
		themeColor: 'var(--color-gpb-raspberry)',

		metrics: {
			averagePlayTime: 240,
			completionRate: 0.75,
			difficulty: 'medium',
			maxScore: 2000,
			averageScore: 1200
		},
		estimatedDuration: 4,

		relatedProducts: [
			{
				id: 'fraud-protection',
				name: 'Защита от мошенничества',
				description: 'Комплексная система защиты ваших средств',
				url: '/products/fraud-protection',
				category: 'service'
			},
			{
				id: 'sms-notifications',
				name: 'SMS-уведомления',
				description: 'Безопасные уведомления обо всех операциях',
				url: '/products/sms-notifications',
				category: 'service'
			},
			{
				id: 'security-consultation',
				name: 'Консультации по кибербезопасности',
				description: 'Персональные рекомендации по защите',
				url: '/products/security-consultation',
				category: 'service'
			}
		],

		version: '1.0.0',
		createdAt: new Date('2024-09-26'),
		updatedAt: new Date('2024-09-26'),
		componentPath: '/games/anti-fraud-hunter/AntiFraudGame.svelte',
		locale: 'ru'
	}
];

export function getActiveGames(): Game[] {
	return GAMES_DATA.filter(game => game.status === GAME_STATUS.ACTIVE);
}

export function getComingSoonGames(): Game[] {
	return GAMES_DATA.filter(game => game.status === GAME_STATUS.COMING_SOON);
}

export function getGameById(gameId: string): Game | undefined {
	return GAMES_DATA.find(game => game.id === gameId);
}

export function getGamesByCategory(category: string): Game[] {
	return GAMES_DATA.filter(game => game.category === category);
}