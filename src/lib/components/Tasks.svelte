<script lang="ts">
	import { onMount } from 'svelte';
	import { CheckSquare, Trophy, Filter } from 'lucide-svelte';
	import { tasksStore, availableTasks, completedTasks, totalTasksCompleted, totalRewardsEarned } from '$lib/stores/tasksStore';
	import { getTasksData } from '$lib/data/tasks';
	import DailyRewards from './DailyRewards.svelte';
	import TaskCard from './TaskCard.svelte';
	import TaskModal from './TaskModal.svelte';
	import StatsSection from './StatsSection.svelte';
	import type { Task } from '$lib/types/Tasks';
	import SectionHeading from './SectionHeading.svelte';

	let mounted = $state(false);
	let selectedTask = $state<Task | null>(null);
	let isModalOpen = $state(false);
	let currentFilter = $state<'all' | 'available' | 'completed'>('available');

	const statsMetrics = $derived([
		{ label: 'Выполнено заданий', value: $totalTasksCompleted, icon: CheckSquare },
		{ label: 'Баллов заработано', value: $totalRewardsEarned, icon: Trophy }
	]);

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

		<StatsSection ariaLabel="Результаты" metrics={statsMetrics} columns={2} />

		<section class="section" aria-labelledby="tasks-list-heading">
			<SectionHeading eyebrow="Список" title="Доступные задания" id="tasks-list-heading" />

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
		padding-bottom: calc(96px + 0.5rem);
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


	.section {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
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

	.hero,
	.daily {
		padding: 1.25rem;
	}

	.tasks-grid {
		grid-template-columns: 1fr;
	}

</style>
