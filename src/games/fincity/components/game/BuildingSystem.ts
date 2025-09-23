import { GridManager } from './GridManager';
import { BuildingRenderer } from './BuildingRenderer';
import { SceneManager } from './SceneManager';
import { buildingConfigs, addBuilding, hasBuildingOfType } from '../../stores/buildings';
import { gameState } from '../../stores/gameState';
import { playerData } from '../../stores/playerData';
import { showToast } from '../../stores/ui';
import { get } from 'svelte/store';
import type { Building, BuildingConfig } from '../../types/Building';
import { BuildingType } from '../../types/Building';
import { GameMode } from '../../types/GameState';
import type { GridPosition, InteractionEvent } from '../../types/Game';
import type { TilePosition } from './TerrainManager';

export enum BuildingMode {
  NORMAL = 'normal',
  BUILDING = 'building'
}

export interface BuildingSystemState {
  mode: BuildingMode;
  selectedBuildingType: BuildingType | null;
  selectedBuildingConfig: BuildingConfig | null;
  isValidPlacement: boolean;
  previewPosition: GridPosition | null;
}

export class BuildingSystem {
  private gridManager: GridManager;
  private buildingRenderer: BuildingRenderer;
  private sceneManager: SceneManager;
  private state: BuildingSystemState;

  constructor(sceneManager: SceneManager) {
    this.sceneManager = sceneManager;
    this.gridManager = new GridManager(
      sceneManager.config.gridWidth,
      sceneManager.config.gridHeight
    );

    const resourceManager = sceneManager.getResourceManager();
    if (!resourceManager) {
      throw new Error('ResourceManager is required for BuildingSystem');
    }

    this.buildingRenderer = new BuildingRenderer(
      sceneManager.layers.buildings,
      resourceManager,
      sceneManager.config.cellSize
    );

    this.state = {
      mode: BuildingMode.NORMAL,
      selectedBuildingType: null,
      selectedBuildingConfig: null,
      isValidPlacement: false,
      previewPosition: null
    };

    this.initializeFromExistingBuildings();
  }

  private initializeFromExistingBuildings(): void {
    const currentPlayerData = get(playerData);
    this.gridManager.initializeFromBuildings(currentPlayerData.buildings);

    currentPlayerData.buildings.forEach(building => {
      this.renderExistingBuilding(building);
    });
  }

  private renderExistingBuilding(building: Building): void {
    const config = buildingConfigs[building.type];
    if (config) {
      const worldPos = this.getBuildingWorldPosition(
        building.x,
        building.y,
        config.size
      );
      if (!worldPos) return;
      this.buildingRenderer.createBuilding(building, config, worldPos);
    }
  }

  startBuildingMode(buildingType: BuildingType): boolean {
    const config = buildingConfigs[buildingType];
    if (!config) {
      showToast('error', 'Ошибка', 'Неизвестный тип здания');
      return false;
    }

    const currentPlayerData = get(playerData);

    if (currentPlayerData.level < config.unlockLevel) {
      showToast('warning', 'Здание заблокировано', `Требуется ${config.unlockLevel} уровень`);
      return false;
    }

    if (config.requiresBuilding && !get(hasBuildingOfType)(config.requiresBuilding)) {
      const requiredConfig = buildingConfigs[config.requiresBuilding];
      showToast('warning', 'Здание заблокировано', `Сначала постройте: ${requiredConfig.name}`);
      return false;
    }

    if (!this.canAffordBuilding(config)) {
      showToast('error', 'Недостаточно ресурсов', 'Нужно больше монет или кристаллов');
      return false;
    }

    this.state.mode = BuildingMode.BUILDING;
    this.state.selectedBuildingType = buildingType;
    this.state.selectedBuildingConfig = config;
    this.state.isValidPlacement = false;
    this.state.previewPosition = null;

    this.updateGameState();

    showToast('info', 'Режим строительства', `Выберите место для: ${config.name}`);
    return true;
  }

  cancelBuildingMode(): void {
    if (this.state.mode === BuildingMode.BUILDING) {
      this.buildingRenderer.hidePreview();
      this.state.mode = BuildingMode.NORMAL;
      this.state.selectedBuildingType = null;
      this.state.selectedBuildingConfig = null;
      this.state.isValidPlacement = false;
      this.state.previewPosition = null;

      this.updateGameState();
      this.sceneManager.clearHighlights();

      showToast('info', 'Строительство отменено', '');
    }
  }

