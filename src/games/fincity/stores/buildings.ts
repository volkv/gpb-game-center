import { derived, get } from 'svelte/store';
import type { Building, BuildingConfig } from '../types/Building';
import { BuildingType } from '../types/Building';
import { playerData, spendResources, addResources } from './playerData';

export const buildings = derived(playerData, $playerData => $playerData.buildings);

export const buildingConfigs: Record<BuildingType, BuildingConfig> = {
  [BuildingType.CENTRAL_BANK]: {
    type: BuildingType.CENTRAL_BANK,
    name: 'Центральный банк',
    description: 'Основа вашего финансового города. Генерирует базовый доход.',
    basePrice: { coins: 0, crystals: 0, energy: 10 },
    income: { coins: 10, crystals: 1, interval: 30000 },
    maxLevel: 5,
    size: { width: 2, height: 2 },
    unlockLevel: 1,
    bankProduct: 'Накопительный счет'
  },
  [BuildingType.SECURITY_HQ]: {
    type: BuildingType.SECURITY_HQ,
    name: 'Штаб-квартира безопасности',
    description: 'Защищает ваш город от финансовых угроз.',
    basePrice: { coins: 500, crystals: 10, energy: 20 },
    income: { coins: 15, crystals: 2, interval: 45000 },
    maxLevel: 3,
    size: { width: 2, height: 2 },
    unlockLevel: 1,
    requiresBuilding: BuildingType.CENTRAL_BANK,
    bankProduct: 'Защита от мошенничества'
  },
  [BuildingType.CAPITAL_TOWER]: {
    type: BuildingType.CAPITAL_TOWER,
    name: 'Небоскреб "Капитал"',
    description: 'Высокодоходное здание для опытных инвесторов.',
    basePrice: { coins: 2000, crystals: 50, energy: 50 },
    income: { coins: 50, crystals: 5, interval: 60000 },
    maxLevel: 10,
    size: { width: 2, height: 3 },
    unlockLevel: 5,
    bankProduct: 'Инвестиционное страхование жизни'
  },
  [BuildingType.LONGEVITY_PARK]: {
    type: BuildingType.LONGEVITY_PARK,
    name: 'Парк долголетия',
    description: 'Престижный парк для долгосрочного планирования.',
    basePrice: { coins: 1500, crystals: 30, energy: 40 },
    income: { coins: 20, crystals: 3, interval: 120000 },
    maxLevel: 1,
    size: { width: 4, height: 3 },
    unlockLevel: 8,
    bankProduct: 'Долгосрочные сбережения'
  },
  [BuildingType.PARTNER_MALL]: {
    type: BuildingType.PARTNER_MALL,
    name: 'Торговый центр "Партнер"',
    description: 'Увеличивает доходы от партнерских программ.',
    basePrice: { coins: 1000, crystals: 25, energy: 30 },
    income: { coins: 30, crystals: 4, interval: 90000 },
    maxLevel: 5,
    size: { width: 3, height: 3 },
    unlockLevel: 4,
    bankProduct: 'Кэшбэк программы'
  },
  [BuildingType.RESEARCH_INSTITUTE]: {
    type: BuildingType.RESEARCH_INSTITUTE,
    name: 'Научный институт',
    description: 'Центр финансовой грамотности и обучения.',
    basePrice: { coins: 800, crystals: 20, energy: 25 },
    income: { coins: 0, crystals: 0, interval: 0 },
    maxLevel: 3,
    size: { width: 2, height: 2 },
    unlockLevel: 3,
    bankProduct: 'Финансовая грамотность'
  },
  [BuildingType.CREDIT_OFFICE]: {
    type: BuildingType.CREDIT_OFFICE,
    name: 'Кредитный офис',
    description: 'Предоставляет кредитные решения для развития города.',
    basePrice: { coins: 1200, crystals: 28, energy: 35 },
    income: { coins: 35, crystals: 3, interval: 70000 },
    maxLevel: 7,
    size: { width: 2, height: 2 },
    unlockLevel: 3,
    requiresBuilding: BuildingType.CENTRAL_BANK,
    bankProduct: 'Кредит наличными'
  },
  [BuildingType.AUTO_SHOWROOM]: {
    type: BuildingType.AUTO_SHOWROOM,
    name: 'Автосалон "Драйв"',
    description: 'Финансирование автомобилей и транспортных средств.',
    basePrice: { coins: 1800, crystals: 40, energy: 45 },
    income: { coins: 45, crystals: 4, interval: 80000 },
    maxLevel: 6,
    size: { width: 3, height: 2 },
    unlockLevel: 5,
    requiresBuilding: BuildingType.CREDIT_OFFICE,
    bankProduct: 'Автокредит'
  },
  [BuildingType.REAL_ESTATE_AGENCY]: {
    type: BuildingType.REAL_ESTATE_AGENCY,
    name: 'Агентство недвижимости',
    description: 'Ипотечные программы для покупки жилья.',
    basePrice: { coins: 2500, crystals: 60, energy: 60 },
    income: { coins: 60, crystals: 6, interval: 100000 },
    maxLevel: 8,
    size: { width: 3, height: 3 },
    unlockLevel: 6,
    requiresBuilding: BuildingType.CREDIT_OFFICE,
    bankProduct: 'Ипотека'
  }
};

