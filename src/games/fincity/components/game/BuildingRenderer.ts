import { Container, Graphics, Text, TextStyle, FederatedPointerEvent, Sprite } from 'pixi.js';
import type { Building, BuildingConfig } from '../../types/Building';
import { BuildingType } from '../../types/Building';
import type { GridPosition } from '../../types/Game';
import type { ResourceManager } from './ResourceManager';

export interface BuildingVisual {
  container: Container;
  building: Building;
  sprite: Sprite | null;
  graphics?: Graphics;
  nameText?: Text;
  isGhost: boolean;
}

export interface PreviewData {
  container: Container;
  sprite?: Sprite;
  graphics?: Graphics;
  isValid: boolean;
  gridPosition: GridPosition;
  buildingType: BuildingType;
}

export class BuildingRenderer {
  private buildingsContainer: Container;
  private previewContainer: Container;
  private buildings: Map<string, BuildingVisual> = new Map();
  private currentPreview: PreviewData | null = null;
  private cellSize: number;
  private resourceManager: ResourceManager;

  constructor(buildingsContainer: Container, resourceManager: ResourceManager, cellSize: number = 96) {
    this.buildingsContainer = buildingsContainer;
    this.resourceManager = resourceManager;
    this.cellSize = cellSize;

    this.previewContainer = new Container();
    this.previewContainer.label = 'preview';
    this.buildingsContainer.addChild(this.previewContainer);
  }

  // Получаем размер одного тайла для зданий в изометрической проекции
  private getBuildingTileSize(): { width: number; height: number } {
    // Используем полный размер изометрического тайла для зданий
    // Это должно обеспечить правильное покрытие нужного количества тайлов
    return {
      width: 330,  // Полная ширина изометрического тайла
      height: 180  // Полная высота изометрического тайла
    };
  }

  createBuilding(building: Building, config: BuildingConfig, screenPosition: { x: number; y: number }): BuildingVisual {
    const container = new Container();
    container.label = `building_${building.id}`;
    container.x = screenPosition.x;
    container.y = screenPosition.y;

    const spriteContainer = new Container();
    const textContainer = new Container();

    const sprite = this.createBuildingSprite(config, false);
    if (sprite) {
      sprite.anchor.set(0.5, 1);  // Тот же anchor что у ландшафтных тайлов
      spriteContainer.addChild(sprite);
    } else {
      const graphics = this.createBuildingGraphics(config, false);
      spriteContainer.addChild(graphics);
    }

    const nameText = this.createBuildingLabel(config.name);
    nameText.x = 0;
    nameText.y = -20;
    textContainer.addChild(nameText);

    container.addChild(spriteContainer);
    container.addChild(textContainer);

    container.eventMode = 'static';
    container.cursor = 'pointer';

    this.setupBuildingInteractions(container, building);

    const visual: BuildingVisual = {
      container,
      building,
      sprite,
      nameText,
      isGhost: false
    };

    this.buildings.set(building.id, visual);
    this.buildingsContainer.addChild(container);

    return visual;
  }

  updateBuildingPosition(buildingId: string, screenPosition: { x: number; y: number }, _config: BuildingConfig): void {
    const visual = this.buildings.get(buildingId);
    if (visual) {
      visual.container.x = screenPosition.x;
      visual.container.y = screenPosition.y;
    }
  }

  removeBuilding(buildingId: string): void {
    const visual = this.buildings.get(buildingId);
    if (visual) {
      this.buildingsContainer.removeChild(visual.container);
      visual.container.destroy();
      this.buildings.delete(buildingId);
    }
  }

