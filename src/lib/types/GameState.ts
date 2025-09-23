export type GameSessionStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'completed' | 'failed' | 'error';

export type LoadingState = 'idle' | 'loading' | 'loaded' | 'error';

export interface GameScore {
  current: number;
  best: number;
  multiplier?: number;
}

export interface GameProgress {
  currentLevel: number;
  currentQuestion?: number;
  totalQuestions?: number;
  totalLevels?: number;
  percentage: number; // 0-100
}

export interface GameTime {
  startTime?: Date;
  endTime?: Date;
  elapsed: number; // в секундах
  remaining?: number; // в секундах, для игр с таймером
}

export interface GameResults {
  score: number;
  maxScore: number;
  accuracy?: number; // 0-1
  correctAnswers?: number;
  totalAnswers?: number;
  timeBonus?: number;
  grade?: 'A' | 'B' | 'C' | 'D' | 'F';
  achievements?: string[];
}

export interface GameError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
  recoverable: boolean;
}

export interface GameState {
  // Основное состояние
  status: GameSessionStatus;
  loadingState: LoadingState;

  // Игровые данные
  score: GameScore;
  progress: GameProgress;
  time: GameTime;

  // Результаты (заполняется в конце игры)
  results?: GameResults;

  // Ошибки
  error?: GameError;

  // Настройки сессии
  difficulty?: 'easy' | 'medium' | 'hard';
  hints: number;
  lives?: number;

  // Мета информация
  sessionId: string;
  gameId: string;
  userId?: string;
  deviceId?: string;

  // Дополнительные данные (специфичные для каждой игры)
  gameData?: Record<string, any>;
}

export interface GameAction {
  type: string;
  payload?: any;
  timestamp: Date;
  sessionId: string;
}

export interface GameStateMachine {
  currentState: GameState;
  previousState?: GameState;
  actions: GameAction[];
}

// Утилитарные типы для состояний
export type GameStateSlice<T extends keyof GameState> = Pick<GameState, T>;

export type PartialGameState = Partial<GameState>;

export type GameStateUpdater = (state: GameState) => GameState;

// Валидаторы состояний
export type StateValidator = (state: GameState) => boolean;

export type StateTransition = {
  from: GameSessionStatus;
  to: GameSessionStatus;
  validator?: StateValidator;
  action?: GameAction['type'];
};