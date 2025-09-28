export const APP_CONFIG = {
	name: 'Игровой Центр Газпромбанка',
	version: '1.0.0',
	description: 'Интерактивная игровая платформа для обучения и развлечения',

	container: {
		maxWidth: 500,
		maxHeight: 1000,
		aspectRatio: '1:2'
	},

	api: {
		baseUrl: process.env.NODE_ENV === 'production'
			? 'https://api.gazprombank.ru/games'
			: 'http://localhost:3000',
		timeout: 10000,
		retries: 3
	},

	cache: {
		gameComponentTTL: 30 * 60 * 1000, // 30 minutes
		assetTTL: 60 * 60 * 1000, // 1 hour
		maxCacheSize: 50 * 1024 * 1024 // 50MB
	}
};

export const GAMES_CONFIG = {
	maxActiveGames: 5,
	maxComingSoonGames: 3,

	defaultSettings: {
		hints: 3,
		lives: 3,
		timeLimit: 300, // 5 minutes
		difficulty: 'medium' as const
	},

	scoring: {
		baseScore: 100,
		timeBonus: 10,
		hintPenalty: 20,
		accuracyMultiplier: 1.5
	}
};

export const ANIMATION_CONFIG = {
	durations: {
		fast: 150,
		normal: 300,
		slow: 500,
		page: 400
	},

	easing: {
		default: 'cubic-bezier(0.4, 0, 0.2, 1)',
		bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
		smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
	},

	delays: {
		stagger: 100,
		hover: 50
	}
};

export const UI_CONFIG = {
	breakpoints: {
		mobile: 480,
		tablet: 768,
		desktop: 1024
	},

	spacing: {
		xs: '0.5rem',
		sm: '0.75rem',
		md: '1rem',
		lg: '1.5rem',
		xl: '2rem',
		xxl: '3rem'
	},

	borderRadius: {
		sm: '0.5rem',
		md: '0.75rem',
		lg: '1rem',
		xl: '1.5rem',
		full: '9999px'
	},

	shadows: {
		sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
		md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
		lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
		xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
	}
};

export const GAME_TYPES = {
	QUIZ_SHIELD_RUBLE: 'quiz-shield-ruble',
	MATCH3_GOLDEN_RESERVE: 'match3-golden-reserve',
	CROSSWORD_FINANCIAL: 'crossword-financial',
	DETECTIVE_BANKING: 'detective-banking',
	INVESTMENT_STRATEGY: 'investment-strategy',
	FINCITY: 'fincity',
	ANTI_FRAUD_HUNTER: 'anti-fraud-hunter',
	CODE_TO_SUCCESS: 'code-to-success',
	TOWER_SAVINGS: 'tower-savings',
	BUSINESS_DRIVE: 'business-drive',
	DREAM_PATH: 'dream-path',
	ASSET_GUARDIAN: 'asset-guardian'
} as const;

export const GAME_CATEGORIES = {
	QUIZ: 'quiz',
	PUZZLE: 'puzzle',
	MATCH3: 'match3',
	CROSSWORD: 'crossword',
	EDUCATIONAL: 'educational',
	ACTION: 'action',
	VISUAL_NOVEL: 'visual-novel',
	STACKER: 'stacker',
	CARD: 'card',
	RUNNER: 'runner'
} as const;

export const GAME_STATUS = {
	ACTIVE: 'active',
	COMING_SOON: 'coming_soon',
	MAINTENANCE: 'maintenance',
	DISABLED: 'disabled'
} as const;

export const SESSION_STATUS = {
	IDLE: 'idle',
	LOADING: 'loading',
	PLAYING: 'playing',
	PAUSED: 'paused',
	COMPLETED: 'completed',
	FAILED: 'failed',
	ERROR: 'error'
} as const;

export const SCREEN_TYPES = {
	GAME_CENTER: 'game-center',
	GAME: 'game',
	LOADING: 'loading',
	ERROR: 'error'
} as const;

export const ERROR_CODES = {
	GAME_NOT_FOUND: 'GAME_NOT_FOUND',
	GAME_LOAD_FAILED: 'GAME_LOAD_FAILED',
	NETWORK_ERROR: 'NETWORK_ERROR',
	COMPONENT_ERROR: 'COMPONENT_ERROR',
	INVALID_STATE: 'INVALID_STATE',
	TIMEOUT: 'TIMEOUT'
} as const;

export const LOCAL_STORAGE_KEYS = {
	GAME_PROGRESS: 'gpb_game_progress',
	USER_SETTINGS: 'gpb_user_settings',
	HIGH_SCORES: 'gpb_high_scores',
	TUTORIAL_COMPLETED: 'gpb_tutorial_completed'
} as const;

export const EVENT_TYPES = {
	GAME_START: 'game:start',
	GAME_PAUSE: 'game:pause',
	GAME_RESUME: 'game:resume',
	GAME_COMPLETE: 'game:complete',
	GAME_EXIT: 'game:exit',
	SCORE_UPDATE: 'game:score_update',
	LEVEL_COMPLETE: 'game:level_complete',
	ERROR_OCCURRED: 'game:error'
} as const;

export const PERFORMANCE_THRESHOLDS = {
	gameLoadTime: 2000, // 2 seconds
	componentRenderTime: 100, // 100ms
	animationFrameRate: 60, // fps
	memoryUsage: 100 * 1024 * 1024 // 100MB
};

export const QUIZ_CONFIG = {
	maxQuestions: 5,
	timePerQuestion: 30, // seconds
	passingScore: 0.8, // 80%
	categories: ['security', 'investment', 'cards', 'loans', 'savings']
};

export const MATCH3_CONFIG = {
	gridSize: { width: 8, height: 8 },
	minMatchSize: 3,
	maxMoves: 20,
	scoreTargets: [1000, 2000, 3000]
};

export const CROSSWORD_CONFIG = {
	gridSize: { width: 6, height: 6 },
	maxAttempts: 6,
	wordLength: 5,
	categories: ['finance', 'banking', 'investment']
};

export const ACCESSIBILITY_CONFIG = {
	minTouchTarget: 44, // pixels
	maxTextContrast: 7, // WCAG AA
	reducedMotionSupport: true,
	screenReaderSupport: true,
	keyboardNavigation: true
};

export const DEVELOPMENT_CONFIG = {
	enableDebugMode: process.env.NODE_ENV === 'development',
	enablePerformanceMonitoring: true,
	enableErrorReporting: process.env.NODE_ENV === 'production',
	logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'error'
};

export type GameType = typeof GAME_TYPES[keyof typeof GAME_TYPES];
export type GameCategory = typeof GAME_CATEGORIES[keyof typeof GAME_CATEGORIES];
export type GameStatus = typeof GAME_STATUS[keyof typeof GAME_STATUS];
export type SessionStatus = typeof SESSION_STATUS[keyof typeof SESSION_STATUS];
export type ScreenType = typeof SCREEN_TYPES[keyof typeof SCREEN_TYPES];
export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];
export type EventType = typeof EVENT_TYPES[keyof typeof EVENT_TYPES];