<script lang="ts">
	import { Star, Clock } from 'lucide-svelte';
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
</script>

<div
	class="reward-card"
	class:reward-card--disabled={isDisabled}
	style={`--reward-gradient: ${reward.gradient ?? 'linear-gradient(135deg, rgba(0, 122, 195, 0.16) 0%, rgba(31, 196, 217, 0.12) 100%)'}; --reward-accent: ${reward.themeColor ?? 'var(--color-brand-500)'};`}
	onclick={handleCardClick}
	onkeydown={handleCardKeydown}
	role="button"
	tabindex={isDisabled ? -1 : 0}
	aria-label={`Награда: ${reward.title}`}
>
	<div class="reward-card__header">
		<div class="reward-card__icon" aria-hidden="true">
			<span>{reward.icon}</span>
		</div>
		<div class="reward-card__header-content">
			<h3 class="reward-card__title">{reward.title}</h3>
			<p class="reward-card__subtitle">{reward.partner}</p>
		</div>
		{#if !reward.isAvailable}
			<span class="reward-card__badge reward-card__badge--muted">Недоступно</span>
		{:else if canAfford}
			<span class="reward-card__badge">Доступно</span>
		{/if}
	</div>

	<div class="reward-card__body">
		<p class="reward-card__description">{reward.description}</p>
	</div>

	<div class="reward-card__footer">
		<div class="reward-card__meta">
			<span class="reward-card__meta-item">
				<Star class="shrink-0" size={14} aria-hidden="true" />
				{reward.cost.toLocaleString()} баллов
			</span>
			{#if reward.validUntil}
				<span class="reward-card__meta-item">
					<Clock class="shrink-0" size={14} aria-hidden="true" />
					до {reward.validUntil.toLocaleDateString('ru-RU')}
				</span>
			{/if}
		</div>
		<button class="reward-card__button" disabled={isDisabled} onclick={handleCardClick}>
			Купить
		</button>
	</div>
</div>

<style>
	.reward-card {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1.25rem;
		border-radius: var(--radius-xl);
		border: 1px solid var(--color-border-muted);
		background: var(--color-surface-card);
		box-shadow: var(--shadow-soft);
		transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
		cursor: pointer;
		height: 100%;
	}

	.reward-card::before {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
		opacity: 0.18;
		background: var(--reward-gradient);
		pointer-events: none;
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

	.reward-card--disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
		box-shadow: none;
	}

	.reward-card--disabled:hover {
		transform: none;
		box-shadow: none;
	}

	.reward-card__header {
		display: flex;
		align-items: flex-start;
		gap: 0.85rem;
	}

	.reward-card__icon {
		width: 48px;
		height: 48px;
		flex-shrink: 0;
		border-radius: var(--radius-lg);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.5rem;
		overflow: hidden;
	}

	.reward-card__header-content {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		flex: 1;
		min-width: 0;
	}

	.reward-card__badge {
		display: inline-flex;
		align-items: center;
		align-self: flex-start;
		flex-shrink: 0;
		gap: 0.35rem;
		padding: 0.25rem 0.65rem;
		border-radius: var(--radius-full);
		font-size: 0.65rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		background: var(--layer-brand-100);
		color: var(--reward-accent);
	}

	.reward-card__badge--muted {
		background: var(--color-neutral-100);
		color: var(--color-fg-secondary);
	}

	.reward-card__title {
		margin: 0;
		font-family: var(--font-display);
		font-size: 1.05rem;
		font-weight: 600;
		line-height: 1.3;
		color: var(--color-fg-primary);
	}

	.reward-card__subtitle {
		margin: 0;
		font-size: 0.8rem;
		line-height: 1.4;
		color: var(--color-fg-muted);
	}

	.reward-card__body {
		display: flex;
		flex-direction: column;
	}

	.reward-card__description {
		margin: 0;
		font-size: 0.875rem;
		line-height: 1.5;
		color: var(--color-fg-secondary);
	}

	.reward-card__footer {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-top: auto;
	}

	.reward-card__meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		font-size: 0.85rem;
		color: var(--color-fg-secondary);
	}

	.reward-card__meta-item {
		display: inline-flex;
		align-items: center;
		gap: 0.75rem;
	}

	.reward-card__meta :global(svg) {
		color: var(--color-fg-muted);
	}

	.reward-card__button {
		width: 100%;
		padding: 0.75rem 1rem;
		border: none;
		border-radius: var(--radius-lg);
		background: var(--reward-accent);
		color: white;
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
		transition: opacity 160ms ease, transform 160ms ease;
	}

	.reward-card__button:hover:not(:disabled) {
		opacity: 0.9;
		transform: scale(0.98);
	}

	.reward-card__button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
