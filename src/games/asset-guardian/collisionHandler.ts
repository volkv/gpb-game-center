import type { CollisionResult, Position, BankingProduct, VisualEffects } from './types';
import { SCORE_VALUES, HAPTIC_PATTERNS, BANKING_PRODUCTS, type BankingProductsRecord } from './constants';
import { triggerHapticFeedback } from '$lib/telegram/integration';
import { getTelegramWebApp } from '$lib/telegram/integration';
import type { AssetGuardianGameEngine } from './gameEngine';

export interface CollisionEffectResult {
	scoreChange: number;
	livesChange: number;
	timeChange: number;
	bonusesCollected: number;
	trapsHit: number;
	shouldRemoveObject: boolean;
	gameCompleted: boolean;
	gameFailed: boolean;
	specialEffect?: CollisionSpecialEffect;
	bankingBonus?: BankingProduct['gameBonus'];
}

export interface CollisionSpecialEffect {
	type: 'shield' | 'time_bonus' | 'score_multiplier' | 'combo_bonus' | 'perfect_level';
	duration?: number;
	multiplier?: number;
	value?: number;
	message?: string;
}

export interface CollisionContext {
	currentScore: number;
	currentLives: number;
	timeRemaining: number;
	bonusesCollected: number;
	trapsHit: number;
	comboCount: number;
	hasActiveShield: boolean;
	currentLevel: number;
}

export class CollisionHandler {
	private comboTimeout: number | null = null;
	private consecutiveBonuses = 0;
	private lastCollisionTime = 0;
	private collectionHistory: Array<{ type: string; time: number }> = [];
	private gameEngine: AssetGuardianGameEngine | null = null;

	setGameEngine(gameEngine: AssetGuardianGameEngine): void {
		this.gameEngine = gameEngine;
	}

	processCollision(
		result: CollisionResult,
		context: CollisionContext
	): CollisionEffectResult {
		const now = Date.now();
		const timeSinceLastCollision = now - this.lastCollisionTime;

		this.updateComboSystem(result, timeSinceLastCollision);
		this.triggerHaptics(result);
		this.addToHistory(result, now);

		this.lastCollisionTime = now;

		switch (result.type) {
			case 'bonus':
				return this.handleBonusCollision(result, context);
			case 'trap':
				return this.handleTrapCollision(result, context);
			case 'finish':
				return this.handleFinishCollision(result, context);
			case 'wall':
				return this.handleWallCollision(result, context);
			default:
				return this.createDefaultResult();
		}
	}

	private handleBonusCollision(
		result: CollisionResult,
		context: CollisionContext
	): CollisionEffectResult {
		this.consecutiveBonuses++;

		let scoreChange = result.value;
		let specialEffect: CollisionSpecialEffect | undefined;
		let bankingBonus: BankingProduct['gameBonus'] | undefined;

		const comboMultiplier = this.getComboMultiplier();
		if (comboMultiplier > 1) {
			scoreChange *= comboMultiplier;
			specialEffect = {
				type: 'combo_bonus',
				multiplier: comboMultiplier,
				message: `Комбо x${comboMultiplier}!`
			};

			if (this.gameEngine && result.position) {
				this.gameEngine.createComboEffect(result.position, comboMultiplier);
			}
		}

		const bankingProduct = this.getBankingProductForBonus(result);
		if (bankingProduct) {
			bankingBonus = bankingProduct.gameBonus;
			scoreChange += SCORE_VALUES.BANKING_LESSON_BONUS;
		}

		return {
			scoreChange,
			livesChange: 0,
			timeChange: 0,
			bonusesCollected: context.bonusesCollected + 1,
			trapsHit: context.trapsHit,
			shouldRemoveObject: true,
			gameCompleted: false,
			gameFailed: false,
			specialEffect,
			bankingBonus
		};
	}

	private handleTrapCollision(
		result: CollisionResult,
		context: CollisionContext
	): CollisionEffectResult {
		this.consecutiveBonuses = 0;

		if (context.hasActiveShield) {
			return {
				scoreChange: 0,
				livesChange: 0,
				timeChange: 0,
				bonusesCollected: context.bonusesCollected,
				trapsHit: context.trapsHit,
				shouldRemoveObject: true,
				gameCompleted: false,
				gameFailed: false,
				specialEffect: {
					type: 'shield',
					message: 'Защита активирована!'
				}
			};
		}

		const newLives = context.currentLives - 1;
		const timeChange = this.getTrapTimeReduction(result);

		return {
			scoreChange: SCORE_VALUES.TRAP_PENALTY,
			livesChange: -1,
			timeChange,
			bonusesCollected: context.bonusesCollected,
			trapsHit: context.trapsHit + 1,
			shouldRemoveObject: true,
			gameCompleted: false,
			gameFailed: newLives <= 0,
		};
	}

	private handleFinishCollision(
		result: CollisionResult,
		context: CollisionContext
	): CollisionEffectResult {
		let scoreChange = SCORE_VALUES.LEVEL_COMPLETE;
		let specialEffect: CollisionSpecialEffect | undefined;

		const timeBonus = context.timeRemaining * SCORE_VALUES.TIME_BONUS_PER_SECOND;
		scoreChange += timeBonus;

		const isPerfectLevel = context.trapsHit === 0 && context.bonusesCollected > 0;
		if (isPerfectLevel) {
			scoreChange += SCORE_VALUES.PERFECT_LEVEL;
			specialEffect = {
				type: 'perfect_level',
				value: SCORE_VALUES.PERFECT_LEVEL,
				message: 'Идеальное прохождение!'
			};
		}

		return {
			scoreChange,
			livesChange: 0,
			timeChange: 0,
			bonusesCollected: context.bonusesCollected,
			trapsHit: context.trapsHit,
			shouldRemoveObject: false,
			gameCompleted: true,
			gameFailed: false,
			specialEffect
		};
	}

