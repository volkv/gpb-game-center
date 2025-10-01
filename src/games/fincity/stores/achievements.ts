import { writable, derived, get } from 'svelte/store';
import type { Achievement, AchievementCondition, AchievementReward } from '../types/Achievement';
import { AchievementType, AchievementCategory, AchievementStatus } from '../types/Achievement';
import type { Building } from '../types/Building';
import type { PlayerData } from '../types/PlayerData';
import { playerData, addResources } from './playerData';
import { showSuccessToast } from './ui';

const initialAchievements: Achievement[] = [
  {
    id: 'welcome_home',
    type: AchievementType.TUTORIAL,
    category: AchievementCategory.GENERAL,
    title: 'Добро пожаловать!',
    description: 'Начните свое финансовое путешествие',
    icon: 'home',
    rarity: 'common',
    status: AchievementStatus.LOCKED,
    progress: 0,
    maxProgress: 1,
    rewards: {
      coins: 100,
      experience: 50
    },
    conditions: [
      {
        type: 'tutorial_completed',
        target: 1
      }
    ]
  },
  {
    id: 'first_builder',
    type: AchievementType.BUILDING,
    category: AchievementCategory.BUILDINGS,
    title: 'Первый строитель',
    description: 'Постройте свое первое здание',
    icon: 'building',
    rarity: 'common',
    status: AchievementStatus.LOCKED,
    progress: 0,
    maxProgress: 1,
    rewards: {
      coins: 200,
      experience: 100
    },
    conditions: [
      {
        type: 'buildings_built',
        target: 1
      }
    ]
  },
  {
    id: 'city_founder',
    type: AchievementType.BUILDING,
    category: AchievementCategory.BUILDINGS,
    title: 'Основатель города',
    description: 'Постройте 5 зданий',
    icon: 'building',
    rarity: 'rare',
    status: AchievementStatus.LOCKED,
    progress: 0,
    maxProgress: 5,
    rewards: {
      coins: 500,
      crystals: 10,
      experience: 250
    },
    conditions: [
      {
        type: 'buildings_built',
        target: 5
      }
    ]
  },
  {
    id: 'metropolis_mayor',
    type: AchievementType.BUILDING,
    category: AchievementCategory.BUILDINGS,
    title: 'Мэр мегаполиса',
    description: 'Постройте 15 зданий',
    icon: 'crown',
    rarity: 'epic',
    status: AchievementStatus.LOCKED,
    progress: 0,
    maxProgress: 15,
    rewards: {
      coins: 1000,
      crystals: 25,
      experience: 500,
      title: 'Мэр мегаполиса'
    },
    conditions: [
      {
        type: 'buildings_built',
        target: 15
      }
    ]
  },
  {
    id: 'coin_collector',
    type: AchievementType.COLLECTION,
    category: AchievementCategory.RESOURCES,
    title: 'Коллекционер монет',
    description: 'Соберите 10,000 монет',
    icon: 'coin',
    rarity: 'rare',
    status: AchievementStatus.LOCKED,
    progress: 0,
    maxProgress: 10000,
    rewards: {
      crystals: 15,
      experience: 200
    },
    conditions: [
      {
        type: 'coins_collected',
        target: 10000
      }
    ]
  },
  {
    id: 'crystal_hunter',
    type: AchievementType.COLLECTION,
    category: AchievementCategory.RESOURCES,
    title: 'Охотник за кристаллами',
    description: 'Соберите 500 кристаллов',
    icon: 'crystal',
    rarity: 'rare',
    status: AchievementStatus.LOCKED,
    progress: 0,
    maxProgress: 500,
    rewards: {
      coins: 2000,
      experience: 300
    },
    conditions: [
      {
        type: 'crystals_collected',
        target: 500
      }
    ]
  },
  {
    id: 'quest_starter',
    type: AchievementType.QUEST,
    category: AchievementCategory.QUESTS,
    title: 'Начинающий исследователь',
    description: 'Завершите 3 квеста',
    icon: 'quest',
    rarity: 'common',
    status: AchievementStatus.LOCKED,
    progress: 0,
    maxProgress: 3,
    rewards: {
      coins: 300,
      experience: 150
    },
    conditions: [
      {
        type: 'quests_completed',
        target: 3
      }
    ]
  },
  {
    id: 'quest_master',
    type: AchievementType.QUEST,
    category: AchievementCategory.QUESTS,
    title: 'Мастер квестов',
    description: 'Завершите все доступные квесты',
    icon: 'star',
    rarity: 'epic',
    status: AchievementStatus.LOCKED,
    progress: 0,
    maxProgress: 6,
    rewards: {
      coins: 1000,
      crystals: 20,
      experience: 500,
      title: 'Мастер квестов'
    },
    conditions: [
      {
        type: 'quests_completed',
        target: 6
      }
    ]
  },
  {
    id: 'level_up',
    type: AchievementType.LEVEL,
    category: AchievementCategory.PROGRESSION,
    title: 'Повышение',
    description: 'Достигните 5 уровня',
    icon: 'level',
    rarity: 'common',
    status: AchievementStatus.LOCKED,
    progress: 0,
    maxProgress: 5,
    rewards: {
      coins: 500,
      crystals: 10,
      experience: 200
    },
    conditions: [
      {
        type: 'level_reached',
        target: 5
      }
    ]
  },
  {
    id: 'financial_expert',
    type: AchievementType.RESOURCE,
    category: AchievementCategory.EDUCATION,
    title: 'Финансовый эксперт',
    description: 'Изучите информацию о 3 банковских продуктах',
    icon: 'book',
    rarity: 'rare',
    status: AchievementStatus.LOCKED,
    progress: 0,
    maxProgress: 3,
    rewards: {
      coins: 800,
      crystals: 15,
      experience: 400
    },
    conditions: [
      {
        type: 'products_learned',
        target: 3
      }
    ]
  }
];

