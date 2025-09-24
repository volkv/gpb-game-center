import { writable, derived, get } from 'svelte/store';
import type { GameState } from '../types/GameState';
import { GameScreen, GameMode } from '../types/GameState';
import { playerData } from './playerData';
import type { GameEngine } from '../components/game/GameEngine';

const initialGameState: GameState = {
  version: '1.0.0',
  currentScreen: 'loading' as GameScreen,
  mode: 'normal' as GameMode,
  isInitialized: false,
  isLoading: true,
  isFirstTime: false,
  lastUpdate: Date.now(),
  settings: {
    soundEnabled: true,
    musicEnabled: true,
    notificationsEnabled: true,
    language: 'ru'
  },
  camera: {
    x: 0,
    y: 0,
    zoom: 1
  },
  ui: {
    showGrid: true,
    showTutorialHighlight: false
  },
  building: {
    isInBuildingMode: false,
    selectedBuildingType: undefined,
    previewPosition: undefined,
    isValidPlacement: false
  }
};

export const gameState = writable<GameState>(initialGameState);

export const currentScreen = derived(gameState, $gameState => $gameState.currentScreen);
export const isLoading = derived(gameState, $gameState => $gameState.isLoading);
export const isFirstTime = derived(gameState, $gameState => $gameState.isFirstTime);
export const settings = derived(gameState, $gameState => $gameState.settings);
export const gameMode = derived(gameState, $gameState => $gameState.mode);
export const buildingState = derived(gameState, $gameState => $gameState.building);
export const isInBuildingMode = derived(gameState, $gameState => $gameState.building?.isInBuildingMode || false);

export function setScreen(screen: GameScreen) {
  gameState.update(state => ({
    ...state,
    currentScreen: screen
  }));
}

export function setLoading(loading: boolean) {
  gameState.update(state => ({
    ...state,
    isLoading: loading
  }));
}

export function updateSettings(newSettings: Partial<GameState['settings']>) {
  gameState.update(state => ({
    ...state,
    settings: { ...state.settings, ...newSettings }
  }));
}

export function moveCamera(x: number, y: number) {
  gameState.update(state => ({
    ...state,
    camera: { ...state.camera, x, y }
  }));
}

export function setZoom(zoom: number) {
  gameState.update(state => ({
    ...state,
    camera: { ...state.camera, zoom }
  }));
}

export function initializeGame() {
  console.log('🎮 [GAME] initializeGame() called');
  
  const $playerData = get(playerData);
  console.log('📊 [GAME] Current playerData:', {
    tutorialCompleted: $playerData.tutorialCompleted,
    buildingsCount: $playerData.buildings.length,
    cityName: $playerData.cityName
  });
  
  const isFirstTime = !$playerData.tutorialCompleted && $playerData.buildings.length === 0;
  console.log('🔍 [GAME] initializeGame isFirstTime check:', isFirstTime);

  gameState.update(state => {
    const newState = {
      ...state,
      isInitialized: true,
      isLoading: false,
      isFirstTime,
      currentScreen: 'main' as GameScreen
    };
    
    console.log('🎯 [GAME] Updating gameState:', {
      isInitialized: newState.isInitialized,
      isLoading: newState.isLoading,
      isFirstTime: newState.isFirstTime,
      currentScreen: newState.currentScreen
    });
    
    return newState;
  });
}

export function setFirstTimeComplete() {
  gameState.update(state => ({
    ...state,
    isFirstTime: false
  }));
}

export function checkIfFirstTime() {
  console.log('🔍 [ONBOARDING] checkIfFirstTime() called - always first time in stateless mode');

  const isFirstTime = true;

  console.log('🎯 [ONBOARDING] Final isFirstTime result:', isFirstTime);

  gameState.update(state => ({
    ...state,
    isFirstTime
  }));

  return isFirstTime;
}

export function setGameMode(mode: GameMode) {
  gameState.update(state => ({
    ...state,
    mode
  }));
}

export function startBuildingMode(buildingType: string) {
  gameState.update(state => ({
    ...state,
    mode: 'building' as GameMode,
    building: {
      isInBuildingMode: true,
      selectedBuildingType: buildingType,
      previewPosition: undefined,
      isValidPlacement: false
    }
  }));
}

export function exitBuildingMode() {
  gameState.update(state => ({
    ...state,
    mode: 'normal' as GameMode,
    building: {
      isInBuildingMode: false,
      selectedBuildingType: undefined,
      previewPosition: undefined,
      isValidPlacement: false
    }
  }));
}

export function updateBuildingPreview(gridX: number, gridY: number, isValid: boolean) {
  gameState.update(state => ({
    ...state,
    building: state.building ? {
      ...state.building,
      previewPosition: { gridX, gridY },
      isValidPlacement: isValid
    } : state.building
  }));
}

export function setTutorialHighlight(show: boolean) {
  gameState.update(state => ({
    ...state,
    ui: {
      ...state.ui,
      showTutorialHighlight: show
    }
  }));
}

export function resetGameState() {
  gameState.set(initialGameState);
}

export function getGameProgress() {
  const $playerData = get(playerData);

  return {
    level: $playerData.level,
    buildingsCount: $playerData.buildings.length,
    questsCompleted: $playerData.completedQuests.length,
    tutorialCompleted: $playerData.tutorialCompleted,
    achievementsUnlocked: $playerData.achievements.length
  };
}

export function showIconTest() {
  setScreen(GameScreen.TEST);
}

export const gameEngine = writable<GameEngine | null>(null);

export function setGameEngine(engine: GameEngine | null) {
  gameEngine.set(engine);
}

export function playBuildingUpgradeEffects(buildingId: string) {
  const engine = get(gameEngine);
  if (!engine || !engine.buildingManager) {
    console.warn('GameEngine or BuildingSystem not available for effects');
    return;
  }

  const buildingRenderer = engine.buildingManager.getBuildingRenderer();
  if (buildingRenderer) {
    buildingRenderer.playUpgradeEffects(buildingId);
  } else {
    console.warn('BuildingRenderer not available for effects');
  }
}