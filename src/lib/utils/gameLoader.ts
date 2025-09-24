import type { ComponentType, Component } from 'svelte';
import type { Game } from '$lib/types/Game';
import { errorHandler, withErrorHandling } from './errorHandler.js';

export interface LoadedGameComponent {
	component: ComponentType;
	game: Game;
	loadedAt: Date;
}

export interface GameLoadError {
	gameId: string;
	error: Error;
	timestamp: Date;
	retryCount: number;
}

class GameLoaderService {
	private cache = new Map<string, LoadedGameComponent>();
	private loadingPromises = new Map<string, Promise<ComponentType>>();
	private errorCache = new Map<string, GameLoadError>();
	private maxRetries = 3;
	private cacheExpiryTime = 5 * 60 * 1000; // 5 минут

	async loadGame(game: Game): Promise<ComponentType> {
		const cacheKey = game.id;

		if (this.cache.has(cacheKey)) {
			const cached = this.cache.get(cacheKey)!;
			if (this.isCacheValid(cached.loadedAt)) {
				return cached.component;
			} else {
				this.cache.delete(cacheKey);
			}
		}

		if (this.loadingPromises.has(cacheKey)) {
			return this.loadingPromises.get(cacheKey)!;
		}

		const loadPromise = this.loadGameComponent(game);
		this.loadingPromises.set(cacheKey, loadPromise);

		try {
			const component = await loadPromise;

			this.cache.set(cacheKey, {
				component,
				game,
				loadedAt: new Date()
			});

			this.clearError(game.id);
			return component;
		} catch (error) {
			this.handleLoadError(game.id, error as Error);
			throw error;
		} finally {
			this.loadingPromises.delete(cacheKey);
		}
	}

	private async loadGameComponent(game: Game): Promise<ComponentType> {
		const startTime = performance.now();

		try {
			const module = await this.dynamicImport(game.componentPath);

			if (import.meta.env.DEV) {
				const loadTime = performance.now() - startTime;
				console.log(`Game ${game.id} loaded in ${loadTime.toFixed(2)}ms`);
			}

			if (!module.default) {
				throw new Error(`Game component ${game.componentPath} does not have a default export`);
			}

			return module.default;
		} catch (error) {
			if (import.meta.env.DEV) {
				const loadTime = performance.now() - startTime;
				console.error(`Failed to load game ${game.id} after ${loadTime.toFixed(2)}ms:`, error);
			}
			throw new Error(`Failed to load game component: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}

	private async dynamicImport(path: string): Promise<{ default: any }> {
		switch (path) {
			case '/games/quiz-shield-ruble/QuizGame.svelte':
				return import('../../games/quiz-shield-ruble/QuizGame.svelte');
			case '/games/match3-golden-reserve/Match3Demo.svelte':
				return import('../../games/match3-golden-reserve/Match3Demo.svelte');
			case '/games/crossword-financial/CrosswordDemo.svelte':
				return import('../../games/crossword-financial/CrosswordDemo.svelte');
			case '/games/fincity/FincityGame.svelte':
				return import('../../games/fincity/FincityGame.svelte');
			default:
				throw new Error(`Unknown game component path: ${path}`);
		}
	}

	private handleLoadError(gameId: string, error: Error): void {
		const existing = this.errorCache.get(gameId);
		const retryCount = existing ? existing.retryCount + 1 : 1;

		this.errorCache.set(gameId, {
			gameId,
			error,
			timestamp: new Date(),
			retryCount
		});

		if (retryCount >= this.maxRetries && import.meta.env.DEV) {
			console.error(`Game ${gameId} failed to load after ${this.maxRetries} attempts`);
		}
	}

	private clearError(gameId: string): void {
		this.errorCache.delete(gameId);
	}

	private isCacheValid(loadedAt: Date): boolean {
		const now = new Date().getTime();
		const loadTime = loadedAt.getTime();
		return (now - loadTime) < this.cacheExpiryTime;
	}

	canRetry(gameId: string): boolean {
		const error = this.errorCache.get(gameId);
		return !error || error.retryCount < this.maxRetries;
	}

	async retryLoad(game: Game): Promise<ComponentType> {
		if (!this.canRetry(game.id)) {
			throw new Error(`Maximum retry attempts reached for game ${game.id}`);
		}

		this.cache.delete(game.id);
		this.loadingPromises.delete(game.id);

		return this.loadGame(game);
	}

	preloadGame(game: Game): Promise<ComponentType> {
		return this.loadGame(game).catch(error => {
			if (import.meta.env.DEV) {
				console.warn(`Preload failed for game ${game.id}:`, error);
			}
			return Promise.reject(error);
		});
	}

	isGameLoaded(gameId: string): boolean {
		const cached = this.cache.get(gameId);
		return cached ? this.isCacheValid(cached.loadedAt) : false;
	}

	isGameLoading(gameId: string): boolean {
		return this.loadingPromises.has(gameId);
	}

	getLoadError(gameId: string): GameLoadError | null {
		return this.errorCache.get(gameId) || null;
	}

	clearCache(gameId?: string): void {
		if (gameId) {
			this.cache.delete(gameId);
			this.loadingPromises.delete(gameId);
			this.errorCache.delete(gameId);
		} else {
			this.cache.clear();
			this.loadingPromises.clear();
			this.errorCache.clear();
		}
	}

	getCacheStats() {
		return {
			cachedGames: this.cache.size,
			loadingGames: this.loadingPromises.size,
			failedGames: this.errorCache.size,
			totalMemoryUsage: this.estimateMemoryUsage()
		};
	}

	private estimateMemoryUsage(): number {
		// More accurate memory estimation
		let totalSize = 0;
		this.cache.forEach(cached => {
			// Estimate component size + metadata
			totalSize += 2048; // Base component size
		});
		return totalSize;
	}

	destroy(): void {
		this.clearCache();
		// Clear any pending promises to prevent memory leaks
		this.loadingPromises.clear();
		this.errorCache.clear();
	}
}

export const gameLoader = new GameLoaderService();

export async function loadGameComponent(game: Game): Promise<ComponentType> {
	return gameLoader.loadGame(game);
}

export async function preloadGameComponent(game: Game): Promise<ComponentType> {
	return gameLoader.preloadGame(game);
}

export function isGameComponentLoaded(gameId: string): boolean {
	return gameLoader.isGameLoaded(gameId);
}

export function isGameComponentLoading(gameId: string): boolean {
	return gameLoader.isGameLoading(gameId);
}

export function getGameLoadError(gameId: string): GameLoadError | null {
	return gameLoader.getLoadError(gameId);
}

export function canRetryGameLoad(gameId: string): boolean {
	return gameLoader.canRetry(gameId);
}

export async function retryGameLoad(game: Game): Promise<ComponentType> {
	return gameLoader.retryLoad(game);
}

export function clearGameCache(gameId?: string): void {
	gameLoader.clearCache(gameId);
}

export function getGameLoaderStats() {
	return gameLoader.getCacheStats();
}