import confetti from 'canvas-confetti';
import type { Position } from './types';
import { VISUAL_EFFECTS, HAPTIC_PATTERNS, ANIMATION_DURATIONS } from './constants';
import { getTelegramWebApp } from '$lib/telegram/integration';

export interface EffectConfig {
	position: Position;
	type: 'bonus' | 'trap' | 'finish' | 'combo' | 'achievement' | 'wall_hit';
	intensity?: 'low' | 'medium' | 'high';
	bankingTheme?: 'cashback' | 'deposit' | 'investment' | 'protection';
	metadata?: Record<string, any>;
}

export interface ParticleEffect {
	id: string;
	element: HTMLElement;
	startTime: number;
	duration: number;
	cleanup: () => void;
}

export interface HapticSequence {
	pattern: Array<{
		type: 'light' | 'medium' | 'heavy';
		delay: number;
	}>;
	duration: number;
}

export class EffectsManager {
	private activeParticles: Map<string, ParticleEffect> = new Map();
	private canvasElement: HTMLCanvasElement | null = null;
	private gameContainer: HTMLElement | null = null;
	private hapticEnabled = true;
	private confettiEnabled = true;
	private particleIdCounter = 0;

	initialize(gameContainer: HTMLElement, canvas?: HTMLCanvasElement): void {
		this.gameContainer = gameContainer;
		this.canvasElement = canvas || null;
		this.setupConfettiDefaults();
	}

	private setupConfettiDefaults(): void {
		if (!this.canvasElement) return;

		confetti.create(this.canvasElement, {
			resize: true,
			useWorker: true
		});
	}

	triggerEffect(config: EffectConfig): Promise<void> {
		return new Promise((resolve) => {
			const promises: Promise<void>[] = [];

			switch (config.type) {
				case 'bonus':
					promises.push(this.triggerBonusEffect(config));
					break;
				case 'trap':
					promises.push(this.triggerTrapEffect(config));
					break;
				case 'finish':
					promises.push(this.triggerFinishEffect(config));
					break;
				case 'combo':
					promises.push(this.triggerComboEffect(config));
					break;
				case 'achievement':
					promises.push(this.triggerAchievementEffect(config));
					break;
				case 'wall_hit':
					promises.push(this.triggerWallHitEffect(config));
					break;
			}

			Promise.all(promises).then(() => resolve());
		});
	}

	private async triggerBonusEffect(config: EffectConfig): Promise<void> {
		const promises: Promise<void>[] = [];

		promises.push(this.createBonusConfetti(config));
		promises.push(this.createBonusParticles(config));
		promises.push(this.triggerBonusHaptic(config));

		await Promise.all(promises);
	}

	private async createBonusConfetti(config: EffectConfig): Promise<void> {
		if (!this.confettiEnabled) return;

		const colors = this.getBankingColors(config.bankingTheme || 'cashback');
		const position = this.normalizePosition(config.position);

		return new Promise((resolve) => {
			confetti({
				particleCount: config.intensity === 'high' ? 50 : 25,
				spread: 70,
				origin: {
					x: position.x,
					y: position.y
				},
				colors,
				shapes: ['square', 'circle'],
				scalar: config.intensity === 'high' ? 1.2 : 0.8,
				gravity: 0.6,
				drift: 0.1,
				startVelocity: config.intensity === 'high' ? 45 : 30,
				decay: 0.92,
				ticks: 120
			});

			setTimeout(() => resolve(), 500);
		});
	}

	private async createBonusParticles(config: EffectConfig): Promise<void> {
		const particleCount = config.intensity === 'high' ? 8 : 5;
		const promises: Promise<void>[] = [];

		for (let i = 0; i < particleCount; i++) {
			promises.push(this.createFloatingSymbol(config));
		}

		await Promise.all(promises);
	}

