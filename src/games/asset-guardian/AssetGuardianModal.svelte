<script lang="ts">
	import { Play, Pause, RotateCcw, BarChart3, Settings, Trophy, Shield, Award, X } from 'lucide-svelte';
	import { Modal, Button } from '$lib';
	import { BANKING_PRODUCTS } from './constants';
	import type { AssetGuardianGameState } from './types';

	interface Props {
		showInstructions?: boolean;
		showStatsModal?: boolean;
		showSettingsModal?: boolean;
		selectors: any;
		gameState: any;
		scoringState: any;
		currentLevelId: number;
		settings: {
			hapticFeedback: boolean;
			visualEffectsIntensity: 'low' | 'medium' | 'high';
			perspectiveEffects: boolean;
			gyroscopeSensitivity: number;
		};
		gyroscopeStatus: string;
		calibrationInProgress?: boolean;
		isDebugLogging?: boolean;
		onStartGame?: () => void;
		onResumeGame?: () => void;
		onPauseGame?: () => void;
		onRestartGame?: () => void;
		onExit?: () => void;
		onShowStats?: () => void;
		onCloseStats?: () => void;
		onShowSettings?: () => void;
		onCloseSettings?: () => void;
		onToggleSetting?: (setting: string) => void;
		onGyroscopeSensitivityChange?: (delta: number) => void;
		onCalibrateGyroscope?: () => void;
		onStartDebugLogging?: () => void;
		onStopDebugLogging?: () => void;
		onActivateBonus?: (productId: string) => void;
		formatTime?: (seconds: number) => string;
	}

	let {
		showInstructions = false,
		showStatsModal = false,
		showSettingsModal = false,
		selectors,
		gameState,
		scoringState,
		currentLevelId,
		settings,
		gyroscopeStatus,
		calibrationInProgress = false,
		isDebugLogging = false,
		onStartGame,
		onResumeGame,
		onPauseGame,
		onRestartGame,
		onExit,
		onShowStats,
		onCloseStats,
		onShowSettings,
		onCloseSettings,
		onToggleSetting,
		onGyroscopeSensitivityChange,
		onCalibrateGyroscope,
		onStartDebugLogging,
		onStopDebugLogging,
		onActivateBonus,
		formatTime = (seconds) => {
			const mins = Math.floor(seconds / 60);
			const secs = seconds % 60;
			return `${mins}:${secs.toString().padStart(2, '0')}`;
		}
	}: Props = $props();

	// Determine which modal content to show
	let modalOpen = $derived(
		showInstructions || selectors?.isReady || selectors?.isPaused ||
		selectors?.isCompleted || selectors?.isFailed || showStatsModal || showSettingsModal
	);

	let modalType = $derived.by(() => {
		if (showStatsModal) return 'stats';
		if (showSettingsModal) return 'settings';
		if (selectors?.isCompleted) return 'success';
		if (selectors?.isFailed) return 'failure';
		if (selectors?.isPaused) return 'pause';
		if (showInstructions || selectors?.isReady) return 'instructions';
		return null;
	});

	// Debug logging
	$effect(() => {
		console.log('Modal state:', {
			modalOpen,
			modalType,
			showInstructions,
			showStatsModal,
			showSettingsModal,
			selectors: {
				isReady: selectors?.isReady,
				isPaused: selectors?.isPaused,
				isCompleted: selectors?.isCompleted,
				isFailed: selectors?.isFailed
			}
		});
	});

	function handleModalClose() {
		if (showStatsModal) {
			onCloseStats?.();
		} else if (showSettingsModal) {
			onCloseSettings?.();
		}
		// Don't close game state modals automatically
	}
</script>

<Modal
	open={modalOpen}
	size="lg"
	closeOnBackdrop={modalType === 'stats' || modalType === 'settings'}
	closeOnEscape={modalType === 'stats' || modalType === 'settings'}
	showClose={modalType === 'stats' || modalType === 'settings'}
	onClose={handleModalClose}
	class="asset-guardian-modal"