export const buildingsByType = derived(buildings, $buildings => {
  return $buildings.reduce((acc, building) => {
    if (!acc[building.type]) acc[building.type] = [];
    acc[building.type].push(building);
    return acc;
  }, {} as Record<BuildingType, Building[]>);
});

export const totalBuildings = derived(buildings, $buildings => $buildings.length);

export const hasBuildingOfType = derived(buildings, $buildings => {
  return (buildingType: BuildingType) => {
    return $buildings.some(building => building.type === buildingType);
  };
});

export const readyToCollect = derived(buildings, $buildings => {
  const now = Date.now();
  return $buildings.filter(building => {
    const config = buildingConfigs[building.type];
    return building.isActive &&
           config.income.interval > 0 &&
           now - building.lastCollected >= config.income.interval;
  });
});

export function addBuilding(type: BuildingType, x: number, y: number): boolean {
  const config = buildingConfigs[type];
  const canAfford = checkCanAfford(config.basePrice);

  if (!canAfford) return false;

  spendResources(config.basePrice);

  const newBuilding: Building = {
    id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    x,
    y,
    level: 1,
    lastCollected: Date.now(),
    isActive: true
  };

  playerData.update(data => ({
    ...data,
    buildings: [...data.buildings, newBuilding]
  }));

  addResources({ experience: 10 });

  import('./playerData').then(({ checkLevelUp }) => {
    checkLevelUp();
  });

  return true;
}

export function removeBuilding(buildingId: string) {
  playerData.update(data => ({
    ...data,
    buildings: data.buildings.filter(b => b.id !== buildingId)
  }));
}

export function collectFromBuilding(buildingId: string) {
  playerData.update(data => ({
    ...data,
    buildings: data.buildings.map(building => {
      if (building.id === buildingId && building.isActive) {
        const config = buildingConfigs[building.type];
        const now = Date.now();

        if (now - building.lastCollected >= config.income.interval) {
          addResources({
            coins: config.income.coins * building.level,
            crystals: config.income.crystals * building.level
          });

          return { ...building, lastCollected: now };
        }
      }
      return building;
    })
  }));
}

export function collectAllReady() {
  let totalCoins = 0;
  let totalCrystals = 0;

  playerData.update(data => ({
    ...data,
    buildings: data.buildings.map(building => {
      const config = buildingConfigs[building.type];
      const now = Date.now();

      if (building.isActive &&
          config.income.interval > 0 &&
          now - building.lastCollected >= config.income.interval) {

        totalCoins += config.income.coins * building.level;
        totalCrystals += config.income.crystals * building.level;

        return { ...building, lastCollected: now };
      }
      return building;
    })
  }));

  if (totalCoins > 0 || totalCrystals > 0) {
    addResources({ coins: totalCoins, crystals: totalCrystals });
  }

  return { coins: totalCoins, crystals: totalCrystals };
}

export function upgradeBuilding(buildingId: string): boolean {
  let success = false;

  playerData.update(data => ({
    ...data,
    buildings: data.buildings.map(building => {
      if (building.id === buildingId) {
        const config = buildingConfigs[building.type];
        if (building.level < config.maxLevel) {
          const upgradeCost = {
            coins: config.basePrice.coins * building.level,
            crystals: config.basePrice.crystals * building.level
          };

          if (checkCanAfford(upgradeCost)) {
            spendResources(upgradeCost);
            success = true;
            return { ...building, level: building.level + 1 };
          }
        }
      }
      return building;
    })
  }));

  return success;
}

