<script lang="ts">
  import { onMount } from 'svelte';
  import {
    LoadingScreen, TopBar, ActionButtons, BuildMenu, BuildingInfo, BuildingUpgrade, QuestLog, Settings,
    GameCanvas, Toast, Onboarding, Achievement, IconTest
  } from './components/ui';

  import { currentScreen, isLoading, initializeGame, checkIfFirstTime, isFirstTime, setGameEngine } from './stores/gameState';
  import { toasts, hideToast } from './stores/ui';
  import { playerData, setUserName, resetPlayerData } from './stores/playerData';
  import { resetGameState } from './stores/gameState';
  import { resetQuests } from './stores/quests';
  import { resetAchievements } from './stores/achievements';
  import { resetUIState } from './stores/ui';
  import type { GameEngine } from './components/game';
  import type { InteractionEvent } from './types/Game';

  let gameEngine = $state<GameEngine | null>(null);
  let gameLoadingProgress = $state(0);

  onMount(() => {
    console.log('🚀 [APP] FinCity App.svelte onMount() started');

    resetAllStores();

    setTimeout(() => {
      console.log('🎮 [APP] Initializing game after 3s delay');
      initializeGame();
    }, 3000);

    const unsubscribePlayerData = playerData.subscribe(() => {
    });

    return () => {
      unsubscribePlayerData();
    };
  });

  function resetAllStores() {
    try {
      resetPlayerData();
      resetGameState();
      resetQuests();
      resetAchievements();
      resetUIState();

      console.log('All stores reset to initial state');
    } catch (error) {
      console.error('Failed to reset stores:', error);
    }
  }

  function handleGameReady(engine: GameEngine) {
    gameEngine = engine;
    setGameEngine(engine);
  }

  function handleGameInteraction(event: InteractionEvent) {
    if (event.type === 'click' && gameEngine) {
      const { gridX, gridY } = event.gridPosition;
      if (gameEngine.scenes.isValidGridPosition(gridX, gridY)) {
        console.log(`Grid position clicked: ${gridX}, ${gridY}`);
      }
    }
  }

  function handleGameProgress(progress: number) {
    gameLoadingProgress = Math.round(progress * 100);
  }
</script>

<svelte:head>
  <title>FinCity - Построй свою финансовую империю</title>
  <meta name="description" content="Игровой симулятор финансового города от Газпромбанка" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<div class="app fincity-game">
  {#if $isLoading}
    <LoadingScreen progress={gameLoadingProgress} />
  {:else if $currentScreen === 'test'}
    <IconTest />
  {:else if $currentScreen === 'main'}
    {(() => {
      console.log('🎯 [APP] Rendering main screen. Current gameState:', {
        currentScreen: $currentScreen,
        isLoading: $isLoading,
        isFirstTime: $isFirstTime
      });
      return '';
    })()}
    <main class="game-screen">
      <TopBar />

      <div class="game-content">
        <GameCanvas
          backgroundColor={0x4a9c59}
          onGameReady={handleGameReady}
          onInteraction={handleGameInteraction}
          onLoadingProgress={handleGameProgress}
          class="game-canvas"
        />
      </div>

      <ActionButtons />
    </main>

    <BuildMenu gameEngine={gameEngine} />
    <BuildingInfo />
    <BuildingUpgrade />
    <QuestLog />
    <Settings />
    <Achievement />
    {console.log('🎬 [APP] About to render Onboarding component')}
    <Onboarding />
  {:else}
    <div class="fallback-screen">
      <h1>FinCity</h1>
      <p>Неизвестный экран: {$currentScreen}</p>
    </div>
  {/if}
</div>

{#if $toasts.length > 0}
  <div class="toast-container">
    {#each $toasts as toast, index (toast.id)}
      <Toast
        visible={true}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        duration={toast.duration}
        onclose={() => hideToast(toast.id)}
        style={`transform: translateY(-${index * 120}px);`}
      />
    {/each}
  </div>
{/if}

<style>
  .app {
    min-height: 100vh;
    transition: colors 300ms;
    overflow: hidden;
    background: white;
  }

  .game-screen {
    position: relative;
    height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .game-content {
    flex: 1;
    position: relative;
    overflow: hidden;
    touch-action: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  :global(.game-canvas) {
    width: 100%;
    height: 100%;
  }

  .fallback-screen {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  .fallback-screen > * + * {
    margin-top: 1rem;
  }

  .fallback-screen h1 {
    font-size: 2.25rem;
    font-weight: bold;
    color: #111827;
  }

  .fallback-screen p {
    font-size: 1.125rem;
    color: #4b5563;
  }

  .toast-container {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 50;
    pointer-events: none;
  }

  @media (max-width: 640px) {
    .toast-container {
      top: 0.5rem;
      right: 0.5rem;
      left: 0.5rem;
    }
  }

  @media (orientation: landscape) and (max-height: 500px) {
    .game-content {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }

    :global(.top-bar) {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      z-index: 40;
      padding: 0.25rem 0;
    }

    :global(.action-buttons) {
      position: absolute;
      bottom: 0.5rem;
      right: 0.5rem;
      z-index: 30;
    }
  }

  @media (orientation: landscape) and (max-height: 400px) {
    :global(.top-bar) {
      padding: 0.25rem 0;
    }

    :global(.top-bar .top-bar-content) {
      padding: 0.25rem;
      gap: 0.25rem;
    }

    :global(.top-bar .user-greeting) {
      font-size: 0.75rem;
    }

    :global(.top-bar .resource-value) {
      font-size: 0.75rem;
    }

    :global(.action-buttons) {
      bottom: 0.25rem;
      right: 0.25rem;
      transform: scale(0.9);
    }
  }

  @media (max-width: 320px) {
    .app {
      font-size: 0.75rem;
    }

    .game-screen {
      position: relative;
    }

    .toast-container {
      top: 0.25rem;
      right: 0.25rem;
      left: 0.25rem;
    }
  }
</style>