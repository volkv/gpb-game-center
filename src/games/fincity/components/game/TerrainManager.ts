import { Container, Sprite, Graphics } from 'pixi.js';
import type { Graphics as PIXIGraphics } from 'pixi.js';
import type { ResourceManager } from './ResourceManager';
import { MapConfigManager, type IsometricMapConfiguration } from './MapConfig';

export interface TilePosition {
  gridX: number;
  gridY: number;
  isoX: number;
  isoY: number;
}

export class TerrainManager {
  private terrainContainer: Container;
  private voidContainer: Container;
  private highlightContainer: Container;
  private resourceManager: ResourceManager | null = null;
  private mapConfigManager: MapConfigManager;
  private tiles: Map<string, Sprite> = new Map();
  private currentHighlights: PIXIGraphics[] = [];
  private mapOrigin = { x: 0, y: 0 };
  private layoutBounds = { minX: 0, maxX: 0, minY: 0, maxY: 0 };
  private worldBounds = { minX: 0, maxX: 0, minY: 0, maxY: 0 };
  private tilePadding = 36;

  constructor(resourceManager?: ResourceManager, mapConfig?: Partial<IsometricMapConfiguration>) {
    this.terrainContainer = new Container();
    this.voidContainer = new Container();
    this.highlightContainer = new Container();
    this.resourceManager = resourceManager || null;
    this.mapConfigManager = new MapConfigManager(mapConfig);

    this.terrainContainer.label = 'terrain-tiles';
    this.voidContainer.label = 'void-background';
    this.highlightContainer.label = 'highlight-overlay';
  }

  private recalculateBounds(): void {
    const mapBounds = this.mapConfigManager.calculateMapBounds();
    this.layoutBounds = mapBounds;
    this.mapOrigin = {
      x: -mapBounds.minX,
      y: -mapBounds.minY
    };
    this.worldBounds = {
      minX: 0,
      maxX: mapBounds.maxX - mapBounds.minX,
      minY: 0,
      maxY: mapBounds.maxY - mapBounds.minY
    };
  }

  private isValidGridPosition(gridX: number, gridY: number): boolean {
    return this.mapConfigManager.isValidGridPosition(gridX, gridY);
  }

  private getTileKey(gridX: number, gridY: number): string {
    return `${gridX},${gridY}`;
  }

  createVoidBackground(): void {
    this.voidContainer.removeChildren();

    const voidBackground = new Graphics() as PIXIGraphics;
    const mapBounds = this.layoutBounds;
    const voidConfig = this.mapConfigManager.getVoidConfig();

    const extendedBounds = {
      minX: mapBounds.minX - voidConfig.margin,
      maxX: mapBounds.maxX + voidConfig.margin,
      minY: mapBounds.minY - voidConfig.margin,
      maxY: mapBounds.maxY + voidConfig.margin
    };

    const voidWidth = extendedBounds.maxX - extendedBounds.minX;
    const voidHeight = extendedBounds.maxY - extendedBounds.minY;

    voidBackground.rect(
      extendedBounds.minX + this.mapOrigin.x,
      extendedBounds.minY + this.mapOrigin.y,
      voidWidth,
      voidHeight
    );
    voidBackground.fill({ color: voidConfig.color, alpha: voidConfig.alpha });

    this.voidContainer.addChild(voidBackground);
  }

  createTerrain(): void {
    this.terrainContainer.removeChildren();
    this.tiles.clear();

    if (!this.resourceManager) {
      console.warn('ResourceManager not available for terrain creation');
      return;
    }

    const mapDimensions = this.mapConfigManager.getMapDimensions();
    let successfulTiles = 0;
    let failedTiles = 0;

    for (let gridX = 0; gridX < mapDimensions.width; gridX++) {
      for (let gridY = 0; gridY < mapDimensions.height; gridY++) {
        const grassTexture = this.resourceManager.getRandomGrassTexture();

        if (grassTexture) {
          const grassSprite = new Sprite(grassTexture);
          const { isoX, isoY } = this.mapConfigManager.gridToIsometric(gridX, gridY);
          const tileConfig = this.mapConfigManager.getTileConfig();

          grassSprite.width = tileConfig.width;
          grassSprite.height = tileConfig.height + this.tilePadding;
          grassSprite.x = isoX + this.mapOrigin.x;
          grassSprite.y = isoY + this.mapOrigin.y;
          grassSprite.anchor.set(0.5, 1);

          const tileKey = this.getTileKey(gridX, gridY);
          this.tiles.set(tileKey, grassSprite);
          this.terrainContainer.addChild(grassSprite);
          successfulTiles++;

          if (gridX === 0 && gridY === 0) {
            console.log('Terrain tile info:', {
              gridPos: { gridX, gridY },
              isoPos: { x: isoX, y: isoY },
              textureSize: { width: grassTexture.width, height: grassTexture.height },
              mapConfig: this.mapConfigManager.getConfig()
            });
          }
        } else {
          console.warn(`Failed to get grass texture for tile at (${gridX}, ${gridY})`);
          failedTiles++;
        }
      }
    }

    console.log(`Created terrain: ${successfulTiles} successful, ${failedTiles} failed out of ${mapDimensions.width * mapDimensions.height} total tiles`);
  }

