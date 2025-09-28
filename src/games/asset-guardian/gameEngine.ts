import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js';
import { PhysicsEngine } from './physics';
import type { Position, LevelConfig, CellType, VisualEffects } from './types';
import {
	GAME_CONFIG,
	BALL_CONFIG,
	CELL_COLORS,
	CELL_LABELS,
	VISUAL_EFFECTS,
	ANIMATION_DURATIONS
} from './constants';
import { createVisualEffectsManager, convertTiltToNormalized, smoothTiltTransition } from './visual-effects';
import type { VisualEffectsManager } from './visual-effects';
import { createEffectsManager } from './effects';
import type { EffectsManager } from './effects';

export interface GameEngineConfig {
	width: number;
	height: number;
	backgroundColor: number;
	antialias: boolean;
	resolution: number;
}

export class AssetGuardianGameEngine {
	private app: Application;
	private physics: PhysicsEngine;
	private gameContainer: Container;
	private ballGraphics: Graphics;
	private ballShadow: Graphics;
	private ballHighlightGraphics: Graphics;
	private levelContainer: Container;
	private effectsContainer: Container;
	private isInitialized = false;
	private animationFrameId: number | null = null;
	private lastTime = 0;
	private cellSprites: Map<string, Graphics> = new Map();
	private currentLevel: LevelConfig | null = null;
	private visualEffectsManager: VisualEffectsManager;
	private effectsManager: EffectsManager;
	private currentTilt: { x: number; y: number } = { x: 0, y: 0 };
	private targetTilt: { x: number; y: number } = { x: 0, y: 0 };

	constructor(private config: GameEngineConfig) {
		this.app = new Application();
		this.physics = new PhysicsEngine();
		this.gameContainer = new Container();
		this.levelContainer = new Container();
		this.effectsContainer = new Container();
		this.ballGraphics = new Graphics();
		this.ballShadow = new Graphics();
		this.ballHighlightGraphics = new Graphics();
		this.visualEffectsManager = createVisualEffectsManager();
		this.effectsManager = createEffectsManager();
	}

	async initialize(canvas: HTMLCanvasElement): Promise<void> {
		if (this.isInitialized) return;

		try {
			await this.app.init({
				canvas,
				width: this.config.width,
				height: this.config.height,
				backgroundColor: this.config.backgroundColor,
				antialias: this.config.antialias,
				resolution: this.config.resolution,
				autoDensity: true
			});

			this.setupContainers();
			this.setupPhysics();
			this.createBallGraphics();

			this.app.stage.addChild(this.gameContainer);
			this.isInitialized = true;
		} catch (error) {
			console.error('Failed to initialize AssetGuardianGameEngine:', error);
			throw error;
		}
	}

	private setupContainers(): void {
		this.gameContainer.addChild(this.effectsContainer);
		this.gameContainer.addChild(this.levelContainer);
		this.gameContainer.addChild(this.ballShadow);
		this.gameContainer.addChild(this.ballGraphics);
		this.gameContainer.addChild(this.ballHighlightGraphics);

		// Use dynamic canvas size instead of fixed WORLD_WIDTH/HEIGHT
		this.gameContainer.width = this.config.width;
		this.gameContainer.height = this.config.height;

		const containerElement = this.app.canvas.parentElement;
		if (containerElement) {
			this.visualEffectsManager.initialize(containerElement);
			this.effectsManager.initialize(containerElement, this.app.canvas);
		}
	}

	private setupPhysics(): void {
		this.physics.createWalls({
			width: this.config.width,
			height: this.config.height
		});

		this.physics.addCollisionHandler('cashback', (result) => {
			this.createBonusEffect(result.position, 'cashback');
		});

		this.physics.addCollisionHandler('deposit', (result) => {
			this.createBonusEffect(result.position, 'deposit');
		});

		this.physics.addCollisionHandler('trap_phishing', (result) => {
			this.createTrapEffect(result.position, 'trap_phishing');
		});

		this.physics.addCollisionHandler('trap_fraud', (result) => {
			this.createTrapEffect(result.position, 'trap_fraud');
		});

		this.physics.addCollisionHandler('finish', (result) => {
			this.createFinishEffect(result.position);
		});
	}

