import { Application, Container, Point, Graphics } from 'pixi.js';
import { CameraManager } from './CameraManager';
import { TerrainManager } from './TerrainManager';
import type { ResourceManager } from './ResourceManager';

export interface GridConfig {
  cellSize: number;
  gridWidth: number;
  gridHeight: number;
  gridColor: number;
  gridAlpha: number;
}

export type SkyType = 'day' | 'evening' | 'night';

export interface SkyConfig {
  type: SkyType;
  gradientColors: {
    start: number;
    end: number;
  };
}

export class SceneManager {
  private app: Application;
  private viewport: Container;
  private backgroundLayer: Container;
  private terrainLayer: Container;
  private gridLayer: Container;
  private buildingsLayer: Container;
  private uiLayer: Container;
  private cameraManager: CameraManager | null = null;
  private resourceManager: ResourceManager | null = null;
  private terrainManager: TerrainManager;

  private gridConfig: GridConfig = {
    cellSize: 96,
    gridWidth: 30,
    gridHeight: 20,
    gridColor: 0x333333,
    gridAlpha: 0.3
  };

  private currentSky: SkyType = 'day';
  private skyConfigs: Record<SkyType, SkyConfig> = {
    day: {
      type: 'day',
      gradientColors: {
        start: 0x58FFFF,
        end: 0x1919EF
      }
    },
    evening: {
      type: 'evening',
      gradientColors: {
        start: 0xDD41DB,
        end: 0x1919EF
      }
    },
    night: {
      type: 'night',
      gradientColors: {
        start: 0x000000,
        end: 0x060698
      }
    }
  };

  constructor(app: Application, resourceManager?: ResourceManager) {
    this.app = app;
    this.viewport = new Container();
    this.backgroundLayer = new Container();
    this.terrainLayer = new Container();
    this.gridLayer = new Container();
    this.buildingsLayer = new Container();
    this.uiLayer = new Container();
    this.resourceManager = resourceManager || null;
    this.terrainManager = new TerrainManager(this.resourceManager || undefined);
  }

  setupScene(): void {
    this.app.stage.removeChildren();

    this.viewport.label = 'viewport';
    this.backgroundLayer.label = 'background';
    this.terrainLayer.label = 'terrain';
    this.gridLayer.label = 'grid';
    this.buildingsLayer.label = 'buildings';
    this.uiLayer.label = 'ui';

    this.viewport.addChild(this.terrainLayer);
    this.viewport.addChild(this.gridLayer);
    this.viewport.addChild(this.buildingsLayer);

    this.app.stage.addChild(this.viewport);
    this.app.stage.addChild(this.uiLayer);

    this.setupTerrain();
    this.initializeCamera();

    if (this.cameraManager) {
      this.cameraManager.initializePosition();
    }
  }

  private initializeCamera(): void {
    const mapBounds = this.terrainManager.bounds;
    const worldWidth = mapBounds.maxX - mapBounds.minX;
    const worldHeight = mapBounds.maxY - mapBounds.minY;
    const voidMargin = this.terrainManager.getMapConfigManager().getVoidConfig().margin;

    this.cameraManager = new CameraManager(
      this.app,
      this.viewport,
      worldWidth,
      worldHeight,
      {
        maxZoom: 3.0,
        minZoom: 0.1,
        panSpeed: 1.0,
        zoomSpeed: 0.1,
        boundsMargin: voidMargin,
        smoothingFactor: 0.8
      }
    );
  }

  private createBackground(): void {
    this.backgroundLayer.removeChildren();
  }

  private colorToHex(color: number): string {
    return '#' + color.toString(16).padStart(6, '0');
  }

  private setupTerrain(): void {
    this.terrainLayer.removeChildren();

    if (!this.resourceManager) {
      console.warn('ResourceManager not available for terrain creation');
      return;
    }

    this.terrainManager.setResourceManager(this.resourceManager);
    this.terrainManager.setupTerrain();

    const { void: voidContainer, terrain: terrainContainer, highlight: highlightContainer } = this.terrainManager.containers;

    this.terrainLayer.addChild(voidContainer);
    this.terrainLayer.addChild(terrainContainer);
    this.terrainLayer.addChild(highlightContainer);
  }

  drawGrid(): void {
    this.gridLayer.removeChildren();

    const gridContainer = new Container();
    const grid = new Graphics();
    grid.stroke({
      color: this.gridConfig.gridColor,
      alpha: this.gridConfig.gridAlpha,
      width: 2
    });

    const { cellSize, gridWidth, gridHeight } = this.gridConfig;
    const totalWidth = gridWidth * cellSize;
    const totalHeight = gridHeight * cellSize;

    for (let x = 0; x <= gridWidth; x++) {
      const posX = x * cellSize;
      grid.moveTo(posX, 0);
      grid.lineTo(posX, totalHeight);
    }

    for (let y = 0; y <= gridHeight; y++) {
      const posY = y * cellSize;
      grid.moveTo(0, posY);
      grid.lineTo(totalWidth, posY);
    }

    gridContainer.addChild(grid);
    this.gridLayer.addChild(gridContainer);
  }

