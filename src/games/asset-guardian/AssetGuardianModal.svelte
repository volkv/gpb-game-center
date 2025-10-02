<script lang="ts">
	import { Play, RotateCcw } from 'lucide-svelte';
	import { Modal, Button } from '$lib';
	import { BANKING_PRODUCTS } from './constants';
	import type { AssetGuardianGameState } from './types';

	interface Props {
		showInstructions?: boolean;
		selectors: any;
		gameState: any;
		currentLevelId: number;
		onStartGame?: () => void;
		onResumeGame?: () => void;
		onPauseGame?: () => void;
		onRestartGame?: () => void;
		onExit?: () => void;
		onCloseSuccessModal?: () => void;
		onNextLevel?: () => void;
		onActivateBonus?: (productId: string) => void;
	}

	let {
		showInstructions = false,
		selectors,
		gameState,
		currentLevelId,
		onStartGame,
		onResumeGame,
		onPauseGame,
		onRestartGame,
		onExit,
		onCloseSuccessModal,
		onNextLevel,
		onActivateBonus
	}: Props = $props();

	let modalOpen = $derived(
		showInstructions || selectors?.isReady || selectors?.isPaused ||
		selectors?.isCompleted || selectors?.isFailed
	);

	let modalType = $derived.by(() => {
		if (selectors?.isCompleted) return 'success';
		if (selectors?.isFailed) return 'failure';
		if (selectors?.isPaused) return 'pause';
		if (showInstructions || selectors?.isReady) return 'instructions';
		return null;
	});
</script>

<Modal
	open={modalOpen}
	size="lg"
	closeOnBackdrop={false}
	closeOnEscape={false}
	showClose={false}
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
						{@const isActive = selectors.activeBonuses.some((b: { id: string }) => b.id === product.id)}
						{@const bonusLabel = product.gameBonus.type === 'shield' ? 'Защита от ловушек' :
							product.gameBonus.type === 'multiplier' ? 'Очки x2' :
							product.gameBonus.type === 'extra_life' ? '+1 жизнь' :
							product.gameBonus.type === 'slow_time' ? 'Замедление времени' : 'Бонус'}
						<button
							class="product-card interactive-product {isActive ? 'product-active' : ''}"
							disabled={isActive}
							onclick={() => !isActive && onActivateBonus?.(product.id)}
						>
							<div class="product-content">
								<span class="product-icon">{product.icon}</span>
								<div class="product-info">
									<h4 class="product-name">{product.name}</h4>
									<p class="product-bonus">{bonusLabel}</p>
									{#if product.gameBonus.duration > 0}
										<p class="product-duration">{product.gameBonus.duration / 1000}с</p>
									{/if}
								</div>
								{#if isActive}
									<span class="status-badge status-active">Активен</span>
								{:else}
									<span class="status-badge status-inactive">Тап</span>
								{/if}
							</div>
						</button>
					{/each}
				</div>
				<div class="success-actions">
					<Button
						variant="primary"
						size="md"
						onclick={onNextLevel}
					>
						Следующий уровень
					</Button>
					<Button
						variant="secondary"
						size="sm"
						onclick={onCloseSuccessModal}
					>
						Закрыть
					</Button>
				</div>
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


	{/snippet}
</Modal>

<style>


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
	.failure-actions,
	.success-actions {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	/* Banking Products */
	.banking-products {
		max-height: 420px;
		overflow-y: auto;
		margin-bottom: 1rem;
	}

	.products-title {
		color: var(--color-fg-muted);
		margin-bottom: 0.75rem;
		font-size: 0.75rem;
		text-align: center;
	}

	.interactive-product {
		background: var(--color-surface-muted);
		border: 1px solid var(--color-border-muted);
		border-radius: 0.75rem;
		padding: 0.75rem;
		margin-bottom: 0.5rem;
		width: 100%;
		cursor: pointer;
		transition: all 0.2s ease;
		text-align: left;
	}

	.interactive-product:hover:not(:disabled) {
		background: var(--layer-brand-050);
		border-color: var(--color-brand-400);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(0, 122, 195, 0.15);
	}

	.interactive-product:active:not(:disabled) {
		transform: translateY(0);
	}

	.product-active {
		background: color-mix(in srgb, var(--color-state-success) 12%, var(--color-surface-muted) 88%);
		border-color: var(--color-state-success);
		cursor: not-allowed;
		opacity: 0.65;
	}

	.product-content {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.product-icon {
		font-size: 2rem;
		flex-shrink: 0;
		line-height: 1;
	}

	.product-info {
		flex: 1;
		min-width: 0;
	}

	.product-name {
		font-weight: 600;
		color: var(--color-fg-primary);
		font-size: 0.875rem;
		margin-bottom: 0.25rem;
		line-height: 1.2;
	}

	.product-bonus {
		color: var(--color-fg-muted);
		font-size: 0.75rem;
		line-height: 1.3;
	}

	.product-duration {
		color: var(--color-accent-400);
		font-size: 0.7rem;
		margin-top: 0.125rem;
		font-weight: 500;
	}

	.status-badge {
		flex-shrink: 0;
		font-size: 0.7rem;
		font-weight: 600;
		padding: 0.25rem 0.5rem;
		border-radius: 0.375rem;
		white-space: nowrap;
		line-height: 1;
	}

	.status-active {
		background: var(--color-state-success);
		color: white;
	}

	.status-inactive {
		background: var(--color-accent-400);
		color: white;
	}

	@media (max-width: 480px) {
		.modal-content-wrapper {
			padding: 0.75rem;
		}

		.modal-title {
			font-size: 1.25rem;
		}

		.banking-products {
			max-height: 320px;
		}

		.products-title {
			font-size: 0.7rem;
			margin-bottom: 0.5rem;
		}

		.interactive-product {
			padding: 0.625rem;
			margin-bottom: 0.375rem;
			border-radius: 0.625rem;
		}

		.product-content {
			gap: 0.625rem;
		}

		.product-icon {
			font-size: 1.75rem;
		}

		.product-name {
			font-size: 0.8125rem;
			margin-bottom: 0.1875rem;
		}

		.product-bonus {
			font-size: 0.6875rem;
		}

		.product-duration {
			font-size: 0.65rem;
		}

		.status-badge {
			font-size: 0.65rem;
			padding: 0.1875rem 0.4375rem;
		}
	}
</style>