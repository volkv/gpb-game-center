import { Engine, World, Bodies, Body, Events, Sleeping, Pair } from 'matter-js';
import type { Position, CellType, LevelConfig, CollisionResult } from './types';
import {
	GAME_CONFIG,
	BALL_CONFIG,
	PHYSICS_CONFIG,
	COLLISION_CATEGORIES
} from './constants';

export class PhysicsEngine {
	private engine: Engine;
	private world: World;
	private bodies: Map<string, Body> = new Map();
	private ballBody: Body | null = null;
	private isRunning = false;
	private collisionHandlers: Map<string, (result: CollisionResult) => void> = new Map();
	private lastLogTime = 0;
	private frameCount = 0;
	private isResting = false;
	private timeAtRest = 0;

	constructor() {
		this.engine = Engine.create();
		this.world = this.engine.world;

		this.setupWorld();
		this.setupCollisionDetection();
	}

	private setupWorld(): void {
		this.engine.world.gravity.x = 0;
		this.engine.world.gravity.y = 0;
		// Keep sleeping enabled for better performance and stability
		this.engine.enableSleeping = true;
	}

	private setupCollisionDetection(): void {
		Events.on(this.engine, 'collisionStart', (event) => {
			for (const pair of event.pairs) {
				this.handleCollision(pair, 'start');
			}
		});

		Events.on(this.engine, 'collisionActive', (event) => {
			for (const pair of event.pairs) {
				this.handleCollision(pair, 'active');
			}
		});
	}

	private handleCollision(pair: Pair, phase: 'start' | 'active'): void {
		const { bodyA, bodyB } = pair;
		const ballBody = this.ballBody;
		if (!ballBody) return;

		let otherBody: Body;
		if (bodyA === ballBody) {
			otherBody = bodyB;
		} else if (bodyB === ballBody) {
			otherBody = bodyA;
		} else {
			return;
		}

		const bodyType = (otherBody as any).gameType as string;
		const bodyId = (otherBody as any).gameId as string;

		if (!bodyType || !bodyId) return;

		const isWallCollision = bodyType === 'wall' || bodyType === 'boundary';

		if (phase === 'start') {
			const collisionPoint = pair.collision.supports[0] || ballBody.position;

			const result: CollisionResult = {
				type: this.getCollisionType(bodyType),
				position: { x: collisionPoint.x, y: collisionPoint.y },
				value: this.getCollisionValue(bodyType),
				effect: this.getCollisionEffect(bodyType),
				objectId: bodyId
			};

			const handler = this.collisionHandlers.get(bodyType);
			if (handler) {
				handler(result);
			}
		}
	}


	private getCollisionType(bodyType: string): CollisionResult['type'] {
		switch (bodyType) {
			case 'wall': return 'wall';
			case 'cashback':
			case 'deposit': return 'bonus';
			case 'trap_phishing':
			case 'trap_fraud': return 'trap';
			case 'finish': return 'finish';
			default: return 'wall';
		}
	}

	private getCollisionValue(bodyType: string): number {
		switch (bodyType) {
			case 'cashback': return 100;
			case 'deposit': return 150;
			case 'trap_phishing':
			case 'trap_fraud': return -50;
			case 'finish': return 500;
			default: return 0;
		}
	}

	private getCollisionEffect(bodyType: string): CollisionResult['effect'] {
		switch (bodyType) {
			case 'cashback':
			case 'deposit': return 'score';
			case 'trap_phishing':
			case 'trap_fraud': return 'life';
			case 'finish': return 'complete';
			default: return 'score';
		}
	}

