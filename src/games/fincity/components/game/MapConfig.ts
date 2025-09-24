export interface IsometricTileConfig {
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
}

export interface MapDimensions {
  width: number;
  height: number;
}

export interface IsometricMapConfiguration {
  map: MapDimensions;
  tile: IsometricTileConfig;
  void: {
    color: number;
    alpha: number;
    margin: number;
  };
}

export const DEFAULT_MAP_CONFIG: IsometricMapConfiguration = {
  map: {
    width: 20,
    height: 20
  },
  tile: {
    width: 334,
    height: 181,
    offsetX: 167,
    offsetY: 90.5
  },
  void: {
    color: 0x4a9c59,
    alpha: 1.0,
    margin: 1500
  }
};

export class MapConfigManager {
  private config: IsometricMapConfiguration;

  constructor(config?: Partial<IsometricMapConfiguration>) {
    this.config = this.mergeConfig(DEFAULT_MAP_CONFIG, config);
  }

  private mergeConfig(
    defaultConfig: IsometricMapConfiguration,
    userConfig?: Partial<IsometricMapConfiguration>
  ): IsometricMapConfiguration {
    if (!userConfig) return { ...defaultConfig };

    return {
      map: { ...defaultConfig.map, ...userConfig.map },
      tile: { ...defaultConfig.tile, ...userConfig.tile },
      void: { ...defaultConfig.void, ...userConfig.void }
    };
  }

  getConfig(): IsometricMapConfiguration {
    return { ...this.config };
  }

  updateConfig(newConfig: Partial<IsometricMapConfiguration>): void {
    this.config = this.mergeConfig(this.config, newConfig);
  }

  getMapDimensions(): MapDimensions {
    return { ...this.config.map };
  }

  getTileConfig(): IsometricTileConfig {
    return { ...this.config.tile };
  }

  getVoidConfig() {
    return { ...this.config.void };
  }

  setMapSize(width: number, height: number): void {
    this.config.map = { width, height };
  }

  setTileSize(width: number, height: number): void {
    this.config.tile.width = width;
    this.config.tile.height = height;
    this.config.tile.offsetX = width / 2;
    this.config.tile.offsetY = height / 2;
  }

  calculateMapBounds(): {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  } {
    const { map, tile } = this.config;
    const centerX = Math.floor(map.width / 2);
    const centerY = Math.floor(map.height / 2);

    // Крайние точки ромба
    const top = this.gridToIsometric(centerX, 0);
    const right = this.gridToIsometric(map.width - 1, centerY);
    const bottom = this.gridToIsometric(centerX, map.height - 1);
    const left = this.gridToIsometric(0, centerY);

    return {
      minX: left.isoX - tile.width / 2,
      maxX: right.isoX + tile.width / 2,
      minY: top.isoY - tile.height / 2,
      maxY: bottom.isoY + tile.height / 2
    };
  }

  gridToIsometric(gridX: number, gridY: number): { isoX: number; isoY: number } {
    const { tile } = this.config;
    const halfWidth = tile.width / 2;
    const halfHeight = tile.height / 2;
    return {
      isoX: (gridX - gridY) * halfWidth,
      isoY: (gridX + gridY) * halfHeight
    };
  }

  isometricToGrid(isoX: number, isoY: number): { gridX: number; gridY: number } {
    const { tile } = this.config;
    const halfWidth = tile.width / 2;
    const halfHeight = tile.height / 2;

    const x = isoX / halfWidth;
    const y = isoY / halfHeight;

    const gridX = Math.round((x + y) / 2);
    const gridY = Math.round((y - x) / 2);

    return { gridX, gridY };
  }

  isValidGridPosition(gridX: number, gridY: number): boolean {
    const { map } = this.config;
    return (
      gridX >= 0 &&
      gridY >= 0 &&
      gridX < map.width &&
      gridY < map.height
    );
  }
}

export const defaultMapConfig = new MapConfigManager();

export { MapConfigManager as MapConfig };
