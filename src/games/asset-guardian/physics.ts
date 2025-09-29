import { Engine, World, Bodies, Body, Events, Vector } from 'matter-js';
import type { Position, CellType, LevelConfig, PhysicsBody, CollisionResult } from './types';
import {
	GAME_CONFIG,
	BALL_CONFIG,
	PHYSICS_CONFIG,
	COLLISION_CATEGORIES,
	CELL_TYPES
} from './constants';

export class PhysicsEngine {
	private engine: Engine;
	private world: World;
	private bodies: Map<string, Body> = new Map();
	private ballBody: Body | null = null;
	private isRunning = false;
	private lastUpdateTime = 0;
	private collisionHandlers: Map<string, (result: CollisionResult) => void> = new Map();

	constructor() {
		this.engine = Engine.create();
		this.world = this.engine.world;

		this.setupWorld();
		this.setupCollisionDetection();
	}

	private setupWorld(): void {
		this.engine.world.gravity.x = 0;
		this.engine.world.gravity.y = 0;
		this.engine.constraintIterations = 2;
		this.engine.positionIterations = 6;
		this.engine.velocityIterations = 4;
		this.engine.enableSleeping = false;
	}

	private setupCollisionDetection(): void {
		Events.on(this.engine, 'collisionStart', (event) => {
			for (const pair of event.pairs) {
				this.handleCollision(pair.bodyA, pair.bodyB);
			}
		});
	}

