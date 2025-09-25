<script lang="ts">
	import { Gamepad2, Gift, CheckSquare } from 'lucide-svelte';
	import {
		currentScreen,
		isGameCenterScreen,
		isRewardsShopScreen,
		isTasksScreen,
		navigateToGameCenter,
		navigateToRewardsShop,
		navigateToTasks
	} from '$lib/stores/navigationStore';

	const tabs = [
		{
			id: 'game-center',
			label: 'Игровой центр',
			icon: Gamepad2,
			action: navigateToGameCenter
		},
		{
			id: 'tasks',
			label: 'Задания',
			icon: CheckSquare,
			action: navigateToTasks
		},
		{
			id: 'rewards-shop',
			label: 'Магазин подарков',
			icon: Gift,
			action: navigateToRewardsShop
		}
	];

	function isTabActive(tabId: string): boolean {
		if (tabId === 'game-center') {
			return $isGameCenterScreen;
		} else if (tabId === 'tasks') {
			return $isTasksScreen;
		} else if (tabId === 'rewards-shop') {
			return $isRewardsShopScreen;
		}
		return false;
	}

	function handleTabClick(tab: typeof tabs[0]) {
		if (!isTabActive(tab.id)) {
			tab.action();
		}
	}
</script>

<div class="tab-navigation">
	{#each tabs as tab}
		<button
			type="button"
			class="tab-item"
			class:active={isTabActive(tab.id)}
			onclick={() => handleTabClick(tab)}
			aria-pressed={isTabActive(tab.id)}
		>
			<div class="tab-icon">
				<svelte:component this={tab.icon} size={20} />
			</div>
			<span class="tab-label">{tab.label}</span>
			{#if isTabActive(tab.id)}
				<div class="active-indicator"></div>
			{/if}
		</button>
	{/each}
</div>

<style>
	.tab-navigation {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: white;
		border-top: 1px solid rgb(240, 240, 240);
		display: flex;
		justify-content: center;
		padding: 8px 0 calc(8px + var(--ios-safe-area-bottom, 0px));
		z-index: 50;
		box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
	}

	.tab-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		padding: 12px 24px;
		background: none;
		border: none;
		cursor: pointer;
		transition: all 0.3s ease;
		border-radius: 12px;
		position: relative;
		flex: 1;
		max-width: 140px;
		color: var(--color-gpb-gray-600);
	}

	.tab-item:hover:not(.active) {
		background: rgba(25, 25, 239, 0.05);
		color: var(--color-gpb-violet);
		transform: translateY(-1px);
	}

	.tab-item.active {
		background: linear-gradient(135deg, var(--color-gpb-violet) 0%, var(--color-gpb-raspberry) 100%);
		color: white;
		box-shadow: 0 4px 12px rgba(25, 25, 239, 0.3);
		transform: translateY(-2px);
	}

	.tab-item.active:hover {
		box-shadow: 0 6px 16px rgba(25, 25, 239, 0.4);
		transform: translateY(-3px);
	}

	.tab-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
	}

	.tab-item.active .tab-icon {
		filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.5));
	}

	.tab-label {
		font-family: var(--font-heading);
		font-size: 12px;
		font-weight: 600;
		text-align: center;
		line-height: 1.2;
		transition: all 0.2s ease;
	}

	.tab-item.active .tab-label {
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
	}

	.active-indicator {
		position: absolute;
		top: -1px;
		left: 50%;
		transform: translateX(-50%);
		width: 24px;
		height: 3px;
		background: linear-gradient(90deg, var(--color-gpb-mint) 0%, var(--color-gpb-gold) 100%);
		border-radius: 0 0 2px 2px;
		box-shadow: 0 0 8px rgba(88, 255, 255, 0.6);
	}


	@media (max-width: 380px) {
		.tab-item {
			padding: 10px 16px;
			max-width: 120px;
		}

		.tab-label {
			font-size: 11px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.tab-item,
		.tab-icon,
		.tab-label {
			transition: none;
		}

		.tab-item:hover,
		.tab-item.active,
		.tab-item.active:hover {
			transform: none;
		}

		.tab-item.active .tab-icon {
			filter: none;
		}
	}

	@media (prefers-contrast: high) {
		.tab-navigation {
			background: #000000;
			border-top: 2px solid white;
		}

		.tab-item {
			color: white;
		}

		.tab-item.active {
			background: white;
			color: #000000;
			border: 2px solid white;
		}

		.active-indicator {
			background: white;
		}
	}
</style>