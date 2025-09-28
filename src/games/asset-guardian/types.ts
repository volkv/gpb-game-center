export type GameStatus = 'loading' | 'ready' | 'playing' | 'paused' | 'completed' | 'failed';

export interface Position {
	x: number;
	y: number;
}

export interface GridPosition {
	row: number;
	col: number;
}

export type CellType = 'empty' | 'wall' | 'start' | 'finish' | 'cashback' | 'deposit' | 'trap_phishing' | 'trap_fraud';

export interface LevelCell {
	type: CellType;
	position: GridPosition;
	isActivated?: boolean;
	isCollected?: boolean;
	value?: number;
}

export interface Ball {
	position: Position;
	velocity: Position;
	radius: number;
	mass: number;
	isMoving: boolean;
	energy: number;
}

export interface GyroscopeData {
	alpha: number;
	beta: number;
	gamma: number;
	timestamp: number;
}

export interface Gravity {
	x: number;
	y: number;
	intensity: number;
}

export interface LevelConfig {
	id: number;
	name: string;
	difficulty: 'easy' | 'medium' | 'hard';
	grid: CellType[][];
	timeLimit: number;
	targetScore: number;
	startPosition: GridPosition;
	finishPosition: GridPosition;
	bankingTheme: {
		product: string;
		lesson: string;
	};
}

export interface GameProgress {
	currentLevel: number;
	score: number;
	lives: number;
	timeRemaining: number;
	bonusesCollected: number;
	trapsHit: number;
	perfectLevels: number;
}

export interface CollisionResult {
	type: 'bonus' | 'trap' | 'wall' | 'finish';
	position: Position;
	value: number;
	effect: 'score' | 'life' | 'time' | 'complete';
}

export interface VisualEffects {
	perspective: {
		x: number;
		y: number;
		intensity: number;
	};
	shadow: {
		offsetX: number;
		offsetY: number;
		scaleY: number;
		opacity: number;
	};
	ballHighlight: {
		offsetX: number;
		offsetY: number;
		intensity: number;
	};
}

export interface GameSession {
	sessionId: string;
	startTime: number;
	endTime?: number;
	duration?: number;
	level: number;
	finalScore: number;
	bonusesCollected: number;
	trapsHit: number;
	isCompleted: boolean;
	bankingProductInteraction?: string;
}

export interface AssetGuardianGameState {
	status: GameStatus;
	currentLevel: LevelConfig | null;
	ball: Ball;
	gravity: Gravity;
	progress: GameProgress;
	visualEffects: VisualEffects;
	activeBonuses: Map<string, ActiveBonus>;
	gyroscope: {
		isSupported: boolean;
		isActive: boolean;
		calibration: GyroscopeData | null;
		currentData: GyroscopeData | null;
	};
	physics: {
		worldBounds: {
			width: number;
			height: number;
		};
		friction: number;
		restitution: number;
		airResistance: number;
	};
	ui: {
		showInstructions: boolean;
		showPauseMenu: boolean;
		showLevelComplete: boolean;
		showGameOver: boolean;
		selectedBankingProduct?: string;
	};
	session: GameSession;
}

export interface InputState {
	gyroscope: GyroscopeData | null;
	touch: Position | null;
	mouse: Position | null;
	fallbackActive: boolean;
}

export interface LevelResult {
	completed: boolean;
	score: number;
	timeUsed: number;
	bonusesCollected: number;
	trapsHit: number;
	rating: 1 | 2 | 3;
	bankingLessonLearned: boolean;
}

export interface PhysicsBody {
	id: string;
	type: 'ball' | 'wall' | 'bonus' | 'trap' | 'finish';
	position: Position;
	velocity?: Position;
	radius?: number;
	width?: number;
	height?: number;
	mass?: number;
	isStatic: boolean;
	restitution: number;
	friction: number;
}

export interface HapticFeedback {
	type: 'light' | 'medium' | 'heavy';
	pattern?: 'single' | 'double' | 'success' | 'error';
}

export interface GameAction {
	type: 'start' | 'pause' | 'resume' | 'restart' | 'next_level' | 'collect_bonus' | 'hit_trap' | 'finish_level';
	payload?: any;
	timestamp: number;
}

export interface ValidationResult {
	isValid: boolean;
	error?: string;
	suggestions?: string[];
}

export interface BankingProduct {
	id: string;
	name: string;
	description: string;
	category: 'fraud_protection' | 'investment' | 'deposit' | 'cashback';
	gameBonus: {
		type: 'shield' | 'multiplier' | 'extra_life' | 'slow_time';
		duration: number;
		value: number;
		triggerCondition: string;
	};
}

export interface ActiveBonus {
	id: string;
	type: 'shield' | 'multiplier' | 'extra_life' | 'slow_time';
	name: string;
	icon: string;
	duration: number;
	startTime: number;
	value: number;
	isActive: boolean;
	remainingTime: number;
}

export interface PlayerStats {
	totalScore: number;
	totalPlayTime: number;
	levelsCompleted: number;
	perfectRuns: number;
	totalBonusesCollected: number;
	totalTrapsHit: number;
	averageScore: number;
	bestSpeedRun: number;
	favoriteLevel: number;
	efficiency: number;
	bankingProductsStudied: string[];
	lastPlayedDate: number;
	totalSessions: number;
	currentStreak: number;
	bestStreak: number;
}

export interface HighScore {
	score: number;
	level: number;
	date: number;
	timeUsed: number;
	perfectRun: boolean;
	difficulty: 'easy' | 'medium' | 'hard';
	playerStats: {
		bonusesCollected: number;
		trapsHit: number;
		bankingLessonCompleted: boolean;
	};
}

export interface Achievement {
	id: string;
	name: string;
	description: string;
	icon: string;
	category: 'score' | 'speed' | 'efficiency' | 'banking' | 'streak' | 'exploration';
	rarity: 'common' | 'rare' | 'epic' | 'legendary';
	unlockedAt?: number;
	isUnlocked: boolean;
	progress: number;
	maxProgress: number;
	condition: {
		type: 'score' | 'perfect_runs' | 'speed' | 'banking_products' | 'streak' | 'total_levels';
		value: number;
		operator: '>=' | '>' | '==' | '<=' | '<';
	};
	reward: {
		type: 'points' | 'title' | 'unlock';
		value: number;
		description: string;
	};
}

export interface ProgressData {
	version: string;
	playerStats: PlayerStats;
	highScores: {
		overall: HighScore[];
		byLevel: Record<number, HighScore>;
		speedRuns: HighScore[];
	};
	achievements: Record<string, Achievement>;
	unlockedContent: {
		levels: number[];
		achievements: string[];
		titles: string[];
	};
	preferences: {
		gyroscopeEnabled: boolean;
		hapticFeedbackEnabled: boolean;
		soundEnabled: boolean;
		difficultyPreference: 'easy' | 'medium' | 'hard';
	};
	metadata: {
		createdAt: number;
		lastUpdatedAt: number;
		dataVersion: number;
		migrationHistory: string[];
	};
}

export interface ScoringEvent {
	type: 'level_complete' | 'perfect_run' | 'speed_record' | 'achievement_unlock' | 'banking_lesson';
	levelId: number;
	score: number;
	timeUsed: number;
	bonusesCollected: number;
	trapsHit: number;
	bankingProductUsed?: string;
	timestamp: number;
}

export interface LeaderboardEntry {
	rank: number;
	playerName: string;
	score: number;
	level: number;
	date: number;
	achievements: string[];
}