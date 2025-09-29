import type { CellType } from './types';

export const GAME_CONFIG = {
	WORLD_WIDTH: 400,
	WORLD_HEIGHT: 400,
	CELL_SIZE: 40,
	GRID_WIDTH: 10,
	GRID_HEIGHT: 10,
	INITIAL_LIVES: 3,
	LEVEL_TIME_LIMIT: 120,
	MAX_LEVELS: 10
} as const;

export const BALL_CONFIG = {
	RADIUS: 12,
	MASS: 1.2,
	INITIAL_ENERGY: 100,
	MAX_VELOCITY: 180,
	MIN_VELOCITY: 0.5,
	FRICTION_COEFFICIENT: 0.988,
	RESTITUTION: 0.65,
	COLLISION_DAMPENING: 0.85
} as const;

export const PHYSICS_CONFIG = {
	GRAVITY_STRENGTH: 180,
	MAX_GRAVITY: 350,
	AIR_RESISTANCE: 0.9985,
	WALL_RESTITUTION: 0.75,
	WALL_FRICTION: 0.4,
	COLLISION_TOLERANCE: 3,
	PHYSICS_STEP: 1/60,
	BOUNCE_ENERGY_LOSS: 0.15,
	SURFACE_FRICTION: {
		SMOOTH: 0.1,
		NORMAL: 0.3,
		ROUGH: 0.6
	}
} as const;

export const GYROSCOPE_CONFIG = {
	CALIBRATION_TIME: 3000,
	SENSITIVITY: 0.015,
	DEAD_ZONE: 5.0,
	MAX_TILT: Math.PI / 2,
	SMOOTHING_FACTOR: 0.75,
	FALLBACK_TOUCH_SENSITIVITY: 0.03
} as const;

export const SCORE_VALUES = {
	BONUS_CASHBACK: 100,
	BONUS_DEPOSIT: 150,
	TRAP_PENALTY: -50,
	LEVEL_COMPLETE: 500,
	PERFECT_LEVEL: 1000,
	TIME_BONUS_PER_SECOND: 10,
	BANKING_LESSON_BONUS: 200
} as const;

export const CELL_TYPES: readonly CellType[] = [
	'empty', 'wall', 'start', 'finish',
	'cashback', 'deposit', 'trap_phishing', 'trap_fraud'
] as const;

export const CELL_COLORS = {
	empty: 'transparent',
	wall: '#2C3E50',
	start: '#27AE60',
	finish: '#F39C12',
	cashback: '#1ABC9C',
	deposit: '#3498DB',
	trap_phishing: '#E74C3C',
	trap_fraud: '#C0392B'
} as const;

export const CELL_LABELS = {
	empty: '',
	wall: 'Стена',
	start: 'Старт',
	finish: 'Банковский Сейф',
	cashback: 'Кэшбэк',
	deposit: 'Проценты по Вкладу',
	trap_phishing: 'Фишинговая Ссылка',
	trap_fraud: 'Мошенники'
} as const;

export const ANIMATION_DURATIONS = {
	BALL_BOUNCE: 200,
	BONUS_COLLECT: 300,
	TRAP_HIT: 400,
	LEVEL_TRANSITION: 800,
	EXPLOSION_PARTICLE: 600,
	SCORE_UPDATE: 500,
	PERSPECTIVE_TILT: 150,
	SHADOW_UPDATE: 100,
	HIGHLIGHT_PULSE: 1000,
	OBJECT_REMOVAL: 300,
	HAPTIC_FEEDBACK: 50
} as const;

export const VISUAL_EFFECTS = {
	PERSPECTIVE_INTENSITY: 600,
	MAX_TILT_ANGLE: 15,
	SHADOW_INTENSITY: 0.3,
	SHADOW_BLUR: 8,
	HIGHLIGHT_INTENSITY: 0.7,
	BALL_GLOW_RADIUS: 15,
	PARTICLE_COUNT: 12,
	SCREEN_SHAKE_INTENSITY: 5
} as const;