	private async createFloatingSymbol(config: EffectConfig): Promise<void> {
		if (!this.gameContainer) return;

		const symbol = this.getBankingSymbol(config.bankingTheme || 'cashback');
		const element = document.createElement('div');
		const particleId = `particle-${this.particleIdCounter++}`;

		element.innerHTML = symbol;
		element.style.cssText = `
			position: absolute;
			left: ${config.position.x}px;
			top: ${config.position.y}px;
			font-size: 24px;
			color: #1ABC9C;
			pointer-events: none;
			z-index: 1000;
			text-shadow: 0 0 8px rgba(26, 188, 156, 0.6);
			animation: floatUpFade 1.5s ease-out forwards;
		`;

		const style = document.createElement('style');
		style.textContent = `
			@keyframes floatUpFade {
				0% { transform: translateY(0) scale(0.8); opacity: 1; }
				50% { transform: translateY(-30px) scale(1.1); opacity: 0.8; }
				100% { transform: translateY(-60px) scale(0.6); opacity: 0; }
			}
		`;
		document.head.appendChild(style);

		this.gameContainer.appendChild(element);

		return new Promise((resolve) => {
			const cleanup = () => {
				if (element.parentNode) {
					element.parentNode.removeChild(element);
				}
				if (style.parentNode) {
					style.parentNode.removeChild(style);
				}
				this.activeParticles.delete(particleId);
			};

			const effect: ParticleEffect = {
				id: particleId,
				element,
				startTime: Date.now(),
				duration: 1500,
				cleanup
			};

			this.activeParticles.set(particleId, effect);

			setTimeout(() => {
				cleanup();
				resolve();
			}, 1500);
		});
	}

	private async triggerBonusHaptic(config: EffectConfig): Promise<void> {
		if (!this.hapticEnabled) return;

		const webApp = getTelegramWebApp();
		if (!webApp?.HapticFeedback) return;

		try {
			if (config.intensity === 'high' || config.metadata?.isCombo) {
				await this.executeHapticSequence({
					pattern: [
						{ type: 'light', delay: 0 },
						{ type: 'medium', delay: 100 }
					],
					duration: 200
				});
			} else {
				webApp.HapticFeedback.impactOccurred('light');
			}
		} catch (error) {
			console.warn('🎮 [EFFECTS] Haptic feedback failed:', error);
		}
	}

	private async triggerTrapEffect(config: EffectConfig): Promise<void> {
		const promises: Promise<void>[] = [];

		promises.push(this.createTrapShockwave(config));
		promises.push(this.createTrapWarning(config));
		promises.push(this.triggerTrapHaptic(config));

		await Promise.all(promises);
	}

	private async createTrapShockwave(config: EffectConfig): Promise<void> {
		if (!this.gameContainer) return;

		const shockwave = document.createElement('div');
		shockwave.style.cssText = `
			position: absolute;
			left: ${config.position.x - 25}px;
			top: ${config.position.y - 25}px;
			width: 50px;
			height: 50px;
			border: 3px solid #E74C3C;
			border-radius: 50%;
			pointer-events: none;
			z-index: 999;
			animation: shockwaveExpand 0.6s ease-out forwards;
		`;

		const style = document.createElement('style');
		style.textContent = `
			@keyframes shockwaveExpand {
				0% { transform: scale(0.2); opacity: 1; border-width: 3px; }
				50% { transform: scale(1.5); opacity: 0.7; border-width: 2px; }
				100% { transform: scale(3); opacity: 0; border-width: 1px; }
			}
		`;
		document.head.appendChild(style);

		this.gameContainer.appendChild(shockwave);

		return new Promise((resolve) => {
			setTimeout(() => {
				if (shockwave.parentNode) {
					shockwave.parentNode.removeChild(shockwave);
				}
				if (style.parentNode) {
					style.parentNode.removeChild(style);
				}
				resolve();
			}, 600);
		});
	}

