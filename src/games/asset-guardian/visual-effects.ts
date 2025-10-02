import type { Position, VisualEffects, Gravity } from './types';
import { VISUAL_EFFECTS, GYROSCOPE_CONFIG, BALL_CONFIG } from './constants';

export interface ShadowConfig {
	offsetMultiplier: number;
	scaleYMultiplier: number;
	minScaleY: number;
	maxOpacity: number;
	offsetY: number;
}

export interface HighlightConfig {
	offsetMultiplier: number;
	intensityMultiplier: number;
	pulseSpeed: number;
	baseIntensity: number;
}

export interface ParallaxConfig {
	layers: Array<{
		speed: number;
		opacity: number;
		zIndex: number;
	}>;
	maxOffset: number;
}

export interface BankVaultConfig {
	metalColor: string;
	accentColor: string;
	glowIntensity: number;
	textureScale: number;
}

export class ShadowCalculator {
	constructor(private config: ShadowConfig = {
		offsetMultiplier: 15,
		scaleYMultiplier: 0.4,
		minScaleY: 0.6,
		maxOpacity: 0.3,
		offsetY: 5
	}) {}

	calculateShadow(tilt: { x: number; y: number }): VisualEffects['shadow'] {
		const tiltMagnitude = Math.sqrt(tilt.x * tilt.x + tilt.y * tilt.y);
		const normalizedTilt = Math.min(tiltMagnitude, 1);

		const offsetX = tilt.x * this.config.offsetMultiplier;
		const offsetY = this.config.offsetY + Math.abs(tilt.y) * this.config.offsetMultiplier;

		const scaleY = Math.max(
			this.config.minScaleY,
			1 - normalizedTilt * this.config.scaleYMultiplier
		);

		const opacity = this.config.maxOpacity * (1 - normalizedTilt * 0.3);

		return {
			offsetX,
			offsetY,
			scaleY,
			opacity: Math.max(0.1, opacity)
		};
	}
}

export class HighlightRenderer {
	private time: number = 0;

	constructor(private config: HighlightConfig = {
		offsetMultiplier: 8,
		intensityMultiplier: 0.5,
		pulseSpeed: 0.002,
		baseIntensity: 0.7
	}) {}

	calculateHighlight(tilt: { x: number; y: number }, deltaTime: number): VisualEffects['ballHighlight'] {
		this.time += deltaTime;

		const lightDirection = {
			x: -tilt.x * 0.8 + 0.2,
			y: -tilt.y * 0.8 - 0.3
		};

		const offsetX = lightDirection.x * this.config.offsetMultiplier;
		const offsetY = lightDirection.y * this.config.offsetMultiplier;

		const pulse = Math.sin(this.time * this.config.pulseSpeed) * 0.05 + 0.95;
		const tiltIntensity = 1 - Math.min(Math.sqrt(tilt.x * tilt.x + tilt.y * tilt.y), 1) * 0.2;
		const intensity = this.config.baseIntensity * pulse * tiltIntensity;

		return {
			offsetX,
			offsetY,
			intensity: Math.max(0.5, intensity)
		};
	}

	createRadialGradient(canvas: HTMLCanvasElement, highlight: VisualEffects['ballHighlight']): CanvasGradient | null {
		const ctx = canvas.getContext('2d');
		if (!ctx) return null;

		const centerX = BALL_CONFIG.RADIUS + highlight.offsetX;
		const centerY = BALL_CONFIG.RADIUS + highlight.offsetY;
		const radius = BALL_CONFIG.RADIUS * 0.6;

		const gradient = ctx.createRadialGradient(
			centerX, centerY, 0,
			BALL_CONFIG.RADIUS, BALL_CONFIG.RADIUS, radius
		);

		const alpha = highlight.intensity;
		gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
		gradient.addColorStop(0.4, `rgba(255, 255, 255, ${alpha * 0.6})`);
		gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);

		return gradient;
	}
}

export class ParallaxController {
	private layers: HTMLElement[] = [];

	constructor(private config: ParallaxConfig = {
		layers: [
			{ speed: 0.1, opacity: 0.3, zIndex: -3 },
			{ speed: 0.3, opacity: 0.5, zIndex: -2 },
			{ speed: 0.6, opacity: 0.7, zIndex: -1 }
		],
		maxOffset: 30
	}) {}

	initializeLayers(container: HTMLElement): void {
		if (typeof window === 'undefined') return;

		const isMobile = window.innerWidth < 768;
		if (isMobile) return;

		this.config.layers.forEach((layerConfig, index) => {
			const layer = document.createElement('div');
			layer.className = `parallax-layer parallax-layer-${index}`;
			layer.style.cssText = `
				position: absolute;
				top: 0;
				left: 0;
				width: 120%;
				height: 120%;
				opacity: ${layerConfig.opacity};
				z-index: ${layerConfig.zIndex};
				pointer-events: none;
				background: radial-gradient(ellipse at center,
					rgba(15, 169, 194, ${layerConfig.opacity * 0.3}) 0%,
					rgba(0, 107, 165, ${layerConfig.opacity * 0.2}) 50%,
					transparent 100%);
				transform-origin: center center;
				transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
			`;

			container.appendChild(layer);
			this.layers.push(layer);
		});
	}

