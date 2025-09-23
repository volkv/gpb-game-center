import { writable, derived } from 'svelte/store';
import type { PlayerData, PlayerResources } from '../types/PlayerData';
import type { Building } from '../types/Building';
import { checkAchievements } from './achievements';

const initialPlayerData: PlayerData = {
  cityName: 'Новый город',
  userName: 'Клиент',
  level: 1,
  resources: {
    coins: 1000,
    crystals: 50,
    energy: 100,
    maxEnergy: 100,
    experience: 0
  },
  buildings: [],
  completedQuests: [],
  activeQuests: [],
  unlockedBuildings: ['central_bank'],
  lastSave: Date.now(),
  tutorialCompleted: false,
  achievements: []
};

export const playerData = writable<PlayerData>(initialPlayerData);

export const resources = derived(playerData, $playerData => $playerData.resources);
export const level = derived(playerData, $playerData => $playerData.level);
export const cityName = derived(playerData, $playerData => $playerData.cityName);
export const userName = derived(playerData, $playerData => $playerData.userName);
export const buildings = derived(playerData, $playerData => $playerData.buildings);

export const experienceToNextLevel = derived(level, $level => {
  return $level * 100;
});

export const canAfford = derived(resources, $resources => {
  return (cost: { coins?: number; crystals?: number; energy?: number }) => {
    const coinsOk = !cost.coins || $resources.coins >= cost.coins;
    const crystalsOk = !cost.crystals || $resources.crystals >= cost.crystals;
    const energyOk = !cost.energy || $resources.energy >= cost.energy;
    return coinsOk && crystalsOk && energyOk;
  };
});

export function updateResources(changes: Partial<PlayerResources>) {
  playerData.update(data => ({
    ...data,
    resources: { ...data.resources, ...changes }
  }));
}

export function addResources(amount: { coins?: number; crystals?: number; energy?: number; experience?: number }) {
  playerData.update(data => {
    const newResources = { ...data.resources };

    if (amount.coins) newResources.coins += amount.coins;
    if (amount.crystals) newResources.crystals += amount.crystals;
    if (amount.energy) {
      newResources.energy = Math.min(newResources.energy + amount.energy, newResources.maxEnergy);
    }
    if (amount.experience) newResources.experience += amount.experience;

    return { ...data, resources: newResources };
  });

  checkAchievements();
}

export function spendResources(cost: { coins?: number; crystals?: number; energy?: number }) {
  playerData.update(data => {
    const newResources = { ...data.resources };

    if (cost.coins) newResources.coins -= cost.coins;
    if (cost.crystals) newResources.crystals -= cost.crystals;
    if (cost.energy) newResources.energy -= cost.energy;

    return { ...data, resources: newResources };
  });
}

export function setCityName(name: string) {
  playerData.update(data => ({
    ...data,
    cityName: name
  }));
}

export function setUserName(name: string) {
  playerData.update(data => ({
    ...data,
    userName: name
  }));
}

export function addCompletedQuest(questId: string) {
  playerData.update(data => ({
    ...data,
    completedQuests: [...data.completedQuests, questId],
    activeQuests: data.activeQuests.filter(id => id !== questId)
  }));
}

export function addActiveQuest(questId: string) {
  playerData.update(data => ({
    ...data,
    activeQuests: [...data.activeQuests, questId]
  }));
}

export function unlockBuilding(buildingType: string) {
  playerData.update(data => ({
    ...data,
    unlockedBuildings: [...data.unlockedBuildings, buildingType]
  }));
}

export function checkLevelUp() {
  playerData.update(data => {
    const requiredXP = data.level * 100;
    if (data.resources.experience >= requiredXP) {
      return {
        ...data,
        level: data.level + 1,
        resources: {
          ...data.resources,
          experience: data.resources.experience - requiredXP,
          maxEnergy: data.resources.maxEnergy + 10
        }
      };
    }
    return data;
  });

  checkAchievements();
}

export function addBuilding(building: Building) {
  playerData.update(data => ({
    ...data,
    buildings: [...data.buildings, building]
  }));

  checkAchievements();
}

export function removeBuilding(buildingId: string) {
  playerData.update(data => ({
    ...data,
    buildings: data.buildings.filter(building => building.id !== buildingId)
  }));
}

export function addAchievement(achievementId: string) {
  playerData.update(data => ({
    ...data,
    achievements: [...data.achievements, achievementId]
  }));
}

export function completeTutorial() {
  playerData.update(data => ({
    ...data,
    tutorialCompleted: true
  }));

  checkAchievements();
}


export function resetPlayerData() {
  playerData.set({ ...initialPlayerData });
}

export function getPlayerStats() {
  return derived(playerData, $playerData => ({
    totalBuildingsBuilt: $playerData.buildings.length,
    totalCoinsEarned: $playerData.resources.coins,
    totalCrystalsEarned: $playerData.resources.crystals,
    totalQuestsCompleted: $playerData.completedQuests.length,
    totalAchievementsUnlocked: $playerData.achievements.length,
    currentLevel: $playerData.level,
    tutorialCompleted: $playerData.tutorialCompleted
  }));
}