export enum GameScreen {
  LOADING = 'loading',
  MAIN = 'main',
  BUILD_MENU = 'build_menu',
  QUEST_LOG = 'quest_log',
  SETTINGS = 'settings',
  TUTORIAL = 'tutorial',
  TEST = 'test'
}

export enum GameMode {
  NORMAL = 'normal',
  BUILDING = 'building',
  TUTORIAL = 'tutorial',
  PAUSED = 'paused'
}

export interface GameState {
  currentScreen: GameScreen;
  mode: GameMode;
  isInitialized: boolean;
  isLoading: boolean;
  isFirstTime: boolean;
  version: string;
  lastUpdate: number;
  settings: {
    soundEnabled: boolean;
    musicEnabled: boolean;
    notificationsEnabled: boolean;
    language: string;
  };
  camera: {
    x: number;
    y: number;
    zoom: number;
  };
  ui: {
    selectedBuilding?: string;
    showGrid: boolean;
    showTutorialHighlight: boolean;
  };
  building?: {
    isInBuildingMode: boolean;
    selectedBuildingType?: string;
    previewPosition?: {
      gridX: number;
      gridY: number;
    };
    isValidPlacement: boolean;
  };
}