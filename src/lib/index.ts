// Компоненты UI
export { default as Button } from './components/Button.svelte';
export { default as Card } from './components/Card.svelte';
export { default as LoadingSpinner } from './components/LoadingSpinner.svelte';
export { default as Modal } from './components/Modal.svelte';
export { default as GameCenter } from './components/GameCenter.svelte';
export { default as GameIcon } from './components/GameIcon.svelte';
export { default as GameContainer } from './components/GameContainer.svelte';
export { default as GameBase } from './components/GameBase.svelte';
export { default as GameLayout } from './components/GameLayout.svelte';
export { default as LazyImage } from './components/LazyImage.svelte';
export { default as ErrorBoundary } from './components/ErrorBoundary.svelte';
export { default as Badge } from './components/Badge.svelte';
export { default as ProgressBar } from './components/ProgressBar.svelte';
export { default as Counter } from './components/Counter.svelte';

// Типы
export type {
  Game,
  GameDifficulty,
  GameImage,
  GameProduct,
  GameMetrics
} from './types/Game.js';

export type {
  GameState,
  GameSessionStatus,
  LoadingState,
  GameScore,
  GameProgress,
  GameTime,
  GameResults,
  GameError,
  GameAction,
  GameStateMachine,
  GameStateSlice,
  PartialGameState,
  GameStateUpdater,
  StateValidator,
  StateTransition
} from './types/GameState.js';

// Stores
export {
  gameStore,
  activeGames,
  comingSoonGames,
  currentGameState,
  isGameLoading,
  isGameActive
} from './stores/gameStore.js';

export {
  navigationStore,
  currentScreen,
  canGoBack,
  isModalOpen,
  modalContent,
  isTransitioning,
  isGameScreen,
  isGameCenterScreen,
  navigationHistory,
  navigateToGame,
  navigateToGameCenter,
  navigateToLoading,
  navigateToError,
  goBack
} from './stores/navigationStore.js';

export type {
  Screen,
  NavigationState,
  NavigationOptions
} from './stores/navigationStore.js';

// Game Loader
export {
  gameLoader,
  loadGameComponent,
  preloadGameComponent,
  isGameComponentLoaded,
  isGameComponentLoading,
  getGameLoadError,
  canRetryGameLoad,
  retryGameLoad,
  clearGameCache,
  getGameLoaderStats
} from './utils/gameLoader.js';

export type {
  LoadedGameComponent,
  GameLoadError
} from './utils/gameLoader.js';

// Constants
export {
  APP_CONFIG,
  GAMES_CONFIG,
  ANIMATION_CONFIG,
  UI_CONFIG,
  GAME_TYPES,
  GAME_CATEGORIES,
  GAME_STATUS,
  SESSION_STATUS,
  SCREEN_TYPES,
  ERROR_CODES,
  LOCAL_STORAGE_KEYS,
  EVENT_TYPES,
  PERFORMANCE_THRESHOLDS,
  QUIZ_CONFIG,
  MATCH3_CONFIG,
  CROSSWORD_CONFIG,
  ACCESSIBILITY_CONFIG,
  DEVELOPMENT_CONFIG
} from './utils/constants.js';

export type {
  GameType,
  GameCategory,
  GameStatus,
  SessionStatus,
  ScreenType,
  ErrorCode,
  EventType
} from './utils/constants.js';

// Утилиты анимаций
export {
  slideUpBounce,
  scaleSpring,
  slideHorizontal,
  createStaggeredAnimation,
  pulse,
  flip,
  explode,
  typewriter,
  glitch,
  animationPresets,
  sequenceAnimation,
  gameAnimations
} from './utils/animations.js';

// Svelte Transitions
export {
  slideEnhanced,
  scaleEnhanced,
  slideInOut,
  scaleAndSlide,
  staggeredFadeIn,
  bounceIn,
  slideHorizontalSmooth,
  fadeBlur,
  spring,
  slideUpBounce as slideUpBounceTransition,
  transitionPresets,
  gameTransitions,
  createStaggered,
  reduceMotionTransition
} from './utils/transitions.js';

export type {
  TransitionParams
} from './utils/transitions.js';

// Данные игр
export {
  GAMES_DATA,
  getActiveGames,
  getComingSoonGames,
  getGameById,
  getGamesByCategory
} from './data/games.js';

// Offline utils
export { isOnline, NetworkError, createRetryHandler, createOfflineQueue } from './utils/offline.js';