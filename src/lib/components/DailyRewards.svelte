<script lang="ts">
	import { Calendar } from 'lucide-svelte';
	import { tasksStore, dailyRewards, currentDay } from '$lib/stores/tasksStore';
	import { fade, scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

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
				}, 3000);
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
		return $dailyRewards.find(r => r.day === day)?.claimed || false;
	}
</script>

<section class="daily-rewards-section">
	<div class="section-header">
		<Calendar size={24} class="text-gpb-violet" style="filter: drop-shadow(0 0 8px currentColor);" />
		<h2 class="font-section-title">Ежедневные награды</h2>
	</div>

	<div class="rewards-calendar">
		{#each $dailyRewards as reward, index}
			<div
				class="reward-day"
				class:available={isRewardAvailable(reward.day)}
				class:claimable={canClaimReward(reward.day)}
				class:claimed={isRewardClaimed(reward.day)}
				style="--animation-delay: {index * 100}ms"
			>
				<div class="day-number">День {reward.day}</div>
				<div class="reward-icon" class:pulse={canClaimReward(reward.day)}>
					{reward.icon}
				</div>
				<div class="reward-amount">+{reward.reward.toLocaleString()}</div>
				<div class="reward-description">{reward.description}</div>

				{#if canClaimReward(reward.day)}
					<button
						type="button"
						class="btn-game-primary btn-claim"
						onclick={() => handleClaimReward(reward.day)}
					>
						Забрать
					</button>
				{:else if isRewardClaimed(reward.day)}
					<div class="status-claimed">✓ Получено</div>
				{:else if !isRewardAvailable(reward.day)}
					<div class="status-locked">🔒 Заблокировано</div>
				{/if}
			</div>
		{/each}
	</div>

	<div class="rewards-info">
		<p class="info-text">
			Заходите каждый день и получайте растущие награды!
			Чем больше дней подряд, тем больше баллов.
		</p>
		<div class="streak-info">
			<span class="streak-label">Текущая серия:</span>
			<span class="streak-value">{$currentDay - 1} дней</span>
		</div>
	</div>
</section>

{#if showRewardClaimed}
	<div class="reward-popup" transition:scale={{ duration: 400, easing: quintOut }}>
		<div class="popup-content">
			<div class="popup-icon">🎉</div>
			<div class="popup-title">Награда получена!</div>
			<div class="popup-amount">+{claimedAmount.toLocaleString()} баллов</div>
		</div>
	</div>
{/if}

<style>
	.daily-rewards-section {
		margin-bottom: 2rem;
		background: linear-gradient(135deg, #1919EF 0%, #9B59B6 50%, #DD41DB 100%);
		border-radius: 1rem;
		padding: 1.5rem;
		color: white;
		position: relative;
		overflow: hidden;
	}

	.daily-rewards-section::before {
		content: '';
		position: absolute;
		top: -50%;
		left: -50%;
		width: 200%;
		height: 200%;
		background: linear-gradient(45deg,
			transparent 30%,
			rgba(255, 255, 255, 0.1) 50%,
			transparent 70%);
		animation: shine 4s ease-in-out infinite;
		transform: rotate(-45deg);
	}

	@keyframes shine {
		0%, 100% {
			transform: translateX(-100%) rotate(-45deg);
		}
		50% {
			transform: translateX(100%) rotate(-45deg);
		}
	}

	.section-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1.5rem;
		justify-content: center;
		text-align: center;
		position: relative;
		z-index: 1;
	}

	.font-section-title {
		font-family: var(--font-heading);
		font-size: 1.5rem;
		font-weight: 700;
		color: white;
		text-shadow: 0 2px 4px rgba(0,0,0,0.3);
		margin: 0;
		line-height: 1.2;
	}


	.rewards-calendar {
		display: flex;
		gap: 1rem;
		margin-bottom: 1.5rem;
		position: relative;
		z-index: 1;
		overflow-x: auto;
		overflow-y: hidden;
		padding-bottom: 0.5rem;
		scroll-snap-type: x mandatory;
	}

	.rewards-calendar::-webkit-scrollbar {
		height: 6px;
	}

	.rewards-calendar::-webkit-scrollbar-track {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 3px;
	}

	.rewards-calendar::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.3);
		border-radius: 3px;
	}

	.rewards-calendar::-webkit-scrollbar-thumb:hover {
		background: rgba(255, 255, 255, 0.5);
	}

	.reward-day {
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(8px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 12px;
		padding: 0.75rem;
		text-align: center;
		transition: all 0.3s ease;
		opacity: 1;
		transform: translateY(0);
		flex-shrink: 0;
		width: 120px;
		scroll-snap-align: start;
	}

	@keyframes staggerIn {
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.reward-day.available {
		background: rgba(255, 255, 255, 0.15);
		border-color: rgba(255, 255, 255, 0.3);
	}

	.reward-day.claimable {
		background: linear-gradient(135deg, rgba(255, 215, 0, 0.3) 0%, rgba(80, 200, 120, 0.3) 100%);
		border-color: rgba(255, 215, 0, 0.6);
		box-shadow: 0 0 20px rgba(255, 215, 0, 0.4);
		animation: glow 2s ease-in-out infinite alternate;
	}

	@keyframes glow {
		from {
			box-shadow: 0 0 20px rgba(255, 215, 0, 0.4);
		}
		to {
			box-shadow: 0 0 30px rgba(255, 215, 0, 0.6);
		}
	}

	.reward-day.claimed {
		background: rgba(80, 200, 120, 0.2);
		border-color: rgba(80, 200, 120, 0.4);
	}

	.day-number {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: rgba(255, 255, 255, 0.8);
		margin-bottom: 0.5rem;
	}

	.reward-icon {
		font-size: 1.5rem;
		margin-bottom: 0.5rem;
		transition: transform 0.3s ease;
	}

	.reward-icon.pulse {
		animation: pulse 1.5s ease-in-out infinite;
	}

	@keyframes pulse {
		0%, 100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.1);
		}
	}

	.reward-amount {
		font-size: 0.875rem;
		font-weight: 700;
		color: #FFD700;
		text-shadow: 0 1px 2px rgba(0,0,0,0.3);
		margin-bottom: 0.25rem;
	}

	.reward-description {
		font-size: 0.65rem;
		color: rgba(255, 255, 255, 0.7);
		margin-bottom: 0.75rem;
		line-height: 1.2;
	}

	.btn-claim {
		width: 100%;
		padding: 0.375rem 0.75rem;
		font-size: 0.75rem;
		border-radius: 6px;
	}

	.status-claimed {
		color: #50C878;
		font-size: 0.75rem;
		font-weight: 600;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.25rem;
	}

	.status-locked {
		color: rgba(255, 255, 255, 0.5);
		font-size: 0.75rem;
		font-weight: 600;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.25rem;
	}

	.rewards-info {
		text-align: center;
		position: relative;
		z-index: 1;
	}

	.info-text {
		color: rgba(255, 255, 255, 0.9);
		font-size: 0.875rem;
		line-height: 1.5;
		margin-bottom: 1rem;
	}

	.streak-info {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		backdrop-filter: blur(4px);
	}

	.streak-label {
		font-size: 0.875rem;
		color: rgba(255, 255, 255, 0.8);
	}

	.streak-value {
		font-size: 1rem;
		font-weight: 700;
		color: #FFD700;
		text-shadow: 0 1px 2px rgba(0,0,0,0.3);
	}

	.reward-popup {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		z-index: 1000;
		background: linear-gradient(135deg, #FFD700 0%, #50C878 100%);
		border-radius: 1rem;
		padding: 2rem;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
		color: white;
		text-align: center;
	}

	.popup-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}

	.popup-icon {
		font-size: 3rem;
		margin-bottom: 0.5rem;
	}

	.popup-title {
		font-size: 1.25rem;
		font-weight: 700;
		text-shadow: 0 2px 4px rgba(0,0,0,0.3);
	}

	.popup-amount {
		font-size: 1.5rem;
		font-weight: 800;
		text-shadow: 0 2px 4px rgba(0,0,0,0.3);
	}

	@media (max-width: 480px) {
		.reward-day {
			width: 100px;
			padding: 0.5rem;
		}

		.reward-icon {
			font-size: 1.25rem;
		}

		.reward-amount {
			font-size: 0.75rem;
		}

		.reward-description {
			font-size: 0.6rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.reward-day,
		.reward-icon.pulse,
		.daily-rewards-section::before {
			animation: none;
		}

		.reward-day.claimable {
			animation: none;
		}

		.reward-day {
			opacity: 1 !important;
			transform: translateY(0) !important;
			animation: none !important;
		}
	}

	:global(.reward-day) {
		opacity: 1 !important;
		transform: translateY(0) !important;
	}
</style>