  showPreview(buildingType: BuildingType, config: BuildingConfig, gridPosition: GridPosition, screenPosition: { x: number; y: number }, isValid: boolean): void {
    this.hidePreview();

    const container = new Container();
    container.label = 'building_preview';
    container.x = screenPosition.x;
    container.y = screenPosition.y;

    const spriteContainer = new Container();
    const textContainer = new Container();

    const sprite = this.createBuildingSprite(config, true);
    let graphics: Graphics | undefined;

    if (sprite) {
      sprite.anchor.set(0.5, 1);  // Тот же anchor что у ландшафтных тайлов для предпросмотра
      spriteContainer.addChild(sprite);
      if (!isValid) {
        sprite.tint = 0xff0000;
        sprite.alpha = 0.5;
      }
    } else {
      graphics = this.createBuildingGraphics(config, true, isValid);
      spriteContainer.addChild(graphics);
    }

    const nameText = this.createBuildingLabel(config.name, true);
    nameText.x = 0;
    nameText.y = -20;
    textContainer.addChild(nameText);

    container.addChild(spriteContainer);
    container.addChild(textContainer);

    this.currentPreview = {
      container,
      sprite: sprite ?? undefined,
      graphics,
      isValid,
      gridPosition,
      buildingType
    };

    this.previewContainer.addChild(container);
  }

  updatePreview(gridPosition: GridPosition, screenPosition: { x: number; y: number }, isValid: boolean): void {
    if (this.currentPreview) {
      this.currentPreview.container.x = screenPosition.x;
      this.currentPreview.container.y = screenPosition.y;
      this.currentPreview.gridPosition = gridPosition;

      if (this.currentPreview.isValid !== isValid) {
        this.currentPreview.isValid = isValid;
        this.updatePreviewAppearance(isValid);
      }
    }
  }

  hidePreview(): void {
    if (this.currentPreview) {
      this.previewContainer.removeChild(this.currentPreview.container);
      this.currentPreview.container.destroy();
      this.currentPreview = null;
    }
  }

  hasPreview(): boolean {
    return this.currentPreview !== null;
  }

  getPreviewData(): PreviewData | null {
    return this.currentPreview;
  }

  public getBuilding(buildingId: string): BuildingVisual | undefined {
    return this.buildings.get(buildingId);
  }

  private createBuildingSprite(config: BuildingConfig, isPreview: boolean): Sprite | null {
    const textureKey = this.getBuildingTextureKey(config.type);
    const texture = this.resourceManager.getTexture(textureKey);

    if (!texture) {
      return null;
    }

    const sprite = new Sprite(texture);
    const tileSize = this.getBuildingTileSize();
    const targetWidth = config.size.width * tileSize.width;
    const targetHeight = config.size.height * tileSize.height;

    // Сохраняем пропорции изображения, масштабируя по наибольшему измерению
    const scaleX = targetWidth / texture.width;
    const scaleY = targetHeight / texture.height;
    const scale = Math.min(scaleX, scaleY); // Используем меньший масштаб чтобы изображение поместилось

    sprite.scale.set(scale);

    if (isPreview) {
      sprite.alpha = 0.6;
    }

    return sprite;
  }

  private getBuildingTextureKey(buildingType: BuildingType): string {
    const textureKeys: Record<BuildingType, string> = {
      'central_bank': 'building-central-bank',
      'security_hq': 'building-security-hq',
      'capital_tower': 'building-placeholder',
      'longevity_park': 'building-placeholder',
      'partner_mall': 'building-placeholder',
      'research_institute': 'building-placeholder'
    };
    return textureKeys[buildingType] || 'building-placeholder';
  }

