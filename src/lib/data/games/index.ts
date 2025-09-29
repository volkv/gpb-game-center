import type { Game } from '$lib/types/Game.js';
import { GAME_STATUS } from '$lib/utils/constants.js';
import { ACTIVE_GAMES } from './active.js';
import { COMING_SOON_GAMES } from './comingSoon.js';

export const GAMES_DATA: Game[] = [...ACTIVE_GAMES, ...COMING_SOON_GAMES];

export function getActiveGames(): Game[] {
	return GAMES_DATA.filter(game => game.status === GAME_STATUS.ACTIVE);
}

export function getComingSoonGames(): Game[] {
	return GAMES_DATA.filter(game => game.status === GAME_STATUS.COMING_SOON);
}

export function getGameById(gameId: string): Game | undefined {
	return GAMES_DATA.find(game => game.id === gameId);
}

export function getGamesByCategory(category: string): Game[] {
	return GAMES_DATA.filter(game => game.category === category);
}