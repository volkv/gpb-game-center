<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Shield, Trophy, Zap, Play, Pause, RotateCcw } from 'lucide-svelte';
	import { Button, Counter, Badge, GameLayout } from '$lib';
	import { assetGuardianStore, assetGuardianSelectors } from './gameState';
	import { GAME_CONFIG, BALL_CONFIG, BANKING_PRODUCTS } from './constants';
	import type { LevelConfig } from './types';
	import { createGyroscopeManager, createFallbackInputManager, throttle } from './gyroscope';
	import type { GyroscopeManager, FallbackInputManager } from './gyroscope';
	import { AssetGuardianGameEngine } from './gameEngine';
	import type { GameEngineConfig } from './gameEngine';
	import { createVisualEffectsManager, convertTiltToNormalized } from './visual-effects';
	import type { VisualEffectsManager } from './visual-effects';
	import AssetGuardianModal from './AssetGuardianModal.svelte';
	import {
		LEVELS,
		getLevelById,
		getNextLevel,
		getTotalLevels,
		isLastLevel
	} from './levelData';
	import { validateLevel, parseLevel } from './levelParser';
	import GameHeader from './components/GameHeader.svelte';
	import GameControls from './components/GameControls.svelte';

	interface Props {
		onexit?: () => void;
	}

	let { onexit }: Props = $props();

	let mounted = $state(false);
	let gameState = $state($assetGuardianStore);
	let selectors = $state($assetGuardianSelectors);
	let gameCanvas: HTMLCanvasElement | undefined = $state();
	let showInstructions = $state(true);
	let gyroscopeManager: GyroscopeManager;
	let fallbackInputManager: FallbackInputManager;
	let gameEngine: AssetGuardianGameEngine | null = $state(null);
	let gameEngineReady = $state(false);
	let gyroscopeStatus = $state('checking');
	let visualEffectsManager: VisualEffectsManager | null = $state(null);
	let gameCanvasWrapper: HTMLElement | undefined = $state();
	let isDebugLogging = $state(false);

	let canvasSize = $state({ width: 400, height: 400 });
	let containerSize = $state({ width: 0, height: 0 });

	// Calculate adaptive canvas size
	function calculateCanvasSize() {
		if (typeof window === 'undefined') return { width: 400, height: 400 };

		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;

		// Reserve space for UI elements (header, buttons, safe areas)
		const availableWidth = viewportWidth - 32; // 16px padding on each side
		const availableHeight = viewportHeight - 280; // Reserve for header and controls

		// Ensure square aspect ratio and minimum/maximum sizes
		const maxSize = Math.min(availableWidth, availableHeight);
		const size = Math.max(280, Math.min(450, maxSize)); // Between 280px and 450px

		return { width: size, height: size };
	}

	// Update canvas size on mount and resize
	function updateCanvasSize() {
		const newSize = calculateCanvasSize();
		canvasSize = newSize;

		if (gameEngine && gameEngineReady) {
			gameEngine.resize(newSize.width, newSize.height);
		}
	}

	$effect(() => {
		gameState = $assetGuardianStore;
		selectors = $assetGuardianSelectors;
	});

	// Handle window resize
	$effect(() => {
		if (typeof window !== 'undefined') {
			updateCanvasSize();
			const handleResize = () => updateCanvasSize();
			window.addEventListener('resize', handleResize);

			return () => {
				window.removeEventListener('resize', handleResize);
			};
		}
	});

	$effect(() => {
		if (gameCanvas && gyroscopeStatus === 'fallback' && fallbackInputManager && !fallbackInputManager.isActive) {
			setupFallbackInput();
		}
	});

	$effect(() => {
		if (gameCanvas && !gameEngine) {
			initializeGameEngine();
		}
	});

	$effect(() => {
		if (gameEngine && gameEngineReady && selectors.currentGravity) {
			assetGuardianStore.updateGameEngineGravity(gameEngine, selectors.currentGravity);
			gameEngine.updateVisualEffects(selectors.currentGravity);
		}
	});

	let currentLevelId = $state(1);

	function loadCurrentLevel(): LevelConfig {
		const level = getLevelById(currentLevelId);
		if (!level) {
			console.error(`Level ${currentLevelId} not found, falling back to level 1`);
			currentLevelId = 1;
			return LEVELS[0];
		}

		const validation = validateLevel(level);
		if (!validation.isValid) {
			console.error(`Level ${currentLevelId} validation failed:`, validation.error);
			if (validation.suggestions) {
				console.warn('Suggestions:', validation.suggestions);
			}
		}

		return level;
	}

	onMount(async () => {
		mounted = true;

		// Initialize adaptive canvas size
		updateCanvasSize();

		const level = loadCurrentLevel();
		assetGuardianStore.initialize(level);
		assetGuardianStore.initializeCollisionSystem();

		if (gameCanvasWrapper) {
			visualEffectsManager = createVisualEffectsManager();
			visualEffectsManager.initialize(gameCanvasWrapper);
		}

		setTimeout(() => {
			showInstructions = false;
		}, 5000);

		await initializeInputSystem();
	});

	async function initializeInputSystem() {
		gyroscopeStatus = 'initializing';

		gyroscopeManager = createGyroscopeManager();
		fallbackInputManager = createFallbackInputManager();

		assetGuardianStore.setupGyroscopeManager(gyroscopeManager);

		if (gyroscopeManager.isSupported) {
			if (import.meta.env.DEV) console.log('🎮 [INPUT] Gyroscope init');

			const throttledGravityUpdate = throttle((gravity) => {
				assetGuardianStore.updateGravityFromGyroscope(gravity);
			}, 16);

			gyroscopeManager.onGyroscopeChanged((data) => {
				assetGuardianStore.updateGyroscope(data);
				const gravity = gyroscopeManager.convertToGravity(data);
				throttledGravityUpdate(gravity);
			});

			gyroscopeManager.onGyroscopeStarted(() => {
				if (import.meta.env.DEV) console.log('✅ [INPUT] Gyroscope active');
				gyroscopeStatus = 'active';
				assetGuardianStore.enableGyroscope();
			});

			gyroscopeManager.onGyroscopeFailed((error) => {
				if (import.meta.env.DEV) console.warn('⚠️ [INPUT] Gyroscope failed:', error);
				setupFallbackInput();
			});

			gyroscopeStatus = 'ready';
		} else {
			if (import.meta.env.DEV) console.log('🎮 [INPUT] Using touch fallback');
			setupFallbackInput();
		}
	}

	async function startGyroscope() {
		if (gyroscopeStatus === 'fallback') {
			if (gameCanvas && fallbackInputManager && !fallbackInputManager.isActive) {
				fallbackInputManager.start(gameCanvas);
				if (import.meta.env.DEV) console.log('✅ [INPUT] Touch started');
			}
			return;
		}

		if (!gyroscopeManager || !gyroscopeManager.isSupported) {
			return;
		}

		const started = await gyroscopeManager.start();
		if (!started) {
			if (import.meta.env.DEV) console.warn('⚠️ [INPUT] Gyroscope not started');
			setupFallbackInput();
		}
	}

	function stopGyroscope() {
		if (gyroscopeManager && gyroscopeManager.isActive) {
			gyroscopeManager.stop();
			if (gyroscopeStatus === 'active') {
				gyroscopeStatus = 'ready';
			}
			if (import.meta.env.DEV) console.log('🛑 [INPUT] Gyroscope stopped');
		}

		if (fallbackInputManager && fallbackInputManager.isActive) {
			fallbackInputManager.stop();
			if (import.meta.env.DEV) console.log('🛑 [INPUT] Touch stopped');
		}
	}

	function setupFallbackInput() {
		gyroscopeStatus = 'fallback';

		const throttledGravityUpdate = throttle((gravity) => {
			assetGuardianStore.updateGravityFromGyroscope(gravity);
		}, 16);

		fallbackInputManager.onInputChanged(throttledGravityUpdate);

		if (import.meta.env.DEV) console.log('🎮 [INPUT] Touch configured');
	}

	async function initializeGameEngine() {
		if (!gameCanvas) {
			if (import.meta.env.DEV) console.warn('⚠️ [ENGINE] Canvas not ready');
			return;
		}

		try {
			if (import.meta.env.DEV) console.log('🎮 [ENGINE] Init...');

			const config: GameEngineConfig = {
				width: canvasSize.width,
				height: canvasSize.height,
				backgroundColor: 0x2C3E50,
				antialias: true,
				resolution: 1
			};

			gameEngine = new AssetGuardianGameEngine(config);
			await assetGuardianStore.initializeGameEngine(gameEngine, gameCanvas);

			assetGuardianStore.setGameEngineForCollisionHandler(gameEngine);

			const physics = gameEngine.getPhysicsEngine();
			physics.addCollisionHandler('cashback', (result) => {
				assetGuardianStore.handlePhysicsCollision(result, gameEngine || undefined);
			});

			physics.addCollisionHandler('deposit', (result) => {
				assetGuardianStore.handlePhysicsCollision(result, gameEngine || undefined);
			});

			physics.addCollisionHandler('trap_phishing', (result) => {
				assetGuardianStore.handlePhysicsCollision(result, gameEngine || undefined);
			});

			physics.addCollisionHandler('trap_fraud', (result) => {
				assetGuardianStore.handlePhysicsCollision(result, gameEngine || undefined);
			});

			physics.addCollisionHandler('finish', (result) => {
				assetGuardianStore.handlePhysicsCollision(result, gameEngine || undefined);
			});

			const level = loadCurrentLevel();
			assetGuardianStore.loadGameLevel(gameEngine, level);

			gameEngineReady = true;
			if (import.meta.env.DEV) console.log('✅ [ENGINE] Ready');
		} catch (error) {
			console.error('❌ [ENGINE] Init failed:', error);
		}
	}

	onDestroy(() => {
		if (gameEngine) {
			assetGuardianStore.destroyGameEngine(gameEngine);
			gameEngine = null;
		}
		if (gyroscopeManager) {
			gyroscopeManager.cleanup();
		}
		if (fallbackInputManager) {
			fallbackInputManager.cleanup();
		}
		if (visualEffectsManager) {
			visualEffectsManager.destroy();
		}
		assetGuardianStore.destroyCollisionSystem();
		assetGuardianStore.reset();
	});


	async function handleStartGame() {
		if (!gameEngine || !gameEngineReady) {
			console.warn('Game engine not ready');
			return;
		}

		showInstructions = false;
		await startGyroscope();
		assetGuardianStore.startGameEngines(gameEngine);
	}

	function handlePauseGame() {
		if (!gameEngine) return;
		stopGyroscope();
		assetGuardianStore.stopGameEngines(gameEngine);
	}

	async function handleResumeGame() {
		if (!gameEngine) return;
		await startGyroscope();
		assetGuardianStore.startGameEngines(gameEngine);
	}

	function handleRestartGame() {
		stopGyroscope();
		assetGuardianStore.reset();
		const level = loadCurrentLevel();
		assetGuardianStore.initialize(level);
		if (gameEngine) {
			assetGuardianStore.loadGameLevel(gameEngine, level);
		}
	}

	function handleNextLevel() {
		const nextLevel = getNextLevel(currentLevelId);
		if (nextLevel) {
			stopGyroscope();
			currentLevelId = nextLevel.id;
			const level = loadCurrentLevel();
			assetGuardianStore.reset();
			assetGuardianStore.initialize(level);
			if (gameEngine) {
				assetGuardianStore.loadGameLevel(gameEngine, level);
			}
		}
	}

	function handlePrevLevel() {
		if (currentLevelId > 1) {
			stopGyroscope();
			currentLevelId = currentLevelId - 1;
			const level = loadCurrentLevel();
			assetGuardianStore.reset();
			assetGuardianStore.initialize(level);
			if (gameEngine) {
				assetGuardianStore.loadGameLevel(gameEngine, level);
			}
		}
	}


	function handleStartDebugLogging() {
		if (!gyroscopeManager || !gyroscopeManager.isSupported || !gyroscopeManager.isActive) {
			if (import.meta.env.DEV) console.warn('⚠️ [DEBUG] Gyroscope not available');
			return;
		}

		gyroscopeManager.startDebugLogging();
		isDebugLogging = true;
		console.log('📝 [DEBUG] Logging started');
	}

	function handleStopDebugLogging() {
		if (!gyroscopeManager) {
			if (import.meta.env.DEV) console.warn('⚠️ [DEBUG] Manager not available');
			return;
		}

		const debugLogs = gyroscopeManager.stopDebugLogging();
		isDebugLogging = false;
		console.log(`📊 [DEBUG] Stopped. ${debugLogs.length} samples collected`);
	}


	function handleActivateBonus(productId: string) {
		assetGuardianStore.activateBonus(productId);

		// Show confirmation effect
		if (gameEngine) {
			gameEngine.triggerEffect({
				position: { x: 50, y: 50 },
				type: 'achievement',
				intensity: 'high',
				metadata: { achievementName: 'Банковский бонус активирован!' }
			});
		}

		// Continue to next level if not last
		if (!isLastLevel(currentLevelId)) {
			setTimeout(() => {
				handleNextLevel();
			}, 1500);
		}
	}

	function handleExit() {
		stopGyroscope();
		onexit?.();
	}

	function handleCloseSuccessModal() {
		stopGyroscope();
		assetGuardianStore.reset();
	}
