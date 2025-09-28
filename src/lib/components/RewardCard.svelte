<script lang="ts">
	import { Star, ShoppingBag, Clock } from 'lucide-svelte';
	import { pointsStore } from '$lib/stores/pointsStore';
	import type { Reward } from '$lib/types/Points';

	let { reward, onPurchase }: { reward: Reward; onPurchase: (reward: Reward) => void } = $props();

	let canAfford = $derived(pointsStore.canAfford(reward.cost));
	let isDisabled = $derived(!canAfford || !reward.isAvailable);

	function handleCardClick() {
		if (!isDisabled) {
			onPurchase(reward);
		}
	}

	function handleCardKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleCardClick();
		}
	}

	function handleRewardAction(event: MouseEvent) {
		event.stopPropagation();
		if (!isDisabled) {
			onPurchase(reward);
		}
	}
</script>

<div
	class="reward-card"
	class:reward-card--affordable={canAfford}
	class:reward-card--disabled={!reward.isAvailable}
	onclick={handleCardClick}
	onkeydown={handleCardKeydown}
	role="button"
	tabindex={isDisabled ? -1 : 0}
	aria-label={`Награда: ${reward.title}`}
>
	<header class="reward-card__header">
		<div class="reward-card__icon" aria-hidden="true">
			<span>{reward.icon}</span>
		</div>
		<div class="reward-card__badges">
			<span class="reward-card__badge reward-card__badge--partner">
				{reward.partner}
			</span>
			{#if !reward.isAvailable}
				<span class="reward-card__badge reward-card__badge--unavailable">
					Недоступно
				</span>
			{/if}
		</div>
	</header>

	<div class="reward-card__body">
		<h3 class="reward-card__title">{reward.title}</h3>
		<p class="reward-card__description text-balance">{reward.description}</p>
	</div>

	<footer class="reward-card__footer">
		<div class="reward-card__meta">
			<span class="reward-card__meta-item">
				<Star size={14} aria-hidden="true" />
				{reward.cost.toLocaleString()}
			</span>
			{#if reward.validUntil}
				<span class="reward-card__meta-item">
					<Clock size={14} aria-hidden="true" />
					до {reward.validUntil.toLocaleDateString('ru-RU')}
				</span>
			{/if}
		</div>

		{#if !isDisabled}
			<button type="button" class="reward-card__action" onclick={handleRewardAction}>
				Получить
			</button>
		{:else}
			<div class="reward-card__status">
				<ShoppingBag size={16} aria-hidden="true" />
				<span>{!canAfford ? 'Недостаточно баллов' : 'Недоступно'}</span>
			</div>
		{/if}
	</footer>
</div>

<style>
	.reward-card {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		padding: 1.5rem;
		border-radius: var(--radius-xl);
		border: 1px solid var(--color-border-muted);
		background: var(--color-surface-card);
		box-shadow: var(--shadow-soft);
		transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
		cursor: pointer;
	}

	.reward-card:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-medium);
		border-color: var(--layer-brand-150);
	}

	.reward-card:focus-visible {
		outline: none;
		box-shadow: var(--shadow-focus);
	}

	.reward-card--affordable {
		border-color: color-mix(in srgb, var(--color-accent-400) 55%, transparent);
	}

	.reward-card--disabled {
		opacity: 0.72;
		cursor: default;
		transform: none;
	}

	.reward-card__header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
	}

	.reward-card__icon {
		width: 48px;
		height: 48px;
		border-radius: var(--radius-lg);
		background: var(--layer-brand-050);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.5rem;
	}

	.reward-card__badges {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		align-items: flex-end;
	}

	.reward-card__badge {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		padding: 0.3rem 0.7rem;
		border-radius: var(--radius-full);
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	.reward-card__badge--partner {
		background: var(--color-neutral-100);
		color: var(--color-fg-secondary);
		border: 1px solid var(--color-border-subtle);
	}

	.reward-card__badge--unavailable {
		background: color-mix(in srgb, var(--color-state-danger) 18%, white 82%);
		color: var(--color-state-danger);
		border: 1px solid color-mix(in srgb, var(--color-state-danger) 32%, transparent);
	}

	.reward-card__body {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.reward-card__title {
		margin: 0;
		font-family: var(--font-display);
		font-size: 1.15rem;
		font-weight: 600;
		color: var(--color-fg-primary);
	}

	.reward-card__description {
		margin: 0;
		font-size: 0.9rem;
		color: var(--color-fg-secondary);
	}

	.reward-card__footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.reward-card__meta {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
		color: var(--color-fg-muted);
		font-size: 0.8rem;
	}

	.reward-card__meta-item {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
	}

	.reward-card__action {
		padding: 0.6rem 1.1rem;
		border-radius: var(--radius-lg);
		border: 1px solid transparent;
		background: linear-gradient(135deg, var(--color-brand-600) 0%, var(--color-brand-500) 100%);
		color: var(--color-fg-inverse);
		font-family: var(--font-display);
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
		transition: background-color 160ms ease, transform 160ms ease, box-shadow 160ms ease;
	}

	.reward-card__action:hover {
		transform: translateY(-1px);
		box-shadow: var(--shadow-soft);
		background: linear-gradient(135deg, var(--color-brand-700) 0%, var(--color-brand-500) 100%);
	}

	.reward-card__action:focus-visible {
		outline: none;
		box-shadow: var(--shadow-focus);
	}

	.reward-card__status {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--color-fg-muted);
	}

	.reward-card {
		padding: 1.25rem;
	}

	.reward-card__footer {
		flex-direction: column;
		align-items: stretch;
		gap: 0.75rem;
	}

	.reward-card__action {
		width: 100%;
	}
</style>
