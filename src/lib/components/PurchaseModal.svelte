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
	}

	.reward-icon {
		width: 5rem;
		height: 5rem;
		border-radius: 50%;
		background: linear-gradient(135deg, var(--color-gpb-mint) 0%, var(--color-gpb-raspberry) 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto 1rem;
	}

	.icon-emoji {
		font-size: 2.5rem;
		line-height: 1;
	}

	.reward-title {
		font-family: var(--font-heading);
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--color-gpb-black);
		margin: 0 0 0.5rem;
		line-height: 1.2;
	}

	.reward-partner {
		font-family: var(--font-body);
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-gpb-violet);
		margin: 0 0 1rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.reward-description {
		font-family: var(--font-body);
		font-size: 1rem;
		color: var(--color-gpb-gray-700);
		line-height: 1.4;
		margin: 0;
	}

	.cost-section {
		background: rgba(25, 25, 239, 0.05);
		border-radius: 1rem;
		padding: 1.25rem;
		margin-bottom: 1.5rem;
		text-align: center;
	}

	.cost-display {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		margin-bottom: 0.75rem;
	}


	.cost-value {
		font-family: var(--font-heading);
		font-size: 1.375rem;
		font-weight: 700;
		color: var(--color-gpb-violet);
	}

	.cost-label {
		font-family: var(--font-body);
		font-size: 1rem;
		color: var(--color-gpb-gray-600);
	}

	.cost-note {
		font-family: var(--font-body);
		font-size: 0.875rem;
		color: var(--color-gpb-gray-600);
		margin: 0;
	}

	.terms-section {
		background: var(--color-gpb-gray-50);
		border-radius: 0.75rem;
		padding: 1rem;
		margin-bottom: 1.5rem;
	}

	.terms-title {
		font-family: var(--font-heading);
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-gpb-black);
		margin: 0 0 0.5rem;
	}

	.terms-text {
		font-family: var(--font-body);
		font-size: 0.8125rem;
		color: var(--color-gpb-gray-700);
		line-height: 1.4;
		margin: 0;
	}

	.btn-secondary,
	.btn-primary {
		flex: 1;
		padding: 0.875rem 1rem;
		border: none;
		border-radius: 0.75rem;
		font-family: var(--font-heading);
		font-size: 0.9375rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.btn-secondary {
		background: var(--color-gpb-gray-100);
		color: var(--color-gpb-gray-700);
	}

	.btn-secondary:hover:not(:disabled) {
		background: var(--color-gpb-gray-200);
	}

	.btn-primary {
		background: linear-gradient(135deg, var(--color-gpb-emerald) 0%, #45b369 100%);
		color: white;
		box-shadow: 0 4px 12px rgba(80, 200, 120, 0.3);
	}

	.btn-primary:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 6px 16px rgba(80, 200, 120, 0.4);
	}

	.btn-secondary:disabled,
	.btn-primary:disabled {
		opacity: 0.7;
		cursor: not-allowed;
		transform: none;
	}

	.success-content {
		padding: 2rem;
		text-align: center;
	}

	.success-icon {
		margin: 0 auto 1rem;
		color: white;
		opacity: 0;
		animation: successIconEnter 0.5s ease-out 0.3s forwards;
	}

	.success-title {
		font-family: var(--font-heading);
		font-size: 1.5rem;
		font-weight: 700;
		margin: 0 0 0.75rem;
		color: white;
		opacity: 0;
		animation: successTextEnter 0.5s ease-out 0.6s forwards;
	}

	.success-message {
		font-family: var(--font-body);
		font-size: 1rem;
		line-height: 1.4;
		margin: 0;
		color: rgba(255, 255, 255, 0.9);
		opacity: 0;
		animation: successTextEnter 0.5s ease-out 0.9s forwards;
	}

	@keyframes successIconEnter {
		to {
			opacity: 1;
			transform: scale(1.1) rotate(10deg);
		}
	}

	@keyframes successTextEnter {
		to {
			opacity: 1;
		}
	}

	@media (max-width: 480px) {
		.reward-icon {
			width: 4rem;
			height: 4rem;
		}

		.icon-emoji {
			font-size: 2rem;
		}

		.reward-title {
			font-size: 1.25rem;
		}

		.success-content {
			padding: 1.5rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.success-icon,
		.success-title,
		.success-message {
			animation: none;
			opacity: 1;
		}

		.btn-primary:hover {
			transform: none;
		}
	}
</style>