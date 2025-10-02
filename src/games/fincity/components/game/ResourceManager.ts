import { Assets, Texture, Spritesheet, Graphics } from 'pixi.js';

export interface AssetManifest {
  textures: Record<string, string>;
  sprites: Record<string, string>;
  atlases?: Record<string, {
    image: string;
    data: string;
  }>;
}

export interface LoadingStageInfo {
  stage: string;
  progress: number;
  assetsLoaded: number;
  totalAssets: number;
}

export type LoadingProgress = (progress: number, stage?: LoadingStageInfo) => void;

export interface AssetPriority {
  critical: string[];
  normal: string[];
  low: string[];
}

interface CachedAssetMetadata {
  version: string;
  timestamp: number;
  size: number;
}

export class ResourceManager {
  private textures: Map<string, Texture> = new Map();
  private spritesheets: Map<string, Spritesheet> = new Map();
  private isLoaded = false;
  private cacheEnabled = true;
  private readonly CACHE_KEY = 'fincity_assets_cache';
  private readonly CACHE_VERSION = '1.0.0';
  private readonly CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 дней

  async loadBasicAssets(onProgress?: LoadingProgress): Promise<void> {
    if (this.isLoaded) return;

    try {
      this.reportProgress(onProgress, 'Проверка кэша...', 0, 0, 0);

      const manifestResponse = await fetch('/games/fincity/manifest.json');
      const manifest: AssetManifest = await manifestResponse.json();

      const assetPriority = this.categorizeAssetsByPriority(manifest);

      this.reportProgress(onProgress, 'Загрузка критических ресурсов...', 0, 0, this.getTotalAssetCount(manifest));

      await this.loadPrioritizedAssets(manifest, assetPriority, onProgress);

      this.isLoaded = true;
      this.reportProgress(onProgress, 'Загрузка завершена', 100, this.getTotalAssetCount(manifest), this.getTotalAssetCount(manifest));
      console.log('All assets loaded successfully');
    } catch (error) {
      console.error('Failed to load assets:', error);
      this.isLoaded = false;
      throw new Error(`Asset loading failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private categorizeAssetsByPriority(manifest: AssetManifest): AssetPriority {
    const critical = ['terrain-grass', 'building-central-bank', 'ui-icons'];
    const normal = Object.keys({ ...manifest.textures, ...manifest.sprites });
    const low = manifest.atlases ? Object.keys(manifest.atlases) : [];

    return {
      critical: critical.filter(name => normal.includes(name)),
      normal: normal.filter(name => !critical.includes(name)),
      low
    };
  }

  private getTotalAssetCount(manifest: AssetManifest): number {
    const textureCount = Object.keys(manifest.textures || {}).length;
    const spriteCount = Object.keys(manifest.sprites || {}).length;
    const atlasCount = Object.keys(manifest.atlases || {}).length;
    return textureCount + spriteCount + atlasCount;
  }

  private reportProgress(onProgress?: LoadingProgress, stage: string = '', progress: number = 0, loaded: number = 0, total: number = 0): void {
    if (onProgress) {
      onProgress(progress / 100, {
        stage,
        progress,
        assetsLoaded: loaded,
        totalAssets: total
      });
    }
  }

  private async loadPrioritizedAssets(manifest: AssetManifest, priority: AssetPriority, onProgress?: LoadingProgress): Promise<void> {
    const totalAssets = this.getTotalAssetCount(manifest);
    let loadedAssets = 0;

    // Загрузка критических ассетов (0-40%)
    if (priority.critical.length > 0) {
      const criticalManifest = this.filterManifest(manifest, priority.critical);
      await this.loadFromManifest(criticalManifest, (progress) => {
        const stageProgress = progress * 40;
        loadedAssets = Math.floor((stageProgress / 100) * priority.critical.length);
        this.reportProgress(onProgress, 'Загрузка критических ресурсов...', stageProgress, loadedAssets, totalAssets);
      });
    }

    // Загрузка обычных ассетов (40-80%)
    if (priority.normal.length > 0) {
      const normalManifest = this.filterManifest(manifest, priority.normal);
      await this.loadFromManifest(normalManifest, (progress) => {
        const stageProgress = 40 + (progress * 40);
        loadedAssets = priority.critical.length + Math.floor(((stageProgress - 40) / 100) * priority.normal.length);
        this.reportProgress(onProgress, 'Загрузка основных ресурсов...', stageProgress, loadedAssets, totalAssets);
      });
    }

    // Загрузка дополнительных ассетов (80-100%)
    if (priority.low.length > 0 && manifest.atlases) {
      const atlasManifest = { textures: {}, sprites: {}, atlases: manifest.atlases };
      await this.loadFromManifest(atlasManifest, (progress) => {
        const stageProgress = 80 + (progress * 20);
        loadedAssets = priority.critical.length + priority.normal.length + Math.floor(((stageProgress - 80) / 100) * priority.low.length);
        this.reportProgress(onProgress, 'Загрузка дополнительных ресурсов...', stageProgress, loadedAssets, totalAssets);
      });
    }
  }

  private filterManifest(manifest: AssetManifest, assetNames: string[]): AssetManifest {
    const filtered: AssetManifest = { textures: {}, sprites: {} };

    for (const name of assetNames) {
      if (manifest.textures[name]) {
        filtered.textures[name] = manifest.textures[name];
      }
      if (manifest.sprites[name]) {
        filtered.sprites[name] = manifest.sprites[name];
      }
    }

    return filtered;
  }

  getSpritesheet(name: string): Spritesheet | null {
    return this.spritesheets.get(name) || null;
  }

  getRandomGrassTexture(): Texture | null {
    const grassSpritesheet = this.spritesheets.get('terrain-grass');

    if (!grassSpritesheet || !grassSpritesheet.textures) {
      console.warn('No grass spritesheet found, creating fallback. Available spritesheets:', Array.from(this.spritesheets.keys()));
      console.warn('Available textures in Map:', Array.from(this.textures.keys()));
      return this.createFallbackGrassTexture();
    }

    const grassTextureKeys = Object.keys(grassSpritesheet.textures);


    if (grassTextureKeys.length === 0) {
      console.warn('No grass textures in spritesheet, creating fallback');
      return this.createFallbackGrassTexture();
    }

    const randomIndex = Math.floor(Math.random() * grassTextureKeys.length);
    const randomGrassTexture = grassTextureKeys[randomIndex];

    return grassSpritesheet.textures[randomGrassTexture] || this.createFallbackGrassTexture();
  }

  private createFallbackGrassTexture(): Texture {
    const graphics = new Graphics();
    graphics.rect(0, 0, 96, 96);
    graphics.fill({ color: 0x4a7c59, alpha: 1.0 });

    const cacheKey = 'fallback_grass_96_96';
    const cachedTexture = Assets.cache.get(cacheKey) as Texture;
    if (cachedTexture) {
      graphics.destroy();
      return cachedTexture;
    }

    return Assets.cache.set(cacheKey, graphics) as unknown as Texture;
  }

  getTexture(name: string): Texture | null {
    return this.textures.get(name) || null;
  }

  hasTexture(name: string): boolean {
    return this.textures.has(name);
  }

  async loadFromManifest(manifest: AssetManifest, onProgress?: LoadingProgress): Promise<void> {
    const allAssets = { ...manifest.textures, ...manifest.sprites };
    const assetNames = Object.keys(allAssets);
    const totalAssets = assetNames.length + (manifest.atlases ? Object.keys(manifest.atlases).length : 0);

    if (totalAssets === 0) {
      if (onProgress) onProgress(1);
      return;
    }

    try {
      if (assetNames.length > 0) {
        Assets.addBundle('game', allAssets);

        const loadedAssets = await Assets.loadBundle('game', (progress) => {
          if (onProgress) onProgress(progress * 0.7);
        });

        for (const [name, asset] of Object.entries(loadedAssets)) {
          if (asset instanceof Texture) {
            this.textures.set(name, asset);
            if (asset.source && asset.source.style) {
              Object.assign(asset.source, {
                autoGenerateMipmaps: false
              });
              Object.assign(asset.source.style, {
                mipmapFilter: 'nearest',
                scaleMode: 'linear'
              });
            }
          }
        }
      }

      if (manifest.atlases) {
        const atlasesLoaded = Object.keys(manifest.atlases).length;
        let currentAtlas = 0;

        for (const [name, atlas] of Object.entries(manifest.atlases)) {
          try {
            const dataResponse = await fetch(atlas.data);
            const atlasData = await dataResponse.json();

            const texture = await Assets.load(atlas.image);
            const spritesheet = new Spritesheet(texture, atlasData);
            await spritesheet.parse();

            this.spritesheets.set(name, spritesheet);

            for (const [frameName, frameTexture] of Object.entries(spritesheet.textures)) {
              this.textures.set(`${name}-${frameName}`, frameTexture);
              if (frameTexture.source && frameTexture.source.style) {
                Object.assign(frameTexture.source, {
                  autoGenerateMipmaps: false
                });
                Object.assign(frameTexture.source.style, {
                  mipmapFilter: 'nearest',
                  scaleMode: 'linear'
                });
              }
            }

            currentAtlas++;
            if (onProgress) {
              onProgress(0.7 + (currentAtlas / atlasesLoaded) * 0.3);
            }
          } catch (error) {
            console.error(`Failed to load atlas ${name}:`, error);
            throw error;
          }
        }
      }

      if (onProgress) onProgress(1);
    } catch (error) {
      console.error('Failed to load manifest assets:', error);
      throw error;
    }
  }

  preloadTexture(name: string, url: string): Promise<Texture> {
    return Assets.load(url).then((texture: Texture) => {
      this.textures.set(name, texture);
      return texture;
    });
  }

  unload(name: string): void {
    const texture = this.textures.get(name);
    if (texture) {
      texture.destroy(true);
      this.textures.delete(name);
    }
  }

  unloadAll(): void {
    for (const [, texture] of this.textures) {
      texture.destroy(true);
    }
    this.textures.clear();

    for (const [, spritesheet] of this.spritesheets) {
      spritesheet.destroy(true);
    }
    this.spritesheets.clear();

    this.isLoaded = false;
  }

  async optimizeMemoryUsage(): Promise<void> {
    if (!this.textures.size) return;

    const unusedTextures: string[] = [];
    const currentTime = Date.now();

    for (const [name, texture] of this.textures) {
      if (texture.source && texture.source.destroyed) {
        unusedTextures.push(name);
        continue;
      }

      const metadata = this.getCacheMetadata(name);
      if (metadata && currentTime - metadata.timestamp > this.CACHE_EXPIRY) {
        unusedTextures.push(name);
      }
    }

    for (const name of unusedTextures) {
      this.unload(name);
    }

    if (import.meta.env.DEV && typeof window !== 'undefined' && 'gc' in window) {
      try {
        (window as any).gc();
      } catch {
        // GC may not be available in all browsers
      }
    }

    if (import.meta.env.DEV) {
      console.log(`Memory optimization completed. Removed ${unusedTextures.length} unused textures.`);
    }
  }

  private getCacheMetadata(name: string): CachedAssetMetadata | null {
    try {
      if (typeof localStorage === 'undefined') return null;

      const cached = localStorage.getItem(`${this.CACHE_KEY}_${name}`);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  }

  private setCacheMetadata(name: string, size: number): void {
    try {
      if (typeof localStorage === 'undefined' || !this.cacheEnabled) return;

      const metadata: CachedAssetMetadata = {
        version: this.CACHE_VERSION,
        timestamp: Date.now(),
        size
      };

      localStorage.setItem(`${this.CACHE_KEY}_${name}`, JSON.stringify(metadata));
    } catch (error) {
      console.warn(`Failed to cache metadata for ${name}:`, error);
    }
  }

  async preloadNextBatch(assets: string[]): Promise<void> {
    if (!assets.length) return;

    const batch = assets.slice(0, 5); // Загружаем по 5 ассетов за раз
    const promises = batch.map(async (assetUrl) => {
      try {
        const texture = await Assets.load(assetUrl);
        const assetName = assetUrl.split('/').pop()?.split('.')[0] || assetUrl;
        this.textures.set(assetName, texture);
        this.setCacheMetadata(assetName, texture.source?.width * texture.source?.height * 4 || 1024);
        return texture;
      } catch (error) {
        console.warn(`Failed to preload asset ${assetUrl}:`, error);
        return null;
      }
    });

    await Promise.allSettled(promises);
  }

  getMemoryUsage(): { textures: number; spritesheets: number; totalMB: number } {
    let textureMemory = 0;
    let spritesheetMemory = 0;

    for (const [, texture] of this.textures) {
      if (texture.source) {
        textureMemory += texture.source.width * texture.source.height * 4; // RGBA
      }
    }

    for (const [, spritesheet] of this.spritesheets) {
      if (spritesheet.textures && Object.keys(spritesheet.textures).length > 0) {
        const firstTexture = Object.values(spritesheet.textures)[0];
        spritesheetMemory += firstTexture.width * firstTexture.height * 4;
      }
    }

    const totalBytes = textureMemory + spritesheetMemory;
    const totalMB = totalBytes / (1024 * 1024);

    return {
      textures: this.textures.size,
      spritesheets: this.spritesheets.size,
      totalMB: Math.round(totalMB * 100) / 100
    };
  }

  get loadedTextures(): string[] {
    return Array.from(this.textures.keys());
  }

  get loaded(): boolean {
    return this.isLoaded;
  }

  getTextureNames(): string[] {
    return Array.from(this.textures.keys());
  }

  getAllTextures(): Map<string, Texture> {
    return new Map(this.textures);
  }
}