	private async createTrapWarning(config: EffectConfig): Promise<void> {
		if (!this.gameContainer) return;

		const warning = document.createElement('div');
		warning.innerHTML = '⚠️';
		warning.style.cssText = `
			position: absolute;
			left: ${config.position.x - 15}px;
			top: ${config.position.y - 40}px;
			font-size: 30px;
			pointer-events: none;
			z-index: 1001;
			animation: warningBounce 0.8s ease-out forwards;
		`;

		const style = document.createElement('style');
		style.textContent = `
			@keyframes warningBounce {
				0% { transform: translateY(0) scale(0.5); opacity: 1; }
				20% { transform: translateY(-15px) scale(1.2); opacity: 1; }
				40% { transform: translateY(-5px) scale(1); opacity: 0.9; }
				60% { transform: translateY(-10px) scale(1.1); opacity: 0.7; }
				100% { transform: translateY(-20px) scale(0.8); opacity: 0; }
			}
		`;
		document.head.appendChild(style);

		this.gameContainer.appendChild(warning);

		return new Promise((resolve) => {
			setTimeout(() => {
				if (warning.parentNode) {
					warning.parentNode.removeChild(warning);
				}
				if (style.parentNode) {
					style.parentNode.removeChild(style);
				}
				resolve();
			}, 800);
		});
	}

	private async triggerTrapHaptic(config: EffectConfig): Promise<void> {
		if (!this.hapticEnabled) return;

		const webApp = getTelegramWebApp();
		if (!webApp?.HapticFeedback) return;

		try {
			webApp.HapticFeedback.notificationOccurred('error');

			setTimeout(() => {
				webApp.HapticFeedback?.impactOccurred('medium');
			}, 150);
		} catch (error) {
			console.warn('🎮 [EFFECTS] Trap haptic feedback failed:', error);
		}
	}

	private async triggerFinishEffect(config: EffectConfig): Promise<void> {
		const promises: Promise<void>[] = [];

		promises.push(this.createFinishFireworks(config));
		promises.push(this.createFinishGoldRain(config));
		promises.push(this.triggerFinishHaptic(config));

		await Promise.all(promises);
	}

	private async createFinishFireworks(config: EffectConfig): Promise<void> {
		if (!this.confettiEnabled) return;

		const position = this.normalizePosition(config.position);

		const sequence = [
			{ delay: 0, count: 100, spread: 100 },
			{ delay: 300, count: 75, spread: 120 },
			{ delay: 600, count: 50, spread: 80 }
		];

		for (const burst of sequence) {
			setTimeout(() => {
				confetti({
					particleCount: burst.count,
					spread: burst.spread,
					origin: { x: position.x, y: position.y },
					colors: ['#F39C12', '#E67E22', '#D35400', '#1ABC9C', '#16A085'],
					shapes: ['star', 'circle'],
					scalar: 1.4,
					gravity: 0.8,
					startVelocity: 60,
					decay: 0.85,
					ticks: 200
				});
			}, burst.delay);
		}

		return new Promise((resolve) => {
			setTimeout(() => resolve(), 1000);
		});
	}

	private async createFinishGoldRain(config: EffectConfig): Promise<void> {
		if (!this.confettiEnabled) return;

		return new Promise((resolve) => {
			const duration = 3000;
			const intervalId = setInterval(() => {
				confetti({
					particleCount: 3,
					angle: 270,
					spread: 20,
					origin: { x: Math.random(), y: 0 },
					colors: ['#FFD700', '#FFA500', '#FF8C00'],
					shapes: ['circle'],
					scalar: 0.8,
					gravity: 0.4,
					startVelocity: 20,
					decay: 0.9,
					ticks: 300
				});
			}, 150);

			setTimeout(() => {
				clearInterval(intervalId);
				resolve();
			}, duration);
		});
	}

