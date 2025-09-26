<script lang="ts">
	import { onMount } from 'svelte';
	import { CheckSquare, Trophy, Filter } from 'lucide-svelte';
	import { tasksStore, availableTasks, completedTasks, totalTasksCompleted, totalRewardsEarned } from '$lib/stores/tasksStore';
	import { getTasksData } from '$lib/data/tasks';
	import DailyRewards from './DailyRewards.svelte';
	import TaskCard from './TaskCard.svelte';
	import TaskModal from './TaskModal.svelte';
	import type { Task } from '$lib/types/Tasks';

	let mounted = $state(false);
	let selectedTask = $state<Task | null>(null);
	let isModalOpen = $state(false);
	let currentFilter = $state<'all' | 'available' | 'completed'>('available');

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

	onMount(() => {
		tasksStore.initializeTasks(getTasksData());
		mounted = true;
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

{#if mounted}
	<main class="tasks">
		<section class="hero surface-contrast" aria-labelledby="tasks-title">
			<div class="hero-copy">
				<p class="hero-eyebrow">Повышайте активность</p>
				<h1 class="hero-title" id="tasks-title">Задания</h1>
				<p class="hero-subtitle text-balance">
					Выполняйте задания, проходите игры и накапливайте баллы для обмена на привилегии.
				</p>
			</div>
		</section>

		<section class="daily surface-card" aria-label="Ежедневные награды">
			<DailyRewards />
		</section>

		<section class="stats surface-card" aria-label="Результаты">
			<div class="stats-grid">
				<div class="metric-card">
					<CheckSquare size={18} aria-hidden="true" />
					<div>
						<span class="metric-card__label">Выполнено заданий</span>
						<span class="metric-card__value">{$totalTasksCompleted}</span>
					</div>
				</div>
				<div class="metric-card">
					<Trophy size={18} aria-hidden="true" />
					<div>
						<span class="metric-card__label">Баллов заработано</span>
						<span class="metric-card__value">{$totalRewardsEarned.toLocaleString()}</span>
					</div>
				</div>
			</div>
		</section>

		<section class="section" aria-labelledby="tasks-list-heading">
			<div class="section-heading section-heading--split">
				<div>
					<p class="section-heading__eyebrow">Список</p>
					<h2 class="section-heading__title" id="tasks-list-heading">Доступные задания</h2>
				</div>
				<div class="filter-controls">
					<Filter size={16} aria-hidden="true" />
					<select
						bind:value={currentFilter}
						class="filter-select"
						aria-label={`Фильтр заданий: ${getFilterLabel(currentFilter)}`}
					>
						<option value="all">Все ({$availableTasks.length + $completedTasks.length})</option>
						<option value="available">Доступные ({$availableTasks.length})</option>
						<option value="completed">Выполненные ({$completedTasks.length})</option>
					</select>
				</div>
			</div>

			<div class="tasks-grid" role="list">
				{#each filteredTasks() as task (task.id)}
					<div class="tasks-grid__item" role="listitem">
						<TaskCard {task} onTaskClick={handleTaskClick} />
					</div>
				{/each}
			</div>

			{#if filteredTasks().length === 0}
				<div class="empty-state">
					<div class="empty-icon" aria-hidden="true">📋</div>
					<h3 class="empty-title">Нет заданий для отображения</h3>
					<p class="empty-description">
						{#if currentFilter === 'available'}
							Все активные задания выполнены. Загляните позже.
						{:else if currentFilter === 'completed'}
							Вы ещё не завершили ни одного задания.
						{:else}
							Новые задания появятся в ближайшее время.
						{/if}
					</p>
				</div>
			{/if}
		</section>
	</main>
{/if}

<TaskModal
	task={selectedTask}
	isOpen={isModalOpen}
	onClose={handleModalClose}
/>

<style>
	.tasks {
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
		max-width: 32rem;
		margin: 0;
	}

	.daily {
		padding: 1.5rem;
	}

	.stats {
		padding: 1.5rem;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
	}

	.metric-card {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border-subtle);
		padding: 1rem;
		background: linear-gradient(135deg, rgba(6, 6, 152, 0.1) 0%, rgba(31, 196, 217, 0.06) 100%);
	}

	.metric-card:nth-child(2) {
		background: linear-gradient(135deg, rgba(31, 196, 217, 0.12) 0%, rgba(6, 6, 152, 0.05) 100%);
	}

	.metric-card :global(svg) {
		color: var(--color-brand-600);
	}

	.metric-card__label {
		display: block;
		font-size: 0.75rem;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--color-fg-muted);
	}

	.metric-card__value {
		font-family: var(--font-display);
		font-size: 1.4rem;
		font-weight: 600;
	}

	.section {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.section-heading--split {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.filter-controls {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.35rem 0.6rem;
		border-radius: var(--radius-full);
		background: var(--color-neutral-100);
		border: 1px solid var(--color-border-subtle);
		color: var(--color-fg-secondary);
	}

	.filter-controls :global(svg) {
		color: var(--color-fg-muted);
	}

	.filter-select {
		background: transparent;
		border: none;
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--color-fg-primary);
		appearance: none;
		padding: 0;
		cursor: pointer;
	}

	.filter-select:focus-visible {
		outline: none;
	}

	.tasks-grid {
		display: grid;
		gap: 1rem;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
	}

	.tasks-grid__item {
		list-style: none;
	}

	.empty-state {
		padding: 2.5rem 1.5rem;
		text-align: center;
		border-radius: var(--radius-lg);
		border: 1px dashed var(--color-border-muted);
		background: var(--color-neutral-50);
	}

	.empty-icon {
		font-size: 2rem;
		margin-bottom: 0.5rem;
	}

	.empty-title {
		margin: 0 0 0.5rem;
		font-family: var(--font-display);
		font-size: 1.1rem;
		color: var(--color-fg-primary);
	}

	.empty-description {
		margin: 0;
		font-size: 0.9rem;
		color: var(--color-fg-muted);
	}

	@media (max-width: 540px) {
		.hero,
		.daily,
		.stats {
			padding: 1.25rem;
		}

		.tasks-grid {
			grid-template-columns: 1fr;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.metric-card,
		.filter-controls {
			transition: none;
		}
	}
</style>