function checkCanAfford(cost: { coins: number; crystals: number; energy?: number }): boolean {
  const data = get(playerData);
  const coinsOk = data.resources.coins >= cost.coins;
  const crystalsOk = data.resources.crystals >= cost.crystals;
  const energyOk = cost.energy ? data.resources.energy >= cost.energy : true;

  if (import.meta.env.DEV) {
    console.log('[FinCity] checkCanAfford:', {
      cost,
      resources: data.resources,
      coinsOk,
      crystalsOk,
      energyOk,
      result: coinsOk && crystalsOk && energyOk
    });
  }

  return coinsOk && crystalsOk && energyOk;
}

export function getUpgradeCost(buildingId: string): { coins: number; crystals: number; energy?: number } | null {
  const buildingsList = get(buildings);
  const building = buildingsList.find(b => b.id === buildingId);

  if (!building) return null;

  const config = buildingConfigs[building.type];
  const cost = {
    coins: config.basePrice.coins * building.level,
    crystals: config.basePrice.crystals * building.level,
    energy: config.basePrice.energy != null ? config.basePrice.energy * building.level : undefined
  };

  if (import.meta.env.DEV) {
    console.log('[FinCity] getUpgradeCost:', {
      buildingId,
      buildingType: building.type,
      buildingLevel: building.level,
      basePrice: config.basePrice,
      cost
    });
  }

  return cost;
}

export function canUpgrade(buildingId: string): boolean {
  const buildingsList = get(buildings);
  const building = buildingsList.find(b => b.id === buildingId);

  if (!building || building.isUpgrading) return false;

  const config = buildingConfigs[building.type];
  if (building.level >= config.maxLevel) return false;

  const cost = getUpgradeCost(buildingId);
  if (!cost) return false;

  return checkCanAfford(cost);
}

export function startBuildingUpgrade(buildingId: string): boolean {
  const buildingsList = get(buildings);
  const building = buildingsList.find(b => b.id === buildingId);

  if (!building || !canUpgrade(buildingId)) return false;

  const cost = getUpgradeCost(buildingId);
  if (!cost) return false;

  spendResources(cost);

  const upgradeEndTime = Date.now() + 3000;

  playerData.update(data => ({
    ...data,
    buildings: data.buildings.map(b =>
      b.id === buildingId
        ? { ...b, isUpgrading: true, upgradeEndTime }
        : b
    )
  }));

  setTimeout(() => {
    completeBuildingUpgrade(buildingId);
  }, 3000);

  return true;
}

export function completeBuildingUpgrade(buildingId: string): void {
  const buildingsList = get(buildings);
  const building = buildingsList.find(b => b.id === buildingId);
  const config = building ? buildingConfigs[building.type] : null;
  const newLevel = building ? building.level + 1 : 1;

  playerData.update(data => ({
    ...data,
    buildings: data.buildings.map(b => {
      if (b.id === buildingId && b.isUpgrading) {
        return {
          ...b,
          level: b.level + 1,
          isUpgrading: false,
          upgradeEndTime: undefined
        };
      }
      return b;
    })
  }));

  addResources({ experience: 15 });

  import('./playerData').then(({ checkLevelUp }) => {
    checkLevelUp();
  });

  import('./gameState').then(({ playBuildingUpgradeEffects, updateBuildingLabelText }) => {
    playBuildingUpgradeEffects(buildingId);
    if (config) {
      updateBuildingLabelText(buildingId, config.name, newLevel);
    }
  });

  import('$lib/utils/confetti').then(({ confettiEffects }) => {
    confettiEffects.simpleSuccess();
  });
}

export function cancelBuildingUpgrade(buildingId: string): boolean {
  const buildingsList = get(buildings);
  const building = buildingsList.find(b => b.id === buildingId);

  if (!building || !building.isUpgrading) return false;

  const cost = getUpgradeCost(buildingId);
  if (cost) {
    addResources(cost);
  }

  playerData.update(data => ({
    ...data,
    buildings: data.buildings.map(b =>
      b.id === buildingId
        ? { ...b, isUpgrading: false, upgradeEndTime: undefined }
        : b
    )
  }));

  return true;
}