  private createBuildingGraphics(config: BuildingConfig, isPreview: boolean, isValid: boolean = true): Graphics {
    const graphics = new Graphics();
    const tileSize = this.getBuildingTileSize();
    const width = config.size.width * tileSize.width;
    const height = config.size.height * tileSize.height;

    const color = this.getBuildingColor(config.type);
    const alpha = isPreview ? 0.8 : 1.0;

    if (isPreview && !isValid) {
      graphics.rect(0, 0, width, height);
      graphics.fill({ color: 0xff0000, alpha: 0.5 });
      graphics.stroke({ color: 0xff0000, width: 3, alpha: 1.0 });
    } else if (isPreview) {
      graphics.rect(0, 0, width, height);
      graphics.fill({ color, alpha: 0.6 });
      graphics.stroke({ color: 0xffffff, width: 3, alpha: 1.0 });

      const dashLength = 8;
      const gapLength = 4;
      const dashGraphics = new Graphics();
      dashGraphics.stroke({ color: 0xffffff, width: 2, alpha: 0.8 });

      for (let x = 0; x < width; x += dashLength + gapLength) {
        dashGraphics.moveTo(x, 0);
        dashGraphics.lineTo(Math.min(x + dashLength, width), 0);
        dashGraphics.moveTo(x, height);
        dashGraphics.lineTo(Math.min(x + dashLength, width), height);
      }

      for (let y = 0; y < height; y += dashLength + gapLength) {
        dashGraphics.moveTo(0, y);
        dashGraphics.lineTo(0, Math.min(y + dashLength, height));
        dashGraphics.moveTo(width, y);
        dashGraphics.lineTo(width, Math.min(y + dashLength, height));
      }

      graphics.addChild(dashGraphics);
      this.addBuildingDetails(graphics, config, width, height, alpha);
    } else {
      graphics.rect(0, 0, width, height);
      graphics.fill({ color, alpha });
      graphics.stroke({ color: this.darkenColor(color), width: 2, alpha });

      this.addBuildingDetails(graphics, config, width, height, alpha);
    }

    graphics.pivot.set(width / 2, height);  // Тот же pivot что у ландшафтных тайлов

    return graphics;
  }

  private createBuildingLabel(name: string, isPreview: boolean = false): Text {
    const style = new TextStyle({
      fontFamily: 'Inter, sans-serif',
      fontSize: isPreview ? 14 : 12,
      fontWeight: 'bold',
      fill: isPreview ? 0xffffff : 0x333333,
      stroke: isPreview ? { color: 0x000000, width: 2 } : { color: 0xffffff, width: 1 },
      align: 'center'
    });

    const text = new Text({ text: name, style });
    text.anchor.set(0.5, 1);

    if (isPreview) {
      text.alpha = 0.9;
    }

    return text;
  }

  private addBuildingDetails(graphics: Graphics, config: BuildingConfig, width: number, height: number, alpha: number): void {
    const iconSize = Math.min(width, height) * 0.3;
    const iconX = width / 2 - iconSize / 2;
    const iconY = height / 2 - iconSize / 2;

    graphics.rect(iconX, iconY, iconSize, iconSize);
    graphics.fill({ color: this.getIconColor(config.type), alpha: alpha * 0.9 });
    graphics.stroke({ color: 0xffffff, width: 2, alpha: alpha });

    if (width >= this.cellSize * 2 && height >= this.cellSize * 2) {
      const windowSize = 6;
      const windowSpacing = 12;
      const startX = 8;
      const startY = 8;

      for (let x = startX; x < width - windowSize; x += windowSpacing) {
        for (let y = startY; y < height - windowSize - iconSize; y += windowSpacing) {
          graphics.rect(x, y, windowSize, windowSize);
          graphics.fill({ color: 0xffffff, alpha: alpha * 0.7 });
          graphics.stroke({ color: this.darkenColor(0xffffff), width: 1, alpha: alpha * 0.5 });
        }
      }
    }

    const typeIcon = this.createTypeIcon(config.type, iconSize);
    if (typeIcon) {
      typeIcon.x = iconX + iconSize / 2;
      typeIcon.y = iconY + iconSize / 2;
      graphics.addChild(typeIcon);
    }
  }

  private setupBuildingInteractions(container: Container, building: Building): void {
    container.on('pointerover', () => {
      container.scale.set(1.05);
      container.zIndex = 1000;
    });

    container.on('pointerout', () => {
      container.scale.set(1.0);
      container.zIndex = 0;
    });

    container.on('pointertap', (event: FederatedPointerEvent) => {
      event.stopPropagation();
      this.onBuildingClick(building);
    });
  }

  private onBuildingClick(building: Building): void {
    console.log(`Building clicked: ${building.id} (${building.type})`);

    import('../../stores/ui').then(({ openModal }) => {
      openModal('building_upgrade', { buildingId: building.id });
    });
  }