	createBall(position: Position): Body {
		const ball = Bodies.circle(
			position.x,
			position.y,
			BALL_CONFIG.RADIUS,
			{
				mass: BALL_CONFIG.MASS,
				restitution: PHYSICS_CONFIG.BALL_RESTITUTION,
				friction: PHYSICS_CONFIG.BALL_FRICTION,
				frictionAir: PHYSICS_CONFIG.AIR_RESISTANCE,
				frictionStatic: PHYSICS_CONFIG.BALL_FRICTION_STATIC,
				slop: 0.01, // Allow for slight penetration to avoid jitter
				collisionFilter: {
					category: COLLISION_CATEGORIES.BALL,
					mask: COLLISION_CATEGORIES.WALL |
						  COLLISION_CATEGORIES.BONUS |
						  COLLISION_CATEGORIES.TRAP |
						  COLLISION_CATEGORIES.FINISH |
						  COLLISION_CATEGORIES.BOUNDARY
				}
			}
		);

		(ball as any).gameType = 'ball';
		(ball as any).gameId = 'player-ball';

		World.add(this.world, ball);
		this.bodies.set('ball', ball);
		this.ballBody = ball;

		return ball;
	}

	createWalls(bounds: { width: number; height: number }): Body[] {
		const thickness = 50; // Make walls thicker to prevent tunneling
		const wallOptions = {
			isStatic: true,
			restitution: PHYSICS_CONFIG.WALL_RESTITUTION,
			friction: PHYSICS_CONFIG.WALL_FRICTION,
			collisionFilter: { category: COLLISION_CATEGORIES.BOUNDARY }
		};

		const walls = [
			Bodies.rectangle(bounds.width / 2, -thickness / 2, bounds.width + thickness*2, thickness, wallOptions), // Top
			Bodies.rectangle(bounds.width / 2, bounds.height + thickness / 2, bounds.width + thickness*2, thickness, wallOptions), // Bottom
			Bodies.rectangle(-thickness / 2, bounds.height / 2, thickness, bounds.height, wallOptions), // Left
			Bodies.rectangle(bounds.width + thickness / 2, bounds.height / 2, thickness, bounds.height, wallOptions) // Right
		];

		walls.forEach((wall, index) => {
			(wall as any).gameType = 'boundary';
			(wall as any).gameId = `boundary-${index}`;
		});

		World.add(this.world, walls);
		walls.forEach((wall, index) => {
			this.bodies.set(`boundary-${index}`, wall);
		});

		return walls;
	}

	createLevelGeometry(level: LevelConfig, bounds: { width: number; height: number }): void {
		this.clearLevelBodies();

		const cellWidth = bounds.width / GAME_CONFIG.GRID_WIDTH;
		const cellHeight = bounds.height / GAME_CONFIG.GRID_HEIGHT;

		level.grid.forEach((row, rowIndex) => {
			row.forEach((cellType, colIndex) => {
				if (cellType === 'empty' || cellType === 'start') return;

				const x = colIndex * cellWidth + cellWidth / 2;
				const y = rowIndex * cellHeight + cellHeight / 2;
				const bodyId = `cell-${rowIndex}-${colIndex}`;

				let body: Body;
				let collisionCategory: number;

				switch (cellType) {
					case 'wall':
						body = Bodies.rectangle(x, y, cellWidth, cellHeight, {
							isStatic: true,
							restitution: PHYSICS_CONFIG.WALL_RESTITUTION,
							friction: PHYSICS_CONFIG.WALL_FRICTION,
						});
						collisionCategory = COLLISION_CATEGORIES.WALL;
						break;

					case 'finish':
						body = Bodies.rectangle(x, y, cellWidth * 0.8, cellHeight * 0.8, {
							isStatic: true,
							isSensor: true
						});
						collisionCategory = COLLISION_CATEGORIES.FINISH;
						break;

					case 'cashback':
					case 'deposit':
						body = Bodies.circle(x, y, Math.min(cellWidth, cellHeight) * 0.3, {
							isStatic: true,
							isSensor: true
						});
						collisionCategory = COLLISION_CATEGORIES.BONUS;
						break;

					case 'trap_phishing':
					case 'trap_fraud':
						body = Bodies.circle(x, y, Math.min(cellWidth, cellHeight) * 0.35, {
							isStatic: true,
							isSensor: true
						});
						collisionCategory = COLLISION_CATEGORIES.TRAP;
						break;

					default:
						return;
				}

				body.collisionFilter.category = collisionCategory;
				(body as any).gameType = cellType;
				(body as any).gameId = bodyId;

				World.add(this.world, body);
				this.bodies.set(bodyId, body);
			});
		});
	}

