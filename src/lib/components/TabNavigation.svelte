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
			label: 'Игры',
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
			label: 'Подарки',
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

	function handleTabClick(tab: typeof tabs[number]) {
		if (!isTabActive(tab.id)) {
			tab.action();
		}
	}
</script>

<nav class="tab-navigation" aria-label="Основная навигация">
	{#each tabs as tab}
		<button
			type="button"
			class="tab-item"
			class:active={isTabActive(tab.id)}
			onclick={() => handleTabClick(tab)}
			title={tab.label}
			aria-pressed={isTabActive(tab.id)}
			aria-current={isTabActive(tab.id) ? 'page' : undefined}
		>
			<div class="tab-icon" aria-hidden="true">
				<svelte:component this={tab.icon} size={20} stroke-width={1.8} />
			</div>
			<span class="tab-label">{tab.label}</span>
		</button>
	{/each}
</nav>

<style>
	.tab-navigation {
		position: fixed;
		bottom: 16px;
		left: 0;
		right: 0;
		margin-inline: auto;
		margin-top: auto;
		max-width: 26rem;
		padding: 0.5rem;
		display: flex;
		gap: 0.5rem;
		border-radius: var(--radius-xl);
		background-color: rgba(255, 255, 255, 0.9);
		border: 1px solid var(--color-border-muted);
		box-shadow: var(--shadow-soft);
		backdrop-filter: blur(12px);
		z-index: 40;
	}

	.tab-item {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.75rem 0.5rem;
		border-radius: var(--radius-lg);
		border: 1px solid transparent;
		background: transparent;
		color: var(--color-fg-muted);
		font-family: var(--font-sans);
		font-weight: 600;
		font-size: 0.8125rem;
		letter-spacing: 0.01em;
		transition: background-color 140ms ease, color 140ms ease, border-color 140ms ease;
	}

	.tab-item:hover:not(.active) {
		background: var(--color-neutral-50);
		color: var(--color-fg-secondary);
	}

	.tab-item:focus-visible {
		border-color: var(--layer-brand-150);
		box-shadow: var(--shadow-focus);
		outline: none;
	}

	.tab-item.active {
		background: var(--color-brand-50);
		border-color: var(--layer-brand-150);
		color: var(--color-brand-600);
	}

	.tab-item.active .tab-icon :global(svg) {
		color: var(--color-brand-600);
	}

	.tab-icon :global(svg) {
		color: var(--color-fg-muted);
		transition: color 140ms ease;
	}

	.tab-label {
		white-space: nowrap;
	}


</style>
