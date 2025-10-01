import type { CellData, BuildingPlacement } from '../../types/Game';
import type { Building, BuildingConfig } from '../../types/Building';
import type { TerrainManager } from './TerrainManager';

export interface GridBounds {
  width: number;
  height: number;
}

export class GridManager {
  private occupiedCells: Map<string, CellData> = new Map();
  private gridBounds: GridBounds;
  private terrainManager: TerrainManager | null = null;

  constructor(gridWidth: number, gridHeight: number, terrainManager?: TerrainManager) {
    this.gridBounds = { width: gridWidth, height: gridHeight };
    this.terrainManager = terrainManager || null;
  }

  private getCellKey(gridX: number, gridY: number): string {
    return `${gridX},${gridY}`;
  }

  isValidPosition(gridX: number, gridY: number): boolean {
    if (this.terrainManager) {
      return this.terrainManager.getTilePosition(gridX, gridY) !== null;
    }

    return gridX >= 0 &&
           gridX < this.gridBounds.width &&
           gridY >= 0 &&
           gridY < this.gridBounds.height;
  }

  isCellOccupied(gridX: number, gridY: number): boolean {
    return this.occupiedCells.has(this.getCellKey(gridX, gridY));
  }

  canPlaceBuilding(gridX: number, gridY: number, buildingSize: { width: number; height: number }): boolean {
    for (let x = gridX; x < gridX + buildingSize.width; x++) {
      for (let y = gridY; y < gridY + buildingSize.height; y++) {
        if (!this.isValidPosition(x, y) || this.isCellOccupied(x, y)) {
          return false;
        }
      }
    }
    return true;
  }

  reserveCells(gridX: number, gridY: number, buildingSize: { width: number; height: number }, buildingId: string, buildingType: string): boolean {
    if (!this.canPlaceBuilding(gridX, gridY, buildingSize)) {
      return false;
    }

    const cellsToReserve: CellData[] = [];

    for (let x = gridX; x < gridX + buildingSize.width; x++) {
      for (let y = gridY; y < gridY + buildingSize.height; y++) {
        cellsToReserve.push({
          gridX: x,
          gridY: y,
          occupied: true,
          buildingId,
          buildingType
        });
      }
    }

    cellsToReserve.forEach(cell => {
      this.occupiedCells.set(this.getCellKey(cell.gridX, cell.gridY), cell);
    });

    return true;
  }

  freeCells(buildingId: string): void {
    const cellsToRemove: string[] = [];

    this.occupiedCells.forEach((cell, key) => {
      if (cell.buildingId === buildingId) {
        cellsToRemove.push(key);
      }
    });

    cellsToRemove.forEach(key => {
      this.occupiedCells.delete(key);
    });
  }

  getOccupiedCells(): CellData[] {
    return Array.from(this.occupiedCells.values());
  }

  getCellData(gridX: number, gridY: number): CellData | undefined {
    return this.occupiedCells.get(this.getCellKey(gridX, gridY));
  }

  getBuildingCells(buildingId: string): CellData[] {
    return Array.from(this.occupiedCells.values()).filter(
      cell => cell.buildingId === buildingId
    );
  }

  validatePlacement(gridX: number, gridY: number, buildingConfig: BuildingConfig): BuildingPlacement {
    const canPlace = this.canPlaceBuilding(gridX, gridY, buildingConfig.size);

    return {
      gridX,
      gridY,
      buildingType: buildingConfig.type,
      valid: canPlace
    };
  }

  getConflictingCells(gridX: number, gridY: number, buildingSize: { width: number; height: number }): CellData[] {
    const conflicts: CellData[] = [];

    for (let x = gridX; x < gridX + buildingSize.width; x++) {
      for (let y = gridY; y < gridY + buildingSize.height; y++) {
        const cellData = this.getCellData(x, y);
        if (cellData) {
          conflicts.push(cellData);
        }
      }
    }

    return conflicts;
  }

  getOccupiedArea(): number {
    return this.occupiedCells.size;
  }

  getTotalArea(): number {
    return this.gridBounds.width * this.gridBounds.height;
  }

  getOccupancyPercentage(): number {
    return (this.getOccupiedArea() / this.getTotalArea()) * 100;
  }

  clearGrid(): void {
    this.occupiedCells.clear();
  }

  initializeFromBuildings(buildings: Building[]): void {
    this.clearGrid();

    buildings.forEach(building => {
      const buildingConfig = this.getBuildingConfig(building.type);
      if (buildingConfig) {
        this.reserveCells(
          building.x,
          building.y,
          buildingConfig.size,
          building.id,
          building.type
        );
      }
    });
  }

  private getBuildingConfig(buildingType: string): { size: { width: number; height: number } } | null {
    const configs: Record<string, { size: { width: number; height: number } }> = {
      'central_bank': { size: { width: 2, height: 2 } },
      'security_hq': { size: { width: 3, height: 2 } },
      'capital_tower': { size: { width: 2, height: 3 } },
      'longevity_park': { size: { width: 4, height: 3 } },
      'partner_mall': { size: { width: 3, height: 3 } },
      'research_institute': { size: { width: 2, height: 2 } },
      'credit_office': { size: { width: 2, height: 2 } },
      'auto_showroom': { size: { width: 3, height: 2 } },
      'real_estate_agency': { size: { width: 3, height: 3 } }
    };

    return configs[buildingType] || null;
  }

  setTerrainManager(terrainManager: TerrainManager): void {
    this.terrainManager = terrainManager;
    const config = terrainManager.config;
    this.gridBounds = {
      width: config.map.width,
      height: config.map.height
    };
  }

  getTerrainManager(): TerrainManager | null {
    return this.terrainManager;
  }

  getIsometricPosition(gridX: number, gridY: number): { isoX: number; isoY: number } | null {
    if (this.terrainManager) {
      const tilePos = this.terrainManager.getTilePosition(gridX, gridY);
      return tilePos ? { isoX: tilePos.isoX, isoY: tilePos.isoY } : null;
    }
    return null;
  }

  getGridFromIsometric(isoX: number, isoY: number): { gridX: number; gridY: number } | null {
    if (this.terrainManager) {
      return this.terrainManager.getGridPosition(isoX, isoY);
    }
    return null;
  }

  updateBounds(newBounds: GridBounds): void {
    this.gridBounds = newBounds;
  }

  get bounds(): GridBounds {
    return { ...this.gridBounds };
  }
}
