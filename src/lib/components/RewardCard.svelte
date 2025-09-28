<script lang="ts">
	import { Star, ShoppingBag } from 'lucide-svelte';
	import { pointsStore } from '$lib/stores/pointsStore';
	import type { Reward } from '$lib/types/Points';

	let { reward, onPurchase }: { reward: Reward; onPurchase: (reward: Reward) => void } = $props();

	let canAfford = $derived(pointsStore.canAfford(reward.cost));
</script>

<article
	class="reward-card"
	class:reward-card--affordable={canAfford}
	class:reward-card--disabled={!reward.isAvailable}
>
	<header class="reward-card__header">
		<div class="reward-card__icon" aria-hidden="true">
			<span class="reward-card__emoji">{reward.icon}</span>
		</div>
		<div class="reward-card__title-block">
			<h3 class="reward-card__title">{reward.title}</h3>
			<span class="reward-card__partner">{reward.partner}</span>
		</div>
	</header>

	<p class="reward-card__description text-balance">{reward.description}</p>

	<div class="reward-card__meta" aria-label="Стоимость">
		<span class="reward-card__cost">
			<Star size={16} aria-hidden="true" />
			<span class="reward-card__cost-value">{reward.cost.toLocaleString()}</span>
			<span class="reward-card__cost-label">баллов</span>
		</span>
		{#if reward.validUntil}
			<span class="reward-card__chip">до {reward.validUntil.toLocaleDateString('ru-RU')}</span>
		{/if}
	</div>

	<footer class="reward-card__footer">
		<button
			type="button"
			class="reward-card__action"
			disabled={!canAfford || !reward.isAvailable}
			onclick={() => onPurchase(reward)}
		>
			<ShoppingBag size={16} aria-hidden="true" />
			{canAfford && reward.isAvailable ? 'Получить' : !canAfford ? 'Недостаточно баллов' : 'Недоступно'}
		</button>
	</footer>
</article>

<style>
	.reward-card {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1.5rem;
		border-radius: var(--radius-xl);
		border: 1px solid var(--color-border-muted);
		background: var(--color-surface-card);
		box-shadow: var(--shadow-soft);
		transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
	}

	.reward-card::before {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
		opacity: 0;
		background: linear-gradient(135deg, rgba(6, 6, 152, 0.14) 0%, rgba(31, 196, 217, 0.12) 100%);
		pointer-events: none;
		transition: opacity 160ms ease;
	}

	.reward-card:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-medium);
		border-color: var(--layer-brand-150);
	}

	.reward-card:hover::before {
		opacity: 1;
	}

	.reward-card--affordable {
		border-color: color-mix(in srgb, var(--color-accent-400) 55%, transparent);
	}

	.reward-card--disabled {
		opacity: 0.65;
		cursor: not-allowed;
	}

	.reward-card__header {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.reward-card__icon {
		width: 52px;
		height: 52px;
		border-radius: var(--radius-lg);
		background: var(--layer-brand-050);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.reward-card__emoji {
		font-size: 1.8rem;
	}

	.reward-card__title-block {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		min-width: 0;
	}

	.reward-card__title {
		margin: 0;
		font-family: var(--font-display);
		font-size: 1.15rem;
		font-weight: 600;
		color: var(--color-fg-primary);
		white-space: nowrap;
		
		text-overflow: ellipsis;
	}

	.reward-card__partner {
		font-size: 0.75rem;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--color-fg-muted);
	}

	.reward-card__description {
		margin: 0;
		font-size: 0.9rem;
		color: var(--color-fg-secondary);
	}

	.reward-card__meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.reward-card__cost {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.35rem 0.6rem;
		border-radius: var(--radius-full);
		background: var(--color-neutral-100);
		border: 1px solid var(--color-border-subtle);
		color: var(--color-fg-secondary);
		font-size: 0.85rem;
	}

	.reward-card__cost-value {
		font-family: var(--font-display);
		font-weight: 600;
		color: var(--color-brand-600);
	}

	.reward-card__cost-label {
		font-size: 0.75rem;
		color: var(--color-fg-muted);
	}

	.reward-card__chip {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		padding: 0.25rem 0.55rem;
		border-radius: var(--radius-full);
		background: var(--color-neutral-50);
		border: 1px solid var(--color-border-subtle);
		font-size: 0.75rem;
		color: var(--color-fg-muted);
	}

	.reward-card__footer {
		margin-top: auto;
	}

	.reward-card__action {
		width: 100%;
		padding: 0.85rem 1rem;
		border-radius: var(--radius-lg);
		border: 1px solid transparent;
		background: var(--color-brand-500);
		color: var(--color-fg-inverse);
		font-family: var(--font-display);
		font-size: 0.95rem;
		font-weight: 600;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		transition: background-color 160ms ease, transform 160ms ease, box-shadow 160ms ease;
		cursor: pointer;
	}

	.reward-card__action:hover {
		transform: translateY(-1px);
		box-shadow: var(--shadow-soft);
	}

	.reward-card__action:focus-visible {
		outline: none;
		box-shadow: var(--shadow-focus);
	}

	.reward-card__action:disabled {
		background: var(--color-neutral-100);
		color: var(--color-fg-muted);
		border-color: var(--color-border-muted);
		cursor: not-allowed;
		box-shadow: none;
	}

	.reward-card--disabled .reward-card__action {
		background: var(--color-neutral-100);
		color: var(--color-fg-muted);
		border-color: var(--color-border-muted);
		cursor: not-allowed;
	}



</style>
