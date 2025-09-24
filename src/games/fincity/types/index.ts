export type { PlayerData } from './PlayerData';
export type { Building } from './Building';
export { BuildingType } from './Building';
export type { Quest } from './Quest';
export { QuestType, QuestStatus } from './Quest';
export type { GameState } from './GameState';
export { GameScreen, GameMode } from './GameState';
export type { Achievement } from './Achievement';
export { AchievementType, AchievementCategory, AchievementStatus } from './Achievement';
export type * from './Game';
export type { IconName } from './Icon';

// Game engine types
export interface InteractionEvent {
  type: 'click' | 'hover' | 'drag' | 'zoom';
  position: { x: number; y: number };
  gridPosition?: { x: number; y: number };
  target?: string;
  data?: any;
}

export type LoadingProgressHandler = (progress: number, stage?: string) => void;