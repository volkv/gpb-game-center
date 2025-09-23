import type { PlayerData, PlayerResources } from '../types/PlayerData';
import type { GameState } from '../types/GameState';
import { GameScreen, GameMode } from '../types/GameState';
import type { Building } from '../types/Building';
import { BuildingType } from '../types/Building';

export function validatePlayerData(data: unknown): PlayerData | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  try {
    const dataObj = data as Record<string, unknown>;
    const playerData: PlayerData = {
      cityName: validateString(dataObj.cityName, 'Новый город'),
      userName: validateString(dataObj.userName, 'Клиент'),
      level: validatePositiveNumber(dataObj.level, 1),
      resources: validatePlayerResources(dataObj.resources),
      buildings: validateBuildings(dataObj.buildings),
      completedQuests: validateStringArray(dataObj.completedQuests),
      activeQuests: validateStringArray(dataObj.activeQuests),
      unlockedBuildings: validateStringArray(dataObj.unlockedBuildings, ['central_bank']),
      lastSave: validateNumber(dataObj.lastSave, Date.now()),
      tutorialCompleted: validateBoolean(dataObj.tutorialCompleted, false),
      achievements: validateStringArray(dataObj.achievements)
    };

    return playerData;
  } catch (error) {
    console.error('Player data validation failed:', error);
    return null;
  }
}

export function validateGameState(data: unknown): GameState | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  try {
    const dataObj = data as Record<string, unknown>;
    const gameState: GameState = {
      currentScreen: validateEnum(dataObj.currentScreen, Object.values(GameScreen), GameScreen.LOADING),
      mode: validateEnum(dataObj.mode, Object.values(GameMode), GameMode.NORMAL),
      isInitialized: validateBoolean(dataObj.isInitialized, false),
      isLoading: validateBoolean(dataObj.isLoading, true),
      isFirstTime: validateBoolean(dataObj.isFirstTime, true),
      version: validateString(dataObj.version, '1.0.0'),
      lastUpdate: validateNumber(dataObj.lastUpdate, Date.now()),
      settings: {
        soundEnabled: validateBoolean((dataObj.settings as Record<string, unknown>)?.soundEnabled, true),
        musicEnabled: validateBoolean((dataObj.settings as Record<string, unknown>)?.musicEnabled, true),
        notificationsEnabled: validateBoolean((dataObj.settings as Record<string, unknown>)?.notificationsEnabled, true),
        language: validateString((dataObj.settings as Record<string, unknown>)?.language, 'ru')
      },
      camera: {
        x: validateNumber((dataObj.camera as Record<string, unknown>)?.x, 0),
        y: validateNumber((dataObj.camera as Record<string, unknown>)?.y, 0),
        zoom: validateNumberRange((dataObj.camera as Record<string, unknown>)?.zoom, 0.5, 3, 1)
      },
      ui: {
        selectedBuilding: (dataObj.ui as Record<string, unknown>)?.selectedBuilding as string | undefined,
        showGrid: validateBoolean((dataObj.ui as Record<string, unknown>)?.showGrid, true),
        showTutorialHighlight: validateBoolean((dataObj.ui as Record<string, unknown>)?.showTutorialHighlight, false)
      }
    };

    return gameState;
  } catch (error) {
    console.error('Game state validation failed:', error);
    return null;
  }
}

function validatePlayerResources(data: unknown): PlayerResources {
  const dataObj = data as Record<string, unknown> | undefined;
  return {
    coins: validateNonNegativeNumber(dataObj?.coins, 1000),
    crystals: validateNonNegativeNumber(dataObj?.crystals, 50),
    energy: validateNonNegativeNumber(dataObj?.energy, 100),
    maxEnergy: validatePositiveNumber(dataObj?.maxEnergy, 100),
    experience: validateNonNegativeNumber(dataObj?.experience, 0)
  };
}

function validateBuildings(data: unknown): Building[] {
  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .map(validateBuilding)
    .filter(building => building !== null) as Building[];
}

function validateBuilding(data: unknown): Building | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  try {
    const dataObj = data as Record<string, unknown>;
    const buildingType = validateBuildingType(dataObj.type);
    if (!buildingType) {
      return null;
    }

    return {
      id: validateString(dataObj.id, ''),
      type: buildingType,
      x: validateNumber(dataObj.x, 0),
      y: validateNumber(dataObj.y, 0),
      level: validatePositiveNumber(dataObj.level, 1),
      lastCollected: validateNumber(dataObj.lastCollected, Date.now()),
      isActive: validateBoolean(dataObj.isActive, true)
    };
  } catch (error) {
    console.warn('Invalid building data:', error);
    return null;
  }
}

function validateBuildingType(value: unknown): BuildingType | null {
  const validTypes = Object.values(BuildingType);
  return validTypes.includes(value as BuildingType) ? (value as BuildingType) : null;
}

function validateString(value: unknown, defaultValue: string): string {
  return typeof value === 'string' && value.length > 0 ? value : defaultValue;
}

function validateNumber(value: unknown, defaultValue: number): number {
  const num = Number(value);
  return !isNaN(num) && isFinite(num) ? num : defaultValue;
}

function validatePositiveNumber(value: unknown, defaultValue: number): number {
  const num = validateNumber(value, defaultValue);
  return num > 0 ? num : defaultValue;
}

function validateNonNegativeNumber(value: unknown, defaultValue: number): number {
  const num = validateNumber(value, defaultValue);
  return num >= 0 ? num : defaultValue;
}

function validateNumberRange(value: unknown, min: number, max: number, defaultValue: number): number {
  const num = validateNumber(value, defaultValue);
  return num >= min && num <= max ? num : defaultValue;
}

function validateBoolean(value: unknown, defaultValue: boolean): boolean {
  return typeof value === 'boolean' ? value : defaultValue;
}

function validateStringArray(value: unknown, defaultValue: string[] = []): string[] {
  if (!Array.isArray(value)) {
    return defaultValue;
  }

  return value.filter(item => typeof item === 'string' && item.length > 0);
}

function validateEnum<T extends string>(value: unknown, validValues: T[], defaultValue: T): T {
  return validValues.includes(value as T) ? (value as T) : defaultValue;
}

export function sanitizePlayerData(data: PlayerData): PlayerData {
  return {
    ...data,
    cityName: data.cityName.substring(0, 50),
    userName: data.userName.substring(0, 30),
    level: Math.max(1, Math.min(data.level, 100)),
    resources: {
      ...data.resources,
      coins: Math.max(0, Math.min(data.resources.coins, 999999999)),
      crystals: Math.max(0, Math.min(data.resources.crystals, 999999)),
      energy: Math.max(0, Math.min(data.resources.energy, data.resources.maxEnergy)),
      maxEnergy: Math.max(50, Math.min(data.resources.maxEnergy, 1000)),
      experience: Math.max(0, Math.min(data.resources.experience, 999999))
    }
  };
}

export function isValidSaveData(data: unknown): boolean {
  try {
    const validatedPlayerData = validatePlayerData(data);
    return validatedPlayerData !== null;
  } catch {
    return false;
  }
}