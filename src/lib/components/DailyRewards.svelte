<script lang="ts">
	import { Calendar } from 'lucide-svelte';
	import { tasksStore, dailyRewards, currentDay } from '$lib/stores/tasksStore';

	let showRewardClaimed = $state(false);
	let claimedAmount = $state(0);

	function handleClaimReward(day: number) {
		if (tasksStore.canClaimDailyReward(day)) {
			const reward = tasksStore.claimDailyReward(day);
			if (reward > 0) {
				claimedAmount = reward;
				showRewardClaimed = true;
				setTimeout(() => {
					showRewardClaimed = false;
				}, 2800);
			}
		}
	}

	function canClaimReward(day: number): boolean {
		return day === $currentDay && !$dailyRewards.find(r => r.day === day)?.claimed;
	}

	function isRewardAvailable(day: number): boolean {
		return day <= $currentDay;
	}

	function isRewardClaimed(day: number): boolean {
		return $dailyRewards.find(r => r.day === day)?.claimed ?? false;
	}
</script>

<section class="daily-rewards" aria-labelledby="daily-rewards-title">
	<header class="daily-rewards__header">
		<div class="daily-rewards__heading">
			<Calendar size={20} aria-hidden="true" />
			<h2 class="daily-rewards__title" id="daily-rewards-title">Ежедневные награды</h2>
		</div>
		<p class="daily-rewards__hint">Возвращайтесь каждый день — сумма баллов увеличивается с серией.</p>
	</header>

	<div class="daily-rewards__list" role="list">
		{#each $dailyRewards as reward}
			<div
				class="daily-rewards__item"
				class:daily-rewards__item--available={isRewardAvailable(reward.day)}
				class:daily-rewards__item--claimable={canClaimReward(reward.day)}
				class:daily-rewards__item--claimed={isRewardClaimed(reward.day)}
				role="listitem"
			>
				<span class="daily-rewards__day">День {reward.day}</span>
				<div class="daily-rewards__icon" aria-hidden="true">{reward.icon}</div>
				<div class="daily-rewards__amount">+{reward.reward.toLocaleString()}</div>
				<p class="daily-rewards__description">{reward.description}</p>

				{#if canClaimReward(reward.day)}
					<button
						type="button"
						class="daily-rewards__action"
						onclick={() => handleClaimReward(reward.day)}
					>
						Получить
					</button>
				{:else if isRewardClaimed(reward.day)}
					<span class="daily-rewards__status">Получено</span>
				{:else if !isRewardAvailable(reward.day)}
					<span class="daily-rewards__status daily-rewards__status--locked">Откроется позже</span>
				{/if}
			</div>
		{/each}
	</div>

	<footer class="daily-rewards__footer">
		<span class="daily-rewards__streak-label">Текущая серия</span>
		<span class="daily-rewards__streak-value">{$currentDay - 1} дней</span>
	</footer>
</section>

{#if showRewardClaimed}
	<div class="daily-rewards__toast" role="status" aria-live="polite">
		<div class="daily-rewards__toast-content">
			<span class="daily-rewards__toast-icon">🎉</span>
			<span class="daily-rewards__toast-title">Награда получена</span>
			<span class="daily-rewards__toast-amount">+{claimedAmount.toLocaleString()} баллов</span>
		</div>
	</div>
{/if}

<style>
	.daily-rewards {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.daily-rewards__header {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.daily-rewards__heading {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--color-brand-600);
	}

	.daily-rewards__heading :global(svg) {
		color: var(--color-brand-600);
	}

	.daily-rewards__title {
		margin: 0;
		font-family: var(--font-display);
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--color-fg-primary);
	}

	.daily-rewards__hint {
		margin: 0;
		font-size: 0.85rem;
		color: var(--color-fg-muted);
	}

	.daily-rewards__list {
		display: grid;
		gap: 1rem;
		grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
	}

	.daily-rewards__item {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 1rem;
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border-subtle);
		background: var(--color-neutral-50);
		text-align: center;
		transition: border-color 140ms ease, box-shadow 140ms ease, transform 140ms ease;
	}

	.daily-rewards__item--available {
		background: var(--color-surface-card);
	}

	.daily-rewards__item--claimable {
		border-color: rgba(41, 80, 157, 0.35);
		box-shadow: var(--shadow-soft);
		transform: translateY(-2px);
	}

	.daily-rewards__item--claimed {
		border-color: rgba(58, 163, 116, 0.3);
		background: rgba(58, 163, 116, 0.08);
	}

	.daily-rewards__day {
		font-size: 0.75rem;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--color-fg-muted);
	}

	.daily-rewards__icon {
		font-size: 1.7rem;
	}

	.daily-rewards__amount {
		font-family: var(--font-display);
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--color-brand-600);
	}

	.daily-rewards__description {
		margin: 0;
		font-size: 0.8rem;
		color: var(--color-fg-secondary);
	}

	.daily-rewards__action {
		margin-top: 0.5rem;
		padding: 0.45rem 0.75rem;
		border-radius: var(--radius-full);
		border: 1px solid transparent;
		background: var(--color-brand-500);
		color: var(--color-fg-inverse);
		font-size: 0.8rem;
		font-weight: 600;
		cursor: pointer;
		transition: background-color 140ms ease, transform 140ms ease;
	}

	.daily-rewards__action:hover {
		transform: translateY(-1px);
	}

	.daily-rewards__status {
		margin-top: 0.5rem;
		display: inline-block;
		padding: 0.3rem 0.6rem;
		border-radius: var(--radius-full);
		background: var(--color-neutral-100);
		color: var(--color-fg-secondary);
		font-size: 0.75rem;
		font-weight: 600;
	}

	.daily-rewards__status--locked {
		background: var(--color-neutral-50);
		color: var(--color-fg-muted);
	}

	.daily-rewards__footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		font-size: 0.85rem;
		color: var(--color-fg-muted);
	}

	.daily-rewards__streak-label {
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.daily-rewards__streak-value {
		font-family: var(--font-display);
		font-weight: 600;
		color: var(--color-brand-600);
	}

	.daily-rewards__toast {
		position: fixed;
		left: 50%;
		bottom: clamp(1rem, 5vh, 2rem);
		transform: translateX(-50%);
		background: var(--color-surface-card);
		border: 1px solid var(--color-border-muted);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-medium);
		padding: 0.9rem 1.25rem;
	}

	.daily-rewards__toast-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.35rem;
	}

	.daily-rewards__toast-icon {
		font-size: 1.5rem;
	}

	.daily-rewards__toast-title {
		font-family: var(--font-display);
		font-size: 0.95rem;
		font-weight: 600;
		color: var(--color-fg-primary);
	}

	.daily-rewards__toast-amount {
		font-size: 0.85rem;
		color: var(--color-brand-600);
	}

	@media (max-width: 560px) {
		.daily-rewards__list {
			grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.daily-rewards__item,
		.daily-rewards__action {
			transition: none;
		}
	}
</style>
