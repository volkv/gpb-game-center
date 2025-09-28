import type { CellType, MatchClassification } from './types';

export const GAME_CONFIG = {
	FIELD_SIZE: 8,
	TARGET_SCORE: 4800,
	INITIAL_MOVES: 6,
	BOOSTER_MAX_CHARGE: 100,
	MIN_MATCH_LENGTH: 3
} as const;

export const CELL_TYPES: readonly CellType[] = ['coin', 'sapphire', 'emerald', 'gold'] as const;

export const SCORE_VALUES = {
	MATCH_3: 120,
	MATCH_4: 350,
	MATCH_5_PLUS: 600,
	BOOSTER_USE: 1200
} as const;

export const BOOSTER_CHARGE_VALUES = {
	MATCH_4: 35,
	MATCH_5_PLUS: 55,
	L_T_SHAPES: 45
} as const;

export const MATCH_CLASSIFICATIONS: Record<number, MatchClassification> = {
	3: {
		type: 'basic',
		points: SCORE_VALUES.MATCH_3,
		boosterBonus: 0
	},
	4: {
		type: 'big',
		points: SCORE_VALUES.MATCH_4,
		boosterBonus: BOOSTER_CHARGE_VALUES.MATCH_4
	},
	5: {
		type: 'huge',
		points: SCORE_VALUES.MATCH_5_PLUS,
		boosterBonus: BOOSTER_CHARGE_VALUES.MATCH_5_PLUS
	}
} as const;

export const ANIMATION_DURATIONS = {
	CELL_SWAP: 250,
	CELL_FALL: 300,
	CELL_BOUNCE: 120,
	MATCH_DISAPPEAR: 180,
	MATCH_FADE: 250,
	BOOSTER_EXPLOSION: 500,
	EXPLOSION_PARTICLE: 400,
	EXPLOSION_FLASH: 150,
	SCORE_UPDATE: 300,
	SCORE_COUNT: 600,
	SELECTED_PULSE: 1200,
	INVALID_SHAKE: 300,
	CELL_HOVER: 150,
	BOOSTER_GLOW: 1500,
	BOOSTER_SHIMMER: 1200,
	CASCADE_DELAY: 40,
	DROP_STAGGER: 60
} as const;

export const BOOSTER_CONFIG = {
	EXPLOSION_RADIUS: 1,
	READY_THRESHOLD: 100,
	NAME: 'Газпромбанк Бонус',
	ICON: '🚀'
} as const;

export const VALIDATION_MESSAGES = {
	INVALID_POSITION: 'Неверная позиция на поле',
	CELLS_NOT_ADJACENT: 'Клетки должны быть соседними',
	NO_MATCH_POSSIBLE: 'Комбинация невозможна',
	GAME_OVER: 'Игра завершена',
	BOOSTER_NOT_READY: 'Бустер не готов к использованию'
} as const;

export const UI_CONFIG = {
	CELL_ANIMATION_DELAY: 50,
	MATCH_HIGHLIGHT_DURATION: 800,
	SWAP_FEEDBACK_DURATION: 300,
	SELECTION_TIMEOUT: 5000
} as const;

export const PARTICLE_CONFIG = {
	EXPLOSION_PARTICLES: 8,
	PARTICLE_SPREAD: 80,
	PARTICLE_SPEED: 120,
	GRAVITY: 0.8,
	BOUNCE_DAMPING: 0.6
} as const;

export const VISUAL_EFFECTS = {
	SCREEN_SHAKE_INTENSITY: 3,
	FLASH_OPACITY: 0.8,
	GLOW_RADIUS: 20,
	SHIMMER_SPEED: 1.2,
	WAVE_AMPLITUDE: 4
} as const;