	private createBallGraphics(): void {
		this.ballGraphics.clear();
		this.ballGraphics.beginFill(0x1ABC9C);
		this.ballGraphics.drawCircle(0, 0, BALL_CONFIG.RADIUS);
		this.ballGraphics.endFill();

		this.ballGraphics.beginFill(0x16A085);
		this.ballGraphics.drawCircle(0, 0, BALL_CONFIG.RADIUS * 0.85);
		this.ballGraphics.endFill();

		this.ballGraphics.beginFill(0x1ABC9C);
		this.ballGraphics.drawCircle(0, 0, BALL_CONFIG.RADIUS * 0.7);
		this.ballGraphics.endFill();

		this.createBallShadow();
		this.createBallHighlight();
	}

	private createBallShadow(): void {
		this.ballShadow.clear();
		this.ballShadow.beginFill(0x000000, 0.25);
		this.ballShadow.drawEllipse(0, 0, BALL_CONFIG.RADIUS * 1.3, BALL_CONFIG.RADIUS * 0.7);
		this.ballShadow.endFill();
	}

	private createBallHighlight(): void {
		this.ballHighlightGraphics.clear();
		this.ballHighlightGraphics.beginFill(0xFFFFFF, 0.6);
		this.ballHighlightGraphics.drawCircle(
			-BALL_CONFIG.RADIUS * 0.3,
			-BALL_CONFIG.RADIUS * 0.3,
			BALL_CONFIG.RADIUS * 0.4
		);
		this.ballHighlightGraphics.endFill();

		this.ballHighlightGraphics.beginFill(0xFFFFFF, 0.3);
		this.ballHighlightGraphics.drawCircle(
			BALL_CONFIG.RADIUS * 0.2,
			-BALL_CONFIG.RADIUS * 0.4,
			BALL_CONFIG.RADIUS * 0.15
		);
		this.ballHighlightGraphics.endFill();
	}

	loadLevel(level: LevelConfig): void {
		this.currentLevel = level;
		this.clearLevel();
		this.renderLevel(level);
		this.setupLevelPhysics(level);
	}

	private clearLevel(): void {
		this.levelContainer.removeChildren();
		this.cellSprites.clear();
	}

	private renderLevel(level: LevelConfig): void {
		const cellWidth = this.config.width / GAME_CONFIG.GRID_WIDTH;
		const cellHeight = this.config.height / GAME_CONFIG.GRID_HEIGHT;

		level.grid.forEach((row, rowIndex) => {
			row.forEach((cellType, colIndex) => {
				if (cellType === 'empty') return;

				const x = colIndex * cellWidth;
				const y = rowIndex * cellHeight;
				const cellId = `cell-${rowIndex}-${colIndex}`;

				const cellGraphics = this.createCellGraphics(cellType, cellWidth, cellHeight);
				cellGraphics.x = x;
				cellGraphics.y = y;

				this.levelContainer.addChild(cellGraphics);
				this.cellSprites.set(cellId, cellGraphics);

				if (cellType === 'start') {
					this.setBallPosition({ x: x + cellWidth / 2, y: y + cellHeight / 2 });
				}
			});
		});
	}

	private createCellGraphics(cellType: CellType, width: number, height: number): Graphics {
		const graphics = new Graphics();

		switch (cellType) {
			case 'wall':
				this.createWallGraphics(graphics, width, height);
				break;

			case 'start':
				this.createStartGraphics(graphics, width, height);
				break;

			case 'finish':
				this.createFinishGraphics(graphics, width, height);
				break;

			case 'cashback':
			case 'deposit':
				this.createBonusGraphics(graphics, cellType, width, height);
				break;

			case 'trap_phishing':
			case 'trap_fraud':
				this.createTrapGraphics(graphics, cellType, width, height);
				break;
		}

		return graphics;
	}

	private createWallGraphics(graphics: Graphics, width: number, height: number): void {
		// Банковский сейф - металлическая стена с заклепками
		graphics.beginFill(0x2C3E50);
		graphics.drawRect(0, 0, width, height);
		graphics.endFill();

		// Металлический градиент
		graphics.beginFill(0x34495E);
		graphics.drawRect(1, 1, width - 2, height - 2);
		graphics.endFill();

		// Заклепки по углам
		graphics.beginFill(0x5D6D7E);
		graphics.drawCircle(4, 4, 2);
		graphics.drawCircle(width - 4, 4, 2);
		graphics.drawCircle(4, height - 4, 2);
		graphics.drawCircle(width - 4, height - 4, 2);
		graphics.endFill();

		// Центральная заклепка для больших стен
		if (width > 30 && height > 30) {
			graphics.beginFill(0x5D6D7E);
			graphics.drawCircle(width / 2, height / 2, 2);
			graphics.endFill();
		}

		// Блики на металле
		graphics.lineStyle(1, 0x7F8C8D, 0.3);
		graphics.moveTo(2, 2);
		graphics.lineTo(width - 2, 2);
		graphics.moveTo(2, 2);
		graphics.lineTo(2, height - 2);
	}