export const BANKING_PRODUCTS = {
	FRAUD_PROTECTION: {
		id: 'fraud_protection',
		name: 'Защита от Мошенничества',
		description: 'Комплексная защита от финансового мошенничества',
		category: 'fraud_protection' as const,
		icon: '🛡️',
		gameBonus: {
			type: 'shield' as const,
			duration: 10000,
			value: 1,
			triggerCondition: 'trap_hit' as const
		}
	},
	INVESTMENT_PORTFOLIO: {
		id: 'investment_portfolio',
		name: 'Инвестиционный Портфель',
		description: 'Диверсифицированные инвестиционные решения',
		category: 'investment' as const,
		icon: '📈',
		gameBonus: {
			type: 'multiplier' as const,
			duration: 15000,
			value: 2,
			triggerCondition: 'combo' as const
		}
	},
	DEPOSIT_ACCOUNT: {
		id: 'deposit_account',
		name: 'Депозитный Счет',
		description: 'Надежные сбережения с гарантированным доходом',
		category: 'deposit' as const,
		icon: '🏦',
		gameBonus: {
			type: 'extra_life' as const,
			duration: 0,
			value: 1,
			triggerCondition: 'level_complete' as const
		}
	},
	CASHBACK_CARD: {
		id: 'cashback_card',
		name: 'Карта с Кэшбэком',
		description: 'Возврат части средств от покупок',
		category: 'cashback' as const,
		icon: '💳',
		gameBonus: {
			type: 'slow_time' as const,
			duration: 20000,
			value: 0.5,
			triggerCondition: 'time_low' as const
		}
	}
} as const;

export type BankingProductsRecord = typeof BANKING_PRODUCTS;

export const HAPTIC_PATTERNS = {
	LIGHT: { type: 'light' as const, pattern: 'single' as const },
	MEDIUM: { type: 'medium' as const, pattern: 'single' as const },
	HEAVY: { type: 'heavy' as const, pattern: 'single' as const },
	SUCCESS: { type: 'medium' as const, pattern: 'success' as const },
	ERROR: { type: 'heavy' as const, pattern: 'error' as const },
	BONUS_COLLECT: { type: 'light' as const, pattern: 'double' as const },
	TRAP_HIT: { type: 'heavy' as const, pattern: 'single' as const },
	LEVEL_COMPLETE: { type: 'medium' as const, pattern: 'success' as const }
} as const;

export const UI_CONFIG = {
	INSTRUCTION_TIMEOUT: 8000,
	PAUSE_MENU_FADE: 300,
	LEVEL_COMPLETE_DELAY: 1500,
	GAME_OVER_DELAY: 2000,
	TOAST_DURATION: 3000,
	BUTTON_PRESS_FEEDBACK: 100
} as const;

export const LEVEL_DIFFICULTY = {
	EASY: {
		timeLimit: 180,
		bonusCount: 8,
		trapCount: 3,
		scoreMultiplier: 1.0
	},
	MEDIUM: {
		timeLimit: 120,
		bonusCount: 6,
		trapCount: 5,
		scoreMultiplier: 1.2
	},
	HARD: {
		timeLimit: 90,
		bonusCount: 4,
		trapCount: 8,
		scoreMultiplier: 1.5
	}
} as const;

export const COLLISION_CATEGORIES = {
	BALL: 0x0001,
	WALL: 0x0002,
	BONUS: 0x0004,
	TRAP: 0x0008,
	FINISH: 0x0010,
	BOUNDARY: 0x0020
} as const;

export const PARTICLE_CONFIG = {
	BONUS_PARTICLES: 8,
	TRAP_PARTICLES: 12,
	FINISH_PARTICLES: 16,
	PARTICLE_SPEED: 100,
	PARTICLE_LIFE: 1000,
	GRAVITY_EFFECT: 0.5,
	SIZE_VARIATION: 0.3
} as const;

export const VALIDATION_MESSAGES = {
	INVALID_LEVEL: 'Некорректная конфигурация уровня',
	GYROSCOPE_NOT_SUPPORTED: 'Гироскоп не поддерживается устройством',
	PHYSICS_ENGINE_ERROR: 'Ошибка физического движка',
	GAME_STATE_CORRUPTED: 'Состояние игры повреждено',
	COLLISION_DETECTION_FAILED: 'Ошибка определения столкновений'
} as const;

export const PERFORMANCE_THRESHOLDS = {
	MAX_PHYSICS_DELTA: 33.33,
	MAX_RENDER_TIME: 16.67,
	MIN_FPS: 30,
	MEMORY_WARNING_MB: 50,
	GC_TRIGGER_INTERVAL: 30000
} as const;