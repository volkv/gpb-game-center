<script lang="ts">
	import { Clock, Star } from 'lucide-svelte';
	import type { Task } from '$lib/types/Tasks';

	interface Props {
		task: Task;
		onTaskClick?: (task: Task) => void;
	}

	let { task, onTaskClick }: Props = $props();

	const difficultyLabels = {
		easy: 'Легко',
		medium: 'Средне',
		hard: 'Сложно'
	} as const;

	const isCompleted = $derived(task.status === 'completed');
	const isAvailable = $derived(task.status === 'available');

	function handleCardClick() {
		if (!isCompleted) {
			onTaskClick?.(task);
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
	class="task-card"
	class:task-card--disabled={isCompleted}
	style={`--task-gradient: ${task.gradient ?? 'linear-gradient(135deg, rgba(0, 122, 195, 0.16) 0%, rgba(31, 196, 217, 0.12) 100%)'}; --task-accent: ${task.themeColor ?? 'var(--color-brand-500)'};`}
	onclick={handleCardClick}
	onkeydown={handleCardKeydown}
	role="button"
	tabindex={isCompleted ? -1 : 0}
	aria-label={`Задание: ${task.title}`}
>
	<div class="task-card__header">
		<div class="task-card__icon" aria-hidden="true">
			<span>{task.icon}</span>
		</div>
		<div class="task-card__header-content">
			<h3 class="task-card__title">{task.title}</h3>
			<p class="task-card__subtitle">{difficultyLabels[task.difficulty]} · {task.estimatedTime}</p>
		</div>
		{#if isCompleted}
			<span class="task-card__badge task-card__badge--muted">Завершено</span>
		{:else}
			<span class="task-card__badge">+{task.reward}</span>
		{/if}
	</div>

	<div class="task-card__body">
		<p class="task-card__description">{task.description}</p>
	</div>

	<div class="task-card__footer">
		<div class="task-card__meta">
			<span class="task-card__meta-item">
				<Star class="shrink-0" size={14} aria-hidden="true" />
				{task.reward.toLocaleString()} баллов
			</span>
			<span class="task-card__meta-item">
				<Clock class="shrink-0" size={14} aria-hidden="true" />
				{task.estimatedTime}
			</span>
		</div>
		<button class="task-card__button" disabled={isCompleted} onclick={handleCardClick}>
			{isCompleted ? 'Завершено' : 'Выполнить'}
		</button>
	</div>
</div>

<style>
	.task-card {
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

	.task-card::before {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
		opacity: 0.18;
		background: var(--task-gradient);
		pointer-events: none;
	}

	.task-card:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-medium);
		border-color: var(--layer-brand-150);
	}

	.task-card:focus-visible {
		outline: none;
		box-shadow: var(--shadow-focus);
	}

	.task-card--disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
		box-shadow: none;
	}

	.task-card--disabled:hover {
		transform: none;
		box-shadow: none;
	}

	.task-card__header {
		display: flex;
		align-items: flex-start;
		gap: 0.85rem;
	}

	.task-card__icon {
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

	.task-card__header-content {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		flex: 1;
		min-width: 0;
	}

	.task-card__badge {
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
		color: var(--task-accent);
	}

	.task-card__badge--muted {
		background: var(--color-neutral-100);
		color: var(--color-fg-secondary);
	}

	.task-card__title {
		margin: 0;
		font-family: var(--font-display);
		font-size: 1.05rem;
		font-weight: 600;
		line-height: 1.3;
		color: var(--color-fg-primary);
	}

	.task-card__subtitle {
		margin: 0;
		font-size: 0.8rem;
		line-height: 1.4;
		color: var(--color-fg-muted);
	}

	.task-card__body {
		display: flex;
		flex-direction: column;
	}

	.task-card__description {
		margin: 0;
		font-size: 0.875rem;
		line-height: 1.5;
		color: var(--color-fg-secondary);
	}

	.task-card__footer {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-top: auto;
	}

	.task-card__meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		font-size: 0.85rem;
		color: var(--color-fg-secondary);
	}

	.task-card__meta-item {
		display: inline-flex;
		align-items: center;
		gap: 0.75rem;
	}

	.task-card__meta :global(svg) {
		color: var(--color-fg-muted);
	}

	.task-card__button {
		width: 100%;
		padding: 0.75rem 1rem;
		border: none;
		border-radius: var(--radius-lg);
		background: var(--task-accent);
		color: white;
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
		transition: opacity 160ms ease, transform 160ms ease;
	}

	.task-card__button:hover:not(:disabled) {
		opacity: 0.9;
		transform: scale(0.98);
	}

	.task-card__button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