	private createStartGraphics(graphics: Graphics, width: number, height: number): void {
		// Стартовая позиция - зеленая площадка с символом активов
		graphics.beginFill(0x27AE60, 0.4);
		graphics.drawRect(0, 0, width, height);
		graphics.endFill();

		graphics.lineStyle(2, 0x1ABC9C);
		graphics.drawRect(2, 2, width - 4, height - 4);

		// Символ денег в центре
		graphics.lineStyle(3, 0x1ABC9C);
		const centerX = width / 2;
		const centerY = height / 2;
		const radius = Math.min(width, height) * 0.2;

		graphics.drawCircle(centerX, centerY, radius);
		graphics.moveTo(centerX - radius * 0.5, centerY - radius * 0.3);
		graphics.lineTo(centerX + radius * 0.5, centerY - radius * 0.3);
		graphics.moveTo(centerX - radius * 0.5, centerY + radius * 0.3);
		graphics.lineTo(centerX + radius * 0.5, centerY + radius * 0.3);
		graphics.moveTo(centerX, centerY - radius * 0.7);
		graphics.lineTo(centerX, centerY + radius * 0.7);
	}

	private createFinishGraphics(graphics: Graphics, width: number, height: number): void {
		// Банковский сейф - золотой с замком
		graphics.beginFill(0xF39C12);
		graphics.drawRoundedRect(width * 0.05, height * 0.05, width * 0.9, height * 0.9, 6);
		graphics.endFill();

		// Внутренняя рамка
		graphics.beginFill(0xE67E22);
		graphics.drawRoundedRect(width * 0.1, height * 0.1, width * 0.8, height * 0.8, 4);
		graphics.endFill();

		// Замочная скважина
		graphics.beginFill(0xD35400);
		const centerX = width / 2;
		const centerY = height / 2;
		graphics.drawCircle(centerX, centerY, width * 0.12);
		graphics.endFill();

		graphics.beginFill(0xA0522D);
		graphics.drawRect(centerX - width * 0.03, centerY, width * 0.06, height * 0.15);
		graphics.endFill();

		// Декоративные элементы сейфа
		graphics.lineStyle(2, 0xD35400);
		graphics.drawCircle(centerX, centerY - height * 0.25, 3);
		graphics.drawCircle(centerX, centerY + height * 0.25, 3);
		graphics.drawCircle(centerX - width * 0.25, centerY, 3);
		graphics.drawCircle(centerX + width * 0.25, centerY, 3);
	}

	private createBonusGraphics(graphics: Graphics, cellType: 'cashback' | 'deposit', width: number, height: number): void {
		const color = cellType === 'cashback' ? 0x1ABC9C : 0x3498DB;
		const centerX = width / 2;
		const centerY = height / 2;
		const radius = Math.min(width, height) * 0.35;

		// Фон бонуса с градиентом
		graphics.beginFill(color);
		graphics.drawCircle(centerX, centerY, radius);
		graphics.endFill();

		// Внутренняя область
		graphics.beginFill(color === 0x1ABC9C ? 0x16A085 : 0x2980B9);
		graphics.drawCircle(centerX, centerY, radius * 0.8);
		graphics.endFill();

		// Символ
		graphics.lineStyle(3, 0xFFFFFF);
		if (cellType === 'cashback') {
			// Символ возврата денег - стрелка с монетой
			graphics.drawCircle(centerX, centerY, radius * 0.4);
			graphics.moveTo(centerX - radius * 0.3, centerY - radius * 0.1);
			graphics.lineTo(centerX - radius * 0.6, centerY - radius * 0.1);
			graphics.lineTo(centerX - radius * 0.5, centerY - radius * 0.3);
			graphics.moveTo(centerX - radius * 0.6, centerY - radius * 0.1);
			graphics.lineTo(centerX - radius * 0.5, centerY + radius * 0.1);
		} else {
			// Символ депозита - банк
			graphics.drawRect(centerX - radius * 0.4, centerY - radius * 0.2, radius * 0.8, radius * 0.4);
			graphics.moveTo(centerX - radius * 0.5, centerY - radius * 0.2);
			graphics.lineTo(centerX, centerY - radius * 0.4);
			graphics.lineTo(centerX + radius * 0.5, centerY - radius * 0.2);
		}

		// Блики
		graphics.beginFill(0xFFFFFF, 0.3);
		graphics.drawCircle(centerX - radius * 0.3, centerY - radius * 0.3, radius * 0.2);
		graphics.endFill();
	}

