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

	// Settings state
	let settings = $state({
		hapticFeedback: true,
		visualEffectsIntensity: 'medium' as 'low' | 'medium' | 'high',
		perspectiveEffects: true,
		gyroscopeSensitivity: 1.0
	});

	$effect(() => {
		gameState = $assetGuardianStore;
		selectors = $assetGuardianSelectors;
		scoringState = $scoringSelectors;
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
				width: GAME_CONFIG.WORLD_WIDTH,
				height: GAME_CONFIG.WORLD_HEIGHT,
				backgroundColor: 0x2C3E50,
				antialias: true,
				resolution: globalThis.window?.devicePixelRatio || 1
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
		<div class="game-header p-4">
			<div class="stats-bar glass-effect rounded-2xl p-4 text-gpb-gray-900 mb-4">
				<div class="flex justify-between items-center">
					<div class="stat-item">
						<Trophy size={20} class="text-gpb-gold" />
						<div class="stat-content">
							<div class="stat-value">
								<Counter value={selectors.currentScore} target={selectors.currentScore} duration={500} animated={true} />
							</div>
							<div class="stat-label">Очки</div>
						</div>
					</div>

					<div class="stat-item">
						<Shield size={20} class="text-gpb-emerald" />
						<div class="stat-content">
							<div class="stat-value">{selectors.livesRemaining}</div>
							<div class="stat-label">Жизни</div>
						</div>
					</div>

					<div class="stat-item">
						<Clock size={20} class="text-gpb-blue" />
						<div class="stat-content">
							<div class="stat-value">{formatTime(selectors.timeRemaining)}</div>
							<div class="stat-label">Время</div>
						</div>
					</div>

					<div class="stat-item">
						<Zap
							size={20}
							class={gyroscopeStatus === 'active' ? 'text-gpb-emerald' :
								   gyroscopeStatus === 'fallback' ? 'text-gpb-amber' :
								   'text-gpb-gray-400'}
						/>
						<div class="stat-content">
							<div class="stat-value text-xs">
								{gyroscopeStatus === 'active' ? 'ГИРО' :
								 gyroscopeStatus === 'fallback' ? 'TOUCH' :
								 gyroscopeStatus === 'initializing' ? '...' : 'OFF'}
							</div>
							<div class="stat-label">Управление</div>
						</div>
					</div>
				</div>

				<!-- Progress Bars -->
				<div class="progress-bars-container mt-4">
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
			<div class="level-info glass-effect rounded-2xl p-4 text-gpb-gray-900 mb-4">
				<h3 class="font-card-title mb-2 flex items-center gap-2">
					<Zap size={20} class="text-gpb-mint" />
					Уровень {selectors.currentLevel}: {gameState.currentLevel?.name}
				</h3>
				<p class="text-sm text-gpb-gray-600 mb-3">
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
							class="text-xs"
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
						<BarChart3 size={14} class="mr-1" />
						Статистика
					</Button>
					<Button
						size="sm"
						variant="secondary"
						onclick={handleShowSettings}
						class="text-xs"
					>
						<Settings size={14} class="mr-1" />
						Настройки
					</Button>
				</div>
			</div>
		</div>

		<!-- Game Canvas Area -->
		<div class="game-canvas-wrapper perspective-active" bind:this={gameCanvasWrapper}>
			<div class="game-canvas-container bank-vault-glow">
				<canvas
					bind:this={gameCanvas}
					class="game-canvas"
					width={GAME_CONFIG.WORLD_WIDTH}
					height={GAME_CONFIG.WORLD_HEIGHT}
					style="touch-action: none; user-select: none;"
				></canvas>

				<!-- Game State Overlays -->
				{#if showInstructions || selectors.isReady}
					<div class="game-overlay instructions-overlay">
						<div class="overlay-content">
							<h2 class="text-2xl font-bold text-white mb-4">🛡️ Хранитель Активов</h2>
							<p class="text-white/90 mb-6 text-center">
								Наклоняйте телефон, чтобы провести шарик от старта к банковскому сейфу
							</p>
							<div class="instruction-list mb-6">
								<div class="instruction-item">
									<span class="instruction-icon">🟢</span>
									<span>Собирайте бонусы: Кэшбэк, Проценты по вкладу</span>
								</div>
								<div class="instruction-item">
									<span class="instruction-icon">🔴</span>
									<span>Избегайте ловушек: Мошенники, Фишинговые ссылки</span>
								</div>
								<div class="instruction-item">
									<span class="instruction-icon">🏁</span>
									<span>Доберитесь до банковского сейфа</span>
								</div>
							</div>
							<Button
								variant="primary"
								size="lg"
								onclick={handleStartGame}
								class="start-game-btn"
							>
								<Play size={20} class="mr-2" />
								Начать Игру
							</Button>
						</div>
					</div>
				{/if}

				{#if selectors.isPaused}
					<div class="game-overlay pause-overlay">
						<div class="overlay-content">
							<h2 class="text-2xl font-bold text-white mb-4">⏸️ Пауза</h2>
							<div class="pause-actions">
								<Button
									variant="primary"
									size="lg"
									onclick={handleResumeGame}
									class="mb-3"
								>
									<Play size={20} class="mr-2" />
									Продолжить
								</Button>
								<Button
									variant="secondary"
									size="md"
									onclick={handleRestartGame}
									class="mb-3"
								>
									<RotateCcw size={18} class="mr-2" />
									Начать заново
								</Button>
								<Button
									variant="secondary"
									size="md"
									onclick={handleExit}
								>
									Выйти
								</Button>
							</div>
						</div>
					</div>
				{/if}

				{#if selectors.isCompleted}
					<div class="game-overlay success-overlay">
						<div class="overlay-content">
							<h2 class="text-2xl font-bold text-white mb-4">🎉 Уровень пройден!</h2>
							<p class="text-white/90 mb-4">
								Ваш счет: <strong>{selectors.currentScore}</strong>
							</p>
							<p class="text-white/80 mb-6 text-sm">
								Изучите банковские продукты для получения бонусов!
							</p>
							<div class="banking-products mb-6">
								<p class="text-white/80 mb-4 text-sm text-center">
									Выберите банковский продукт для активации бонуса:
								</p>
								{#each Object.values(BANKING_PRODUCTS) as product}
									{@const isActive = selectors.activeBonuses.some(b => b.id === product.id)}
									<button
										class="product-card interactive-product {isActive ? 'product-active' : ''}"
										disabled={isActive}
										onclick={() => !isActive && handleActivateBonus(product.id)}
									>
										<div class="flex items-center gap-3">
											<span class="text-2xl">{product.icon}</span>
											<div class="flex-1 text-left">
												<h4 class="font-semibold text-white text-sm">{product.name}</h4>
												<p class="text-white/70 text-xs mb-1">
													{product.gameBonus.type === 'shield' ? '🛡️ Защита от ловушек' :
													 product.gameBonus.type === 'multiplier' ? '📈 Очки x2' :
													 product.gameBonus.type === 'extra_life' ? '❤️ +1 жизнь' :
													 product.gameBonus.type === 'slow_time' ? '⏰ Замедление времени' : 'Бонус'}
												</p>
												<p class="text-white/50 text-xs">
													{product.gameBonus.duration > 0 ? `${product.gameBonus.duration / 1000}с` : 'Мгновенно'}
												</p>
											</div>
											<div class="activation-status">
												{#if isActive}
													<span class="text-gpb-emerald text-xs">✅ Активен</span>
												{:else}
													<span class="text-gpb-accent text-xs">👆 Активировать</span>
												{/if}
											</div>
										</div>
									</button>
								{/each}
							</div>
							<Button
								variant="primary"
								size="lg"
								onclick={handleExit}
							>
								Завершить
							</Button>
						</div>
					</div>
				{/if}

				{#if selectors.isFailed}
					<div class="game-overlay failure-overlay">
						<div class="overlay-content">
							<h2 class="text-2xl font-bold text-white mb-4">💔 Игра окончена</h2>
							<p class="text-white/90 mb-6">
								{selectors.livesRemaining <= 0 ? 'У вас закончились жизни' : 'Время истекло'}
							</p>
							<div class="failure-actions">
								<Button
									variant="primary"
									size="lg"
									onclick={handleRestartGame}
									class="mb-3"
								>
									<RotateCcw size={20} class="mr-2" />
									Попробовать снова
								</Button>
								<Button
									variant="secondary"
									size="md"
									onclick={handleExit}
								>
									Выйти
								</Button>
							</div>
						</div>
					</div>
				{/if}

				<!-- Statistics Modal -->
				{#if showStatsModal}
					<div class="game-overlay stats-overlay">
						<div class="overlay-content max-w-md max-h-[80vh] overflow-y-auto">
							<div class="flex items-center justify-between mb-4">
								<h2 class="text-2xl font-bold text-white flex items-center gap-2">
									<BarChart3 size={24} class="text-gpb-mint" />
									Статистика
								</h2>
								<Button
									variant="secondary"
									size="sm"
									onclick={handleCloseStats}
									class="text-xs"
								>
									✕
								</Button>
							</div>

							<!-- Player Stats -->
							<div class="stats-section mb-6">
								<h3 class="text-lg font-semibold text-white mb-3 flex items-center gap-2">
									<Trophy size={18} class="text-gpb-gold" />
									Общая статистика
								</h3>
								<div class="stats-grid">
									<div class="stat-card">
										<div class="stat-value text-gpb-mint">{scoringState.playerStats.totalScore.toLocaleString()}</div>
										<div class="stat-label">Общий счет</div>
									</div>
									<div class="stat-card">
										<div class="stat-value text-gpb-gold">{scoringState.bestScore.toLocaleString()}</div>
										<div class="stat-label">Лучший результат</div>
									</div>
									<div class="stat-card">
										<div class="stat-value text-gpb-emerald">{scoringState.playerStats.levelsCompleted}</div>
										<div class="stat-label">Пройдено уровней</div>
									</div>
									<div class="stat-card">
										<div class="stat-value text-gpb-blue">{scoringState.playerStats.perfectRuns}</div>
										<div class="stat-label">Идеальные прохождения</div>
									</div>
								</div>
							</div>

							<!-- Achievements -->
							<div class="stats-section mb-6">
								<h3 class="text-lg font-semibold text-white mb-3 flex items-center gap-2">
									<Award size={18} class="text-gpb-amber" />
									Достижения ({scoringState.unlockedAchievements.length}/{Object.keys(scoringState.achievements).length})
								</h3>
								<div class="achievements-grid">
									{#each Object.values(scoringState.achievements).slice(0, 6) as achievement}
										<div class="achievement-card {achievement.isUnlocked ? 'unlocked' : 'locked'}">
											<div class="achievement-icon">{achievement.icon}</div>
											<div class="achievement-info">
												<div class="achievement-name">{achievement.name}</div>
												<div class="achievement-desc">{achievement.description}</div>
												{#if !achievement.isUnlocked}
													<div class="achievement-progress">
														{achievement.progress}/{achievement.maxProgress}
													</div>
												{/if}
											</div>
										</div>
									{/each}
								</div>
							</div>

							<!-- High Scores -->
							<div class="stats-section mb-4">
								<h3 class="text-lg font-semibold text-white mb-3 flex items-center gap-2">
									<Trophy size={18} class="text-gpb-gold" />
									Лучшие результаты
								</h3>
								<div class="high-scores-list">
									{#each scoringState.highScores.overall.slice(0, 5) as score, index}
										<div class="high-score-item">
											<div class="score-rank">{index + 1}</div>
											<div class="score-details">
												<div class="score-value">{score.score.toLocaleString()} очков</div>
												<div class="score-meta">
													Уровень {score.level} • {new Date(score.date).toLocaleDateString()}
													{#if score.perfectRun}
														<span class="perfect-badge">💎</span>
													{/if}
												</div>
											</div>
										</div>
									{/each}
									{#if scoringState.highScores.overall.length === 0}
										<div class="text-white/60 text-center py-4">
											Пока нет рекордов. Начните играть!
										</div>
									{/if}
								</div>
							</div>

							<!-- Banking Expertise -->
							<div class="stats-section">
								<h3 class="text-lg font-semibold text-white mb-3 flex items-center gap-2">
									<Shield size={18} class="text-gpb-blue" />
									Банковские знания
								</h3>
								<div class="banking-stats">
									<div class="expertise-level">
										<div class="expertise-label">Изучено продуктов</div>
										<div class="expertise-value">{scoringState.bankingExpertise}/4</div>
									</div>
									<div class="expertise-level">
										<div class="expertise-label">Эффективность</div>
										<div class="expertise-value">{scoringState.efficiency}%</div>
									</div>
									<div class="expertise-level">
										<div class="expertise-label">Лучшая серия</div>
										<div class="expertise-value">{scoringState.bestStreak} уровней</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				{/if}

				<!-- Settings Modal -->
				{#if showSettingsModal}
					<div class="game-overlay settings-overlay">
						<div class="overlay-content max-w-md max-h-[80vh] overflow-y-auto">
							<div class="flex items-center justify-between mb-4">
								<h2 class="text-2xl font-bold text-white flex items-center gap-2">
									<Settings size={24} class="text-gpb-mint" />
									Настройки
								</h2>
								<Button
									variant="secondary"
									size="sm"
									onclick={handleCloseSettings}
									class="text-xs"
								>
									✕
								</Button>
							</div>

							<!-- Haptic Feedback -->
							<div class="settings-section mb-6">
								<h3 class="text-lg font-semibold text-white mb-3 flex items-center gap-2">
									📳 Тактильная отдача
								</h3>
								<div class="setting-item">
									<div class="setting-info">
										<div class="setting-name">Вибрация при касаниях</div>
										<div class="setting-desc">Тактильная обратная связь через Telegram</div>
									</div>
									<Button
										variant={settings.hapticFeedback ? "primary" : "secondary"}
										size="sm"
										onclick={() => handleToggleSetting('hapticFeedback')}
									>
										{settings.hapticFeedback ? 'Вкл' : 'Выкл'}
									</Button>
								</div>
							</div>

							<!-- Visual Effects -->
							<div class="settings-section mb-6">
								<h3 class="text-lg font-semibold text-white mb-3 flex items-center gap-2">
									✨ Визуальные эффекты
								</h3>
								<div class="setting-item">
									<div class="setting-info">
										<div class="setting-name">Интенсивность эффектов</div>
										<div class="setting-desc">Низкая/Средняя/Высокая</div>
									</div>
									<Button
										variant="accent"
										size="sm"
										onclick={() => handleToggleSetting('visualEffectsIntensity')}
									>
										{settings.visualEffectsIntensity === 'low' ? 'Низкая' :
										 settings.visualEffectsIntensity === 'medium' ? 'Средняя' : 'Высокая'}
									</Button>
								</div>
								<div class="setting-item">
									<div class="setting-info">
										<div class="setting-name">3D перспектива</div>
										<div class="setting-desc">Эффект наклона игрового поля</div>
									</div>
									<Button
										variant={settings.perspectiveEffects ? "primary" : "secondary"}
										size="sm"
										onclick={() => handleToggleSetting('perspectiveEffects')}
									>
										{settings.perspectiveEffects ? 'Вкл' : 'Выкл'}
									</Button>
								</div>
							</div>

							<!-- Gyroscope Settings -->
							<div class="settings-section mb-4">
								<h3 class="text-lg font-semibold text-white mb-3 flex items-center gap-2">
									🔄 Гироскоп
								</h3>
								<div class="setting-item">
									<div class="setting-info">
										<div class="setting-name">Чувствительность</div>
										<div class="setting-desc">Сила реакции на наклоны ({settings.gyroscopeSensitivity.toFixed(1)}x)</div>
									</div>
									<div class="flex gap-2">
										<Button
											variant="secondary"
											size="sm"
											onclick={() => handleGyroscopeSensitivityChange(-0.1)}
											disabled={settings.gyroscopeSensitivity <= 0.5}
										>
											−
										</Button>
										<Button
											variant="secondary"
											size="sm"
											onclick={() => handleGyroscopeSensitivityChange(0.1)}
											disabled={settings.gyroscopeSensitivity >= 2.0}
										>
											+
										</Button>
									</div>
								</div>
								{#if gyroscopeStatus === 'active'}
									<div class="setting-item">
										<div class="setting-info">
											<div class="setting-name">Калибровка</div>
											<div class="setting-desc">Перенастроить нулевое положение</div>
										</div>
										<Button
											variant="accent"
											size="sm"
											onclick={handleCalibrateGyroscope}
											disabled={calibrationInProgress}
										>
											{calibrationInProgress ? 'Калибровка...' : 'Калибровать'}
										</Button>
									</div>
								{/if}
							</div>
						</div>
					</div>
				{/if}
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
		gap: 0.5rem;
	}

	.stat-content {
		text-align: left;
	}

	.stat-value {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-gpb-gray-900);
		line-height: 1;
		margin-bottom: 0.25rem;
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
	}

	.game-canvas-container {
		position: relative;
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

	.game-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.8);
		backdrop-filter: blur(4px);
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 1rem;
		z-index: 10;
	}

	.overlay-content {
		text-align: center;
		max-width: 320px;
		padding: 2rem;
	}

	.instruction-list {
		text-align: left;
		space-y: 0.75rem;
	}

	.instruction-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.5rem 0;
		color: white;
		font-size: 0.875rem;
	}

	.instruction-icon {
		font-size: 1.25rem;
		flex-shrink: 0;
	}

	.pause-actions,
	.failure-actions {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.banking-products {
		max-height: 200px;
		overflow-y: auto;
	}

	.product-card {
		backdrop-filter: blur(8px);
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.interactive-product {
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(8px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 0.75rem;
		padding: 0.75rem;
		margin-bottom: 0.5rem;
		width: 100%;
		cursor: pointer;
		transition: all 0.3s ease;
		text-align: left;
	}

	.interactive-product:hover:not(:disabled) {
		background: rgba(26, 188, 156, 0.2);
		border-color: rgba(26, 188, 156, 0.4);
		transform: translateY(-2px);
		box-shadow: 0 4px 16px rgba(26, 188, 156, 0.3);
	}

	.interactive-product:active:not(:disabled) {
		transform: translateY(0);
		box-shadow: 0 2px 8px rgba(26, 188, 156, 0.4);
	}

	.product-active {
		background: rgba(34, 197, 94, 0.2);
		border-color: rgba(34, 197, 94, 0.4);
		cursor: not-allowed;
		opacity: 0.7;
	}

	.activation-status {
		display: flex;
		align-items: center;
		flex-shrink: 0;
	}

	.game-controls {
		flex-shrink: 0;
	}

	.development-info {
		backdrop-filter: blur(8px);
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.start-game-btn {
		animation: pulse-glow 2s infinite;
	}

	@keyframes pulse-glow {
		0%, 100% {
			box-shadow: 0 0 15px rgba(31, 196, 217, 0.4);
		}
		50% {
			box-shadow: 0 0 25px rgba(31, 196, 217, 0.7);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.start-game-btn {
			animation: none;
		}

		.game-canvas-container {
			transition: none;
		}

		.parallax-layer {
			transition: none !important;
		}
	}

	.parallax-layer {
		position: absolute;
		top: -10%;
		left: -10%;
		width: 120%;
		height: 120%;
		pointer-events: none;
		border-radius: 1rem;
		transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
	}

	.parallax-layer-0 {
		background: radial-gradient(ellipse at center,
			rgba(15, 169, 194, 0.08) 0%,
			rgba(0, 107, 165, 0.05) 50%,
			transparent 100%);
		z-index: -3;
	}

	.parallax-layer-1 {
		background: radial-gradient(ellipse at 60% 40%,
			rgba(26, 188, 156, 0.06) 0%,
			rgba(52, 152, 219, 0.04) 40%,
			transparent 80%);
		z-index: -2;
	}

	.parallax-layer-2 {
		background: radial-gradient(ellipse at 40% 60%,
			rgba(243, 156, 18, 0.04) 0%,
			rgba(230, 126, 34, 0.02) 30%,
			transparent 70%);
		z-index: -1;
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

	/* Statistics Modal Styles */
	.stats-overlay .overlay-content {
		background: rgba(44, 62, 80, 0.95);
		backdrop-filter: blur(12px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 1rem;
		padding: 1.5rem;
		text-align: left;
	}

	.stats-section {
		margin-bottom: 1.5rem;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.75rem;
	}

	.stat-card {
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(8px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 0.75rem;
		padding: 1rem;
		text-align: center;
	}

	.stat-card .stat-value {
		font-size: 1.5rem;
		font-weight: 700;
		line-height: 1;
		margin-bottom: 0.25rem;
	}

	.stat-card .stat-label {
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.7);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.achievements-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 0.5rem;
	}

	.achievement-card {
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(8px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 0.5rem;
		padding: 0.75rem;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		transition: all 0.2s ease;
	}

	.achievement-card.unlocked {
		background: rgba(26, 188, 156, 0.2);
		border-color: rgba(26, 188, 156, 0.4);
	}

	.achievement-card.locked {
		opacity: 0.6;
	}

	.achievement-icon {
		font-size: 1.5rem;
		flex-shrink: 0;
	}

	.achievement-info {
		flex: 1;
		min-width: 0;
	}

	.achievement-name {
		font-weight: 600;
		color: white;
		font-size: 0.875rem;
		margin-bottom: 0.25rem;
	}

	.achievement-desc {
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.7);
		line-height: 1.2;
	}

	.achievement-progress {
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.6);
		margin-top: 0.25rem;
	}

	.high-scores-list {
		space-y: 0.5rem;
	}

	.high-score-item {
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(8px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 0.5rem;
		padding: 0.75rem;
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.score-rank {
		background: rgba(243, 156, 18, 0.3);
		color: white;
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		font-size: 0.875rem;
		flex-shrink: 0;
	}

	.score-details {
		flex: 1;
	}

	.score-value {
		font-weight: 600;
		color: white;
		font-size: 0.875rem;
	}

	.score-meta {
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.7);
		margin-top: 0.25rem;
	}

	.perfect-badge {
		margin-left: 0.5rem;
	}

	.banking-stats {
		display: grid;
		grid-template-columns: 1fr;
		gap: 0.75rem;
	}

	.expertise-level {
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(8px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 0.5rem;
		padding: 0.75rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.expertise-label {
		font-size: 0.875rem;
		color: rgba(255, 255, 255, 0.8);
	}

	.expertise-value {
		font-weight: 700;
		color: white;
		font-size: 0.875rem;
	}

	/* Settings Modal Styles */
	.settings-overlay .overlay-content {
		background: rgba(44, 62, 80, 0.95);
		backdrop-filter: blur(12px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 1rem;
		padding: 1.5rem;
		text-align: left;
	}

	.settings-section {
		margin-bottom: 1.5rem;
	}

	.setting-item {
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(8px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 0.75rem;
		padding: 1rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.75rem;
		transition: all 0.2s ease;
	}

	.setting-item:hover {
		background: rgba(255, 255, 255, 0.15);
		border-color: rgba(26, 188, 156, 0.3);
	}

	.setting-info {
		flex: 1;
		margin-right: 1rem;
	}

	.setting-name {
		font-weight: 600;
		color: white;
		font-size: 0.875rem;
		margin-bottom: 0.25rem;
	}

	.setting-desc {
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.7);
		line-height: 1.2;
	}

	/* Progress Bars Styles */
	.progress-bars-container {
		display: grid;
		grid-template-columns: 1fr;
		gap: 0.75rem;
	}

	.progress-bar-item {
		flex: 1;
	}

	.progress-bar-label {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.375rem;
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
</style>