	private handleWallCollision(
		result: CollisionResult,
		context: CollisionContext
	): CollisionEffectResult {
		if (this.gameEngine && result.position) {
			this.gameEngine.createWallHitEffect(result.position);
		}

		return {
			scoreChange: 0,
			livesChange: 0,
			timeChange: 0,
			bonusesCollected: context.bonusesCollected,
			trapsHit: context.trapsHit,
			shouldRemoveObject: false,
			gameCompleted: false,
			gameFailed: false
		};
	}

	private createDefaultResult(): CollisionEffectResult {
		return {
			scoreChange: 0,
			livesChange: 0,
			timeChange: 0,
			bonusesCollected: 0,
			trapsHit: 0,
			shouldRemoveObject: false,
			gameCompleted: false,
			gameFailed: false
		};
	}

	private updateComboSystem(result: CollisionResult, timeSinceLastCollision: number): void {
		if (this.comboTimeout) {
			clearTimeout(this.comboTimeout);
		}

		if (result.type === 'bonus' && timeSinceLastCollision < 3000) {
			this.comboTimeout = window.setTimeout(() => {
				this.consecutiveBonuses = 0;
			}, 3000);
		} else {
			this.consecutiveBonuses = 0;
		}
	}

	private getComboMultiplier(): number {
		if (this.consecutiveBonuses >= 5) return 3;
		if (this.consecutiveBonuses >= 3) return 2;
		return 1;
	}

	private getBankingProductForBonus(result: CollisionResult): BankingProduct | undefined {
		const bonusType = this.getBonusType(result);
		const products = Object.values(BANKING_PRODUCTS) as BankingProduct[];
		return products.find((product: BankingProduct) =>
			product.gameBonus.triggerCondition === bonusType
		);
	}

	private getBonusType(result: CollisionResult): string {
		if (result.position && typeof result.position === 'object') {
			const sourceElement = document.elementFromPoint(result.position.x, result.position.y);
			if (sourceElement) {
				return sourceElement.getAttribute('data-bonus-type') || 'unknown';
			}
		}
		return 'unknown';
	}

	private getTrapTimeReduction(result: CollisionResult): number {
		const trapType = this.getTrapType(result);
		switch (trapType) {
			case 'trap_phishing': return -10;
			case 'trap_fraud': return -15;
			default: return -5;
		}
	}

	private getTrapType(result: CollisionResult): string {
		if (result.position && typeof result.position === 'object') {
			const sourceElement = document.elementFromPoint(result.position.x, result.position.y);
			if (sourceElement) {
				return sourceElement.getAttribute('data-trap-type') || 'unknown';
			}
		}
		return 'unknown';
	}

	private triggerHaptics(result: CollisionResult): void {
		const webApp = getTelegramWebApp();
		if (!webApp?.HapticFeedback) return;

		try {
			switch (result.type) {
				case 'bonus':
					if (this.consecutiveBonuses >= 3) {
						webApp.HapticFeedback.notificationOccurred('success');
					} else {
						webApp.HapticFeedback.impactOccurred('light');
					}
					break;
				case 'trap':
					webApp.HapticFeedback.notificationOccurred('error');
					break;
				case 'finish':
					webApp.HapticFeedback.notificationOccurred('success');
					setTimeout(() => {
						webApp.HapticFeedback?.impactOccurred('heavy');
					}, 200);
					break;
				case 'wall':
					webApp.HapticFeedback.impactOccurred('medium');
					break;
			}
		} catch (error) {
			console.warn('🎮 [COLLISION] Failed to trigger haptic feedback:', error);
		}
	}

	private addToHistory(result: CollisionResult, timestamp: number): void {
		this.collectionHistory.push({
			type: result.type,
			time: timestamp
		});

		if (this.collectionHistory.length > 20) {
			this.collectionHistory.shift();
		}
	}

	getCollisionStats() {
		const now = Date.now();
		const recentCollisions = this.collectionHistory.filter(
			collision => now - collision.time < 60000
		);

		return {
			totalCollisions: this.collectionHistory.length,
			recentCollisions: recentCollisions.length,
			consecutiveBonuses: this.consecutiveBonuses,
			averageTimeBetweenCollisions: this.calculateAverageTimeBetweenCollisions(),
			collisionsByType: this.getCollisionsByType()
		};
	}

	private calculateAverageTimeBetweenCollisions(): number {
		if (this.collectionHistory.length < 2) return 0;

		const times = this.collectionHistory.map(collision => collision.time);
		const intervals = [];

		for (let i = 1; i < times.length; i++) {
			intervals.push(times[i] - times[i - 1]);
		}

		return intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
	}

	private getCollisionsByType(): Record<string, number> {
		return this.collectionHistory.reduce((counts, collision) => {
			counts[collision.type] = (counts[collision.type] || 0) + 1;
			return counts;
		}, {} as Record<string, number>);
	}

	reset(): void {
		this.consecutiveBonuses = 0;
		this.lastCollisionTime = 0;
		this.collectionHistory = [];
		if (this.comboTimeout) {
			clearTimeout(this.comboTimeout);
			this.comboTimeout = null;
		}
	}

	destroy(): void {
		this.reset();
	}
}

export function createCollisionHandler(): CollisionHandler {
	return new CollisionHandler();
}