	private async triggerFinishHaptic(config: EffectConfig): Promise<void> {
		if (!this.hapticEnabled) return;

		const webApp = getTelegramWebApp();
		if (!webApp?.HapticFeedback) return;

		try {
			await this.executeHapticSequence({
				pattern: [
					{ type: 'medium', delay: 0 },
					{ type: 'heavy', delay: 200 },
					{ type: 'medium', delay: 400 },
					{ type: 'light', delay: 600 }
				],
				duration: 800
			});
		} catch (error) {
			console.warn('🎮 [EFFECTS] Finish haptic sequence failed:', error);
		}
	}

	private async triggerComboEffect(config: EffectConfig): Promise<void> {
		const comboLevel = config.metadata?.comboLevel || 1;
		const promises: Promise<void>[] = [];

		promises.push(this.createComboText(config, comboLevel));
		promises.push(this.createComboConfetti(config, comboLevel));
		promises.push(this.triggerComboHaptic(config, comboLevel));

		await Promise.all(promises);
	}

	private async createComboText(config: EffectConfig, level: number): Promise<void> {
		if (!this.gameContainer) return;

		const comboText = document.createElement('div');
		comboText.innerHTML = `КОМБО x${level}!`;
		comboText.style.cssText = `
			position: absolute;
			left: ${config.position.x - 50}px;
			top: ${config.position.y - 60}px;
			font-family: 'Halvar Breitschrift', sans-serif;
			font-size: 20px;
			font-weight: 700;
			color: #F39C12;
			text-align: center;
			pointer-events: none;
			z-index: 1002;
			text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
			animation: comboPopScale 1.2s ease-out forwards;
		`;

		const style = document.createElement('style');
		style.textContent = `
			@keyframes comboPopScale {
				0% { transform: scale(0.5) rotate(-5deg); opacity: 0; }
				20% { transform: scale(1.3) rotate(2deg); opacity: 1; }
				40% { transform: scale(1.1) rotate(-1deg); opacity: 1; }
				60% { transform: scale(1.2) rotate(0deg); opacity: 0.9; }
				100% { transform: scale(0.8) rotate(0deg); opacity: 0; }
			}
		`;
		document.head.appendChild(style);

		this.gameContainer.appendChild(comboText);

		return new Promise((resolve) => {
			setTimeout(() => {
				if (comboText.parentNode) {
					comboText.parentNode.removeChild(comboText);
				}
				if (style.parentNode) {
					style.parentNode.removeChild(style);
				}
				resolve();
			}, 1200);
		});
	}

	private async createComboConfetti(config: EffectConfig, level: number): Promise<void> {
		if (!this.confettiEnabled) return;

		const position = this.normalizePosition(config.position);
		const intensity = Math.min(level * 20, 100);

		return new Promise((resolve) => {
			confetti({
				particleCount: intensity,
				spread: 60 + level * 10,
				origin: { x: position.x, y: position.y },
				colors: ['#1ABC9C', '#3498DB', '#F39C12'],
				shapes: ['star'],
				scalar: 0.9 + level * 0.1,
				gravity: 0.7,
				startVelocity: 40 + level * 5,
				decay: 0.9,
				ticks: 150
			});

			setTimeout(() => resolve(), 600);
		});
	}

	private async triggerComboHaptic(config: EffectConfig, level: number): Promise<void> {
		if (!this.hapticEnabled) return;

		const webApp = getTelegramWebApp();
		if (!webApp?.HapticFeedback) return;

		try {
			if (level >= 5) {
				webApp.HapticFeedback.notificationOccurred('success');
				setTimeout(() => {
					webApp.HapticFeedback?.impactOccurred('heavy');
				}, 100);
			} else if (level >= 3) {
				webApp.HapticFeedback.notificationOccurred('success');
			} else {
				webApp.HapticFeedback.impactOccurred('medium');
			}
		} catch (error) {
			console.warn('🎮 [EFFECTS] Combo haptic failed:', error);
		}
	}

