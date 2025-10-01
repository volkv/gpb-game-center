export type CellType = 'coin' | 'gold' | 'sapphire' | 'emerald';

export type GameStatus = 'playing' | 'targeting' | 'completed';

export interface Position {
	row: number;
	col: number;
}

export interface Cell {
	type: CellType;
	id: string;
	position: Position;
	isSelected?: boolean;
	isMatched?: boolean;
	isHighlighted?: boolean;
	isRecommended?: boolean;
	isSwapping?: boolean;
	swapDirection?: 'up' | 'down' | 'left' | 'right';
	isAnimating?: boolean;
	isFalling?: boolean;
	isBouncing?: boolean;
	isFading?: boolean;
	isAppearing?: boolean;
	isExploding?: boolean;
	animationDelay?: number;
}

export interface Match {
	cells: Cell[];
	type: 'horizontal' | 'vertical' | 'L' | 'T';
	length: number;
}

export interface MatchResult {
	matches: Match[];
	score: number;
	boosterCharge: number;
}

export interface BoosterState {
	charge: number;
	isActive: boolean;
	isReady: boolean;
}

export interface DemoState {
	isActive: boolean;
	currentStep: number;
	currentHint: string;
	recommendedMove: { from: Position; to: Position } | null;
	showingHint: boolean;
}

export interface GameSession {
	startTime: number;
	endTime?: number;
	duration?: number;
	totalMoves: number;
	finalScore: number;
	isCompleted: boolean;
	bestCombo: number;
	boosterUsed: boolean;
}

export interface Match3GameState {
	field: Cell[][];
	selectedCell: Position | null;
	score: number;
	moves: number;
	status: GameStatus;
	booster: BoosterState;
	targetScore: number;
	isAnimating: boolean;
	scoreBoost: {
		amount: number;
		visible: boolean;
	};
	demo: DemoState;
	session: GameSession;
}

export type Match3Status = GameStatus;
export type Match3State = Match3GameState;

export interface SwapAction {
	from: Position;
	to: Position;
	timestamp: number;
}

export interface GameAction {
	type: 'swap' | 'select' | 'booster' | 'reset';
	payload: any;
	timestamp: number;
}

export interface ValidationResult {
	isValid: boolean;
	error?: string;
	suggestions?: string[];
}

export interface MatchClassification {
	type: 'basic' | 'big' | 'huge';
	points: number;
	boosterBonus: number;
}

export interface SwapResult {
	success: boolean;
	field?: Cell[][];
	matches?: Position[][];
	points?: number;
	error?: string;
}

export interface AnimationState {
	isSwapping: boolean;
	isMatching: boolean;
	isFalling: boolean;
	isExploding: boolean;
}

export type MatchType = 'match_3' | 'match_4' | 'match_5_plus' | 'l_shape' | 't_shape';