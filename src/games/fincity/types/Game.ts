import type { Application, Container } from 'pixi.js';

export interface Vector2D {
  x: number;
  y: number;
}

export interface GridPosition {
  gridX: number;
  gridY: number;
}

export interface ScreenPosition {
  screenX: number;
  screenY: number;
}

export interface GameConfiguration {
  canvas: {
    width: number;
    height: number;
    backgroundColor: number;
    antialias: boolean;
    resolution: number;
  };
  grid: {
    cellSize: number;
    gridWidth: number;
    gridHeight: number;
    gridColor: number;
    gridAlpha: number;
  };
  rendering: {
    fps: number;
    vsync: boolean;
    pixelPerfect: boolean;
  };
}

export interface GameLayers {
  background: Container;
  grid: Container;
  buildings: Container;
  ui: Container;
}

export interface CellData {
  gridX: number;
  gridY: number;
  occupied: boolean;
  buildingId?: string;
  buildingType?: string;
}

export interface BuildingPlacement {
  gridX: number;
  gridY: number;
  buildingType: string;
  valid: boolean;
}

export interface GameEventData {
  type: string;
  payload?: unknown;
  timestamp: number;
}

export interface InteractionEvent {
  type: 'click' | 'hover' | 'drag' | 'drop';
  position: Vector2D;
  gridPosition: GridPosition;
  target?: string;
  data?: unknown;
}

export interface RenderContext {
  app: Application;
  layers: GameLayers;
  deltaTime: number;
  totalTime: number;
}

export interface AnimationState {
  id: string;
  type: 'position' | 'scale' | 'rotation' | 'alpha';
  target: Container;
  from: number | Vector2D;
  to: number | Vector2D;
  duration: number;
  elapsed: number;
  easing: (t: number) => number;
  completed: boolean;
}

export interface CameraState {
  x: number;
  y: number;
  zoom: number;
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    minZoom: number;
    maxZoom: number;
  };
}

export interface InputState {
  mouse: {
    x: number;
    y: number;
    buttons: Set<number>;
    wheel: number;
  };
  touch: {
    touches: Map<number, Vector2D>;
    pinchDistance: number;
  };
  keyboard: {
    keys: Set<string>;
  };
}

export interface GameStats {
  fps: number;
  frameTime: number;
  drawCalls: number;
  objectsRendered: number;
  memoryUsage: number;
}

export type GameEventHandler = (event: GameEventData) => void;
export type InteractionHandler = (event: InteractionEvent) => void;
export type ResizeHandler = (width: number, height: number) => void;
export type LoadingProgressHandler = (progress: number, stage: string) => void;