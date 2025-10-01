import { get } from 'svelte/store';
import { playerData, resetPlayerData } from '../stores/playerData';
import { gameState, resetGameState } from '../stores/gameState';
import { resetQuests } from '../stores/quests';
import { resetAchievements } from '../stores/achievements';
import { resetUIState } from '../stores/ui';
import { savePlayerData, saveGameState, loadPlayerData, loadGameState } from './storage';

const AUTO_SAVE_INTERVAL = 30000;

let autoSaveTimer: number | null = null;
let lastSaveTime = 0;
let hasUnsavedChanges = false;

export function initializeAutoSave() {
  console.log('Initializing auto-save system');

  loadSavedData();

  startAutoSaveTimer();

  subscribeToStoreChanges();

  setupBeforeUnloadHandler();
}

export function stopAutoSave() {
  if (autoSaveTimer) {
    globalThis.clearInterval(autoSaveTimer);
    autoSaveTimer = null;
  }

  saveCurrentState();
}

function loadSavedData() {
  console.log('💾 [AUTOSAVE] Loading saved data...');

  const savedPlayerData = loadPlayerData();
  if (savedPlayerData) {
    console.log('📊 [AUTOSAVE] Loading player data:', {
      tutorialCompleted: savedPlayerData.tutorialCompleted,
      buildingsCount: savedPlayerData.buildings.length,
      cityName: savedPlayerData.cityName
    });
    playerData.set(savedPlayerData);
    console.log('✅ [AUTOSAVE] Player data loaded from storage');

    import('../stores/buildings').then(({ collectOfflineIncome }) => {
      const offlineReward = collectOfflineIncome();
      if (offlineReward.coins > 0 || offlineReward.crystals > 0) {
        console.log('💰 [OFFLINE] Collected offline income:', offlineReward);
      }
    });
  } else {
    console.log('❌ [AUTOSAVE] No saved player data found');
  }

  const savedGameState = loadGameState();
  if (savedGameState) {
    console.log('🎮 [AUTOSAVE] Game state loaded from storage');
    gameState.set(savedGameState);
  } else {
    console.log('❌ [AUTOSAVE] No saved game state found');
  }
}

export function startAutoSaveTimer() {
  if (autoSaveTimer) {
    globalThis.clearInterval(autoSaveTimer);
  }

  autoSaveTimer = globalThis.window.setInterval(() => {
    if (hasUnsavedChanges) {
      saveCurrentState();
    }
  }, AUTO_SAVE_INTERVAL);

  console.log(`Auto-save timer started (interval: ${AUTO_SAVE_INTERVAL}ms)`);
}

export function subscribeToStoreChanges() {
  playerData.subscribe(() => {
    hasUnsavedChanges = true;
  });

  gameState.subscribe(() => {
    hasUnsavedChanges = true;
  });
}

export function setupBeforeUnloadHandler() {
  globalThis.window.addEventListener('beforeunload', () => {
    if (hasUnsavedChanges) {
      saveCurrentState();
    }
  });

  globalThis.window.addEventListener('pagehide', () => {
    if (hasUnsavedChanges) {
      saveCurrentState();
    }
  });

  globalThis.document.addEventListener('visibilitychange', () => {
    if (globalThis.document.visibilityState === 'hidden' && hasUnsavedChanges) {
      saveCurrentState();
    }
  });
}

function saveCurrentState(): boolean {
  try {
    const currentPlayerData = get(playerData);
    const currentGameState = get(gameState);

    const updatedPlayerData = {
      ...currentPlayerData,
      lastSave: Date.now()
    };

    const playerDataSaved = savePlayerData(updatedPlayerData);
    const gameStateSaved = saveGameState(currentGameState);

    if (playerDataSaved && gameStateSaved) {
      hasUnsavedChanges = false;
      lastSaveTime = Date.now();

      console.log('Auto-save completed successfully');
      return true;
    } else {
      console.warn('Auto-save partially failed');
      return false;
    }
  } catch (error) {
    console.error('Auto-save failed:', error);
    return false;
  }
}

export function forceSave(): boolean {
  console.log('Force saving...');
  return saveCurrentState();
}

export function getLastSaveTime(): number {
  return lastSaveTime;
}

export function hasUnsavedData(): boolean {
  return hasUnsavedChanges;
}

export function getSaveStats() {
  return {
    lastSaveTime,
    hasUnsavedChanges,
    autoSaveInterval: AUTO_SAVE_INTERVAL,
    isAutoSaveActive: autoSaveTimer !== null
  };
}

export function clearAllData(): boolean {
  try {
    globalThis.localStorage.clear();
    console.log('All data cleared from localStorage');
    return true;
  } catch (error) {
    console.error('Failed to clear data:', error);
    return false;
  }
}

export function resetAllStores() {
  try {
    resetPlayerData();
    resetGameState();
    resetQuests();
    resetAchievements();
    resetUIState();

    console.log('All stores reset to initial state');
    return true;
  } catch (error) {
    console.error('Failed to reset stores:', error);
    return false;
  }
}