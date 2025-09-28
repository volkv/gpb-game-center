<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Shield, Clock, Trophy, Zap, Play, Pause, RotateCcw, Settings } from 'lucide-svelte';
	import { Button, Counter, Badge, GameLayout } from '$lib';
	import { assetGuardianStore, assetGuardianSelectors } from './gameState';
	import { GAME_CONFIG, BALL_CONFIG, BANKING_PRODUCTS } from './constants';
	import type { LevelConfig } from './types';
	import { createGyroscopeManager, createFallbackInputManager, throttle } from './gyroscope';
	import type { GyroscopeManager, FallbackInputManager } from './gyroscope';

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
	let calibrationInProgress = $state(false);
	let gyroscopeStatus = $state('checking');

	$effect(() => {
		gameState = $assetGuardianStore;
		selectors = $assetGuardianSelectors;
	});

	$effect(() => {
		if (gameCanvas && gyroscopeStatus === 'fallback' && fallbackInputManager && !fallbackInputManager.isActive) {
			setupFallbackInput();
		}
	});

	const mockLevel: LevelConfig = {
		id: 1,
		name: 'Первые Шаги',
		difficulty: 'easy',
		grid: [
			['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
			['wall', 'start', 'empty', 'empty', 'cashback', 'empty', 'empty', 'empty', 'empty', 'wall'],
			['wall', 'empty', 'wall', 'empty', 'empty', 'empty', 'wall', 'deposit', 'empty', 'wall'],
			['wall', 'empty', 'empty', 'empty', 'trap_phishing', 'empty', 'empty', 'empty', 'empty', 'wall'],
			['wall', 'cashback', 'empty', 'wall', 'empty', 'empty', 'wall', 'empty', 'deposit', 'wall'],
			['wall', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'wall'],
			['wall', 'empty', 'trap_fraud', 'empty', 'empty', 'wall', 'empty', 'empty', 'empty', 'wall'],
			['wall', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'cashback', 'empty', 'wall'],
			['wall', 'empty', 'empty', 'deposit', 'empty', 'empty', 'empty', 'empty', 'finish', 'wall'],
			['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall']
		],
		timeLimit: 120,
		targetScore: 500,
		startPosition: { row: 1, col: 1 },
		finishPosition: { row: 8, col: 8 },
		bankingTheme: {
			product: 'Защита от мошенничества',
			lesson: 'Избегайте подозрительных ссылок и сохраняйте свои активы'
		}
	};

	onMount(async () => {
		mounted = true;
		assetGuardianStore.initialize(mockLevel);

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

	onDestroy(() => {
		if (gyroscopeManager) {
			gyroscopeManager.cleanup();
		}
		if (fallbackInputManager) {
			fallbackInputManager.cleanup();
		}
		assetGuardianStore.reset();
	});

	function handleStartGame() {
		showInstructions = false;
		assetGuardianStore.startGame();
	}

	function handlePauseGame() {
		assetGuardianStore.pauseGame();
	}

	function handleResumeGame() {
		assetGuardianStore.resumeGame();
	}

	function handleRestartGame() {
		assetGuardianStore.reset();
		assetGuardianStore.initialize(mockLevel);
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

	function handleExit() {
		onexit?.();
	}

	function formatTime(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}
</script>

<GameLayout gameName="Хранитель Активов" background="gradient-brand-hero" showScore={true}>
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
				</div>
			</div>
		</div>

		<!-- Game Canvas Area -->
		<div class="game-canvas-wrapper">
			<div class="game-canvas-container">
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
								{#each Object.values(BANKING_PRODUCTS) as product}
									<div class="product-card glass-effect rounded-xl p-3 mb-2">
										<div class="flex items-center gap-3">
											<span class="text-2xl">{product.icon}</span>
											<div>
												<h4 class="font-semibold text-white text-sm">{product.name}</h4>
												<p class="text-white/70 text-xs">Игровой бонус: {product.gameBonus.type}</p>
											</div>
										</div>
									</div>
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

			<div class="development-info glass-effect rounded-xl p-4 text-center text-gpb-gray-700">
				<p class="text-sm mb-2">
					<strong>Итерация 2:</strong> Базовые компоненты и типизация ✅
				</p>
				<div class="text-xs text-gpb-gray-600">
					Создана архитектура игры: types.ts, constants.ts, gameState.ts, основной компонент
				</div>
			</div>
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
	}

	.game-canvas-container {
		position: relative;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 1rem;
		padding: 1rem;
		backdrop-filter: blur(8px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
	}

	.game-canvas {
		display: block;
		border-radius: 0.5rem;
		background: linear-gradient(135deg, #2C3E50 0%, #34495E 100%);
		box-shadow: inset 0 4px 12px rgba(0, 0, 0, 0.3);
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
	}
</style>