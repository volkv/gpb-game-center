<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { GameEngine, type GameEngineConfig } from '../game/GameEngine';
  import { ZoomControls } from '.';
  import type { InteractionEvent, LoadingProgressHandler } from '../types';
  import type { LoadingStageInfo } from '../game/ResourceManager';

  interface Props {
    backgroundColor?: number;
    onGameReady?: (engine: GameEngine) => void;
    onInteraction?: (event: InteractionEvent) => void;
    onLoadingProgress?: LoadingProgressHandler;
    class?: string;
  }

  let {
    backgroundColor = 0x4a9c59,
    onGameReady,
    onInteraction,
    class: className = ''
  }: Props = $props();

  let canvasElement: globalThis.HTMLCanvasElement;
  let containerElement: HTMLDivElement;
  let gameEngine: GameEngine | null = null;
  let isLoading = $state(true);
  let loadingProgress = $state(0);
  let loadingStageInfo = $state<LoadingStageInfo | undefined>(undefined);
  let errorMessage = $state<string | null>(null);
  let containerSize = $state({ width: 800, height: 600 });
  let canZoomIn = $state(true);
  let canZoomOut = $state(true);

  let config = $derived<GameEngineConfig>({
    width: containerSize.width,
    height: containerSize.height,
    backgroundColor,
    antialias: true,
    resolution: globalThis.window.devicePixelRatio || 1
  });

  onMount(async () => {
    try {
      updateContainerSize();

      gameEngine = new GameEngine(config);
      await gameEngine.initialize(canvasElement);

      setupInteractionHandlers();
      setupKeyboardHandlers();
      setupResizeObserver();

      isLoading = false;

      if (onGameReady && gameEngine) {
        onGameReady(gameEngine);
      }

      updateZoomState();
    } catch (error) {
      console.error('Failed to initialize game engine:', error);
      errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      isLoading = false;
    }
  });

  onDestroy(() => {
    if (gameEngine) {
      gameEngine.destroy();
      gameEngine = null;
    }
  });

  function setupInteractionHandlers() {
    if (!gameEngine || !canvasElement) return;

    const canvas = canvasElement;

    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('mousemove', handleCanvasMouseMove);
    canvas.addEventListener('touchstart', handleCanvasTouchStart, { passive: false });
    canvas.addEventListener('touchend', handleCanvasTouchEnd, { passive: false });

    window.addEventListener('resize', handleResize);
  }

  function getCanvasCoordinates(event: MouseEvent) {
    if (!canvasElement) {
      return { x: event.offsetX, y: event.offsetY };
    }

    const rect = canvasElement.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  function getTouchCoordinates(touch: globalThis.Touch) {
    if (!canvasElement) {
      return { x: touch.clientX, y: touch.clientY };
    }

    const rect = canvasElement.getBoundingClientRect();
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
  }

  function handleCanvasClick(event: MouseEvent) {
    if (!gameEngine) return;

    const { x, y } = getCanvasCoordinates(event);

    const gridPos = gameEngine.scenes.getGridPosition(x, y);

    const interactionEvent: InteractionEvent = {
      type: 'click',
      position: { x, y },
      gridPosition: gridPos,
      data: {
        button: event.button,
        altKey: event.altKey,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey
      }
    };

    gameEngine.handleInteraction(interactionEvent);

    if (onInteraction) {
      onInteraction(interactionEvent);
    }
  }

  function handleCanvasMouseMove(event: MouseEvent) {
    if (!gameEngine) return;

    const { x, y } = getCanvasCoordinates(event);

    const gridPos = gameEngine.scenes.getGridPosition(x, y);

    const interactionEvent: InteractionEvent = {
      type: 'hover',
      position: { x, y },
      gridPosition: gridPos
    };

    gameEngine.handleInteraction(interactionEvent);

    if (onInteraction) {
      onInteraction(interactionEvent);
    }
  }

  function handleCanvasTouchStart(event: globalThis.TouchEvent) {
    if (!gameEngine) return;

    event.preventDefault();

    if (event.touches.length === 1) {
      const touch = event.touches[0];
      const { x, y } = getTouchCoordinates(touch);
      const gridPos = gameEngine.scenes.getGridPosition(x, y);

      const interactionEvent: InteractionEvent = {
        type: 'hover',
        position: { x, y },
        gridPosition: gridPos
      };

      gameEngine.handleInteraction(interactionEvent);

      if (onInteraction) {
        onInteraction(interactionEvent);
      }
    }
  }

  function handleCanvasTouchEnd(event: globalThis.TouchEvent) {
    if (!gameEngine) return;

    event.preventDefault();

    if (event.changedTouches.length === 1) {
      const touch = event.changedTouches[0];
      const { x, y } = getTouchCoordinates(touch);
      const gridPos = gameEngine.scenes.getGridPosition(x, y);

      const interactionEvent: InteractionEvent = {
        type: 'click',
        position: { x, y },
        gridPosition: gridPos
      };

      gameEngine.handleInteraction(interactionEvent);

      if (onInteraction) {
        onInteraction(interactionEvent);
      }
    }
  }

  function updateContainerSize() {
    if (containerElement) {
      const rect = containerElement.getBoundingClientRect();
      containerSize = {
        width: rect.width || 800,
        height: rect.height || 600
      };

      config.width = containerSize.width;
      config.height = containerSize.height;
    }
  }

  function handleResize() {
    if (!gameEngine) return;

    updateContainerSize();
    gameEngine.resize(containerSize.width, containerSize.height);
  }

  function setupResizeObserver() {
    if (!containerElement || !globalThis.ResizeObserver) return;

    const resizeObserver = new globalThis.ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        containerSize = { width, height };

        if (gameEngine) {
          gameEngine.resize(width, height);
        }
      }
    });

    resizeObserver.observe(containerElement);

    return () => {
      resizeObserver.disconnect();
    };
  }

  function setupKeyboardHandlers() {
    function handleKeyDown(event: KeyboardEvent) {
      if (gameEngine) {
        gameEngine.handleKeyPress(event.key);
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }

  function handleZoomIn() {
    if (gameEngine) {
      gameEngine.zoomIn();
      updateZoomState();
    }
  }

  function handleZoomOut() {
    if (gameEngine) {
      gameEngine.zoomOut();
      updateZoomState();
    }
  }

  function updateZoomState() {
    if (gameEngine) {
      canZoomIn = gameEngine.canZoomIn();
      canZoomOut = gameEngine.canZoomOut();
    }
  }

  $effect(() => {
    config.width = containerSize.width;
    config.height = containerSize.height;
  });

  $effect(() => {
    if (gameEngine && canvasElement) {
      const dpr = globalThis.window.devicePixelRatio || 1;

      canvasElement.width = containerSize.width * dpr;
      canvasElement.height = containerSize.height * dpr;

      canvasElement.style.width = containerSize.width + 'px';
      canvasElement.style.height = containerSize.height + 'px';
    }
  });
</script>

<div class="game-canvas-wrapper {className}">
  <div class="game-canvas-container" bind:this={containerElement}>
    {#if isLoading}
      <div class="loading-overlay">
        <div class="loading-content">
          <div class="loading-spinner"></div>
          <div class="loading-text">Загрузка игры...</div>
          <div class="loading-progress">
            <div class="progress-bar">
              <div class="progress-fill" style="width: {loadingProgress}%"></div>
            </div>
            <div class="progress-text">{Math.round(loadingProgress)}%</div>
          </div>
        </div>
      </div>
    {/if}

    {#if errorMessage}
      <div class="error-overlay">
        <div class="error-content">
          <div class="error-icon">⚠️</div>
          <div class="error-title">Ошибка загрузки игры</div>
          <div class="error-message">{errorMessage}</div>
          <button class="error-retry" onclick={() => window.location.reload()}>
            Перезагрузить
          </button>
        </div>
      </div>
    {/if}

    <canvas
      bind:this={canvasElement}
      class="game-canvas"
      class:hidden={isLoading || errorMessage}
      width={containerSize.width * (globalThis.window.devicePixelRatio || 1)}
      height={containerSize.height * (globalThis.window.devicePixelRatio || 1)}
      style="width: {containerSize.width}px; height: {containerSize.height}px;"
    ></canvas>
  </div>

  <ZoomControls
    onZoomIn={handleZoomIn}
    onZoomOut={handleZoomOut}
    {canZoomIn}
    {canZoomOut}
    class="game-zoom-controls"
  />
</div>

<style>

  .game-canvas-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .game-canvas-container {
    position: relative;
    width: 100%;
    height: 100%;
    background: var(--color-gpb-blue);
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    touch-action: manipulation;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  .game-canvas {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: var(--radius-lg);
    cursor: grab;
    pointer-events: auto;
  }

  .game-canvas:active {
    cursor: grabbing;
  }

  .game-canvas.hidden {
    display: none;
  }

  .loading-overlay,
  .error-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(16, 24, 32, 0.9);
    backdrop-filter: blur(8px);
    z-index: 10;
  }

  .loading-content,
  .error-content {
    text-align: center;
    color: white;
    padding: 2rem;
  }

  .loading-spinner {
    width: 3rem;
    height: 3rem;
    border: 3px solid rgba(255, 255, 255, 0.2);
    border-top: 3px solid var(--color-gpb-blue);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }

  .loading-text {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  .loading-progress {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .progress-bar {
    width: 12rem;
    height: 0.5rem;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 0.25rem;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--color-gpb-blue), var(--color-gpb-light));
    border-radius: 0.25rem;
    transition: width 0.3s ease;
  }

  .progress-text {
    font-size: 0.875rem;
    opacity: 0.8;
  }

  .error-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .error-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  .error-message {
    font-size: 1rem;
    opacity: 0.8;
    margin-bottom: 1.5rem;
  }

  .error-retry {
    padding: 0.75rem 1.5rem;
    background: var(--color-gpb-blue);
    color: white;
    border: none;
    border-radius: var(--radius);
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .error-retry:hover {
    background: var(--color-gpb-light);
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @media (max-width: 640px) {
    :global(.game-zoom-controls) {
      bottom: 1rem !important;
      right: 1rem !important;
    }
  }
</style>
