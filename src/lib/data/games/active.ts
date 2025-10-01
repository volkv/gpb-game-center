import type { Game } from '$lib/types/Game.js';
import { GAME_TYPES, GAME_CATEGORIES, GAME_STATUS } from '$lib/utils/constants.js';

export const ACTIVE_GAMES: Game[] = [
	{
		id: GAME_TYPES.ASSET_GUARDIAN,
		name: 'Хранитель Активов',
		description: 'Управляйте гироскопом: проведите активы через финансовые ловушки к сейфу. Физика + финансовая безопасность.',
		shortDescription: 'Гироскоп лабиринт',
		category: GAME_CATEGORIES.PUZZLE,
		status: GAME_STATUS.ACTIVE,

		icon: {
			url: '/logos/asset-guardian.png',
			alt: 'Иконка Хранитель Активов',
			width: 64,
			height: 64
		},
		gradient: 'linear-gradient(135deg, var(--color-brand-600) 0%, color-mix(in srgb, var(--color-state-success) 60%, white 40%) 100%)',
		themeColor: 'var(--color-state-success)',

		metrics: {
			averagePlayTime: 300,
			completionRate: 0.0,
			difficulty: 'medium',
			maxScore: 1000,
			averageScore: 0
		},
		estimatedDuration: 5,

		relatedProducts: [
			{
				id: 'fraud-protection',
				name: 'Защита от мошенничества',
				description: 'Комплексная защита ваших средств от финансовых ловушек',
				url: '/products/fraud-protection',
				category: 'service'
			},
			{
				id: 'investment-portfolio',
				name: 'Инвестиционный портфель',
				description: 'Выбор оптимального пути для ваших активов',
				url: '/products/investment',
				category: 'investment'
			},
			{
				id: 'asset-management',
				name: 'Управление активами',
				description: 'Профессиональное управление вашими средствами',
				url: '/products/asset-management',
				category: 'service'
			}
		],

		version: '1.0.0',
		createdAt: new Date('2024-09-28'),
		updatedAt: new Date('2024-09-28'),
		componentPath: '/games/asset-guardian/AssetGuardianGame.svelte',
		locale: 'ru'
	},

	{
		id: GAME_TYPES.FINCITY,
		name: 'ФинСити',
		description: 'Постройте свой финансовый город: вклады, инвестиции, бизнес-решения. Экономика игры = ваше финансовое будущее.',
		shortDescription: 'Городской симулятор',
		category: GAME_CATEGORIES.EDUCATIONAL,
		status: GAME_STATUS.ACTIVE,

		icon: {
			url: '/logos/fincity.png',
			alt: 'Иконка ФинСити',
			width: 64,
			height: 64
		},
		gradient: 'linear-gradient(135deg, var(--color-brand-500) 0%, color-mix(in srgb, var(--color-accent-300) 60%, white 40%) 100%)',
		themeColor: 'var(--color-accent-500)',

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
		id: GAME_TYPES.CODE_TO_SUCCESS,
		name: 'Код Безопасности',
		description: 'Проживите историю Анны: принимайте решения в реальных ситуациях с мошенниками. Ваши выборы — ваши последствия.',
		shortDescription: 'Визуальная новелла',
		category: GAME_CATEGORIES.VISUAL_NOVEL,
		status: GAME_STATUS.ACTIVE,

		icon: {
			url: '/logos/code-to-success.png',
			alt: 'Иконка Код Безопасности',
			width: 64,
			height: 64
		},
		gradient: 'linear-gradient(135deg, var(--color-brand-600) 0%, var(--color-accent-500) 100%)',
		themeColor: 'var(--color-brand-600)',

		metrics: {
			averagePlayTime: 180,
			completionRate: 0.88,
			difficulty: 'easy',
			maxScore: 100,
			averageScore: 75
		},
		estimatedDuration: 3,

		relatedProducts: [
			{
				id: 'fraud-protection',
				name: 'Защита от мошенничества',
				description: 'Комплексная система защиты ваших средств от мошенников',
				url: '/products/fraud-protection',
				category: 'service'
			},
			{
				id: 'secure-sms',
				name: 'Безопасные уведомления',
				description: 'Система верификации SMS-сообщений от банка',
				url: '/products/secure-sms',
				category: 'service'
			}
		],

		version: '1.0.0',
		createdAt: new Date('2024-09-26'),
		updatedAt: new Date('2024-09-26'),
		componentPath: '/games/code-to-success/CodeToSuccessGame.svelte',
		locale: 'ru'
	},

	{
		id: GAME_TYPES.QUIZ_SHIELD_RUBLE,
		name: 'Щит и Рубль',
		description: 'Научитесь распознавать фишинг, мошеннические звонки и SMS за 5 минут игры. Реальные сценарии + советы экспертов банка.',
		shortDescription: 'Квиз по безопасности',
		category: GAME_CATEGORIES.QUIZ,
		status: GAME_STATUS.ACTIVE,

		icon: {
			url: '/logos/quiz-shield-ruble.png',
			alt: 'Иконка Щит и Рубль',
			width: 64,
			height: 64
		},
		gradient: 'linear-gradient(135deg, var(--color-brand-600) 0%, var(--color-accent-400) 100%)',
		themeColor: 'var(--color-brand-600)',

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
		description: 'Собирайте финансовые символы три в ряд и открывайте банковские бонусы. Игровые бустеры = реальные продукты банка.',
		shortDescription: 'Головоломка',
		category: GAME_CATEGORIES.MATCH3,
		status: GAME_STATUS.ACTIVE,

		icon: {
			url: '/logos/match3-golden-reserve.png',
			alt: 'Иконка Золотой Запас',
			width: 64,
			height: 64
		},
		gradient: 'linear-gradient(135deg, var(--color-brand-700) 0%, color-mix(in srgb, var(--color-state-warning) 55%, white 45%) 100%)',
		themeColor: 'var(--color-state-warning)',

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
		componentPath: '/games/match3-golden-reserve/Match3Game.svelte',
		locale: 'ru'
	},

	{
		id: GAME_TYPES.CROSSWORD_FINANCIAL,
		name: 'Финансовая Грамота',
		description: 'Разгадывайте финансовые термины в стиле Wordle. ИИС, депозиты, инвестиции — осваивайте язык банкинга играя.',
		shortDescription: 'Интеллектуальная игра',
		category: GAME_CATEGORIES.CROSSWORD,
		status: GAME_STATUS.ACTIVE,

		icon: {
			url: '/logos/crossword-financial.png',
			alt: 'Иконка Финансовая Грамота',
			width: 64,
			height: 64
		},
		gradient: 'linear-gradient(135deg, var(--color-brand-500) 0%, var(--color-accent-300) 100%)',
		themeColor: 'var(--color-brand-500)',

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
		id: GAME_TYPES.ANTI_FRAUD_HUNTER,
		name: 'Стоп-мошенник',
		description: 'Реагируйте молниеносно: отличайте настоящие SMS банка от фальшивых. Прокачайте рефлексы финансовой безопасности.',
		shortDescription: 'Анти-фрод аркада',
		category: GAME_CATEGORIES.ACTION,
		status: GAME_STATUS.ACTIVE,

		icon: {
			url: '/logos/anti-fraud-hunter.png',
			alt: 'Иконка Стоп-мошенник',
			width: 64,
			height: 64
		},
		gradient: 'linear-gradient(135deg, var(--color-brand-700) 0%, color-mix(in srgb, var(--color-state-danger) 70%, white 30%) 100%)',
		themeColor: 'var(--color-state-danger)',

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