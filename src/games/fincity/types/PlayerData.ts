import type { Building } from './Building';

export interface PlayerResources {
  coins: number;
  crystals: number;
  energy: number;
  maxEnergy: number;
  experience: number;
}

export interface PlayerData {
  cityName: string;
  userName: string;
  level: number;
  resources: PlayerResources;
  buildings: Building[];
  completedQuests: string[];
  activeQuests: string[];
  unlockedBuildings: string[];
  lastSave: number;
  tutorialCompleted: boolean;
  achievements: string[];
}

export interface PlayerStats {
  totalBuildingsBuilt: number;
  totalCoinsEarned: number;
  totalCrystalsEarned: number;
  totalQuestsCompleted: number;
  playTime: number;
  firstLoginDate: number;
}