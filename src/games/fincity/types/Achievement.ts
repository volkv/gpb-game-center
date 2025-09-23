export enum AchievementType {
  BUILDING = 'building',
  RESOURCE = 'resource',
  QUEST = 'quest',
  LEVEL = 'level',
  COLLECTION = 'collection',
  TUTORIAL = 'tutorial',
  SPECIAL = 'special'
}

export enum AchievementCategory {
  GENERAL = 'general',
  BUILDINGS = 'buildings',
  RESOURCES = 'resources',
  QUESTS = 'quests',
  PROGRESSION = 'progression',
  EDUCATION = 'education'
}

export enum AchievementStatus {
  LOCKED = 'locked',
  AVAILABLE = 'available',
  UNLOCKED = 'unlocked'
}

export interface AchievementReward {
  coins?: number;
  crystals?: number;
  experience?: number;
  title?: string;
}

export interface AchievementCondition {
  type: 'buildings_built' | 'coins_collected' | 'quests_completed' | 'level_reached' | 'tutorial_completed' | 'specific_building' | 'specific_quest' | 'product_learned' | 'crystals_collected' | 'products_learned' | 'building_type_built';
  target: string | number;
  amount?: number;
  buildingType?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  type: AchievementType;
  category: AchievementCategory;
  status: AchievementStatus;
  conditions: AchievementCondition[];
  rewards: AchievementReward;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockDate?: number;
  progress?: number;
  maxProgress: number;
}

export interface AchievementStats {
  totalUnlocked: number;
  totalAvailable: number;
  completionPercentage: number;
  recentUnlocks: Achievement[];
}