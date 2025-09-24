<script lang="ts">
	import { Star, ShoppingBag } from 'lucide-svelte';
	import { pointsStore } from '$lib/stores/pointsStore';
	import type { Reward } from '$lib/types/Points';

	let { reward, onPurchase }: { reward: Reward; onPurchase: (reward: Reward) => void } = $props();

	let canAfford = $derived(pointsStore.canAfford(reward.cost));
</script>

<div class="reward-card" class:affordable={canAfford} class:unavailable={!reward.isAvailable}>
	<div class="reward-icon">
		<span class="icon-emoji">{reward.icon}</span>
	</div>

	<div class="reward-content">
		<div class="reward-header">
			<h3 class="reward-title">{reward.title}</h3>
			<div class="reward-partner">{reward.partner}</div>
		</div>

		<p class="reward-description">{reward.description}</p>

		<div class="reward-cost">
			<Star size={16} class="cost-icon" />
			<span class="cost-value">{reward.cost.toLocaleString()}</span>
			<span class="cost-label">баллов</span>
		</div>
	</div>

	<div class="reward-action">
		<button
			type="button"
			class="purchase-btn"
			disabled={!canAfford || !reward.isAvailable}
			onclick={() => onPurchase(reward)}
		>
			<ShoppingBag size={16} />
			{canAfford && reward.isAvailable ? 'Купить' : !canAfford ? 'Не хватает баллов' : 'Недоступно'}
		</button>
	</div>
</div>

<style>
	.reward-card {
		padding: 1.5rem;
		border-radius: 1rem;
		background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
		border: 2px solid #e5e7eb;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		transition: all 0.3s ease;
		position: relative;
		overflow: hidden;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
	}

	.reward-card.affordable {
		border-color: var(--color-gpb-emerald);
		box-shadow: 0 8px 25px rgba(80, 200, 120, 0.15);
	}

	.reward-card.affordable:hover {
		transform: translateY(-2px);
		box-shadow: 0 12px 35px rgba(80, 200, 120, 0.2);
	}

	.reward-card.unavailable {
		opacity: 0.7;
		background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
	}

	.reward-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 4rem;
		height: 4rem;
		border-radius: 50%;
		background: linear-gradient(135deg, var(--color-gpb-mint) 0%, var(--color-gpb-raspberry) 100%);
		margin: 0 auto;
		position: relative;
	}

	.icon-emoji {
		font-size: 1.75rem;
		line-height: 1;
	}

	.reward-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		text-align: center;
	}

	.reward-header {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.reward-title {
		font-family: var(--font-heading);
		font-size: 1.125rem;
		font-weight: 700;
		color: var(--color-gpb-black);
		line-height: 1.2;
		margin: 0;
	}

	.reward-partner {
		font-family: var(--font-body);
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-gpb-gray-600);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.reward-description {
		font-family: var(--font-body);
		font-size: 0.875rem;
		color: var(--color-gpb-gray-700);
		line-height: 1.4;
		margin: 0;
	}

	.reward-cost {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.375rem;
		padding: 0.5rem;
		background: rgba(25, 25, 239, 0.1);
		border-radius: 0.5rem;
	}


	.cost-value {
		font-family: var(--font-heading);
		font-size: 1rem;
		font-weight: 700;
		color: var(--color-gpb-violet);
	}

	.cost-label {
		font-family: var(--font-body);
		font-size: 0.875rem;
		color: var(--color-gpb-gray-600);
	}

	.reward-action {
		margin-top: auto;
	}

	.purchase-btn {
		width: 100%;
		padding: 0.875rem 1rem;
		border: none;
		border-radius: 0.75rem;
		font-family: var(--font-heading);
		font-size: 0.9375rem;
		font-weight: 600;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		transition: all 0.2s ease;
		cursor: pointer;
		background: linear-gradient(135deg, var(--color-gpb-emerald) 0%, #45b369 100%);
		color: white;
		box-shadow: 0 4px 12px rgba(80, 200, 120, 0.3);
	}

	.purchase-btn:enabled:hover {
		transform: translateY(-1px);
		box-shadow: 0 6px 16px rgba(80, 200, 120, 0.4);
	}

	.purchase-btn:enabled:active {
		transform: translateY(0);
		box-shadow: 0 2px 8px rgba(80, 200, 120, 0.3);
	}

	.purchase-btn:disabled {
		background: linear-gradient(135deg, var(--color-gpb-gray-400) 0%, var(--color-gpb-gray-500) 100%);
		color: white;
		cursor: not-allowed;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		transform: none;
		opacity: 0.7;
	}

	@media (max-width: 380px) {
		.reward-card {
			padding: 1.25rem;
		}

		.reward-icon {
			width: 3.5rem;
			height: 3.5rem;
		}

		.icon-emoji {
			font-size: 1.5rem;
		}

		.reward-title {
			font-size: 1rem;
		}

		.purchase-btn {
			padding: 0.75rem 0.875rem;
			font-size: 0.875rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.reward-card,
		.purchase-btn {
			transition: none;
			transform: none !important;
		}
	}
</style>