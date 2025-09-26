<script lang="ts">
	import { Star, CheckCircle } from 'lucide-svelte';
	import { pointsStore } from '$lib/stores/pointsStore';
	import type { Reward } from '$lib/types/Points';
	import Modal from './Modal.svelte';

	let {
		isOpen = $bindable(false),
		reward,
		onConfirm,
		onCancel
	}: {
		isOpen: boolean;
		reward: Reward | null;
		onConfirm: (reward: Reward) => void;
		onCancel: () => void;
	} = $props();

	let isProcessing = $state(false);
	let isSuccess = $state(false);

	async function handleConfirm() {
		if (!reward || isProcessing) return;

		isProcessing = true;

		try {
			const success = pointsStore.spendPoints(reward.cost, reward.id, reward.title);

			if (success) {
				isSuccess = true;
				onConfirm(reward);

				setTimeout(() => {
					isSuccess = false;
					isProcessing = false;
					isOpen = false;
				}, 2000);
			} else {
				isProcessing = false;
			}
		} catch (error) {
			console.error('Ошибка при покупке:', error);
			isProcessing = false;
		}
	}

	function handleCancel() {
		if (isProcessing || isSuccess) return;
		onCancel();
		isOpen = false;
	}

	function handleClose() {
		handleCancel();
	}
</script>

<Modal
	open={isOpen && reward !== null}
	success={isSuccess}
	showClose={!isSuccess}
	closeOnBackdrop={!isProcessing && !isSuccess}
	closeOnEscape={!isProcessing && !isSuccess}
	onClose={handleClose}
	size="sm"
>
	{#snippet children()}
		{#if !isSuccess && reward}
			<div class="reward-preview">
				<div class="reward-icon">
					<span class="icon-emoji">{reward.icon}</span>
				</div>
				<h2 class="reward-title">{reward.title}</h2>
				<p class="reward-partner">{reward.partner}</p>
				<p class="reward-description">{reward.description}</p>
			</div>

			<div class="cost-section">
				<div class="cost-display">
					<Star size={20} class="cost-icon" />
					<span class="cost-value">{reward.cost.toLocaleString()}</span>
					<span class="cost-label">баллов</span>
				</div>
				<p class="cost-note">
					После покупки у вас останется {($pointsStore.totalPoints - reward.cost).toLocaleString()} баллов
				</p>
			</div>

			{#if reward.terms}
				<div class="terms-section">
					<h3 class="terms-title">Условия использования</h3>
					<p class="terms-text">{reward.terms}</p>
				</div>
			{/if}
		{:else if isSuccess && reward}
			<div class="success-content">
				<div class="success-icon">
					<CheckCircle size={48} />
				</div>
				<h2 class="success-title">Приз получен!</h2>
				<p class="success-message">
					{reward.title} был добавлен в ваши призы
				</p>
			</div>
		{/if}
	{/snippet}

	{#snippet footer()}
		{#if !isSuccess}
			<button
				type="button"
				class="btn-secondary"
				onclick={handleCancel}
				disabled={isProcessing}
			>
				Отмена
			</button>
			<button
				type="button"
				class="btn-primary"
				onclick={handleConfirm}
				disabled={isProcessing}
			>
				{isProcessing ? 'Покупаем...' : 'Купить приз'}
			</button>
		{/if}
	{/snippet}
</Modal>

<style>
	.reward-preview {
		text-align: center;
		margin-bottom: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.reward-icon {
		width: 5rem;
		height: 5rem;
		border-radius: var(--radius-xl);
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto;
		background: linear-gradient(135deg, rgba(41, 80, 157, 0.14) 0%, rgba(44, 134, 134, 0.18) 100%);
		color: var(--color-brand-600);
	}

	.icon-emoji {
		font-size: 2.4rem;
		line-height: 1;
	}

	.reward-title {
		margin: 0;
		font-family: var(--font-display);
		font-size: 1.35rem;
		font-weight: 600;
		color: var(--color-fg-primary);
	}

	.reward-partner {
		margin: 0;
		font-size: 0.78rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--color-fg-muted);
	}

	.reward-description {
		margin: 0;
		font-size: 0.92rem;
		color: var(--color-fg-secondary);
		line-height: 1.5;
	}

	.cost-section {
		background: var(--color-neutral-50);
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border-subtle);
		padding: 1.25rem;
		margin-bottom: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.cost-display {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.45rem;
	}

	.cost-icon {
		color: var(--color-brand-500);
	}

	.cost-value {
		font-family: var(--font-display);
		font-size: 1.3rem;
		font-weight: 600;
		color: var(--color-brand-600);
	}

	.cost-label {
		font-size: 0.85rem;
		color: var(--color-fg-muted);
	}

	.cost-note {
		margin: 0;
		font-size: 0.8rem;
		color: var(--color-fg-muted);
	}

	.terms-section {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.terms-title {
		margin: 0;
		font-family: var(--font-display);
		font-size: 0.95rem;
		font-weight: 600;
		color: var(--color-fg-primary);
	}

	.terms-text {
		margin: 0;
		font-size: 0.85rem;
		line-height: 1.5;
		color: var(--color-fg-secondary);
	}

	.success-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		text-align: center;
		padding: 2rem 1rem;
	}

	.success-icon {
		width: 72px;
		height: 72px;
		border-radius: var(--radius-xl);
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.18);
	}

	.success-title {
		margin: 0;
		font-family: var(--font-display);
		font-size: 1.35rem;
		font-weight: 600;
	}

	.success-message {
		margin: 0;
		font-size: 0.9rem;
	}

	@media (max-width: 420px) {
		.reward-preview {
			gap: 0.6rem;
		}
	}
</style>
