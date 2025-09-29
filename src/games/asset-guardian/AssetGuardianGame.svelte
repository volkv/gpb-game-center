<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Shield, Clock, Trophy, Zap, Play, Pause, RotateCcw, Settings, BarChart3, Award } from 'lucide-svelte';
	import { Button, Counter, Badge, GameLayout } from '$lib';
	import { assetGuardianStore, assetGuardianSelectors, scoringStore, scoringSelectors } from './gameState';
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

	interface Props {
		onexit?: () => void;
	}

	let { onexit }: Props = $props();

	let mounted = $state(false);
	let gameState = $state($assetGuardianStore);
	let selectors = $state($assetGuardianSelectors);
	let scoringState = $state($scoringSelectors);
	let gameCanvas: HTMLCanvasElement | undefined = $state();
	let showInstructions = $state(true);
	let showStatsModal = $state(false);
	let showSettingsModal = $state(false);
	let gyroscopeManager: GyroscopeManager;
	let fallbackInputManager: FallbackInputManager;
	let gameEngine: AssetGuardianGameEngine | null = $state(null);
	let gameEngineReady = $state(false);
	let calibrationInProgress = $state(false);
	let gyroscopeStatus = $state('checking');
	let visualEffectsManager: VisualEffectsManager | null = $state(null);
	let gameCanvasWrapper: HTMLElement | undefined = $state();
	let isDebugLogging = $state(false);

	// Canvas adaptive sizing
	let canvasSize = $state({ width: 400, height: 400 });
	let containerSize = $state({ width: 0, height: 0 });

	// Settings state
	let settings = $state({
		hapticFeedback: true,
		visualEffectsIntensity: 'medium' as 'low' | 'medium' | 'high',
		perspectiveEffects: true,
		gyroscopeSensitivity: 1.0
	});

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
		scoringState = $scoringSelectors;
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
			console.log('🔄 [GAME] Gyroscope supported, attempting to start...');

			const throttledGravityUpdate = throttle((gravity) => {
				assetGuardianStore.updateGravityFromGyroscope(gravity);
			}, 16);

			gyroscopeManager.onGyroscopeChanged((data) => {
				assetGuardianStore.updateGyroscope(data);
				const gravity = gyroscopeManager.convertToGravity(data);
				throttledGravityUpdate(gravity);
			});

			gyroscopeManager.onGyroscopeStarted(() => {
				console.log('🔄 [GAME] Gyroscope started successfully');
				gyroscopeStatus = 'active';
				assetGuardianStore.enableGyroscope();
			});

			gyroscopeManager.onGyroscopeFailed((error) => {
				console.warn('🔄 [GAME] Gyroscope failed, falling back to touch:', error);
				setupFallbackInput();
			});

			const started = await gyroscopeManager.start();
			if (!started) {
				console.warn('🔄 [GAME] Failed to start gyroscope, using fallback');
				setupFallbackInput();
			}
		} else {
			console.log('🔄 [GAME] Gyroscope not supported, using fallback input');
			setupFallbackInput();
		}
	}

	function setupFallbackInput() {
		gyroscopeStatus = 'fallback';

		if (gameCanvas) {
			assetGuardianStore.setupFallbackInput(gameCanvas, fallbackInputManager);

			const throttledGravityUpdate = throttle((gravity) => {
				assetGuardianStore.updateGravityFromGyroscope(gravity);
			}, 16);

			fallbackInputManager.onInputChanged(throttledGravityUpdate);

			console.log('🔄 [GAME] Fallback input system activated');
		}
	}

	async function initializeGameEngine() {
		if (!gameCanvas) {
			console.warn('🎮 [GAME] Canvas not ready for game engine initialization');
			return;
		}

		try {
			console.log('🎮 [GAME] Initializing game engine...');

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
			console.log('🎮 [GAME] Game engine initialized successfully');
		} catch (error) {
			console.error('🎮 [GAME] Failed to initialize game engine:', error);
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

	function handleShowSettings() {
		showSettingsModal = true;
	}

	function handleCloseSettings() {
		showSettingsModal = false;
	}

	function handleToggleSetting(setting: keyof typeof settings) {
		if (setting === 'visualEffectsIntensity') {
			const intensityMap = { low: 'medium', medium: 'high', high: 'low' } as const;
			settings.visualEffectsIntensity = intensityMap[settings.visualEffectsIntensity];
		} else if (typeof settings[setting] === 'boolean') {
			(settings[setting] as boolean) = !(settings[setting] as boolean);
		}
	}

	function handleGyroscopeSensitivityChange(delta: number) {
		settings.gyroscopeSensitivity = Math.max(0.5, Math.min(2.0, settings.gyroscopeSensitivity + delta));
		if (gyroscopeManager && gyroscopeManager.isActive) {
			gyroscopeManager.setSensitivity?.(settings.gyroscopeSensitivity);
		}
	}

	function handleStartGame() {
		if (!gameEngine || !gameEngineReady) {
			console.warn('Game engine not ready');
			return;
		}

		showInstructions = false;
		assetGuardianStore.startGameEngines(gameEngine);
	}

	function handlePauseGame() {
		if (!gameEngine) return;
		assetGuardianStore.stopGameEngines(gameEngine);
	}

	function handleResumeGame() {
		if (!gameEngine) return;
		assetGuardianStore.startGameEngines(gameEngine);
	}

	function handleRestartGame() {
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
			currentLevelId = currentLevelId - 1;
			const level = loadCurrentLevel();
			assetGuardianStore.reset();
			assetGuardianStore.initialize(level);
			if (gameEngine) {
				assetGuardianStore.loadGameLevel(gameEngine, level);
			}
		}
	}

	async function handleCalibrateGyroscope() {
		if (!gyroscopeManager || !gyroscopeManager.isSupported || !gyroscopeManager.isActive) {
			console.warn('🔄 [GAME] Cannot calibrate: gyroscope not available');
			return;
		}

		calibrationInProgress = true;
		try {
			const calibrationData = await gyroscopeManager.calibrate();
			if (calibrationData) {
				assetGuardianStore.calibrateGyroscope(calibrationData);
				console.log('🔄 [GAME] Calibration completed successfully');
			}
		} catch (error) {
			console.error('🔄 [GAME] Calibration failed:', error);
		} finally {
			calibrationInProgress = false;
		}
	}

	function handleStartDebugLogging() {
		if (!gyroscopeManager || !gyroscopeManager.isSupported || !gyroscopeManager.isActive) {
			console.warn('🔄 [GAME] Cannot start debug logging: gyroscope not available');
			return;
		}

		gyroscopeManager.startDebugLogging();
		isDebugLogging = true;
		console.log('🔥 [GAME] Debug logging started. Rotate your phone to record gyroscope data.');
	}

	function handleStopDebugLogging() {
		if (!gyroscopeManager) {
			console.warn('🔄 [GAME] Cannot stop debug logging: gyroscope manager not available');
			return;
		}

		const debugLogs = gyroscopeManager.stopDebugLogging();
		isDebugLogging = false;
		console.log(`🛑 [GAME] Debug logging stopped. Collected ${debugLogs.length} samples.`);
		console.log('📊 [GAME] Use these data to calibrate gyroscope ranges and sensitivity.');
	}

	function handleShowStats() {
		showStatsModal = true;
	}

	function handleCloseStats() {
		showStatsModal = false;
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
		onexit?.();
	}

	function formatTime(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}
</script>

<GameLayout gameName="Хранитель Активов" background="gradient-electric" showScore={true}>
	<div class="asset-guardian-container">
		<!-- Game Header -->
		<div class="game-header p-2">
			<div class="stats-bar glass-effect rounded-2xl p-3 text-gpb-gray-900 mb-2">
				<div class="flex justify-between items-center">
					<div class="stat-item">
						<Trophy size={16} class="text-gpb-gold" />
						<div class="stat-content">
							<div class="stat-value">
								<Counter value={selectors.currentScore} target={selectors.currentScore} duration={500} animated={true} />
							</div>
							<div class="stat-label">Очки</div>
						</div>
					</div>

					<div class="stat-item">
						<Shield size={16} class="text-gpb-emerald" />
						<div class="stat-content">
							<div class="stat-value">{selectors.livesRemaining}</div>
							<div class="stat-label">Жизни</div>
						</div>
					</div>

					<div class="stat-item">
						<Clock size={16} class="text-gpb-blue" />
						<div class="stat-content">
							<div class="stat-value">{formatTime(selectors.timeRemaining)}</div>
							<div class="stat-label">Время</div>
						</div>
					</div>

					<div class="stat-item">
						<Zap
							size={16}
							class={gyroscopeStatus === 'active' ? 'text-gpb-emerald' :
								   gyroscopeStatus === 'fallback' ? 'text-gpb-amber' :
								   'text-gpb-gray-400'}
						/>
						<div class="stat-content">
							<div class="stat-value text-xs">
								{gyroscopeStatus === 'active' ? (isDebugLogging ? '📝 ЛОГ' : 'ГИРО') :
								 gyroscopeStatus === 'fallback' ? 'TOUCH' :
								 gyroscopeStatus === 'initializing' ? '...' : 'OFF'}
							</div>
							<div class="stat-label">Управление</div>
						</div>
					</div>
				</div>

				<!-- Progress Bars -->
				<div class="progress-bars-container mt-2">
					<!-- Score Progress -->
					<div class="progress-bar-item">
						<div class="progress-bar-label">
							<span class="text-xs text-gpb-gray-600">Счет к цели</span>
							<span class="text-xs text-gpb-gray-500">
								{selectors.currentScore}/{gameState.currentLevel?.targetScore || 0}
							</span>
						</div>
						<div class="progress-bar score-progress">
							<div
								class="progress-fill score-fill"
								style="width: {Math.min(100, (selectors.currentScore / (gameState.currentLevel?.targetScore || 1)) * 100)}%"
							></div>
						</div>
					</div>

					<!-- Time Progress -->
					<div class="progress-bar-item">
						<div class="progress-bar-label">
							<span class="text-xs text-gpb-gray-600">Время</span>
							<span class="text-xs text-gpb-gray-500">
								{formatTime(selectors.timeRemaining)}
							</span>
						</div>
						<div class="progress-bar time-progress">
							<div
								class="progress-fill time-fill"
								style="width: {Math.min(100, (selectors.timeRemaining / (gameState.currentLevel?.timeLimit || 1)) * 100)}%"
							></div>
						</div>
					</div>

					<!-- Level Progress -->
					<div class="progress-bar-item">
						<div class="progress-bar-label">
							<span class="text-xs text-gpb-gray-600">Прогресс уровней</span>
							<span class="text-xs text-gpb-gray-500">
								{currentLevelId}/{getTotalLevels()}
							</span>
						</div>
						<div class="progress-bar level-progress">
							<div
								class="progress-fill level-fill"
								style="width: {(currentLevelId / getTotalLevels()) * 100}%"
							></div>
						</div>
					</div>
				</div>
			</div>

			<!-- Level Info -->
			<div class="level-info glass-effect rounded-2xl p-3 text-gpb-gray-900 mb-2">
				<h3 class="font-card-title mb-1 flex items-center gap-2">
					<Zap size={16} class="text-gpb-mint" />
					Уровень {selectors.currentLevel}: {gameState.currentLevel?.name}
				</h3>
				<p class="text-sm text-gpb-gray-600 mb-2">
					{gameState.currentLevel?.bankingTheme.lesson}
				</p>
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-4 text-xs text-gpb-gray-500">
						<span>Сложность: {gameState.currentLevel?.difficulty}</span>
						<span>Цель: {gameState.currentLevel?.targetScore} очков</span>
					</div>
					<div class="flex items-center gap-2">
						<Button
							variant="secondary"
							size="sm"
							disabled={currentLevelId <= 1}
							onclick={handlePrevLevel}
							class="px-2 py-1 text-xs"
						>
							← Назад
						</Button>
						<div class="text-xs text-gpb-gray-500 px-2">
							{currentLevelId}/{getTotalLevels()}
						</div>
						<Button
							variant="secondary"
							size="sm"
							disabled={isLastLevel(currentLevelId)}
							onclick={handleNextLevel}
							class="px-2 py-1 text-xs"
						>
							Вперед →
						</Button>
					</div>
				</div>
				<div class="flex gap-2">
					{#if gyroscopeStatus === 'active'}
						<Button
							size="sm"
							variant="accent"
							onclick={handleCalibrateGyroscope}
							disabled={calibrationInProgress}
							class="text-xs px-2 py-1"
						>
							{calibrationInProgress ? 'Калибровка...' : 'Калибровка'}
						</Button>
					{/if}
					<Button
						size="sm"
						variant="secondary"
						onclick={handleShowStats}
						class="text-xs"
					>
						<BarChart3 size={12} class="mr-1" />
						Статистика
					</Button>
					<Button
						size="sm"
						variant="secondary"
						onclick={handleShowSettings}
						class="text-xs"
					>
						<Settings size={12} class="mr-1" />
						Настройки
					</Button>
				</div>
			</div>
		</div>

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

		<!-- Game Controls -->
		<div class="game-controls p-4">
			{#if selectors.isPlaying}
				<div class="flex gap-3 justify-center mb-4">
					<Button
						variant="secondary"
						size="md"
						onclick={handlePauseGame}
						class="btn-game-secondary"
					>
						<Pause size={18} class="mr-2" />
						Пауза
					</Button>
					<Button
						variant="secondary"
						size="md"
						onclick={handleExit}
						class="btn-game-secondary"
					>
						Выйти
					</Button>
				</div>
			{/if}

		</div>

		<!-- Full-screen Modal UI -->
		<AssetGuardianModal
			showInstructions={showInstructions}
			showStatsModal={showStatsModal}
			showSettingsModal={showSettingsModal}
			selectors={selectors}
			gameState={gameState}
			scoringState={scoringState}
			currentLevelId={currentLevelId}
			settings={settings}
			gyroscopeStatus={gyroscopeStatus}
			calibrationInProgress={calibrationInProgress}
			isDebugLogging={isDebugLogging}
			onStartGame={handleStartGame}
			onResumeGame={handleResumeGame}
			onPauseGame={handlePauseGame}
			onRestartGame={handleRestartGame}
			onExit={handleExit}
			onShowStats={handleShowStats}
			onCloseStats={handleCloseStats}
			onShowSettings={handleShowSettings}
			onCloseSettings={handleCloseSettings}
			onToggleSetting={handleToggleSetting}
			onGyroscopeSensitivityChange={handleGyroscopeSensitivityChange}
			onCalibrateGyroscope={handleCalibrateGyroscope}
			onStartDebugLogging={handleStartDebugLogging}
			onStopDebugLogging={handleStopDebugLogging}
			onActivateBonus={handleActivateBonus}
			formatTime={formatTime}
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

	.game-header {
		flex-shrink: 0;
	}

	.stats-bar {
		backdrop-filter: blur(8px);
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.level-info {
		backdrop-filter: blur(8px);
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.stat-item {
		display: flex;
		align-items: center;
		gap: 0.375rem;
	}

	.stat-content {
		text-align: left;
	}

	.stat-value {
		font-size: 1rem;
		font-weight: 700;
		color: var(--color-gpb-gray-900);
		line-height: 1;
		margin-bottom: 0.125rem;
	}

	.stat-label {
		font-size: 0.75rem;
		color: var(--color-gpb-gray-600);
		text-transform: uppercase;
		letter-spacing: 0.05em;
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

	.game-controls {
		flex-shrink: 0;
	}


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

	/* Progress Bars Styles */
	.progress-bars-container {
		display: grid;
		grid-template-columns: 1fr;
		gap: 0.5rem;
	}

	.progress-bar-item {
		flex: 1;
	}

	.progress-bar-label {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.25rem;
	}

	.progress-bar {
		height: 6px;
		background: rgba(255, 255, 255, 0.2);
		border-radius: 3px;
		overflow: hidden;
		backdrop-filter: blur(4px);
		position: relative;
	}

	.progress-fill {
		height: 100%;
		transition: width 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
		border-radius: 3px;
		position: relative;
	}

	.score-fill {
		background: linear-gradient(90deg, var(--color-accent-500) 0%, var(--color-accent-400) 100%);
		box-shadow: 0 0 8px rgba(26, 188, 156, 0.4);
	}

	.time-fill {
		background: linear-gradient(90deg, var(--color-state-success) 0%, var(--color-state-warning) 50%, var(--color-state-danger) 100%);
		transition: background 0.3s ease, width 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
	}

	.time-fill[style*="width: 5"] {
		background: linear-gradient(90deg, var(--color-state-danger) 0%, var(--color-state-danger) 100%);
		box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);
		animation: time-warning 1s ease-in-out infinite alternate;
	}

	.time-fill[style*="width: 2"] {
		background: linear-gradient(90deg, var(--color-state-warning) 0%, var(--color-state-danger) 100%);
		box-shadow: 0 0 8px rgba(245, 158, 11, 0.6);
	}

	.level-fill {
		background: linear-gradient(90deg, var(--color-brand-600) 0%, var(--color-brand-400) 100%);
		box-shadow: 0 0 8px rgba(0, 107, 165, 0.4);
	}

	@keyframes time-warning {
		0% {
			box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);
		}
		100% {
			box-shadow: 0 0 16px rgba(239, 68, 68, 0.9);
		}
	}

	@media (min-width: 400px) {
		.progress-bars-container {
			grid-template-columns: repeat(3, 1fr);
		}
	}

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
		.game-header {
			padding: 0.375rem;
		}

		.stats-bar {
			padding: 0.5rem;
			margin-bottom: 0.375rem;
		}

		.level-info {
			padding: 0.5rem;
			margin-bottom: 0.375rem;
		}

		.progress-bars-container {
			margin-top: 0.375rem;
			gap: 0.375rem;
		}

		.progress-bar-label {
			margin-bottom: 0.125rem;
		}

		.stat-item {
			gap: 0.25rem;
		}

		.stat-value {
			font-size: 0.875rem;
			margin-bottom: 0.0625rem;
		}

		.stat-label {
			font-size: 0.625rem;
		}
	}
</style>