</script>

<GameLayout gameName="Хранитель Активов" background="gradient-electric" showScore={true}>
	<div class="asset-guardian-container">
		<GameHeader
			{selectors}
			{gameState}
			{gyroscopeStatus}
			{isDebugLogging}
			{currentLevelId}
			totalLevels={getTotalLevels()}
			isLastLevel={isLastLevel(currentLevelId)}
			onPrevLevel={handlePrevLevel}
			onNextLevel={handleNextLevel}
		/>

		<!-- Game Canvas Area -->
		<div class="game-canvas-wrapper perspective-active no-scroll" bind:this={gameCanvasWrapper}>
			<!-- Canvas Layer (will be transformed) -->
			<div class="game-canvas-container bank-vault-glow no-scroll">
				<canvas
					bind:this={gameCanvas}
					class="game-canvas"
					width={canvasSize.width}
					height={canvasSize.height}
					style="touch-action: none; user-select: none; max-width: 100%; max-height: 100%; object-fit: contain;"
				></canvas>
			</div>

			<!-- UI Layer (now empty, UI moved to modal) -->
			<div class="game-ui-layer">
				<!-- UI elements moved to AssetGuardianModal -->
			</div>
		</div>

		<GameControls isPlaying={selectors.isPlaying} onPause={handlePauseGame} onExit={handleExit} />

		<!-- Full-screen Modal UI -->
		<AssetGuardianModal
			showInstructions={showInstructions}
			selectors={selectors}
			gameState={gameState}
			currentLevelId={currentLevelId}
			onStartGame={handleStartGame}
			onResumeGame={handleResumeGame}
			onPauseGame={handlePauseGame}
			onRestartGame={handleRestartGame}
			onExit={handleExit}
			onCloseSuccessModal={handleCloseSuccessModal}
			onNextLevel={handleNextLevel}
			onActivateBonus={handleActivateBonus}
		/>
	</div>