  private updatePreviewAppearance(isValid: boolean): void {
    if (this.currentPreview) {
      if (this.currentPreview.sprite) {
        if (!isValid) {
          this.currentPreview.sprite.tint = 0xff0000;
          this.currentPreview.sprite.alpha = 0.5;
        } else {
          this.currentPreview.sprite.tint = 0xffffff;
          this.currentPreview.sprite.alpha = 0.6;
        }
      } else if (this.currentPreview.graphics) {
        this.currentPreview.graphics.clear();

        const config = this.getBuildingConfigByType(this.currentPreview.buildingType);
        if (config) {
          const newGraphics = this.createBuildingGraphics(config, true, isValid);
          this.currentPreview.container.removeChild(this.currentPreview.graphics);
          this.currentPreview.graphics = newGraphics;
          this.currentPreview.container.addChildAt(newGraphics, 0);
        }
      }
    }
  }

  private getPreviewSize(): { width: number; height: number } {
    if (this.currentPreview) {
      const config = this.getBuildingConfigByType(this.currentPreview.buildingType);
      return config ? config.size : { width: 1, height: 1 };
    }
    return { width: 1, height: 1 };
  }

  private getBuildingColor(buildingType: BuildingType): number {
    const colors: Record<BuildingType, number> = {
      'central_bank': 0x4a90e2,
      'security_hq': 0x7b68ee,
      'capital_tower': 0xf5a623,
      'longevity_park': 0x50c878,
      'partner_mall': 0xff6b6b,
      'research_institute': 0x9b59b6
    };
    return colors[buildingType] || 0x888888;
  }

  private getIconColor(buildingType: BuildingType): number {
    const colors: Record<BuildingType, number> = {
      'central_bank': 0x2e5db8,
      'security_hq': 0x5a4bba,
      'capital_tower': 0xd4941a,
      'longevity_park': 0x3ea66a,
      'partner_mall': 0xe55555,
      'research_institute': 0x824a9a
    };
    return colors[buildingType] || 0x666666;
  }

  private darkenColor(color: number): number {
    const r = Math.floor((color >> 16) * 0.7);
    const g = Math.floor(((color >> 8) & 0xff) * 0.7);
    const b = Math.floor((color & 0xff) * 0.7);
    return (r << 16) | (g << 8) | b;
  }

  private createTypeIcon(buildingType: BuildingType, size: number): Graphics | null {
    const icon = new Graphics();
    const halfSize = size / 2;

    switch (buildingType) {
      case BuildingType.CENTRAL_BANK:
        icon.circle(0, 0, halfSize * 0.6);
        icon.fill({ color: 0xffffff, alpha: 0.8 });
        icon.rect(-halfSize * 0.2, -halfSize * 0.6, halfSize * 0.4, halfSize * 1.2);
        icon.fill({ color: 0xffffff, alpha: 0.8 });
        break;

      case BuildingType.SECURITY_HQ:
        icon.poly([
          -halfSize * 0.5, halfSize * 0.3,
          -halfSize * 0.3, -halfSize * 0.5,
          halfSize * 0.3, -halfSize * 0.5,
          halfSize * 0.5, halfSize * 0.3,
          0, halfSize * 0.6
        ]);
        icon.fill({ color: 0xffffff, alpha: 0.8 });
        break;

      case BuildingType.CAPITAL_TOWER:
        icon.rect(-halfSize * 0.4, -halfSize * 0.6, halfSize * 0.8, halfSize * 1.2);
        icon.fill({ color: 0xffffff, alpha: 0.8 });
        icon.rect(-halfSize * 0.2, -halfSize * 0.8, halfSize * 0.4, halfSize * 0.4);
        icon.fill({ color: 0xffffff, alpha: 0.8 });
        break;

      case BuildingType.LONGEVITY_PARK:
        icon.circle(0, -halfSize * 0.3, halfSize * 0.4);
        icon.fill({ color: 0xffffff, alpha: 0.8 });
        icon.rect(-halfSize * 0.1, halfSize * 0.1, halfSize * 0.2, halfSize * 0.5);
        icon.fill({ color: 0xffffff, alpha: 0.8 });
        break;

      case BuildingType.PARTNER_MALL:
        icon.rect(-halfSize * 0.6, -halfSize * 0.4, halfSize * 1.2, halfSize * 0.8);
        icon.fill({ color: 0xffffff, alpha: 0.8 });
        icon.rect(-halfSize * 0.4, -halfSize * 0.6, halfSize * 0.2, halfSize * 0.4);
        icon.fill({ color: 0xffffff, alpha: 0.8 });
        icon.rect(halfSize * 0.2, -halfSize * 0.6, halfSize * 0.2, halfSize * 0.4);
        icon.fill({ color: 0xffffff, alpha: 0.8 });
        break;

      case BuildingType.RESEARCH_INSTITUTE:
        icon.rect(-halfSize * 0.5, -halfSize * 0.2, halfSize * 1.0, halfSize * 0.4);
        icon.fill({ color: 0xffffff, alpha: 0.8 });
        icon.poly([
          -halfSize * 0.5, -halfSize * 0.2,
          0, -halfSize * 0.6,
          halfSize * 0.5, -halfSize * 0.2
        ]);
        icon.fill({ color: 0xffffff, alpha: 0.8 });
        break;

      default:
        return null;
    }

    icon.position.set(0, 0);
    return icon;
  }

