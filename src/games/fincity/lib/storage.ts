import type { PlayerData } from '../types/PlayerData';
import type { GameState } from '../types/GameState';
import { validatePlayerData, validateGameState } from './validation';

const STORAGE_KEYS = {
  PLAYER_DATA: 'fincity_player_data',
  GAME_STATE: 'fincity_game_state'
} as const;


export interface SaveData {
  playerData: PlayerData;
  gameState: GameState;
  timestamp: number;
}

export function savePlayerData(data: PlayerData): boolean {
  try {
    if (!data) {
      console.error('Cannot save empty player data');
      return false;
    }

    if (!globalThis.localStorage) {
      console.warn('localStorage is not available');
      return false;
    }

    const saveData: SaveData = {
      playerData: data,
      gameState: {} as GameState,
      timestamp: Date.now()
    };

    const serialized = JSON.stringify(saveData);

    globalThis.localStorage.setItem(STORAGE_KEYS.PLAYER_DATA, serialized);

    console.log('Player data saved successfully');
    return true;
  } catch (error) {
    if (error instanceof globalThis.DOMException && error.name === 'QuotaExceededError') {
      console.error('Storage quota exceeded. Unable to save player data.');
    } else {
      console.error('Failed to save player data:', error);
    }
    return false;
  }
}

export function loadPlayerData(): PlayerData | null {
  try {
    if (!globalThis.localStorage) {
      console.warn('localStorage is not available');
      return null;
    }

    const stored = globalThis.localStorage.getItem(STORAGE_KEYS.PLAYER_DATA);
    if (!stored) {
      console.log('No saved player data found');
      return null;
    }

    let parsed: SaveData;
    try {
      parsed = JSON.parse(stored) as SaveData;
    } catch (parseError) {
      console.error('Failed to parse stored player data:', parseError);
      return null;
    }

    const validated = validatePlayerData(parsed.playerData);

    if (!validated) {
      console.warn('Invalid player data detected, using defaults');
      return null;
    }

    console.log('Player data loaded successfully');
    return validated;
  } catch (error) {
    console.error('Failed to load player data:', error);
    return null;
  }
}

export function saveGameState(state: GameState): boolean {
  try {
    const serialized = JSON.stringify({
      state,
      timestamp: Date.now()
    });

    globalThis.localStorage.setItem(STORAGE_KEYS.GAME_STATE, serialized);
    return true;
  } catch (error) {
    console.error('Failed to save game state:', error);
    return false;
  }
}

export function loadGameState(): GameState | null {
  try {
    const stored = globalThis.localStorage.getItem(STORAGE_KEYS.GAME_STATE);
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    const validated = validateGameState(parsed.gameState || parsed.state);

    if (!validated) {
      console.warn('Invalid game state detected');
      return null;
    }

    return validated;
  } catch (error) {
    console.error('Failed to load game state:', error);
    return null;
  }
}

export function clearSaveData(): boolean {
  try {
    globalThis.localStorage.removeItem(STORAGE_KEYS.PLAYER_DATA);
    globalThis.localStorage.removeItem(STORAGE_KEYS.GAME_STATE);

    console.log('Save data cleared successfully');
    return true;
  } catch (error) {
    console.error('Failed to clear save data:', error);
    return false;
  }
}

export function exportSaveData(): string | null {
  try {
    const playerData = loadPlayerData();
    const gameState = loadGameState();

    if (!playerData) return null;

    const exportData: SaveData = {
      playerData,
      gameState: gameState || {} as GameState,
      timestamp: Date.now()
    };

    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('Failed to export save data:', error);
    return null;
  }
}

export function importSaveData(data: string): boolean {
  try {
    const parsed = JSON.parse(data) as SaveData;

    const validatedPlayerData = validatePlayerData(parsed.playerData);
    const validatedGameState = validateGameState(parsed.gameState);

    if (!validatedPlayerData) {
      throw new Error('Invalid player data in import');
    }

    savePlayerData(validatedPlayerData);
    if (validatedGameState) {
      saveGameState(validatedGameState);
    }

    console.log('Save data imported successfully');
    return true;
  } catch (error) {
    console.error('Failed to import save data:', error);
    return false;
  }
}

export function getStorageInfo() {
  try {
    const playerData = globalThis.localStorage.getItem(STORAGE_KEYS.PLAYER_DATA);
    const gameState = globalThis.localStorage.getItem(STORAGE_KEYS.GAME_STATE);

    return {
      hasPlayerData: !!playerData,
      hasGameState: !!gameState,
      playerDataSize: playerData ? new globalThis.Blob([playerData]).size : 0,
      gameStateSize: gameState ? new globalThis.Blob([gameState]).size : 0
    };
  } catch (error) {
    console.error('Failed to get storage info:', error);
    return null;
  }
}

export function autoSave(playerData: PlayerData, gameState: GameState) {
  const success = savePlayerData(playerData) && saveGameState(gameState);

  if (success) {
    console.log('Auto-save completed');
  } else {
    console.warn('Auto-save failed');
  }

  return success;
}