  handleInteraction(event: InteractionEvent): void {
    if (this.state.mode === BuildingMode.BUILDING && this.state.selectedBuildingConfig) {
      this.handleBuildingModeInteraction(event);
    } else {
      this.handleNormalModeInteraction(event);
    }
  }

  private handleBuildingModeInteraction(event: InteractionEvent): void {
    const { gridX, gridY } = event.gridPosition;

    if (event.type === 'hover' || event.type === 'click') {
      this.updateBuildingPreview(gridX, gridY);
    }

    if (event.type === 'click' && this.state.isValidPlacement && this.state.selectedBuildingConfig) {
      this.placeBuilding(gridX, gridY);
    }
  }

  private handleNormalModeInteraction(event: InteractionEvent): void {
    const { gridX, gridY } = event.gridPosition;

    if (event.type === 'hover') {
      if (this.sceneManager.isValidGridPosition(gridX, gridY)) {
        this.sceneManager.highlightCell(gridX, gridY, 0x00ff00);
      } else {
        this.sceneManager.clearHighlights();
      }
    } else if (event.type === 'click') {
      const buildingAtPosition = this.findBuildingAt(gridX, gridY);
      if (buildingAtPosition) {
        console.log('Building clicked:', buildingAtPosition.id, `(${buildingAtPosition.type})`);
        this.openBuildingInfo(buildingAtPosition);
      }
    }
  }

  private updateBuildingPreview(gridX: number, gridY: number): void {
    if (!this.state.selectedBuildingConfig) return;

    const isValid = this.gridManager.canPlaceBuilding(
      gridX,
      gridY,
      this.state.selectedBuildingConfig.size
    );

    this.state.isValidPlacement = isValid;
    this.state.previewPosition = { gridX, gridY };

    const worldPos = this.getBuildingWorldPosition(
      gridX,
      gridY,
      this.state.selectedBuildingConfig.size
    );

    if (!worldPos) {
      this.buildingRenderer.hidePreview();
      this.sceneManager.clearHighlights();
      return;
    }

    if (this.sceneManager.isValidGridPosition(gridX, gridY)) {
      this.buildingRenderer.showPreview(
        this.state.selectedBuildingType!,
        this.state.selectedBuildingConfig,
        { gridX, gridY },
        worldPos,
        isValid
      );

      this.highlightPlacementArea(gridX, gridY, isValid);
    } else {
      this.buildingRenderer.hidePreview();
      this.sceneManager.clearHighlights();
    }
  }

  private highlightPlacementArea(gridX: number, gridY: number, isValid: boolean): void {
    if (!this.state.selectedBuildingConfig) return;

    const color = isValid ? 0x00ff00 : 0xff0000;
    const { width, height } = this.state.selectedBuildingConfig.size;

    const tilesToHighlight: Array<{ gridX: number; gridY: number }> = [];

    for (let x = gridX; x < gridX + width; x++) {
      for (let y = gridY; y < gridY + height; y++) {
        if (this.sceneManager.isValidGridPosition(x, y)) {
          tilesToHighlight.push({ gridX: x, gridY: y });
        }
      }
    }

    if (tilesToHighlight.length) {
      this.sceneManager.highlightArea(tilesToHighlight, color, isValid ? 0.35 : 0.45);
    } else {
      this.sceneManager.clearHighlights();
    }
  }