export const achievements = writable<Achievement[]>(initialAchievements);

export const achievementsByCategory = derived(achievements, ($achievements) => {
  const categories: Record<AchievementCategory, Achievement[]> = {
    [AchievementCategory.GENERAL]: [],
    [AchievementCategory.BUILDINGS]: [],
    [AchievementCategory.RESOURCES]: [],
    [AchievementCategory.QUESTS]: [],
    [AchievementCategory.PROGRESSION]: [],
    [AchievementCategory.EDUCATION]: []
  };

  $achievements.forEach(achievement => {
    categories[achievement.category].push(achievement);
  });

  return categories;
});

export const achievementStats = derived(achievements, ($achievements) => {
  const totalUnlocked = $achievements.filter(a => a.status === AchievementStatus.UNLOCKED).length;
  const totalAvailable = $achievements.length;
  const completionPercentage = Math.round((totalUnlocked / totalAvailable) * 100);
  const recentUnlocks = $achievements
    .filter(a => a.status === AchievementStatus.UNLOCKED && a.unlockDate)
    .sort((a, b) => (b.unlockDate! - a.unlockDate!))
    .slice(0, 5);

  return {
    totalUnlocked,
    totalAvailable,
    completionPercentage,
    recentUnlocks
  };
});

export function checkAchievements() {
  const currentPlayerData = get(playerData);
  const currentAchievements = get(achievements);
  let hasUpdates = false;

  const updatedAchievements = currentAchievements.map(achievement => {
    if (achievement.status === AchievementStatus.UNLOCKED) {
      return achievement;
    }

    const playerStats = {
      coinsCollected: currentPlayerData.resources.coins,
      crystalsCollected: currentPlayerData.resources.crystals,
      buildingsBuilt: currentPlayerData.buildings.length,
      questsCompleted: currentPlayerData.completedQuests.length,
      currentLevel: currentPlayerData.level,
      tutorialCompleted: currentPlayerData.tutorialCompleted,
      productsLearned: calculateProductsLearned(currentPlayerData),
      buildings: currentPlayerData.buildings
    };

    const meetsConditions = achievement.conditions.every(condition =>
      checkCondition(condition, playerStats)
    );

    const newProgress = calculateProgress(achievement, playerStats);
    const progressChanged = newProgress !== achievement.progress;

    if (meetsConditions && achievement.status === AchievementStatus.LOCKED) {
      hasUpdates = true;
      unlockAchievement(achievement);
      return {
        ...achievement,
        status: AchievementStatus.UNLOCKED,
        progress: achievement.maxProgress,
        unlockDate: Date.now()
      };
    } else if (progressChanged) {
      hasUpdates = true;
      return {
        ...achievement,
        progress: newProgress
      };
    }

    return achievement;
  });

  if (hasUpdates) {
    achievements.set(updatedAchievements);
  }
}