</GameLayout>

<style>
	.asset-guardian-container {
		display: flex;
		flex-direction: column;
		flex: 1;
		height: 100%;
		min-height: 0;
		font-family: 'Gazprombank Sans', system-ui, sans-serif;
	}

	.game-canvas-wrapper {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		position: relative;
		perspective: 800px;
		perspective-origin: center center;
		min-height: 0;
		overflow: hidden;
	}

	.game-canvas-container {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		max-width: 100%;
		max-height: 100%;
		background:
			radial-gradient(ellipse at center,
				rgba(15, 169, 194, 0.1) 0%,
				rgba(0, 107, 165, 0.2) 30%,
				rgba(44, 62, 80, 0.4) 60%,
				rgba(44, 62, 80, 0.8) 100%),
			linear-gradient(135deg,
				rgba(44, 62, 80, 0.9) 0%,
				rgba(52, 73, 94, 0.9) 25%,
				rgba(44, 62, 80, 0.9) 50%,
				rgba(52, 73, 94, 0.9) 75%,
				rgba(44, 62, 80, 0.9) 100%);
		border-radius: 1rem;
		padding: 1.5rem;
		backdrop-filter: blur(12px);
		border: 2px solid rgba(243, 156, 18, 0.3);
		box-shadow:
			0 0 30px rgba(243, 156, 18, 0.2),
			inset 0 0 20px rgba(243, 156, 18, 0.1),
			0 8px 32px rgba(0, 0, 0, 0.3);
		transform-style: preserve-3d;
		transition: transform 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94);
		overflow: hidden;
	}

	.game-ui-layer {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		pointer-events: none;
		z-index: 10;
		/* UI moved to AssetGuardianModal */
	}

	.game-canvas-container::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background:
			repeating-linear-gradient(45deg,
				transparent,
				transparent 2px,
				rgba(255,255,255,0.03) 2px,
				rgba(255,255,255,0.03) 4px),
			repeating-linear-gradient(-45deg,
				transparent,
				transparent 8px,
				rgba(26, 188, 156, 0.05) 8px,
				rgba(26, 188, 156, 0.05) 10px);
		border-radius: 1rem;
		pointer-events: none;
		z-index: 1;
	}

	.game-canvas {
		display: block;
		border-radius: 0.75rem;
		max-width: 100%;
		max-height: 100vh;
		width: auto;
		height: auto;
		object-fit: contain;
		background:
			radial-gradient(circle at 30% 30%,
				rgba(26, 188, 156, 0.15) 0%,
				rgba(52, 152, 219, 0.1) 30%,
				rgba(44, 62, 80, 1) 60%,
				rgba(52, 73, 94, 1) 100%),
			linear-gradient(45deg,
				rgba(255,255,255,0.05) 0%,
				transparent 50%,
				rgba(0,0,0,0.1) 100%);
		box-shadow:
			inset 0 0 30px rgba(0, 0, 0, 0.5),
			inset 0 4px 15px rgba(26, 188, 156, 0.1),
			0 0 20px rgba(26, 188, 156, 0.1);
		border: 1px solid rgba(26, 188, 156, 0.2);
		transform: translateZ(10px);
		position: relative;
		z-index: 2;
	}

	/* Game overlay styles moved to AssetGuardianModal.svelte */

	@keyframes pulse-glow {
		0%, 100% {
			box-shadow: 0 0 15px rgba(31, 196, 217, 0.4);
		}
		50% {
			box-shadow: 0 0 25px rgba(31, 196, 217, 0.7);
		}
	}




	.game-canvas-wrapper.perspective-active .game-canvas-container {
		transform-style: preserve-3d;
	}

	.bank-vault-glow {
		animation: vault-pulse 3s ease-in-out infinite;
	}

	@keyframes vault-pulse {
		0%, 100% {
			box-shadow:
				0 0 30px rgba(243, 156, 18, 0.2),
				inset 0 0 20px rgba(243, 156, 18, 0.1),
				0 8px 32px rgba(0, 0, 0, 0.3);
		}
		50% {
			box-shadow:
				0 0 40px rgba(243, 156, 18, 0.3),
				inset 0 0 25px rgba(243, 156, 18, 0.15),
				0 12px 40px rgba(0, 0, 0, 0.4);
		}
	}

	/* Modal styles moved to AssetGuardianModal.svelte */


	.no-scroll {
		touch-action: none !important;
		user-select: none !important;
		-webkit-user-select: none !important;
		-webkit-touch-callout: none !important;
		-webkit-tap-highlight-color: transparent !important;
		overscroll-behavior: none !important;
		overflow: hidden !important;
	}

	.no-scroll * {
		touch-action: none !important;
		user-select: none !important;
		-webkit-user-select: none !important;
		-webkit-touch-callout: none !important;
		-webkit-tap-highlight-color: transparent !important;
	}

	@media (max-width: 380px) {
		.game-canvas-wrapper {
			padding: 0.5rem;
		}
	}
</style>