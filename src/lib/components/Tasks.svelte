<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { CheckSquare, Trophy, Filter } from 'lucide-svelte';
	import { tasksStore, availableTasks, completedTasks, totalTasksCompleted, totalRewardsEarned } from '$lib/stores/tasksStore';
	import { getTasksData } from '$lib/data/tasks';
	import DailyRewards from './DailyRewards.svelte';
	import TaskCard from './TaskCard.svelte';
	import TaskModal from './TaskModal.svelte';
	import type { Task } from '$lib/types/Tasks';

	let mounted = $state(false);
	let showContent = $state(false);
	let showDailyRewardsSection = $state(false);
	let showStatsSection = $state(false);
	let showTasksSection = $state(false);

	let selectedTask = $state<Task | null>(null);
	let isModalOpen = $state(false);

	let currentFilter = $state<'all' | 'available' | 'completed'>('available');

	$effect(() => {
		const filteredTasks = currentFilter === 'all'
			? [...$availableTasks, ...$completedTasks]
			: currentFilter === 'available'
				? $availableTasks
				: $completedTasks;
	});

	const filteredTasks = $derived(() => {
		switch (currentFilter) {
			case 'all':
				return [...$availableTasks, ...$completedTasks];
			case 'available':
				return $availableTasks;
			case 'completed':
				return $completedTasks;
			default:
				return $availableTasks;
		}
	});

	onMount(async () => {
		const tasks = getTasksData();
		tasksStore.initializeTasks(tasks);
		mounted = true;

		setTimeout(() => {
			showContent = true;
		}, 100);

		setTimeout(() => {
			showDailyRewardsSection = true;
		}, 200);

		setTimeout(() => {
			showStatsSection = true;
		}, 400);

		setTimeout(() => {
			showTasksSection = true;
		}, 600);
	});

	function handleTaskClick(task: Task) {
		selectedTask = task;
		isModalOpen = true;
	}

	function handleModalClose() {
		isModalOpen = false;
		selectedTask = null;
	}

	function getFilterLabel(filter: string): string {
		switch (filter) {
			case 'all':
				return 'Все';
			case 'available':
				return 'Доступные';
			case 'completed':
				return 'Выполненные';
			default:
				return 'Все';
		}
	}
</script>

