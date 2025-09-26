<script lang="ts">
	import { onMount } from 'svelte';
	import { Star, Gift } from 'lucide-svelte';
	import { totalPoints } from '$lib/stores/pointsStore';
	import { getAvailableRewards } from '$lib/data/rewards';
	import RewardCard from './RewardCard.svelte';
	import PurchaseModal from './PurchaseModal.svelte';
	import type { Reward } from '$lib/types/Points';

	let mounted = $state(false);
	let rewards = $state<Reward[]>([]);
	let selectedReward = $state<Reward | null>(null);
	let isModalOpen = $state(false);

	onMount(() => {
		rewards = getAvailableRewards();
		mounted = true;
	});

	function handlePurchase(reward: Reward) {
		selectedReward = reward;
		isModalOpen = true;
	}

	function handleConfirmPurchase(reward: Reward) {
		console.log(`Приз "${reward.title}" успешно куплен!`);
	}

	function handleCancelPurchase() {
		selectedReward = null;
	}
</script>

{#if mounted}
	<main class="rewards">
		<section class="hero surface-contrast" aria-labelledby="rewards-title">
			<div class="hero-copy">
				<p class="hero-eyebrow">Программа лояльности</p>
				<h1 class="hero-title" id="rewards-title">Магазин подарков</h1>
				<p class="hero-subtitle text-balance">
					Обменивайте накопленные баллы на ценные призы, впечатления и привилегии.
				</p>
			</div>
		</section>

		<section class="summary surface-card" aria-label="Баланс баллов">
			<div class="summary-row">
				<div class="summary-icon" aria-hidden="true">
					<Star size={20} />
				</div>
				<div>
					<p class="summary-label">Доступно баллов</p>
					<p class="summary-value">{$totalPoints.toLocaleString()}</p>
				</div>
			</div>
			<p class="summary-hint">Чем активнее вы в заданиях и играх, тем шире выбор наград.</p>
		</section>

		<section class="section" aria-labelledby="rewards-list-heading">
			<div class="section-heading">
				<p class="section-heading__eyebrow">Выбор</p>
				<div class="section-heading__title-row">
					<h2 class="section-heading__title" id="rewards-list-heading">Каталог призов</h2>
					<div class="section-heading__chip">
						<Gift size={18} aria-hidden="true" />
						<span>{rewards.length}</span>
					</div>
				</div>
			</div>

			<div class="rewards-grid" role="list">
				{#each rewards as reward (reward.id)}
					<div class="rewards-grid__item" role="listitem">
						<RewardCard {reward} onPurchase={handlePurchase} />
					</div>
				{/each}
			</div>

			{#if rewards.length === 0}
				<p class="empty-state">Список подарков временно пуст. Новые предложения скоро появятся.</p>
			{/if}
		</section>
	</main>
{/if}

<PurchaseModal
	bind:isOpen={isModalOpen}
	reward={selectedReward}
	onConfirm={handleConfirmPurchase}
	onCancel={handleCancelPurchase}
/>

<style>
	.rewards {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		padding-top: 1.5rem;
		padding-bottom: calc(96px + 1.5rem);
	}

	.hero {
		padding: 1.75rem;
	}

	.hero-copy {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.hero-eyebrow {
		font-size: 0.75rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.72);
	}

	.hero-title {
		font-family: var(--font-display);
		font-size: clamp(1.6rem, 1.3rem + 1vw, 2.05rem);
		font-weight: 700;
		letter-spacing: -0.01em;
		color: var(--color-fg-inverse);
	}

	.hero-subtitle {
		font-size: 0.95rem;
		color: rgba(255, 255, 255, 0.78);
		max-width: 30rem;
		margin: 0;
	}

	.summary {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 1.5rem;
	}

	.summary-row {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.summary-icon {
		width: 44px;
		height: 44px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--radius-lg);
		background: var(--layer-brand-050);
		color: var(--color-brand-600);
	}

	.summary-label {
		margin: 0;
		font-size: 0.75rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--color-fg-muted);
	}

	.summary-value {
		margin: 0;
		font-family: var(--font-display);
		font-size: 1.6rem;
		font-weight: 600;
		color: var(--color-fg-primary);
	}

	.summary-hint {
		margin: 0;
		font-size: 0.875rem;
		color: var(--color-fg-muted);
	}

	.section {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.section-heading__title-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.section-heading__chip {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.25rem 0.6rem;
		border-radius: var(--radius-full);
		background: var(--color-neutral-100);
		border: 1px solid var(--color-border-subtle);
		font-size: 0.75rem;
		color: var(--color-fg-secondary);
	}

	.rewards-grid {
		display: grid;
		gap: 1.25rem;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
	}

	.rewards-grid__item {
		list-style: none;
	}

	.empty-state {
		font-size: 0.9rem;
		color: var(--color-fg-muted);
	}

	@media (max-width: 420px) {
		.hero {
			padding: 1.5rem;
		}

		.summary {
			padding: 1.25rem;
		}

		.rewards-grid {
			grid-template-columns: 1fr;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.summary,
		.section,
		.rewards-grid__item {
			transition: none;
		}
	}
</style>