	private createTrapGraphics(graphics: Graphics, cellType: 'trap_phishing' | 'trap_fraud', width: number, height: number): void {
		const color = cellType === 'trap_phishing' ? 0xE74C3C : 0xC0392B;
		const centerX = width / 2;
		const centerY = height / 2;
		const radius = Math.min(width, height) * 0.35;

		// Фон ловушки
		graphics.beginFill(color);
		graphics.drawCircle(centerX, centerY, radius);
		graphics.endFill();

		// Внутренняя область с более темным цветом
		graphics.beginFill(0x922B21);
		graphics.drawCircle(centerX, centerY, radius * 0.8);
		graphics.endFill();

		// Предупреждающий символ
		graphics.lineStyle(4, 0xFFFFFF);

		if (cellType === 'trap_phishing') {
			// Символ фишинга - рыболовный крючок
			graphics.moveTo(centerX, centerY - radius * 0.4);
			graphics.lineTo(centerX, centerY + radius * 0.2);
			graphics.lineTo(centerX + radius * 0.3, centerY);
			graphics.lineTo(centerX + radius * 0.2, centerY - radius * 0.1);
		} else {
			// Символ мошенничества - восклицательный знак
			graphics.moveTo(centerX, centerY - radius * 0.4);
			graphics.lineTo(centerX, centerY);
			graphics.drawCircle(centerX, centerY + radius * 0.25, 2);
		}

		// Треугольные предупреждающие полосы
		graphics.lineStyle(2, 0xFFFFFF, 0.6);
		for (let i = 0; i < 8; i++) {
			const angle = (i * Math.PI * 2) / 8;
			const x1 = centerX + Math.cos(angle) * radius * 0.6;
			const y1 = centerY + Math.sin(angle) * radius * 0.6;
			const x2 = centerX + Math.cos(angle) * radius * 0.9;
			const y2 = centerY + Math.sin(angle) * radius * 0.9;
			graphics.moveTo(x1, y1);
			graphics.lineTo(x2, y2);
		}
	}

	private getCellColor(cellType: CellType): number {
		const colorHex = CELL_COLORS[cellType];
		if (colorHex === 'transparent') return 0x000000;
		return parseInt(colorHex.replace('#', ''), 16);
	}

	private setupLevelPhysics(level: LevelConfig): void {
		this.physics.createLevelGeometry(level, {
			width: this.config.width,
			height: this.config.height
		});

		const startPos = this.getStartPosition(level);
		if (startPos) {
			this.physics.createBall(startPos);
		}
	}

	private getStartPosition(level: LevelConfig): Position | null {
		const cellWidth = this.config.width / GAME_CONFIG.GRID_WIDTH;
		const cellHeight = this.config.height / GAME_CONFIG.GRID_HEIGHT;

		for (let row = 0; row < level.grid.length; row++) {
			for (let col = 0; col < level.grid[row].length; col++) {
				if (level.grid[row][col] === 'start') {
					return {
						x: col * cellWidth + cellWidth / 2,
						y: row * cellHeight + cellHeight / 2
					};
				}
			}
		}
		return null;
	}

	setBallPosition(position: Position): void {
		this.physics.setBallPosition(position);
		this.ballGraphics.x = position.x;
		this.ballGraphics.y = position.y;
	}

	updateGravity(gravity: { x: number; y: number }): void {
		this.physics.updateGravity(gravity);
	}

	updateVisualEffects(gravity: { x: number; y: number }, deltaTime: number = 16): void {
		this.targetTilt = convertTiltToNormalized(gravity);
		this.currentTilt = smoothTiltTransition(this.currentTilt, this.targetTilt);

		const effects = this.visualEffectsManager.updateEffects(this.currentTilt, deltaTime);

		this.updatePerspective(effects.perspective);
		this.updateBallShadow(effects.shadow);
		this.updateBallHighlight(effects.ballHighlight);
	}

