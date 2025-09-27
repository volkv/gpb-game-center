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
		gradient: 'linear-gradient(135deg, var(--color-brand-800) 0%, rgba(15, 169, 194, 0.72) 100%)',
		themeColor: 'var(--color-brand-800)',

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
		gradient: 'linear-gradient(135deg, color-mix(in srgb, var(--color-accent-500) 65%, white 35%) 0%, color-mix(in srgb, var(--color-brand-500) 45%, white 55%) 100%)',
		themeColor: 'var(--color-accent-600)',

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
	},

	{
		id: GAME_TYPES.CODE_TO_SUCCESS,
		name: 'Код к Успеху',
		description: 'Интерактивная визуальная новелла о кибербезопасности и защите от мошенничества. Проживите историю героини Анны и научитесь распознавать мошеннические схемы.',
		shortDescription: 'Визуальная новелла',
		category: GAME_CATEGORIES.VISUAL_NOVEL,
		status: GAME_STATUS.ACTIVE,

		icon: {
			url: '/games/code-to-success/icon.svg',
			alt: 'Иконка Код к Успеху',
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
		id: GAME_TYPES.TOWER_SAVINGS,
		name: 'Башня Сбережений',
		description: 'Аркадная головоломка в стиле Stacker. Стройте башню из блоков доходов и расходов, создавая устойчивый финансовый фундамент.',
		shortDescription: 'Аркадная головоломка',
		category: GAME_CATEGORIES.STACKER,
		status: GAME_STATUS.COMING_SOON,

		icon: {
			url: '/games/tower-savings/icon.svg',
			alt: 'Иконка Башня Сбережений',
			width: 64,
			height: 64
		},
		gradient: 'linear-gradient(135deg, var(--color-brand-500) 0%, color-mix(in srgb, var(--color-state-success) 60%, white 40%) 100%)',
		themeColor: 'var(--color-state-success)',

		metrics: {
			averagePlayTime: 420,
			completionRate: 0.0,
			difficulty: 'medium',
			maxScore: 3000,
			averageScore: 0
		},
		estimatedDuration: 7,

		relatedProducts: [
			{
				id: 'savings-deposit',
				name: 'Накопительный вклад',
				description: 'Надежное основание для ваших сбережений',
				url: '/products/deposit',
				category: 'deposit'
			},
			{
				id: 'investment-funds',
				name: 'Паевые инвестиционные фонды',
				description: 'Растущие инвестиционные блоки для вашей башни',
				url: '/products/pif',
				category: 'investment'
			},
			{
				id: 'emergency-fund',
				name: 'Подушка безопасности',
				description: 'Защита от финансовых падений',
				url: '/products/emergency',
				category: 'service'
			}
		],

		version: '1.0.0',
		createdAt: new Date('2024-09-27'),
		updatedAt: new Date('2024-09-27'),
		componentPath: '/games/tower-savings/TowerSavingsGame.svelte',
		locale: 'ru'
	},

	{
		id: GAME_TYPES.BUSINESS_DRIVE,
		name: 'Бизнес-Драйв',
		description: 'Карточный симулятор с swipe-механикой для предпринимателей. Принимайте решения в бизнес-ситуациях и изучайте банковские инструменты для МСБ.',
		shortDescription: 'Карточный симулятор',
		category: GAME_CATEGORIES.CARD,
		status: GAME_STATUS.COMING_SOON,

		icon: {
			url: '/games/business-drive/icon.svg',
			alt: 'Иконка Бизнес-Драйв',
			width: 64,
			height: 64
		},
		gradient: 'linear-gradient(135deg, var(--color-brand-700) 0%, var(--color-accent-500) 100%)',
		themeColor: 'var(--color-accent-600)',

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
				id: 'factoring',
				name: 'Факторинг',
				description: 'Решение кассовых разрывов для бизнеса',
				url: '/products/factoring',
				category: 'service'
			},
			{
				id: 'business-credit',
				name: 'Кредит на пополнение оборотных средств',
				description: 'Финансирование для развития бизнеса',
				url: '/products/business-credit',
				category: 'credit'
			},
			{
				id: 'leasing',
				name: 'Лизинг оборудования',
				description: 'Приобретение оборудования без больших вложений',
				url: '/products/leasing',
				category: 'service'
			},
			{
				id: 'acquiring',
				name: 'Торговый эквайринг',
				description: 'Прием безналичных платежей от клиентов',
				url: '/products/acquiring',
				category: 'service'
			}
		],

		version: '1.0.0',
		createdAt: new Date('2024-09-27'),
		updatedAt: new Date('2024-09-27'),
		componentPath: '/games/business-drive/BusinessDriveGame.svelte',
		locale: 'ru'
	},

	{
		id: GAME_TYPES.DREAM_PATH,
		name: 'Путь к Мечте',
		description: 'Map-ранер стратегия для достижения финансовых целей. За 3-4 хода дойдите до цели, выбирая оптимальные инвестиционные инструменты.',
		shortDescription: 'Стратегический ранер',
		category: GAME_CATEGORIES.RUNNER,
		status: GAME_STATUS.COMING_SOON,

		icon: {
			url: '/games/dream-path/icon.svg',
			alt: 'Иконка Путь к Мечте',
			width: 64,
			height: 64
		},
		gradient: 'linear-gradient(135deg, var(--color-accent-500) 0%, color-mix(in srgb, var(--color-brand-500) 70%, white 30%) 100%)',
		themeColor: 'var(--color-accent-500)',

		metrics: {
			averagePlayTime: 180,
			completionRate: 0.0,
			difficulty: 'easy',
			maxScore: 500,
			averageScore: 0
		},
		estimatedDuration: 3,

		relatedProducts: [
			{
				id: 'term-deposit',
				name: 'Срочный вклад',
				description: 'Фиксированная доходность для краткосрочных целей',
				url: '/products/term-deposit',
				category: 'deposit'
			},
			{
				id: 'iis',
				name: 'Индивидуальный инвестиционный счёт',
				description: 'ИИС с налоговыми льготами',
				url: '/products/iis',
				category: 'investment'
			},
			{
				id: 'life-insurance',
				name: 'Страхование жизни с накоплением',
				description: 'Долгосрочное накопление с защитой',
				url: '/products/life-insurance',
				category: 'insurance'
			}
		],

		version: '1.0.0',
		createdAt: new Date('2024-09-27'),
		updatedAt: new Date('2024-09-27'),
		componentPath: '/games/dream-path/DreamPathGame.svelte',
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