function checkCondition(
  condition: AchievementCondition,
  playerStats: {
    coinsCollected: number;
    crystalsCollected: number;
    buildingsBuilt: number;
    questsCompleted: number;
    currentLevel: number;
    tutorialCompleted: boolean;
    productsLearned: number;
    buildings: Building[];
  }
): boolean {
  switch (condition.type) {
    case 'buildings_built':
      return playerStats.buildingsBuilt >= (condition.target as number);
    case 'coins_collected':
      return playerStats.coinsCollected >= (condition.target as number);
    case 'crystals_collected':
      return playerStats.crystalsCollected >= (condition.target as number);
    case 'quests_completed':
      return playerStats.questsCompleted >= (condition.target as number);
    case 'level_reached':
      return playerStats.currentLevel >= (condition.target as number);
    case 'tutorial_completed':
      return playerStats.tutorialCompleted;
    case 'products_learned':
      return playerStats.productsLearned >= (condition.target as number);
    case 'building_type_built':
      if (!condition.buildingType) return false;
      return playerStats.buildings.some(building => building.type === condition.buildingType);
    default:
      return false;
  }
}

function calculateProgress(
  achievement: Achievement,
  playerStats: {
    coinsCollected: number;
    crystalsCollected: number;
    buildingsBuilt: number;
    questsCompleted: number;
    currentLevel: number;
    tutorialCompleted: boolean;
    productsLearned: number;
    buildings: Building[];
  }
): number {
  const condition = achievement.conditions[0];
  if (!condition) return 0;

  switch (condition.type) {
    case 'buildings_built':
      return Math.min(playerStats.buildingsBuilt, achievement.maxProgress);
    case 'coins_collected':
      return Math.min(playerStats.coinsCollected, achievement.maxProgress);
    case 'crystals_collected':
      return Math.min(playerStats.crystalsCollected, achievement.maxProgress);
    case 'quests_completed':
      return Math.min(playerStats.questsCompleted, achievement.maxProgress);
    case 'level_reached':
      return Math.min(playerStats.currentLevel, achievement.maxProgress);
    case 'tutorial_completed':
      return playerStats.tutorialCompleted ? 1 : 0;
    case 'products_learned':
      return Math.min(playerStats.productsLearned, achievement.maxProgress);
    case 'building_type_built':
      if (!condition.buildingType) return 0;
      return playerStats.buildings.some(building => building.type === condition.buildingType) ? 1 : 0;
    default:
      return 0;
  }
}

function calculateProductsLearned(_playerData: PlayerData): number {
  return 0;
}

function unlockAchievement(achievement: Achievement) {
  showSuccessToast(
    'Достижение разблокировано!',
    `${achievement.title}: ${achievement.description}`
  );

  if (achievement.rewards) {
    giveAchievementRewards(achievement.rewards);
  }
}

function giveAchievementRewards(rewards: AchievementReward) {
  const resourceRewards: Record<string, number> = {};

  if (rewards.coins) {
    resourceRewards.coins = rewards.coins;
  }

  if (rewards.crystals) {
    resourceRewards.crystals = rewards.crystals;
  }

  if (rewards.experience) {
    resourceRewards.experience = rewards.experience;
  }

  if (Object.keys(resourceRewards).length > 0) {
    addResources(resourceRewards, true);
  }

  if (rewards.title) {
    showSuccessToast('Новый титул!', `Вы получили титул: ${rewards.title}`);
  }
}

export function getAchievementById(id: string): Achievement | undefined {
  const currentAchievements = get(achievements);
  return currentAchievements.find(achievement => achievement.id === id);
}

export function getUnlockedAchievements(): Achievement[] {
  const currentAchievements = get(achievements);
  return currentAchievements.filter(achievement => achievement.status === AchievementStatus.UNLOCKED);
}

export function getProgressAchievements(): Achievement[] {
  const currentAchievements = get(achievements);
  return currentAchievements.filter(achievement =>
    achievement.status === AchievementStatus.LOCKED && achievement.progress && achievement.progress > 0
  );
}

export function resetAchievements() {
  achievements.set(initialAchievements.map(achievement => ({ ...achievement })));
}