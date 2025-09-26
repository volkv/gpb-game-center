<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { Star, Gift } from 'lucide-svelte';
	import { pointsStore, totalPoints } from '$lib/stores/pointsStore';
	import { getAvailableRewards } from '$lib/data/rewards';
	import RewardCard from './RewardCard.svelte';
	import PurchaseModal from './PurchaseModal.svelte';
	import type { Reward } from '$lib/types/Points';

	let mounted = $state(false);
	let showContent = $state(false);
	let showStatsSection = $state(false);
	let showRewardsSection = $state(false);
	let rewards = $state<Reward[]>([]);

	let selectedReward = $state<Reward | null>(null);
	let isModalOpen = $state(false);

	onMount(async () => {
		rewards = getAvailableRewards();
		mounted = true;

		setTimeout(() => {
			showContent = true;
		}, 100);

		setTimeout(() => {
			showStatsSection = true;
		}, 200);

		setTimeout(() => {
			showRewardsSection = true;
		}, 400);
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

<main class="rewards-container">
	<div class="particles-container">
		<div class="particle" style="left: 15%; top: 20%; animation-delay: 0s;"></div>
		<div class="particle" style="left: 85%; top: 35%; animation-delay: 1.5s;"></div>
		<div class="particle" style="left: 25%; top: 70%; animation-delay: 0.8s;"></div>
		<div class="particle" style="left: 75%; top: 80%; animation-delay: 2.2s;"></div>
	</div>

	{#if mounted}
		<header class="header" in:fade={{ duration: 600 }}>
			<div class="decoration-orb bg-gpb-mint w-24 h-24 -top-8 -right-8"></div>
			<div class="decoration-orb bg-gpb-raspberry w-16 h-16 -bottom-4 -left-4"></div>
			<h1 class="font-game-title" id="main-title">
				Магазин подарков
			</h1>
			<p class="subtitle font-ui-secondary" aria-describedby="main-title">
				Обменяйте баллы на призы
			</p>
		</header>
	{/if}

	{#if showContent}
		<div class="content">
			{#if showStatsSection}
				<section class="stats-section section-spacing stagger-item" style="--animation-delay: 100ms;">
					<div class="points-display">
						<div class="decoration-shine"></div>
						<div class="flex items-center gap-2 mb-2">
							<Star size={20} class="text-gpb-gold neon-glow" />
							<span class="font-ui-secondary">Доступно баллов</span>
						</div>
						<div class="points-value animate-count-up">{$totalPoints.toLocaleString()}</div>
					</div>
				</section>
			{/if}

			{#if showRewardsSection}
				<section class="rewards-section section-spacing stagger-item" style="--animation-delay: 200ms;">
					<div class="section-header">
						<Gift size={24} class="section-icon text-gpb-violet neon-glow" />
						<h2 class="font-section-title">Доступные призы</h2>
					</div>

					<div class="rewards-grid">
						{#each rewards as reward, index}
							<div class="stagger-item" style="--animation-delay: {300 + index * 100}ms;">
								<RewardCard {reward} onPurchase={handlePurchase} />
							</div>
						{/each}
					</div>
				</section>
			{/if}
		</div>
	{/if}
</main>

<PurchaseModal
	bind:isOpen={isModalOpen}
	reward={selectedReward}
	onConfirm={handleConfirmPurchase}
	onCancel={handleCancelPurchase}
/>

<style>
	.rewards-container {
		padding-left: 1rem;
		padding-right: 1rem;
		padding-top: 1.5rem;
		padding-bottom: calc(88px + 1.5rem);
		background: linear-gradient(135deg, #1919EF 0%, #9B59B6 50%, #DD41DB 100%);
		color: white;
		position: relative;
		min-height: 100%;
	}

	.particles-container {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		overflow: hidden;
		z-index: 0;
	}

	.particle {
		position: absolute;
		width: 4px;
		height: 4px;
		background: rgba(255, 255, 255, 0.3);
		border-radius: 50%;
		animation: float 6s ease-in-out infinite;
	}

	@keyframes float {
		0%, 100% {
			transform: translateY(0px) rotate(0deg);
			opacity: 0.3;
		}
		25% {
			transform: translateY(-10px) rotate(90deg);
			opacity: 0.6;
		}
		50% {
			transform: translateY(-20px) rotate(180deg);
			opacity: 0.3;
		}
		75% {
			transform: translateY(-10px) rotate(270deg);
			opacity: 0.6;
		}
	}

	.header {
		text-align: center;
		margin-bottom: 2rem;
		padding-top: 1rem;
		position: relative;
		z-index: 1;
	}

	.decoration-orb {
		position: absolute;
		border-radius: 50%;
		opacity: 0.6;
		filter: blur(1px);
		animation: float 8s ease-in-out infinite;
	}

	.bg-gpb-mint {
		background-color: var(--color-gpb-mint);
	}

	.bg-gpb-raspberry {
		background-color: var(--color-gpb-raspberry);
	}

	.w-24 { width: 6rem; }
	.h-24 { height: 6rem; }
	.w-16 { width: 4rem; }
	.h-16 { height: 4rem; }
	.-top-8 { top: -2rem; }
	.-right-8 { right: -2rem; }
	.-bottom-4 { bottom: -1rem; }
	.-left-4 { left: -1rem; }

	.subtitle {
		color: rgba(255, 255, 255, 0.9);
		font-size: 1.125rem;
		font-weight: 500;
		margin-top: 0.5rem;
		text-shadow: 0 2px 4px rgba(0,0,0,0.3);
	}

	.content {
		max-width: 28rem;
		margin-left: auto;
		margin-right: auto;
		position: relative;
		z-index: 1;
	}

	.stats-section {
		margin-bottom: 2rem;
	}

	.points-display {
		text-align: center;
		padding: 1.5rem;
		border-radius: 1rem;
		background: linear-gradient(135deg, #FFD700 0%, #50C878 100%);
		color: white;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
		position: relative;
		overflow: hidden;
	}

	.decoration-shine {
		position: absolute;
		top: -50%;
		left: -50%;
		width: 200%;
		height: 200%;
		background: linear-gradient(45deg,
			transparent 30%,
			rgba(255, 255, 255, 0.2) 50%,
			transparent 70%);
		animation: shine 3s ease-in-out infinite;
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

	.flex {
		display: flex;
	}

	.items-center {
		align-items: center;
	}

	.gap-2 {
		gap: 0.5rem;
	}

	.mb-2 {
		margin-bottom: 0.5rem;
	}


	.points-value {
		font-family: var(--font-heading);
		font-size: 2.5rem;
		font-weight: 800;
		line-height: 1;
		text-shadow: 0 4px 8px rgba(0,0,0,0.3);
	}

	.animate-count-up {
		animation: countUp 0.8s ease-out;
	}

	@keyframes countUp {
		0% {
			transform: scale(0.5);
			opacity: 0;
		}
		50% {
			transform: scale(1.1);
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
	}

	.rewards-section {
		margin-bottom: 2rem;
	}

	.section-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1.5rem;
		justify-content: center;
		text-align: center;
	}


	.rewards-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.5rem;
	}

	.stagger-item {
		opacity: 0;
		transform: translateY(20px);
		animation: staggerIn 0.6s ease-out forwards;
		animation-delay: var(--animation-delay, 0ms);
	}

	@keyframes staggerIn {
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.section-spacing {
		margin-bottom: 2rem;
	}

	.font-game-title {
		font-family: var(--font-heading);
		font-size: 2.5rem;
		font-weight: 800;
		text-shadow: 0 4px 8px rgba(0,0,0,0.3);
		margin: 0;
		line-height: 1.1;
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

	.font-ui-secondary {
		font-family: var(--font-body);
		font-weight: 500;
	}

	@media (min-width: 480px) {
		.rewards-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.content {
			max-width: 32rem;
		}
	}

	@media (max-width: 380px) {
		.rewards-container {
			padding-left: 0.75rem;
			padding-right: 0.75rem;
			padding-top: 1rem;
			padding-bottom: calc(88px + 1rem);
		}

		.font-game-title {
			font-size: 2rem;
		}

		.font-section-title {
			font-size: 1.25rem;
		}

		.points-value {
			font-size: 2rem;
		}

		.rewards-grid {
			gap: 1rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.particle,
		.decoration-orb,
		.decoration-shine,
		.stagger-item,
		.animate-count-up {
			animation: none;
		}

		.stagger-item {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (prefers-contrast: high) {
		.rewards-container {
			background-color: #000000;
			border: 2px solid white;
		}

		.subtitle {
			color: white;
		}

		.points-display {
			background: #333333;
			border: 2px solid white;
		}
	}
</style>