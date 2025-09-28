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
	};
}