  private getBuildingWorldPosition(
    gridX: number,
    gridY: number,
    size: { width: number; height: number }
  ): { x: number; y: number } | null {
    const terrainManager = this.sceneManager.getTerrainManager();
    const tiles: TilePosition[] = [];

    for (let x = gridX; x < gridX + size.width; x++) {
      for (let y = gridY; y < gridY + size.height; y++) {
        const tilePos = terrainManager.getTilePosition(x, y);
        if (tilePos) {
          tiles.push(tilePos);
        }
      }
    }

    if (!tiles.length) {
      return null;
    }

    // Находим границы всех тайлов
    const minIsoX = tiles.reduce((min, tile) => Math.min(min, tile.isoX), Number.POSITIVE_INFINITY);
    const maxIsoX = tiles.reduce((max, tile) => Math.max(max, tile.isoX), Number.NEGATIVE_INFINITY);
    const maxIsoY = tiles.reduce((max, tile) => Math.max(max, tile.isoY), Number.NEGATIVE_INFINITY);
    
    // Позиционируем здание с учетом anchor (0.5, 1) и компенсируем padding тайлов
    const terrainPadding = terrainManager.overlap;
    return {
      x: (minIsoX + maxIsoX) / 2,
      y: maxIsoY + terrainPadding  // Компенсируем padding тайлов для правильного прилегания к земле
    };
  }

  private placeBuilding(gridX: number, gridY: number): boolean {
    if (!this.state.selectedBuildingConfig || !this.state.selectedBuildingType) {
      return false;
    }

    if (!this.canAffordBuilding(this.state.selectedBuildingConfig)) {
      showToast('error', 'Недостаточно ресурсов', 'Ресурсы закончились во время строительства');
      return false;
    }

    const success = addBuilding(this.state.selectedBuildingType, gridX, gridY);

    if (success) {
      const currentPlayerData = get(playerData);
      const newBuilding = currentPlayerData.buildings[currentPlayerData.buildings.length - 1];

      this.gridManager.reserveCells(
        gridX,
        gridY,
        this.state.selectedBuildingConfig.size,
        newBuilding.id,
        this.state.selectedBuildingType
      );

      const worldPos = this.getBuildingWorldPosition(
        gridX,
        gridY,
        this.state.selectedBuildingConfig.size
      );
      if (!worldPos) return false;
      this.buildingRenderer.createBuilding(newBuilding, this.state.selectedBuildingConfig, worldPos);

      showToast('success', 'Здание построено!', this.state.selectedBuildingConfig.name);

      this.cancelBuildingMode();
      return true;
    } else {
      showToast('error', 'Ошибка строительства', 'Не удалось построить здание');
      return false;
    }
  }

  removeBuilding(buildingId: string): boolean {
    const visual = this.buildingRenderer.getBuilding(buildingId);
    if (visual) {
      this.gridManager.freeCells(buildingId);
      this.buildingRenderer.removeBuilding(buildingId);
      showToast('info', 'Здание снесено', '');
      return true;
    }
    return false;
  }

  private canAffordBuilding(config: BuildingConfig): boolean {
    const currentPlayerData = get(playerData);
    return currentPlayerData.resources.coins >= config.basePrice.coins &&
           currentPlayerData.resources.crystals >= config.basePrice.crystals;
  }

  private updateGameState(): void {
    gameState.update(state => ({
      ...state,
      mode: this.state.mode === BuildingMode.BUILDING ? GameMode.BUILDING : GameMode.NORMAL
    }));
  }

  isInBuildingMode(): boolean {
    return this.state.mode === BuildingMode.BUILDING;
  }

  getSelectedBuildingType(): BuildingType | null {
    return this.state.selectedBuildingType;
  }

  getCurrentState(): BuildingSystemState {
    return { ...this.state };
  }

  private findBuildingAt(gridX: number, gridY: number): Building | null {
    const currentPlayerData = get(playerData);
    return currentPlayerData.buildings.find(building => {
      const config = buildingConfigs[building.type];
      const buildingEndX = building.x + config.size.width - 1;
      const buildingEndY = building.y + config.size.height - 1;

      return gridX >= building.x && gridX <= buildingEndX &&
             gridY >= building.y && gridY <= buildingEndY;
    }) || null;
  }

  private openBuildingInfo(building: Building): void {
    import('../../stores/ui').then(({ openModal }) => {
      openModal('building_upgrade', { buildingId: building.id });
    });
  }

  getGridManager(): GridManager {
    return this.gridManager;
  }

  getBuildingRenderer(): BuildingRenderer {
    return this.buildingRenderer;
  }

  handleKeyPress(key: string): void {
    if (key === 'Escape' && this.state.mode === BuildingMode.BUILDING) {
      this.cancelBuildingMode();
    }
  }

  destroy(): void {
    this.buildingRenderer.destroy();
    this.gridManager.clearGrid();
  }
}
