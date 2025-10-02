export { gameState, resetGameState } from './gameState';
export { playerData, resetPlayerData, stopEnergyRegeneration } from './playerData';
export { buildings, stopPassiveIncome } from './buildings';
export { quests } from './quests';
export { ui, resetUIState } from './ui';
import { stopAutoSave } from '../lib/autoSave';
import { resetGameState } from './gameState';
import { resetPlayerData, stopEnergyRegeneration } from './playerData';
import { stopPassiveIncome } from './buildings';
import { resetUIState } from './ui';

export function cleanupFincity() {
	stopPassiveIncome();
	stopEnergyRegeneration();
	stopAutoSave();
	resetGameState();
	resetPlayerData();
	resetUIState();
}