	private updatePerspective(perspective: VisualEffects['perspective']): void {
		const containerElement = this.app.canvas.parentElement;
		if (containerElement) {
			const rotateX = perspective.y * VISUAL_EFFECTS.MAX_TILT_ANGLE;
			const rotateY = -perspective.x * VISUAL_EFFECTS.MAX_TILT_ANGLE;

			containerElement.style.transform =
				`perspective(${perspective.intensity}px) ` +
				`rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
		}
	}

	private updateBallShadow(shadow: VisualEffects['shadow']): void {
		this.ballShadow.x = this.ballGraphics.x + shadow.offsetX;
		this.ballShadow.y = this.ballGraphics.y + shadow.offsetY + BALL_CONFIG.RADIUS;
		this.ballShadow.scale.set(1, shadow.scaleY);
		this.ballShadow.alpha = shadow.opacity;
	}

	private updateBallHighlight(highlight: VisualEffects['ballHighlight']): void {
		this.ballHighlightGraphics.x = this.ballGraphics.x + highlight.offsetX;
		this.ballHighlightGraphics.y = this.ballGraphics.y + highlight.offsetY;
		this.ballHighlightGraphics.alpha = highlight.intensity;
	}

	private createBonusEffect(position: Position, type: 'cashback' | 'deposit'): void {
		this.effectsManager.triggerEffect({
			position,
			type: 'bonus',
			intensity: 'medium',
			bankingTheme: type
		});

		const effect = new Graphics();
		effect.beginFill(type === 'cashback' ? 0x1ABC9C : 0x3498DB);
		effect.drawStar(0, 0, 8, 15, 8);
		effect.endFill();
		effect.x = position.x;
		effect.y = position.y;

		this.effectsContainer.addChild(effect);

		this.animateEffect(effect, {
			scale: { from: 0, to: 1.5 },
			alpha: { from: 1, to: 0 },
			duration: ANIMATION_DURATIONS.BONUS_COLLECT
		});
	}

	private createTrapEffect(position: Position, type: 'trap_phishing' | 'trap_fraud'): void {
		this.effectsManager.triggerEffect({
			position,
			type: 'trap',
			intensity: 'high',
			metadata: { trapType: type }
		});

		const effect = new Graphics();
		effect.beginFill(0xE74C3C);
		effect.drawCircle(0, 0, 20);
		effect.endFill();
		effect.x = position.x;
		effect.y = position.y;

		this.effectsContainer.addChild(effect);

		this.animateEffect(effect, {
			scale: { from: 1, to: 2 },
			alpha: { from: 0.8, to: 0 },
			duration: ANIMATION_DURATIONS.TRAP_HIT
		});
	}

	private createFinishEffect(position: Position): void {
		this.effectsManager.triggerEffect({
			position,
			type: 'finish',
			intensity: 'high'
		});

		const effect = new Graphics();
		effect.beginFill(0xF39C12);
		effect.drawStar(0, 0, 12, 30, 15);
		effect.endFill();
		effect.x = position.x;
		effect.y = position.y;

		this.effectsContainer.addChild(effect);

		this.animateEffect(effect, {
			scale: { from: 0, to: 2 },
			rotation: { from: 0, to: Math.PI * 2 },
			alpha: { from: 1, to: 0 },
			duration: ANIMATION_DURATIONS.LEVEL_TRANSITION
		});
	}

	private animateEffect(sprite: Graphics, animation: any): void {
		const startTime = performance.now();
		const animate = (currentTime: number) => {
			const elapsed = currentTime - startTime;
			const progress = Math.min(elapsed / animation.duration, 1);

			if (animation.scale) {
				const scale = animation.scale.from + (animation.scale.to - animation.scale.from) * progress;
				sprite.scale.set(scale);
			}

			if (animation.alpha) {
				sprite.alpha = animation.alpha.from + (animation.alpha.to - animation.alpha.from) * progress;
			}

			if (animation.rotation) {
				sprite.rotation = animation.rotation.from + (animation.rotation.to - animation.rotation.from) * progress;
			}

			if (progress < 1) {
				requestAnimationFrame(animate);
			} else {
				this.effectsContainer.removeChild(sprite);
			}
		};

		requestAnimationFrame(animate);
	}

	start(): void {
		this.physics.start();
		this.startGameLoop();
	}

	stop(): void {
		this.physics.stop();
		this.stopGameLoop();
	}

	private startGameLoop(): void {
		this.lastTime = performance.now();
		this.gameLoop();
	}

	private stopGameLoop(): void {
		if (this.animationFrameId) {
			cancelAnimationFrame(this.animationFrameId);
			this.animationFrameId = null;
		}
	}

	private gameLoop = (): void => {
		const currentTime = performance.now();
		const deltaTime = currentTime - this.lastTime;
		this.lastTime = currentTime;

		this.physics.update(deltaTime);
		this.updateBallGraphics();

		this.animationFrameId = requestAnimationFrame(this.gameLoop);
	};

	private updateBallGraphics(): void {
		const ballPosition = this.physics.getBallPosition();
		if (ballPosition) {
			this.ballGraphics.x = ballPosition.x;
			this.ballGraphics.y = ballPosition.y;
			this.ballHighlightGraphics.x = ballPosition.x;
			this.ballHighlightGraphics.y = ballPosition.y;
		}
	}

	resize(width: number, height: number): void {
		if (!this.isInitialized) return;

		try {
			this.app.renderer.resize(width, height);
		} catch (error) {
			console.warn('Failed to resize AssetGuardianGameEngine:', error);
		}
	}

	getPhysicsEngine(): PhysicsEngine {
		return this.physics;
	}

	removeGameObject(objectId: string): boolean {
		const sprite = this.cellSprites.get(objectId);
		if (sprite) {
			this.createRemovalEffect(sprite.x, sprite.y);
			this.levelContainer.removeChild(sprite);
			this.cellSprites.delete(objectId);
		}

		return this.physics.removeBody(objectId);
	}

	markObjectForRemoval(objectId: string): void {
		const sprite = this.cellSprites.get(objectId);
		if (sprite) {
			sprite.alpha = 0.5;
			this.createCollectionEffect(sprite.x, sprite.y, 'collect');
		}

		this.physics.markBodyForRemoval(objectId);
	}

	processRemovedObjects(): string[] {
		const removedIds = this.physics.processMarkedBodies();

		removedIds.forEach(id => {
			const sprite = this.cellSprites.get(id);
			if (sprite) {
				this.levelContainer.removeChild(sprite);
				this.cellSprites.delete(id);
			}
		});

		return removedIds;
	}

	private createRemovalEffect(x: number, y: number): void {
		const effect = new Graphics();
		effect.beginFill(0xFFD700);
		effect.drawCircle(0, 0, 8);
		effect.endFill();
		effect.x = x;
		effect.y = y;

		this.effectsContainer.addChild(effect);

		this.animateEffect(effect, {
			scale: { from: 1, to: 2 },
			alpha: { from: 1, to: 0 },
			duration: ANIMATION_DURATIONS.OBJECT_REMOVAL || 300
		});
	}

	private createCollectionEffect(x: number, y: number, type: 'collect' | 'trap'): void {
		if (type === 'collect') {
			this.effectsManager.triggerEffect({
				position: { x, y },
				type: 'bonus',
				intensity: 'low'
			});
		}

		const effect = new Graphics();

		if (type === 'collect') {
			effect.beginFill(0x2ECC71);
			effect.drawStar(0, 0, 5, 12, 6);
		} else {
			effect.beginFill(0xE74C3C);
			effect.drawCircle(0, 0, 10);
		}

		effect.endFill();
		effect.x = x;
		effect.y = y;

		this.effectsContainer.addChild(effect);

		this.animateEffect(effect, {
			scale: { from: 0.5, to: 1.5 },
			alpha: { from: 1, to: 0 },
			duration: ANIMATION_DURATIONS.BONUS_COLLECT
		});
	}

	createComboEffect(position: Position, comboLevel: number): void {
		this.effectsManager.triggerEffect({
			position,
			type: 'combo',
			intensity: comboLevel >= 5 ? 'high' : comboLevel >= 3 ? 'medium' : 'low',
			metadata: { comboLevel }
		});
	}

	createAchievementEffect(position: Position, achievementName: string): void {
		this.effectsManager.triggerEffect({
			position,
			type: 'achievement',
			intensity: 'high',
			metadata: { achievementName }
		});
	}

	createWallHitEffect(position: Position): void {
		this.effectsManager.triggerEffect({
			position,
			type: 'wall_hit',
			intensity: 'medium'
		});
	}

	triggerEffect(config: { position: Position; type: string; intensity: string; metadata?: any }): void {
		this.effectsManager.triggerEffect({
			position: config.position,
			type: config.type as any,
			intensity: config.intensity as any,
			metadata: config.metadata
		});
	}

	destroy(): void {
		this.stop();
		this.cellSprites.clear();
		this.visualEffectsManager.destroy();
		this.effectsManager.destroy();

		if (this.app) {
			this.app.destroy(true, { children: true, texture: true });
		}

		this.physics.destroy();
	}
}