	private handleCollision(bodyA: Body, bodyB: Body): void {
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

		const result: CollisionResult = {
			type: this.getCollisionType(bodyType),
			position: { x: otherBody.position.x, y: otherBody.position.y },
			value: this.getCollisionValue(bodyType),
			effect: this.getCollisionEffect(bodyType)
		};

		const handler = this.collisionHandlers.get(bodyType);
		if (handler) {
			handler(result);
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
				restitution: BALL_CONFIG.RESTITUTION,
				friction: BALL_CONFIG.FRICTION_COEFFICIENT,
				frictionAir: 1 - PHYSICS_CONFIG.AIR_RESISTANCE,
				frictionStatic: PHYSICS_CONFIG.SURFACE_FRICTION.NORMAL,
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
		(ball as any).collisionDampening = BALL_CONFIG.COLLISION_DAMPENING;

		World.add(this.world, ball);
		this.bodies.set('ball', ball);
		this.ballBody = ball;

		return ball;
	}

	createWalls(bounds: { width: number; height: number }): Body[] {
		const thickness = 20;
		const walls = [
			Bodies.rectangle(bounds.width / 2, -thickness / 2, bounds.width, thickness, {
				isStatic: true,
				collisionFilter: { category: COLLISION_CATEGORIES.BOUNDARY }
			}),
			Bodies.rectangle(bounds.width / 2, bounds.height + thickness / 2, bounds.width, thickness, {
				isStatic: true,
				collisionFilter: { category: COLLISION_CATEGORIES.BOUNDARY }
			}),
			Bodies.rectangle(-thickness / 2, bounds.height / 2, thickness, bounds.height, {
				isStatic: true,
				collisionFilter: { category: COLLISION_CATEGORIES.BOUNDARY }
			}),
			Bodies.rectangle(bounds.width + thickness / 2, bounds.height / 2, thickness, bounds.height, {
				isStatic: true,
				collisionFilter: { category: COLLISION_CATEGORIES.BOUNDARY }
			})
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
						body = Bodies.rectangle(x, y, cellWidth, cellHeight, { isStatic: true });
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
		this.world.gravity.x = gravity.x;
		this.world.gravity.y = gravity.y;
	}

	start(): void {
		this.isRunning = true;
		this.lastUpdateTime = performance.now();
	}

	stop(): void {
		this.isRunning = false;
	}

	update(deltaTime: number): void {
		if (!this.isRunning) return;

		const clampedDelta = Math.min(deltaTime, PHYSICS_CONFIG.PHYSICS_STEP * 1000);
		Engine.update(this.engine, clampedDelta);

		if (this.ballBody) {
			this.updateBallPhysics();
			this.applyPhysicsCorrections();
		}
	}

	private updateBallPhysics(): void {
		if (!this.ballBody) return;

		const velocity = this.ballBody.velocity;
		const speed = Vector.magnitude(velocity);

		if (speed > BALL_CONFIG.MAX_VELOCITY) {
			const normalizedVelocity = Vector.normalise(velocity);
			const newVelocity = Vector.mult(normalizedVelocity, BALL_CONFIG.MAX_VELOCITY);
			Body.setVelocity(this.ballBody, newVelocity);
		}

		if (speed < BALL_CONFIG.MIN_VELOCITY && speed > 0) {
			Body.setVelocity(this.ballBody, { x: 0, y: 0 });
		}

		this.applyVelocityDampening();
	}

	private applyVelocityDampening(): void {
		if (!this.ballBody) return;

		const velocity = this.ballBody.velocity;
		const dampening = (this.ballBody as any).collisionDampening || 1;

		if (Vector.magnitude(velocity) > 0) {
			const dampenedVelocity = Vector.mult(velocity, dampening);
			Body.setVelocity(this.ballBody, dampenedVelocity);
		}
	}

	private applyPhysicsCorrections(): void {
		if (!this.ballBody) return;

		const position = this.ballBody.position;
		const bounds = {
			width: GAME_CONFIG.WORLD_WIDTH,
			height: GAME_CONFIG.WORLD_HEIGHT
		};

		if (position.x < BALL_CONFIG.RADIUS || position.x > bounds.width - BALL_CONFIG.RADIUS ||
			position.y < BALL_CONFIG.RADIUS || position.y > bounds.height - BALL_CONFIG.RADIUS) {

			const correctedPosition = {
				x: Math.max(BALL_CONFIG.RADIUS, Math.min(bounds.width - BALL_CONFIG.RADIUS, position.x)),
				y: Math.max(BALL_CONFIG.RADIUS, Math.min(bounds.height - BALL_CONFIG.RADIUS, position.y))
			};

			Body.setPosition(this.ballBody, correctedPosition);

			const velocity = this.ballBody.velocity;
			const bounceVelocity = Vector.mult(velocity, -PHYSICS_CONFIG.BOUNCE_ENERGY_LOSS);
			Body.setVelocity(this.ballBody, bounceVelocity);
		}
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
		Body.setPosition(this.ballBody, position);
	}

	addCollisionHandler(bodyType: string, handler: (result: CollisionResult) => void): void {
		this.collisionHandlers.set(bodyType, handler);
	}

	removeCollisionHandler(bodyType: string): void {
		this.collisionHandlers.delete(bodyType);
	}

	getBody(id: string): Body | undefined {
		return this.bodies.get(id);
	}

	getAllBodies(): Map<string, Body> {
		return new Map(this.bodies);
	}

	removeBody(id: string): boolean {
		const body = this.bodies.get(id);
		if (!body) return false;

		World.remove(this.world, body);
		this.bodies.delete(id);
		return true;
	}

	removeBodiesByType(gameType: string): number {
		const bodiesToRemove: { id: string; body: Body }[] = [];

		this.bodies.forEach((body, id) => {
			if ((body as any).gameType === gameType) {
				bodiesToRemove.push({ id, body });
			}
		});

		if (bodiesToRemove.length > 0) {
			const bodies = bodiesToRemove.map(item => item.body);
			World.remove(this.world, bodies);

			bodiesToRemove.forEach(item => {
				this.bodies.delete(item.id);
			});
		}

		return bodiesToRemove.length;
	}

	markBodyForRemoval(id: string): void {
		const body = this.bodies.get(id);
		if (body) {
			(body as any).markedForRemoval = true;
			body.render.visible = false;
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

		const allBodies = Array.from(this.bodies.values());
		if (allBodies.length > 0) {
			World.remove(this.world, allBodies);
		}

		this.bodies.clear();
		this.ballBody = null;
		Engine.clear(this.engine);
	}
}