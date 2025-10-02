import { Application } from 'pixi.js';
import type { Application as PIXIApplication } from 'pixi.js';
import { SceneManager } from './SceneManager';
import { ResourceManager } from './ResourceManager';
import { BuildingSystem } from './BuildingSystem';
import type { InteractionEvent } from '../../types/Game';

export interface GameEngineConfig {
  width: number;
  height: number;
  backgroundColor: number;
  antialias: boolean;
  resolution: number;
}

export class GameEngine {
  private app: PIXIApplication;
  private sceneManager: SceneManager;
  private resourceManager: ResourceManager;
  private buildingSystem: BuildingSystem | null = null;
  private isInitialized = false;

  constructor(private config: GameEngineConfig) {
    this.app = new Application() as PIXIApplication;
    this.resourceManager = new ResourceManager();
    this.sceneManager = new SceneManager(this.app, this.resourceManager);
  }

  async initialize(canvas: globalThis.HTMLCanvasElement): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      if (!canvas) {
        throw new Error('Canvas element is required for GameEngine initialization');
      }

      await this.app.init({
        canvas,
        width: this.config.width,
        height: this.config.height,
        backgroundColor: this.config.backgroundColor,
        antialias: this.config.antialias,
        resolution: this.config.resolution,
        resizeTo: canvas
      });

      await this.resourceManager.loadBasicAssets();

      this.sceneManager.setupScene();
      this.sceneManager.drawGrid();
      this.sceneManager.refreshTerrain();

      this.buildingSystem = new BuildingSystem(this.sceneManager);

      this.app.stage.eventMode = 'static';
      this.app.stage.hitArea = this.app.screen;

      this.isInitialized = true;
    } catch (error) {
      this.isInitialized = false;
      console.error('Failed to initialize GameEngine:', error);
      throw new Error(`GameEngine initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  resize(width: number, height: number): void {
    if (!this.isInitialized) return;

    try {
      this.app.renderer.resize(width, height);
      this.sceneManager.onResize(width, height);
    } catch (error) {
      console.warn('Failed to resize GameEngine:', error);
    }
  }

  destroy(): void {
    try {
      if (this.buildingSystem) {
        this.buildingSystem.destroy();
        this.buildingSystem = null;
      }
      if (this.app) {
        this.app.destroy(true);
      }
      this.isInitialized = false;
    } catch (error) {
      console.warn('Error during GameEngine destruction:', error);
      this.isInitialized = false;
    }
  }

  get pixiApp(): PIXIApplication {
    return this.app;
  }

  get scenes(): SceneManager {
    return this.sceneManager;
  }

  get resources(): ResourceManager {
    return this.resourceManager;
  }

  get initialized(): boolean {
    return this.isInitialized;
  }

  get buildingManager(): BuildingSystem | null {
    return this.buildingSystem;
  }

  handleInteraction(event: InteractionEvent): void {
    if (this.buildingSystem) {
      this.buildingSystem.handleInteraction(event);
    }
  }

  handleKeyPress(key: string): void {
    if (this.buildingSystem) {
      this.buildingSystem.handleKeyPress(key);
    }
  }

  zoomIn(): void {
    const camera = this.sceneManager.getCamera();
    if (camera) {
      camera.zoomBy(0.2);
    }
  }

  zoomOut(): void {
    const camera = this.sceneManager.getCamera();
    if (camera) {
      camera.zoomBy(-0.2);
    }
  }

  getZoomLevel(): number {
    const camera = this.sceneManager.getCamera();
    return camera ? camera.getCameraState().zoom : 1.0;
  }

  canZoomIn(): boolean {
    const camera = this.sceneManager.getCamera();
    if (!camera) return false;
    const cameraState = camera.getCameraState();
    return cameraState.zoom < cameraState.bounds.maxZoom;
  }

  canZoomOut(): boolean {
    const camera = this.sceneManager.getCamera();
    if (!camera) return false;
    const cameraState = camera.getCameraState();
    return cameraState.zoom > cameraState.bounds.minZoom;
  }
}