  onResize(width: number, height: number): void {
    if (this.cameraManager) {
      this.cameraManager.resize(width, height);
    }
  }

  getGridPosition(screenX: number, screenY: number): { gridX: number; gridY: number } {
    if (!this.cameraManager) {
      return { gridX: 0, gridY: 0 };
    }

    const worldPoint = this.viewport.toLocal(new Point(screenX, screenY));
    const worldPos = { x: worldPoint.x, y: worldPoint.y };
    const gridPos = this.terrainManager.getGridPosition(worldPos.x, worldPos.y);


    return gridPos || { gridX: 0, gridY: 0 };
  }

  getScreenPosition(gridX: number, gridY: number): { screenX: number; screenY: number } {
    if (!this.cameraManager) {
      return { screenX: 0, screenY: 0 };
    }

    const tilePos = this.terrainManager.getTilePosition(gridX, gridY);
    if (!tilePos) {
      return { screenX: 0, screenY: 0 };
    }

    const screenPoint = this.viewport.toGlobal(new Point(tilePos.isoX, tilePos.isoY));
    return { screenX: screenPoint.x, screenY: screenPoint.y };
  }

  isValidGridPosition(gridX: number, gridY: number): boolean {
    return this.terrainManager.getTilePosition(gridX, gridY) !== null;
  }

  highlightCell(gridX: number, gridY: number, color: number = 0x00ff00): void {
    this.clearHighlights();
    this.terrainManager.highlightTile(gridX, gridY, color);
  }

  clearHighlights(): void {
    this.terrainManager.clearHighlights();
  }

  highlightArea(
    tiles: Array<{ gridX: number; gridY: number }>,
    color: number = 0x00ff00,
    alpha: number = 0.35
  ): void {
    this.terrainManager.highlightTiles(tiles, color, alpha);
  }

  get layers() {
    return {
      viewport: this.viewport,
      background: this.backgroundLayer,
      terrain: this.terrainLayer,
      grid: this.gridLayer,
      buildings: this.buildingsLayer,
      ui: this.uiLayer
    };
  }

  get config() {
    return { ...this.gridConfig };
  }

  updateGridConfig(newConfig: Partial<GridConfig>): void {
    this.gridConfig = { ...this.gridConfig, ...newConfig };
    this.drawGrid();

    this.terrainManager.updateMapConfig({
      map: {
        width: this.gridConfig.gridWidth,
        height: this.gridConfig.gridHeight
      }
    });

    if (this.cameraManager) {
      const mapBounds = this.terrainManager.bounds;
      const worldWidth = mapBounds.maxX - mapBounds.minX;
      const worldHeight = mapBounds.maxY - mapBounds.minY;
      this.cameraManager.updateWorldBounds(worldWidth, worldHeight);
    }
  }

  public getCamera(): CameraManager | null {
    return this.cameraManager;
  }

  public getWorldPosition(gridX: number, gridY: number): { x: number; y: number } {
    const { cellSize } = this.gridConfig;
    return {
      x: gridX * cellSize + cellSize / 2,
      y: gridY * cellSize + cellSize / 2
    };
  }

  public setSkyType(skyType: SkyType): void {
    this.currentSky = skyType;
    this.createBackground();
  }

  public getSkyType(): SkyType {
    return this.currentSky;
  }

  public cycleSky(): void {
    const skyTypes: SkyType[] = ['day', 'evening', 'night'];
    const currentIndex = skyTypes.indexOf(this.currentSky);
    const nextIndex = (currentIndex + 1) % skyTypes.length;
    this.setSkyType(skyTypes[nextIndex]);
  }

  public setResourceManager(resourceManager: ResourceManager): void {
    this.resourceManager = resourceManager;
  }

  public refreshTerrain(): void {
    if (this.resourceManager) {
      this.setupTerrain();
      if (this.cameraManager) {
        this.cameraManager.initializePosition();
      }
    }
  }

  public getResourceManager(): ResourceManager | null {
    return this.resourceManager;
  }

  public getTerrainManager(): TerrainManager {
    return this.terrainManager;
  }

  public destroy(): void {
    if (this.cameraManager) {
      this.cameraManager.destroy();
      this.cameraManager = null;
    }
    this.terrainManager.destroy();
  }
}