>
	{#snippet children()}

		<!-- Instructions Modal -->
		{#if modalType === 'instructions'}
			<div class="modal-content-wrapper instructions-modal">
				<h2 class="modal-title">🛡️ Хранитель Активов</h2>
				<p class="modal-description">
					Наклоняйте телефон, чтобы провести шарик от старта к банковскому сейфу
				</p>
				<div class="instruction-list">
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
					size="md"
					onclick={onStartGame}
					class="start-game-btn"
				>
					<Play size={16} class="mr-1" />
					Начать Игру
				</Button>
			</div>
		{/if}

		<!-- Pause Modal -->
		{#if modalType === 'pause'}
			<div class="modal-content-wrapper pause-modal">
				<h2 class="modal-title">⏸️ Пауза</h2>
				<div class="pause-actions">
					<Button
						variant="primary"
						size="md"
						onclick={onResumeGame}
					>
						<Play size={16} class="mr-2" />
						Продолжить
					</Button>
					<Button
						variant="secondary"
						size="sm"
						onclick={onRestartGame}
					>
						<RotateCcw size={16} class="mr-2" />
						Начать заново
					</Button>
					<Button
						variant="secondary"
						size="sm"
						onclick={onExit}
					>
						Выйти
					</Button>
				</div>
			</div>
		{/if}

		<!-- Success Modal -->
		{#if modalType === 'success'}
			<div class="modal-content-wrapper success-modal">
				<h2 class="modal-title">🎉 Уровень пройден!</h2>
				<p class="modal-score">
					Ваш счет: <strong>{selectors.currentScore}</strong>
				</p>
				<p class="modal-hint">
					Изучите банковские продукты для получения бонусов!
				</p>
				<div class="banking-products">
					<p class="products-title">
						Выберите банковский продукт для активации бонуса:
					</p>
					{#each Object.values(BANKING_PRODUCTS) as product}
						{@const isActive = selectors.activeBonuses.some(b => b.id === product.id)}
						<button
							class="product-card interactive-product {isActive ? 'product-active' : ''}"
							disabled={isActive}
							onclick={() => !isActive && onActivateBonus?.(product.id)}
						>
							<div class="product-content">
								<span class="product-icon">{product.icon}</span>
								<div class="product-info">
									<h4 class="product-name">{product.name}</h4>
									<p class="product-bonus">
										{product.gameBonus.type === 'shield' ? '🛡️ Защита от ловушек' :
										 product.gameBonus.type === 'multiplier' ? '📈 Очки x2' :
										 product.gameBonus.type === 'extra_life' ? '❤️ +1 жизнь' :
										 product.gameBonus.type === 'slow_time' ? '⏰ Замедление времени' : 'Бонус'}
									</p>
									<p class="product-duration">
										{product.gameBonus.duration > 0 ? `${product.gameBonus.duration / 1000}с` : 'Мгновенно'}
									</p>
								</div>
								<div class="activation-status">
									{#if isActive}
										<span class="status-active">✅ Активен</span>
									{:else}
										<span class="status-inactive">👆 Активировать</span>
									{/if}
								</div>
							</div>
						</button>
					{/each}
				</div>
				<Button
					variant="primary"
					size="md"
					onclick={onExit}
				>
					Завершить
				</Button>
			</div>
		{/if}

		<!-- Failure Modal -->
		{#if modalType === 'failure'}
			<div class="modal-content-wrapper failure-modal">
				<h2 class="modal-title">💔 Игра окончена</h2>
				<p class="modal-description">
					{selectors.livesRemaining <= 0 ? 'У вас закончились жизни' : 'Время истекло'}
				</p>
				<div class="failure-actions">
					<Button
						variant="primary"
						size="md"
						onclick={onRestartGame}
					>
						<RotateCcw size={16} class="mr-2" />
						Попробовать снова
					</Button>
					<Button
						variant="secondary"
						size="sm"
						onclick={onExit}
					>
						Выйти
					</Button>
				</div>
			</div>
		{/if}

		<!-- Statistics Modal -->
		{#if modalType === 'stats'}
			<div class="modal-content-wrapper stats-modal">
				<div class="modal-header-custom">
					<h2 class="modal-title">
						<BarChart3 size={24} style="color: #1abc9c;" />
						Статистика
					</h2>
				</div>

				<!-- Player Stats -->
				<div class="stats-section">
					<h3 class="section-title">
						<Trophy size={18} style="color: #1abc9c;" />
						Общая статистика
					</h3>
					<div class="stats-grid">
						<div class="stat-card">
							<div class="stat-value stat-mint">{scoringState.playerStats.totalScore.toLocaleString()}</div>
							<div class="stat-label">Общий счет</div>
						</div>
						<div class="stat-card">
							<div class="stat-value stat-gold">{scoringState.bestScore.toLocaleString()}</div>
							<div class="stat-label">Лучший результат</div>
						</div>
						<div class="stat-card">
							<div class="stat-value stat-emerald">{scoringState.playerStats.levelsCompleted}</div>
							<div class="stat-label">Пройдено уровней</div>
						</div>
						<div class="stat-card">
							<div class="stat-value stat-blue">{scoringState.playerStats.perfectRuns}</div>
							<div class="stat-label">Идеальные прохождения</div>
						</div>
					</div>
				</div>

				<!-- Achievements -->
				<div class="stats-section">
					<h3 class="section-title">
						<Award size={18} style="color: #1abc9c;" />
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
				<div class="stats-section">
					<h3 class="section-title">
						<Trophy size={18} style="color: #1abc9c;" />
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
							<div class="no-scores">
								Пока нет рекордов. Начните играть!
							</div>
						{/if}
					</div>
				</div>

				<!-- Banking Expertise -->
				<div class="stats-section">
					<h3 class="section-title">
						<Shield size={18} style="color: #1abc9c;" />
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
		{/if}

		<!-- Settings Modal -->
		{#if modalType === 'settings'}
			<div class="modal-content-wrapper settings-modal">
				<div class="modal-header-custom">
					<h2 class="modal-title">
						<Settings size={24} style="color: #1abc9c;" />
						Настройки
					</h2>
				</div>

				<!-- Haptic Feedback -->
				<div class="settings-section">
					<h3 class="section-title">📳 Тактильная отдача</h3>
					<div class="setting-item">
						<div class="setting-info">
							<div class="setting-name">Вибрация при касаниях</div>
							<div class="setting-desc">Тактильная обратная связь через Telegram</div>
						</div>
						<Button
							variant={settings.hapticFeedback ? "primary" : "secondary"}
							size="sm"
							onclick={() => onToggleSetting?.('hapticFeedback')}
						>
							{settings.hapticFeedback ? 'Вкл' : 'Выкл'}
						</Button>
					</div>
				</div>

				<!-- Visual Effects -->
				<div class="settings-section">
					<h3 class="section-title">✨ Визуальные эффекты</h3>
					<div class="setting-item">
						<div class="setting-info">
							<div class="setting-name">Интенсивность эффектов</div>
							<div class="setting-desc">Низкая/Средняя/Высокая</div>
						</div>
						<Button
							variant="accent"
							size="sm"
							onclick={() => onToggleSetting?.('visualEffectsIntensity')}
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
							onclick={() => onToggleSetting?.('perspectiveEffects')}
						>
							{settings.perspectiveEffects ? 'Вкл' : 'Выкл'}
						</Button>
					</div>
				</div>

				<!-- Gyroscope Settings -->
				<div class="settings-section">
					<h3 class="section-title">🔄 Гироскоп</h3>
					<div class="setting-item">
						<div class="setting-info">
							<div class="setting-name">Чувствительность</div>
							<div class="setting-desc">Сила реакции на наклоны ({settings.gyroscopeSensitivity.toFixed(1)}x)</div>
						</div>
						<div class="sensitivity-controls">
							<Button
								variant="secondary"
								size="sm"
								onclick={() => onGyroscopeSensitivityChange?.(-0.1)}
								disabled={settings.gyroscopeSensitivity <= 0.5}
							>
								−
							</Button>
							<Button
								variant="secondary"
								size="sm"
								onclick={() => onGyroscopeSensitivityChange?.(0.1)}
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
								onclick={onCalibrateGyroscope}
								disabled={calibrationInProgress}
							>
								{calibrationInProgress ? 'Калибровка...' : 'Калибровать'}
							</Button>
						</div>
						<div class="setting-item">
							<div class="setting-info">
								<div class="setting-name">Дебаг-логирование</div>
								<div class="setting-desc">Запись данных гироскопа для настройки</div>
							</div>
							{#if !isDebugLogging}
								<Button
									variant="primary"
									size="sm"
									onclick={onStartDebugLogging}
								>
									🔥 Начать запись
								</Button>
							{:else}
								<Button
									variant="secondary"
									size="sm"
									onclick={onStopDebugLogging}
								>
									🛑 Остановить запись
								</Button>
							{/if}
						</div>
					{/if}
				</div>
			</div>
		{/if}

		<!-- Fallback content for debugging -->
		{#if !modalType && modalOpen}
			<div class="modal-content-wrapper">
				<h2 class="modal-title">🔧 Debug Mode</h2>
				<p>Modal is open but modalType is null</p>
				<p>showInstructions: {showInstructions}</p>
				<p>showStatsModal: {showStatsModal}</p>
				<p>showSettingsModal: {showSettingsModal}</p>
				<p>selectors: {JSON.stringify(selectors)}</p>
			</div>
		{/if}
	{/snippet}
</Modal>

<style>
	/* Force dark theme for modal */
	:global(.modal-backdrop) {
		background: rgba(0, 0, 0, 0.9) !important;
	}

	:global(.modal-content) {
		background: rgba(44, 62, 80, 0.98) !important;
		backdrop-filter: blur(12px) !important;
		border: 2px solid rgba(26, 188, 156, 0.3) !important;
		color: white !important;
		max-height: 90vh !important;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8) !important;
	}

	:global(.modal-body) {
		background: transparent !important;
		color: white !important;
	}

	:global(.modal-header) {
		background: transparent !important;
		border-bottom: 1px solid rgba(255, 255, 255, 0.2) !important;
	}

	/* Force all text to be white */
	:global(.modal-content *) {
		color: white !important;
	}

	/* Override button styles */
	:global(.modal-content button) {
		color: inherit !important;
	}

	:global(.modal-content .close-button) {
		color: rgba(255, 255, 255, 0.8) !important;
		border: 1px solid rgba(255, 255, 255, 0.2) !important;
		background: rgba(255, 255, 255, 0.1) !important;
	}

	:global(.modal-content .close-button:hover) {
		color: white !important;
		background: rgba(255, 255, 255, 0.2) !important;
	}

	.modal-content-wrapper {
		text-align: center;
		padding: 1rem;
	}

	.modal-title {
		font-size: 1.5rem;
		font-weight: bold;
		margin-bottom: 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}


	.modal-description {
		margin-bottom: 1rem;
		font-size: 0.875rem;
	}

	.modal-score {
		margin-bottom: 0.75rem;
		font-size: 0.875rem;
	}

	.modal-hint {
		margin-bottom: 1rem;
		font-size: 0.75rem;
	}

	/* Instructions */
	.instruction-list {
		text-align: left;
		margin-bottom: 1.5rem;
	}

	.instruction-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.25rem 0;
		font-size: 0.8rem;
		margin-bottom: 0.5rem;
	}

	.instruction-icon {
		font-size: 1.25rem;
		flex-shrink: 0;
	}

	/* Actions */
	.pause-actions,
	.failure-actions {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	/* Banking Products */
	.banking-products {
		max-height: 200px;
		overflow-y: auto;
		margin-bottom: 1rem;
	}

	.products-title {
		color: rgba(255, 255, 255, 0.8);
		margin-bottom: 0.75rem;
		font-size: 0.75rem;
		text-align: center;
	}

	.interactive-product {
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(8px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 0.5rem;
		padding: 0.5rem;
		margin-bottom: 0.25rem;
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

	.product-content {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.product-icon {
		font-size: 1.5rem;
	}

	.product-info {
		flex: 1;
	}

	.product-name {
		font-weight: 600;
		color: white;
		font-size: 0.875rem;
		margin-bottom: 0.25rem;
	}

	.product-bonus {
		color: rgba(255, 255, 255, 0.7);
		font-size: 0.75rem;
		margin-bottom: 0.125rem;
	}

	.product-duration {
		color: rgba(255, 255, 255, 0.5);
		font-size: 0.75rem;
	}

	.activation-status {
		display: flex;
		align-items: center;
		flex-shrink: 0;
	}

	.status-active {
		color: var(--color-state-success);
		font-size: 0.75rem;
	}

	.status-inactive {
		color: var(--color-accent-400);
		font-size: 0.75rem;
	}

	/* Stats and Settings Modals */
	.stats-modal,
	.settings-modal {
		text-align: left;
		max-height: 80vh;
		overflow-y: auto;
	}

	.modal-header-custom {
		margin-bottom: 1rem;
	}

	.section-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: white;
		margin-bottom: 0.75rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}


	.stats-section,
	.settings-section {
		margin-bottom: 1.5rem;
	}

	/* Stats Grid */
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.stat-card {
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(8px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 0.75rem;
		padding: 1rem;
		text-align: center;
	}

	.stat-value {
		font-size: 1.5rem;
		font-weight: 700;
		line-height: 1;
		margin-bottom: 0.25rem;
	}

	.stat-mint { color: var(--color-accent-400); }
	.stat-gold { color: #f59e0b; }
	.stat-emerald { color: #10b981; }
	.stat-blue { color: #3b82f6; }

	.stat-label {
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.7);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	/* Achievements */
	.achievements-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 0.5rem;
		margin-bottom: 1rem;
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

	/* High Scores */
	.high-scores-list {
		margin-bottom: 1rem;
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
		margin-bottom: 0.5rem;
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

	.no-scores {
		color: rgba(255, 255, 255, 0.6);
		text-align: center;
		padding: 2rem 0;
	}

	/* Banking Stats */
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

	/* Settings */
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

	.sensitivity-controls {
		display: flex;
		gap: 0.5rem;
	}

	@media (max-width: 480px) {
		.stats-grid {
			grid-template-columns: 1fr;
		}

		.modal-content-wrapper {
			padding: 0.75rem;
		}

		.modal-title {
			font-size: 1.25rem;
		}
	}
</style>