	private async triggerAchievementEffect(config: EffectConfig): Promise<void> {
		const promises: Promise<void>[] = [];

		promises.push(this.createAchievementBanner(config));
		promises.push(this.createAchievementConfetti(config));
		promises.push(this.triggerAchievementHaptic(config));

		await Promise.all(promises);
	}

	private async createAchievementBanner(config: EffectConfig): Promise<void> {
		if (!this.gameContainer) return;

		const banner = document.createElement('div');
		const achievementName = config.metadata?.achievementName || 'Достижение!';

		banner.innerHTML = `
			<div style="font-size: 16px; margin-bottom: 5px;">🏆 ДОСТИЖЕНИЕ!</div>
			<div style="font-size: 14px; color: #ECF0F1;">${achievementName}</div>
		`;

		banner.style.cssText = `
			position: absolute;
			left: 50%;
			top: 20%;
			transform: translateX(-50%);
			background: linear-gradient(135deg, #F39C12, #E67E22);
			color: white;
			padding: 15px 25px;
			border-radius: 12px;
			text-align: center;
			font-family: 'Halvar Breitschrift', sans-serif;
			font-weight: 700;
			pointer-events: none;
			z-index: 1003;
			box-shadow: 0 8px 25px rgba(243, 156, 18, 0.4);
			border: 2px solid #D35400;
			animation: achievementSlideIn 2s ease-out forwards;
		`;

		const style = document.createElement('style');
		style.textContent = `
			@keyframes achievementSlideIn {
				0% { transform: translateX(-50%) translateY(-100px) scale(0.8); opacity: 0; }
				20% { transform: translateX(-50%) translateY(0) scale(1.1); opacity: 1; }
				80% { transform: translateX(-50%) translateY(0) scale(1); opacity: 1; }
				100% { transform: translateX(-50%) translateY(-50px) scale(0.9); opacity: 0; }
			}
		`;
		document.head.appendChild(style);

		this.gameContainer.appendChild(banner);

		return new Promise((resolve) => {
			setTimeout(() => {
				if (banner.parentNode) {
					banner.parentNode.removeChild(banner);
				}
				if (style.parentNode) {
					style.parentNode.removeChild(style);
				}
				resolve();
			}, 2000);
		});
	}

	private async createAchievementConfetti(config: EffectConfig): Promise<void> {
		if (!this.confettiEnabled) return;

		return new Promise((resolve) => {
			const burst1 = confetti({
				particleCount: 150,
				spread: 120,
				origin: { x: 0.3, y: 0.3 },
				colors: ['#F39C12', '#E67E22', '#D35400', '#1ABC9C'],
				shapes: ['star', 'circle'],
				scalar: 1.2,
				gravity: 0.6,
				startVelocity: 55,
				decay: 0.88,
				ticks: 200
			});

			setTimeout(() => {
				confetti({
					particleCount: 150,
					spread: 120,
					origin: { x: 0.7, y: 0.3 },
					colors: ['#F39C12', '#E67E22', '#D35400', '#1ABC9C'],
					shapes: ['star', 'circle'],
					scalar: 1.2,
					gravity: 0.6,
					startVelocity: 55,
					decay: 0.88,
					ticks: 200
				});
			}, 300);

			setTimeout(() => resolve(), 1000);
		});
	}

	private async triggerAchievementHaptic(config: EffectConfig): Promise<void> {
		if (!this.hapticEnabled) return;

		const webApp = getTelegramWebApp();
		if (!webApp?.HapticFeedback) return;

		try {
			await this.executeHapticSequence({
				pattern: [
					{ type: 'light', delay: 0 },
					{ type: 'medium', delay: 150 },
					{ type: 'heavy', delay: 300 },
					{ type: 'medium', delay: 450 },
					{ type: 'light', delay: 600 }
				],
				duration: 750
			});
		} catch (error) {
			console.warn('🎮 [EFFECTS] Achievement haptic sequence failed:', error);
		}
	}