  private getBuildingConfigByType(buildingType: BuildingType): BuildingConfig | null {
    const configs: Record<BuildingType, BuildingConfig> = {
      [BuildingType.CENTRAL_BANK]: {
        type: BuildingType.CENTRAL_BANK,
        name: 'Центральный банк',
        description: 'Основа вашего финансового города',
        basePrice: { coins: 0, crystals: 0 },
        income: { coins: 10, crystals: 1, interval: 30000 },
        maxLevel: 5,
        size: { width: 2, height: 2 },
        unlockLevel: 1,
        bankProduct: 'Накопительный счет'
      },
      [BuildingType.SECURITY_HQ]: {
        type: BuildingType.SECURITY_HQ,
        name: 'Штаб-квартира безопасности',
        description: 'Защищает ваш город от угроз',
        basePrice: { coins: 500, crystals: 10 },
        income: { coins: 15, crystals: 2, interval: 45000 },
        maxLevel: 3,
        size: { width: 2, height: 2 },
        unlockLevel: 1,
        requiresBuilding: BuildingType.CENTRAL_BANK,
        bankProduct: 'Защита от мошенничества'
      },
      [BuildingType.CAPITAL_TOWER]: {
        type: BuildingType.CAPITAL_TOWER,
        name: 'Небоскреб "Капитал"',
        description: 'Высокодоходное здание',
        basePrice: { coins: 2000, crystals: 50 },
        income: { coins: 50, crystals: 5, interval: 60000 },
        maxLevel: 10,
        size: { width: 2, height: 3 },
        unlockLevel: 5,
        bankProduct: 'ИСЖ'
      },
      [BuildingType.LONGEVITY_PARK]: {
        type: BuildingType.LONGEVITY_PARK,
        name: 'Парк долголетия',
        description: 'Престижный парк',
        basePrice: { coins: 1500, crystals: 30 },
        income: { coins: 20, crystals: 3, interval: 120000 },
        maxLevel: 1,
        size: { width: 4, height: 3 },
        unlockLevel: 8,
        bankProduct: 'Долгосрочные сбережения'
      },
      [BuildingType.PARTNER_MALL]: {
        type: BuildingType.PARTNER_MALL,
        name: 'Торговый центр "Партнер"',
        description: 'Партнерские программы',
        basePrice: { coins: 1000, crystals: 25 },
        income: { coins: 30, crystals: 4, interval: 90000 },
        maxLevel: 5,
        size: { width: 3, height: 3 },
        unlockLevel: 4,
        bankProduct: 'Кэшбэк программы'
      },
      [BuildingType.RESEARCH_INSTITUTE]: {
        type: BuildingType.RESEARCH_INSTITUTE,
        name: 'Научный институт',
        description: 'Центр финансовой грамотности',
        basePrice: { coins: 800, crystals: 20 },
        income: { coins: 0, crystals: 0, interval: 0 },
        maxLevel: 3,
        size: { width: 2, height: 2 },
        unlockLevel: 3,
        bankProduct: 'Финансовая грамотность'
      }
    };
    return configs[buildingType] || null;
  }

