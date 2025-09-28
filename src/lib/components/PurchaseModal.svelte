<script lang="ts">
	import { Star, CheckCircle } from 'lucide-svelte';
	import { pointsStore } from '$lib/stores/pointsStore';
	import { confettiEffects } from '$lib/utils/confetti';
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

	const SUCCESS_CLOSE_TIMEOUT = 2000;
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

				confettiEffects.purchaseSuccess();

				setTimeout(() => {
					isSuccess = false;
					isProcessing = false;
					isOpen = false;
				}, SUCCESS_CLOSE_TIMEOUT);
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
				<div class="success-progress" style={`--timer-duration: ${SUCCESS_CLOSE_TIMEOUT}ms;`}></div>
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
		background: linear-gradient(135deg, rgba(6, 6, 152, 0.18) 0%, rgba(31, 196, 217, 0.18) 100%);
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
		gap: 0.75rem;
		text-align: center;
		padding: 1.75rem 1.25rem;
	}

	.success-icon {
		width: 56px;
		height: 56px;
		border-radius: 999px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: color-mix(in srgb, var(--color-state-success) 18%, white 82%);
		border: 1px solid color-mix(in srgb, var(--color-state-success) 38%, transparent);
		color: color-mix(in srgb, var(--color-state-success) 72%, var(--color-fg-primary) 28%);
	}

	.success-title {
		margin: 0;
		font-family: var(--font-display);
		font-size: 1.25rem;
		font-weight: 600;
		color: color-mix(in srgb, var(--color-state-success) 70%, var(--color-fg-primary) 30%);
	}

	.success-message {
		margin: 0;
		font-size: 0.9rem;
		color: var(--color-fg-secondary);
	}

	.success-progress {
		position: relative;
		width: 100%;
		height: 4px;
		margin-top: 0.5rem;
		border-radius: 999px;
		background: color-mix(in srgb, var(--color-state-success) 12%, transparent);
		
		align-self: stretch;
	}

	.success-progress::after {
		content: '';
		display: block;
		width: 100%;
		height: 100%;
		background: color-mix(in srgb, var(--color-state-success) 70%, var(--color-fg-primary) 30%);
		transform-origin: left center;
		animation: success-close var(--timer-duration, 2000ms) linear forwards;
		will-change: transform;
	}

	@keyframes success-close {
		from {
			transform: scaleX(1);
		}

		to {
			transform: scaleX(0);
		}
	}


</style>