	private clearLevelBodies(): void {
		const bodiesToRemove: Body[] = [];

		this.bodies.forEach((body, id) => {
			if (id.startsWith('cell-')) {
				bodiesToRemove.push(body);
			}
		});

		if (bodiesToRemove.length > 0) {
			World.remove(this.world, bodiesToRemove);
		}

		Array.from(this.bodies.keys()).forEach(id => {
			if (id.startsWith('cell-')) {
				this.bodies.delete(id);
			}
		});
	}

	updateGravity(gravity: { x: number; y: number }): void {
		// Apply gravity directly. Matter.js sleeping will handle the rest.
		this.world.gravity.x = gravity.x;
		this.world.gravity.y = gravity.y;

		// Wake the ball up if gravity is applied
		if (this.ballBody && (Math.abs(gravity.x) > 0.01 || Math.abs(gravity.y) > 0.01)) {
			Sleeping.set(this.ballBody, false);
		}

	}

	start(): void {
		this.isRunning = true;
	}

	stop(): void {
		this.isRunning = false;
	}

	update(deltaTime: number): void {
		if (!this.isRunning) return;

		const fixedDelta = PHYSICS_CONFIG.PHYSICS_STEP * 1000;
		const maxDelta = fixedDelta * 2;
		const clampedDelta = Math.min(deltaTime, maxDelta);

		Engine.update(this.engine, fixedDelta);

		if (this.ballBody) {
			this.updateBallState();
		}
	}

	private updateBallState(): void {
		if (!this.ballBody) return;

		this.isResting = this.ballBody.isSleeping;
	}

	getBallPosition(): Position | null {
		if (!this.ballBody) return null;
		return {
			x: this.ballBody.position.x,
			y: this.ballBody.position.y
		};
	}

	getBallVelocity(): Position | null {
		if (!this.ballBody) return null;
		return {
			x: this.ballBody.velocity.x,
			y: this.ballBody.velocity.y
		};
	}

	setBallPosition(position: Position): void {
		if (!this.ballBody) return;
		// Set position and clear velocity/forces to prevent unexpected movement
		Body.setPosition(this.ballBody, position);
		Body.setVelocity(this.ballBody, { x: 0, y: 0 });
		Body.setAngularVelocity(this.ballBody, 0);
		Sleeping.set(this.ballBody, false);
	}

	addCollisionHandler(bodyType: string, handler: (result: CollisionResult) => void): void {
		this.collisionHandlers.set(bodyType, handler);
	}

	removeBody(id: string): boolean {
		const body = this.bodies.get(id);
		if (!body) return false;

		World.remove(this.world, body);
		this.bodies.delete(id);
		return true;
	}

	markBodyForRemoval(id: string): void {
		const body = this.bodies.get(id);
		if (body) {
			(body as any).markedForRemoval = true;
		}
	}

	processMarkedBodies(): string[] {
		const removedIds: string[] = [];
		const bodiesToRemove: Body[] = [];

		this.bodies.forEach((body, id) => {
			if ((body as any).markedForRemoval) {
				bodiesToRemove.push(body);
				removedIds.push(id);
			}
		});

		if (bodiesToRemove.length > 0) {
			World.remove(this.world, bodiesToRemove);
			removedIds.forEach(id => this.bodies.delete(id));
		}

		return removedIds;
	}

	destroy(): void {
		this.stop();
		this.collisionHandlers.clear();
		Events.off(this.engine, 'collisionStart');
		Events.off(this.engine, 'collisionActive');

		Engine.clear(this.engine);
		this.bodies.clear();
		this.ballBody = null;
	}
}