  setupTerrain(): void {
    this.recalculateBounds();
    this.createVoidBackground();
    this.createTerrain();
  }

  getTilePosition(gridX: number, gridY: number): TilePosition | null {
    if (!this.isValidGridPosition(gridX, gridY)) {
      return null;
    }

    const { isoX, isoY } = this.mapConfigManager.gridToIsometric(gridX, gridY);
    return {
      gridX,
      gridY,
      isoX: isoX + this.mapOrigin.x,
      isoY: isoY + this.mapOrigin.y
    };
  }

  getGridPosition(isoX: number, isoY: number): { gridX: number; gridY: number } | null {
    const localIsoX = isoX - this.mapOrigin.x;
    const localIsoY = isoY - this.mapOrigin.y;
    const { gridX, gridY } = this.mapConfigManager.isometricToGrid(localIsoX, localIsoY);


    if (!this.isValidGridPosition(gridX, gridY)) {
      return null;
    }

    return { gridX, gridY };
  }

  getTile(gridX: number, gridY: number): Sprite | null {
    const tileKey = this.getTileKey(gridX, gridY);
    return this.tiles.get(tileKey) || null;
  }

  highlightTile(
    gridX: number,
    gridY: number,
    color: number = 0x00ff00,
    options: { alpha?: number; clear?: boolean } = {}
  ): void {
    const { alpha = 0.35, clear = true } = options;

    if (clear) {
      this.clearHighlights();
    }

    const tilePos = this.getTilePosition(gridX, gridY);
    if (!tilePos) return;

    const highlight = new Graphics() as PIXIGraphics;
    const config = this.mapConfigManager.getConfig();

    const halfWidth = config.tile.width / 2;
    const halfHeight = config.tile.height / 2;

    highlight.poly([
      0, -halfHeight,
      halfWidth, 0,
      0, halfHeight,
      -halfWidth, 0
    ]);
    highlight.fill({ color, alpha });
    highlight.stroke({ color, width: 2, alpha: Math.min(1, alpha + 0.35) });

    highlight.x = tilePos.isoX ;
    highlight.y = tilePos.isoY + halfHeight ;

    this.currentHighlights.push(highlight);
    this.highlightContainer.addChild(highlight);
  }

  highlightTiles(
    tiles: Array<{ gridX: number; gridY: number }>,
    color: number = 0x00ff00,
    alpha: number = 0.35
  ): void {
    this.clearHighlights();

    tiles.forEach((tile, index) => {
      this.highlightTile(tile.gridX, tile.gridY, color, {
        alpha,
        clear: index === 0
      });
    });
  }

  clearHighlights(): void {
    if (!this.currentHighlights.length) return;

    this.currentHighlights.forEach((highlight) => {
      this.highlightContainer.removeChild(highlight);
      highlight.destroy();
    });
    this.currentHighlights = [];
  }

  setResourceManager(resourceManager: ResourceManager): void {
    this.resourceManager = resourceManager;
  }

  refreshTerrain(): void {
    if (this.resourceManager) {
      this.createTerrain();
    }
  }

  updateMapConfig(newConfig: Partial<IsometricMapConfiguration>): void {
    this.mapConfigManager.updateConfig(newConfig);
    this.setupTerrain();
  }

  getMapConfigManager(): MapConfigManager {
    return this.mapConfigManager;
  }

  get containers() {
    return {
      void: this.voidContainer,
      terrain: this.terrainContainer,
      highlight: this.highlightContainer
    };
  }

  get config() {
    return this.mapConfigManager.getConfig();
  }

  get bounds() {
    return { ...this.worldBounds };
  }

  get overlap(): number {
    return this.tilePadding;
  }

  destroy(): void {
    this.tiles.forEach(tile => tile.destroy());
    this.tiles.clear();
    this.clearHighlights();
    this.terrainContainer.destroy();
    this.voidContainer.destroy();
    this.highlightContainer.destroy();
  }
}
