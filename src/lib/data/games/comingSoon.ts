import type { Game } from '$lib/types/Game.js';
import { GAME_TYPES, GAME_CATEGORIES, GAME_STATUS } from '$lib/utils/constants.js';

export const COMING_SOON_GAMES: Game[] = [
	{
		id: GAME_TYPES.DETECTIVE_BANKING,
		name: 'Банковский Детектив',
		description: 'Расследуйте финансовые инциденты: анализируйте операции, собирайте улики, раскрывайте схемы мошенников.',
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
		description: 'Управляйте инвестиционным портфелем: балансируйте риск и доходность, изучайте рыночные условия и достигайте целей.',
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
		id: GAME_TYPES.TOWER_SAVINGS,
		name: 'Башня Сбережений',
		description: 'Стройте башню из блоков доходов и расходов. Найдите баланс, создайте устойчивый финансовый фундамент.',
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
		description: 'Swipe-симулятор предпринимателя: факторинг, лизинг, кредиты. Принимайте бизнес-решения свайпом влево-вправо.',
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
		description: 'За 3-4 хода дойдите до финансовой цели: выбирайте вклады, ИИС, страхование. Найдите оптимальный путь.',
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