	updateParallax(tilt: { x: number; y: number }): void {
		this.layers.forEach((layer, index) => {
			const layerConfig = this.config.layers[index];
			const offsetX = -tilt.x * this.config.maxOffset * layerConfig.speed;
			const offsetY = -tilt.y * this.config.maxOffset * layerConfig.speed;

			layer.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(1.1)`;
		});
	}

	destroy(): void {
		this.layers.forEach(layer => {
			layer.parentElement?.removeChild(layer);
		});
		this.layers = [];
	}
}

export class BankVaultStyler {
	constructor(private config: BankVaultConfig = {
		metalColor: '#2C3E50',
		accentColor: '#34495E',
		glowIntensity: 0.4,
		textureScale: 1.0
	}) {}

	createWallTexture(): string {
		return `
			linear-gradient(135deg,
				${this.config.metalColor} 0%,
				${this.config.accentColor} 25%,
				${this.config.metalColor} 50%,
				${this.config.accentColor} 75%,
				${this.config.metalColor} 100%),
			repeating-linear-gradient(45deg,
				transparent,
				transparent 2px,
				rgba(255,255,255,0.05) 2px,
				rgba(255,255,255,0.05) 4px)
		`;
	}

	createSafeTexture(): string {
		return `
			radial-gradient(circle at 30% 30%,
				rgba(243, 156, 18, 0.8) 0%,
				rgba(230, 126, 34, 0.6) 30%,
				${this.config.metalColor} 60%,
				${this.config.accentColor} 100%),
			linear-gradient(45deg,
				rgba(255,255,255,0.1) 0%,
				transparent 50%,
				rgba(0,0,0,0.1) 100%)
		`;
	}

	createCircuitTexture(): string {
		return `
			linear-gradient(90deg,
				rgba(26, 188, 156, 0.2) 0%,
				transparent 50%,
				rgba(52, 152, 219, 0.2) 100%),
			repeating-linear-gradient(0deg,
				transparent,
				transparent 8px,
				rgba(26, 188, 156, 0.1) 8px,
				rgba(26, 188, 156, 0.1) 10px),
			repeating-linear-gradient(90deg,
				transparent,
				transparent 8px,
				rgba(52, 152, 219, 0.1) 8px,
				rgba(52, 152, 219, 0.1) 10px)
		`;
	}

	applySafeGlow(element: HTMLElement, intensity: number = 1): void {
		const glowIntensity = this.config.glowIntensity * intensity;
		element.style.boxShadow = `
			inset 0 0 20px rgba(243, 156, 18, ${glowIntensity}),
			0 0 30px rgba(243, 156, 18, ${glowIntensity * 0.5}),
			0 0 50px rgba(230, 126, 34, ${glowIntensity * 0.3})
		`;
	}
}

export class VisualEffectsManager {
	private shadowCalculator: ShadowCalculator;
	private highlightRenderer: HighlightRenderer;
	private parallaxController: ParallaxController;
	private bankVaultStyler: BankVaultStyler;
	private isInitialized: boolean = false;

	constructor() {
		this.shadowCalculator = new ShadowCalculator();
		this.highlightRenderer = new HighlightRenderer();
		this.parallaxController = new ParallaxController();
		this.bankVaultStyler = new BankVaultStyler();
	}

	initialize(container: HTMLElement): void {
		if (this.isInitialized) return;

		this.parallaxController.initializeLayers(container);
		this.isInitialized = true;
	}

	updateEffects(
		tilt: { x: number; y: number },
		deltaTime: number = 16
	): VisualEffects {
		if (!this.isInitialized) {
			throw new Error('VisualEffectsManager must be initialized before use');
		}

		const perspective = {
			x: tilt.x,
			y: tilt.y,
			intensity: VISUAL_EFFECTS.PERSPECTIVE_INTENSITY
		};

		const shadow = this.shadowCalculator.calculateShadow(tilt);
		const ballHighlight = this.highlightRenderer.calculateHighlight(tilt, deltaTime);

		this.parallaxController.updateParallax(tilt);

		return {
			perspective,
			shadow,
			ballHighlight
		};
	}

	createBallGradient(canvas: HTMLCanvasElement, highlight: VisualEffects['ballHighlight']): CanvasGradient | null {
		return this.highlightRenderer.createRadialGradient(canvas, highlight);
	}

	getWallStyle(): string {
		return this.bankVaultStyler.createWallTexture();
	}

	getSafeStyle(): string {
		return this.bankVaultStyler.createSafeTexture();
	}

	getCircuitStyle(): string {
		return this.bankVaultStyler.createCircuitTexture();
	}

	applySafeGlow(element: HTMLElement, intensity: number = 1): void {
		this.bankVaultStyler.applySafeGlow(element, intensity);
	}

	destroy(): void {
		this.parallaxController.destroy();
		this.isInitialized = false;
	}
}

export function createVisualEffectsManager(): VisualEffectsManager {
	return new VisualEffectsManager();
}

export function convertTiltToNormalized(tilt: { x: number; y: number }): { x: number; y: number } {
	const maxTilt = GYROSCOPE_CONFIG.MAX_TILT;
	return {
		x: Math.max(-1, Math.min(1, tilt.x / maxTilt)),
		y: Math.max(-1, Math.min(1, tilt.y / maxTilt))
	};
}

export function smoothTiltTransition(
	currentTilt: { x: number; y: number },
	targetTilt: { x: number; y: number },
	smoothingFactor: number = GYROSCOPE_CONFIG.SMOOTHING_FACTOR
): { x: number; y: number } {
	return {
		x: currentTilt.x + (targetTilt.x - currentTilt.x) * smoothingFactor,
		y: currentTilt.y + (targetTilt.y - currentTilt.y) * smoothingFactor
	};
}