<main class="tasks-container">
	<div class="particles-container">
		<div class="particle" style="left: 10%; top: 15%; animation-delay: 0s;"></div>
		<div class="particle" style="left: 90%; top: 25%; animation-delay: 1.2s;"></div>
		<div class="particle" style="left: 20%; top: 75%; animation-delay: 0.6s;"></div>
		<div class="particle" style="left: 80%; top: 85%; animation-delay: 1.8s;"></div>
	</div>

	{#if mounted}
		<header class="header" in:fade={{ duration: 600 }}>
			<div class="decoration-orb bg-gpb-mint w-20 h-20 -top-6 -right-6"></div>
			<div class="decoration-orb bg-gpb-raspberry w-14 h-14 -bottom-3 -left-3"></div>
			<h1 class="font-game-title" id="main-title">
				Задания
			</h1>
			<p class="subtitle font-ui-secondary" aria-describedby="main-title">
				Выполняйте задания и получайте баллы
			</p>
		</header>
	{/if}

	{#if showContent}
		<div class="content">
			{#if showDailyRewardsSection}
				<section class="daily-rewards-wrapper section-spacing">
					<DailyRewards />
				</section>
			{/if}

			{#if showStatsSection}
				<section class="stats-section section-spacing stagger-item" style="--animation-delay: 200ms;">
					<div class="stats-grid">
						<div class="stat-card">
							<div class="stat-icon">
								<CheckSquare size={24} class="text-gpb-violet" />
							</div>
							<div class="stat-content">
								<div class="stat-value">{$totalTasksCompleted}</div>
								<div class="stat-label">Выполнено заданий</div>
							</div>
						</div>
						<div class="stat-card">
							<div class="stat-icon">
								<Trophy size={24} class="text-gpb-gold" />
							</div>
							<div class="stat-content">
								<div class="stat-value">{$totalRewardsEarned.toLocaleString()}</div>
								<div class="stat-label">Баллов заработано</div>
							</div>
						</div>
					</div>
				</section>
			{/if}

			{#if showTasksSection}
				<section class="tasks-section section-spacing stagger-item" style="--animation-delay: 300ms;">
					<div class="section-header">
						<div class="section-title-wrapper">
							<CheckSquare size={24} class="text-gpb-violet" style="filter: drop-shadow(0 0 8px currentColor);" />
							<h2 class="font-section-title">Доступные задания</h2>
						</div>

						<div class="filter-controls">
							<Filter size={16} class="text-gpb-gray-500" />
							<select
								bind:value={currentFilter}
								class="filter-select"
								aria-label="Фильтр заданий"
							>
								<option value="all">Все ({$availableTasks.length + $completedTasks.length})</option>
								<option value="available">Доступные ({$availableTasks.length})</option>
								<option value="completed">Выполненные ({$completedTasks.length})</option>
							</select>
						</div>
					</div>

					<div class="tasks-grid">
						{#each filteredTasks() as task, index}
							<div class="stagger-item" style="--animation-delay: {400 + index * 100}ms;">
								<TaskCard {task} onTaskClick={handleTaskClick} />
							</div>
						{/each}
					</div>

					{#if filteredTasks().length === 0}
						<div class="empty-state">
							<div class="empty-icon">📋</div>
							<h3 class="empty-title">Пока нет заданий</h3>
							<p class="empty-description">
								{#if currentFilter === 'available'}
									Все доступные задания уже выполнены!
								{:else if currentFilter === 'completed'}
									Пока не выполнено ни одного задания.
								{:else}
									Задания скоро появятся.
								{/if}
							</p>
						</div>
					{/if}
				</section>
			{/if}
		</div>
	{/if}
</main>

<TaskModal
	task={selectedTask}
	isOpen={isModalOpen}
	onClose={handleModalClose}
/>

<style>
	.tasks-container {
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

	.w-20 { width: 5rem; }
	.h-20 { height: 5rem; }
	.w-14 { width: 3.5rem; }
	.h-14 { height: 3.5rem; }
	.-top-6 { top: -1.5rem; }
	.-right-6 { right: -1.5rem; }
	.-bottom-3 { bottom: -0.75rem; }
	.-left-3 { left: -0.75rem; }

	.subtitle {
		color: rgba(255, 255, 255, 0.9);
		font-size: 1.125rem;
		font-weight: 500;
		margin-top: 0.5rem;
		text-shadow: 0 2px 4px rgba(0,0,0,0.3);
	}

	.content {
		max-width: 56rem;
		margin-left: auto;
		margin-right: auto;
		position: relative;
		z-index: 1;
	}

	.daily-rewards-wrapper {
		margin-bottom: 2rem;
	}

	.stats-section {
		margin-bottom: 2rem;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
	}

	.stat-card {
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(8px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 1rem;
		padding: 1.5rem;
		display: flex;
		align-items: center;
		gap: 1rem;
		transition: all 0.3s ease;
	}

	.stat-card:hover {
		background: rgba(255, 255, 255, 0.15);
		transform: translateY(-2px);
	}

	.stat-icon {
		background: rgba(255, 255, 255, 0.2);
		border-radius: 12px;
		padding: 0.75rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.stat-content {
		flex: 1;
	}

	.stat-value {
		font-family: var(--font-heading);
		font-size: 1.75rem;
		font-weight: 800;
		line-height: 1;
		text-shadow: 0 2px 4px rgba(0,0,0,0.3);
		margin-bottom: 0.25rem;
	}

	.stat-label {
		font-size: 0.875rem;
		color: rgba(255, 255, 255, 0.8);
	}

	.tasks-section {
		margin-bottom: 2rem;
	}

	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1.5rem;
		gap: 1rem;
	}

	.section-title-wrapper {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.filter-controls {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.filter-select {
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(8px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 8px;
		color: white;
		padding: 0.5rem 0.75rem;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.filter-select:focus {
		outline: none;
		background: rgba(255, 255, 255, 0.15);
		border-color: rgba(255, 255, 255, 0.4);
	}

	.filter-select option {
		background: #1919EF;
		color: white;
	}

	.tasks-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1rem;
	}

	.empty-state {
		text-align: center;
		padding: 3rem 1rem;
		color: rgba(255, 255, 255, 0.8);
	}

	.empty-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
		opacity: 0.6;
	}

	.empty-title {
		font-family: var(--font-heading);
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0 0 0.5rem 0;
		color: white;
	}

	.empty-description {
		font-size: 0.875rem;
		line-height: 1.5;
		margin: 0;
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


	@media (min-width: 768px) {
		.content {
			max-width: 64rem;
		}
	}

	@media (min-width: 1024px) {
		.content {
			max-width: 80rem;
		}
	}

	@media (max-width: 480px) {
		.tasks-container {
			padding-left: 0.75rem;
			padding-right: 0.75rem;
			padding-top: 1rem;
			padding-bottom: calc(88px + 1rem);
		}

		.section-header {
			flex-direction: column;
			align-items: stretch;
			gap: 1rem;
		}

		.section-title-wrapper {
			justify-content: center;
		}

		.filter-controls {
			justify-content: center;
		}

		.tasks-grid {
			gap: 0.75rem;
		}

		.stats-grid {
			grid-template-columns: 1fr;
		}

		.font-game-title {
			font-size: 2rem;
		}

		.font-section-title {
			font-size: 1.25rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.particle,
		.decoration-orb,
		.stagger-item {
			animation: none;
		}

		.stat-card:hover {
			transform: none;
		}

		.stagger-item {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (prefers-contrast: high) {
		.tasks-container {
			background-color: #000000;
			border: 2px solid white;
		}

		.subtitle {
			color: white;
		}

		.stat-card,
		.filter-select {
			background: #333333;
			border: 2px solid white;
		}
	}
</style>