export function getUpgradeProgress(buildingId: string): number {
  const buildingsList = get(buildings);
  const building = buildingsList.find(b => b.id === buildingId);

  if (!building || !building.isUpgrading || !building.upgradeEndTime) {
    return 0;
  }

  const now = Date.now();
  const startTime = building.upgradeEndTime - 3000;
  const elapsed = now - startTime;
  const progress = Math.min(elapsed / 3000, 1);

  return Math.max(0, progress);
}

export const incomePerHour = derived(buildings, $buildings => {
  let coinsPerHour = 0;
  let crystalsPerHour = 0;

  $buildings.forEach(building => {
    if (!building.isActive) return;

    const config = buildingConfigs[building.type];
    if (config.income.interval === 0) return;

    const hourInMs = 3600000;
    const collectionsPerHour = hourInMs / config.income.interval;

    coinsPerHour += (config.income.coins * building.level * collectionsPerHour);
    crystalsPerHour += (config.income.crystals * building.level * collectionsPerHour);
  });

  return {
    coins: Math.round(coinsPerHour),
    crystals: Math.round(crystalsPerHour)
  };
});

export const incomePerSecond = derived(buildings, $buildings => {
  let coinsPerSecond = 0;
  let crystalsPerSecond = 0;

  $buildings.forEach(building => {
    if (!building.isActive) return;

    const config = buildingConfigs[building.type];
    if (config.income.interval === 0) return;

    const secondInMs = 1000;
    const incomeRatio = secondInMs / config.income.interval;

    coinsPerSecond += (config.income.coins * building.level * incomeRatio);
    crystalsPerSecond += (config.income.crystals * building.level * incomeRatio);
  });

  return {
    coins: coinsPerSecond,
    crystals: crystalsPerSecond
  };
});

export function collectPassiveIncome() {
  const income = get(incomePerSecond);
  const data = get(playerData);

  const energyRegenPerSecond = data.resources.maxEnergy / (24 * 60 * 60);
  const experienceGain = (income.coins + income.crystals * 5) * 0.01;

  addResources({
    coins: income.coins,
    crystals: income.crystals,
    energy: energyRegenPerSecond,
    experience: experienceGain
  }, true);
}

let passiveIncomeInterval: number | null = null;
let achievementCheckCounter = 0;

export function startPassiveIncome() {
  if (passiveIncomeInterval !== null) {
    return;
  }

  achievementCheckCounter = 0;

  passiveIncomeInterval = window.setInterval(() => {
    collectPassiveIncome();

    import('./playerData').then(({ checkLevelUp }) => {
      checkLevelUp();
    });

    achievementCheckCounter++;
    if (achievementCheckCounter >= 10) {
      import('./achievements').then(({ checkAchievements }) => {
        checkAchievements();
      });
      achievementCheckCounter = 0;
    }
  }, 1000);
}

export function stopPassiveIncome() {
  if (passiveIncomeInterval !== null) {
    clearInterval(passiveIncomeInterval);
    passiveIncomeInterval = null;
  }
}

export function collectOfflineIncome() {
  const data = get(playerData);
  const now = Date.now();
  const lastSave = data.lastSave || now;
  const offlineTime = now - lastSave;

  if (offlineTime <= 0) return { coins: 0, crystals: 0 };

  const maxOfflineTime = 4 * 60 * 60 * 1000;
  const cappedOfflineTime = Math.min(offlineTime, maxOfflineTime);

  let totalCoins = 0;
  let totalCrystals = 0;

  data.buildings.forEach(building => {
    if (!building.isActive) return;

    const config = buildingConfigs[building.type];
    if (config.income.interval === 0) return;

    const collections = Math.floor(cappedOfflineTime / config.income.interval);
    totalCoins += config.income.coins * building.level * collections;
    totalCrystals += config.income.crystals * building.level * collections;
  });

  if (totalCoins > 0 || totalCrystals > 0) {
    addResources({
      coins: totalCoins,
      crystals: totalCrystals
    }, true);
  }

  return { coins: totalCoins, crystals: totalCrystals, timeAway: cappedOfflineTime };
}