  playUpgradeEffects(buildingId: string): void {
    const visual = this.buildings.get(buildingId);
    if (!visual) return;

    const position = { x: visual.container.x, y: visual.container.y };

    this.createFlashEffect(position);
    setTimeout(() => this.createSmokeEffect(position), 200);
    setTimeout(() => this.createFireworkEffect(position), 600);
  }

  private createFlashEffect(position: { x: number; y: number }): void {
    const flash = new Graphics();
    flash.circle(0, 0, 50);
    flash.fill({ color: 0xffffff, alpha: 0.8 });
    flash.x = position.x;
    flash.y = position.y - 50;

    this.buildingsContainer.addChild(flash);

    const startTime = Date.now();
    const duration = 300;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;

      if (progress >= 1) {
        this.buildingsContainer.removeChild(flash);
        flash.destroy();
        return;
      }

      const scale = 1 + progress * 1.5;
      const alpha = 0.8 * (1 - progress);

      flash.scale.set(scale);
      flash.alpha = alpha;

      requestAnimationFrame(animate);
    };

    animate();
  }

  private createSmokeEffect(position: { x: number; y: number }): void {
    const particles: Graphics[] = [];
    const particleCount = 8;

    for (let i = 0; i < particleCount; i++) {
      const particle = new Graphics();
      particle.circle(0, 0, 3 + Math.random() * 3);
      particle.fill({ color: 0x888888, alpha: 0.6 });

      const angle = (i / particleCount) * Math.PI * 2;
      const speed = 20 + Math.random() * 20;

      particle.x = position.x + Math.cos(angle) * 10;
      particle.y = position.y - 30 + Math.sin(angle) * 10;

      const velocity = {
        x: Math.cos(angle) * speed * 0.3,
        y: Math.sin(angle) * speed * 0.3 - 30
      };

      particles.push(particle);
      this.buildingsContainer.addChild(particle);

      this.animateParticle(particle, velocity, 1500, 0.6);
    }
  }

  private createFireworkEffect(position: { x: number; y: number }): void {
    const particles: Graphics[] = [];
    const particleCount = 12;
    const colors = [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0xf9ca24, 0xf0932b, 0xeb4d4b];

    for (let i = 0; i < particleCount; i++) {
      const particle = new Graphics();
      particle.circle(0, 0, 2 + Math.random() * 2);
      particle.fill({ color: colors[Math.floor(Math.random() * colors.length)], alpha: 1 });

      const angle = (i / particleCount) * Math.PI * 2;
      const speed = 40 + Math.random() * 40;

      particle.x = position.x;
      particle.y = position.y - 60;

      const velocity = {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed - 20
      };

      particles.push(particle);
      this.buildingsContainer.addChild(particle);

      this.animateParticle(particle, velocity, 2000, 1, 0.98);
    }
  }

  private animateParticle(
    particle: Graphics,
    velocity: { x: number; y: number },
    duration: number,
    initialAlpha: number,
    friction: number = 0.95
  ): void {
    const startTime = Date.now();
    let currentVelocity = { ...velocity };

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;

      if (progress >= 1) {
        this.buildingsContainer.removeChild(particle);
        particle.destroy();
        return;
      }

      currentVelocity.x *= friction;
      currentVelocity.y *= friction;
      currentVelocity.y += 1;

      particle.x += currentVelocity.x * 0.016;
      particle.y += currentVelocity.y * 0.016;

      particle.alpha = initialAlpha * (1 - progress);

      requestAnimationFrame(animate);
    };

    animate();
  }

  destroy(): void {
    this.buildings.clear();
    this.hidePreview();
    this.buildingsContainer.removeChild(this.previewContainer);
    this.previewContainer.destroy();
  }
}
