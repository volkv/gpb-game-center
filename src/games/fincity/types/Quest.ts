export enum QuestType {
  TUTORIAL = 'tutorial',
  BUILD = 'build',
  COLLECT = 'collect',
  EXPLORE = 'explore',
  UPGRADE = 'upgrade'
}

export enum QuestStatus {
  LOCKED = 'locked',
  AVAILABLE = 'available',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}

export interface QuestReward {
  coins?: number;
  crystals?: number;
  experience?: number;
  unlockBuilding?: string;
}

export interface QuestRequirement {
  type: 'build' | 'collect' | 'level' | 'building_count' | 'learn_product';
  target: string | number;
  amount?: number;
  currentAmount?: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: QuestType;
  status: QuestStatus;
  requirements: QuestRequirement[];
  rewards: QuestReward;
  isMainQuest: boolean;
  order: number;
}