	private async triggerWallHitEffect(config: EffectConfig): Promise<void> {
		const promises: Promise<void>[] = [];

		promises.push(this.createWallImpactRipple(config));
		promises.push(this.triggerWallHaptic(config));

		await Promise.all(promises);
	}

	private async createWallImpactRipple(config: EffectConfig): Promise<void> {
		if (!this.gameContainer) return;

		const ripple = document.createElement('div');
		ripple.style.cssText = `
			position: absolute;
			left: ${config.position.x - 15}px;
			top: ${config.position.y - 15}px;
			width: 30px;
			height: 30px;
			border: 2px solid #34495E;
			border-radius: 50%;
			pointer-events: none;
			z-index: 998;
			animation: wallRipple 0.4s ease-out forwards;
		`;

		const style = document.createElement('style');
		style.textContent = `
			@keyframes wallRipple {
				0% { transform: scale(0.5); opacity: 0.8; }
				100% { transform: scale(2); opacity: 0; }
			}
		`;
		document.head.appendChild(style);

		this.gameContainer.appendChild(ripple);

		return new Promise((resolve) => {
			setTimeout(() => {
				if (ripple.parentNode) {
					ripple.parentNode.removeChild(ripple);
				}
				if (style.parentNode) {
					style.parentNode.removeChild(style);
				}
				resolve();
			}, 400);
		});
	}

	private async triggerWallHaptic(config: EffectConfig): Promise<void> {
		if (!this.hapticEnabled) return;

		const webApp = getTelegramWebApp();
		if (!webApp?.HapticFeedback) return;

		try {
			webApp.HapticFeedback.impactOccurred('medium');
		} catch (error) {
			console.warn('🎮 [EFFECTS] Wall haptic failed:', error);
		}
	}

	private async executeHapticSequence(sequence: HapticSequence): Promise<void> {
		if (!this.hapticEnabled) return;

		const webApp = getTelegramWebApp();
		if (!webApp?.HapticFeedback) return;

		for (const step of sequence.pattern) {
			setTimeout(() => {
				try {
					webApp.HapticFeedback?.impactOccurred(step.type);
				} catch (error) {
					console.warn('🎮 [EFFECTS] Haptic step failed:', error);
				}
			}, step.delay);
		}

		return new Promise((resolve) => {
			setTimeout(() => resolve(), sequence.duration);
		});
	}

	private getBankingColors(theme: string): string[] {
		switch (theme) {
			case 'cashback':
				return ['#1ABC9C', '#16A085', '#0FA9C2'];
			case 'deposit':
				return ['#3498DB', '#2980B9', '#1FC4D9'];
			case 'investment':
				return ['#9B59B6', '#8E44AD', '#C39BD3'];
			case 'protection':
				return ['#E74C3C', '#C0392B', '#F1948A'];
			default:
				return ['#1ABC9C', '#3498DB', '#F39C12'];
		}
	}

	private getBankingSymbol(theme: string): string {
		switch (theme) {
			case 'cashback':
				return '💳';
			case 'deposit':
				return '🏦';
			case 'investment':
				return '📈';
			case 'protection':
				return '🛡️';
			default:
				return '💰';
		}
	}

	private normalizePosition(position: Position): { x: number; y: number } {
		if (!this.gameContainer) return { x: 0.5, y: 0.5 };

		const rect = this.gameContainer.getBoundingClientRect();
		return {
			x: position.x / rect.width,
			y: position.y / rect.height
		};
	}

	setHapticEnabled(enabled: boolean): void {
		this.hapticEnabled = enabled;
	}

	setConfettiEnabled(enabled: boolean): void {
		this.confettiEnabled = enabled;
	}

	cleanup(): void {
		this.activeParticles.forEach(particle => particle.cleanup());
		this.activeParticles.clear();
		this.canvasElement = null;
		this.gameContainer = null;
	}

	destroy(): void {
		this.cleanup();
	}
}

export function createEffectsManager(): EffectsManager {
	return new EffectsManager();
}