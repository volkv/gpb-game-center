<script lang="ts">
	import { Clock, Star, CheckCircle, ExternalLink } from 'lucide-svelte';
	import type { Task } from '$lib/types/Tasks';

	interface Props {
		task: Task;
		onTaskClick?: (task: Task) => void;
	}

	let { task, onTaskClick }: Props = $props();

	const difficultyTokens = {
		easy: {
			label: 'Легко',
			accent: 'var(--color-accent-500)',
			background: 'var(--layer-mint-080)'
		},
		medium: {
			label: 'Средне',
			accent: 'var(--color-brand-500)',
			background: 'var(--layer-brand-100)'
		},
		hard: {
			label: 'Сложно',
			accent: 'var(--color-state-danger)',
			background: 'rgba(209, 60, 106, 0.14)'
		}
	} as const;

	const difficulty = $derived(() => {
		const token = difficultyTokens[task.difficulty as keyof typeof difficultyTokens];
		return token ?? {
			label: 'Неизвестно',
			accent: 'var(--color-fg-muted)',
			background: 'rgba(86, 97, 124, 0.14)'
		};
	});

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

	function handleTaskAction(event: MouseEvent) {
		event.stopPropagation();
		if (isAvailable) {
			onTaskClick?.(task);
		}
	}
</script>

<div
	class="task-card"
	class:task-card--completed={isCompleted}
	onclick={handleCardClick}
	onkeydown={handleCardKeydown}
	role="button"
	tabindex={isCompleted ? -1 : 0}
	aria-label={`Задание: ${task.title}`}
>
	<header class="task-card__header">
		<div class="task-card__icon" aria-hidden="true">
			<span>{task.icon}</span>
		</div>
		<div class="task-card__badges">
			<span
				class="task-card__badge"
				style={`--badge-accent: ${difficulty().accent}; --badge-background: ${difficulty().background};`}
			>
				{difficulty().label}
			</span>
			{#if isCompleted}
				<span class="task-card__badge task-card__badge--completed">
					<CheckCircle size={12} aria-hidden="true" />
					Завершено
				</span>
			{/if}
		</div>
	</header>

	<div class="task-card__body">
		<h3 class="task-card__title">{task.title}</h3>
		<p class="task-card__description text-balance">{task.description}</p>

		<!-- {#if task.productName}
			<span class="task-card__product">
				<ExternalLink size={14} aria-hidden="true" />
				{task.productName}
			</span>
		{/if} -->
	</div>

	<footer class="task-card__footer">
		<div class="task-card__meta">
			<span class="task-card__meta-item">
				<Clock size={14} aria-hidden="true" />
				{task.estimatedTime}
			</span>
			<span class="task-card__meta-item">
				<Star size={14} aria-hidden="true" />
				+{task.reward.toLocaleString()}
			</span>
		</div>

		{#if isAvailable}
			<button type="button" class="task-card__action" onclick={handleTaskAction}>
				Выполнить
			</button>
		{:else if isCompleted}
			<div class="task-card__status">
				<CheckCircle size={16} aria-hidden="true" />
				<span>Готово</span>
			</div>
		{/if}
	</footer>
</div>

<style>
	.task-card {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		padding: 1.5rem;
		border-radius: var(--radius-xl);
		border: 1px solid var(--color-border-muted);
		background: var(--color-surface-card);
		box-shadow: var(--shadow-soft);
		transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
		cursor: pointer;
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

	.task-card--completed {
		opacity: 0.72;
		cursor: default;
		transform: none;
	}

	.task-card__header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
	}

	.task-card__icon {
		width: 48px;
		height: 48px;
		border-radius: var(--radius-lg);
		background: var(--layer-brand-050);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.5rem;
	}

	.task-card__badges {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		align-items: flex-end;
	}

	.task-card__badge {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		padding: 0.3rem 0.7rem;
		border-radius: var(--radius-full);
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		background: var(--badge-background);
		color: var(--badge-accent);
	}

	.task-card__badge--completed {
		background: color-mix(in srgb, var(--color-state-success) 18%, white 82%);
		color: var(--color-state-success);
		border: 1px solid color-mix(in srgb, var(--color-state-success) 32%, transparent);
	}

	.task-card__body {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.task-card__title {
		margin: 0;
		font-family: var(--font-display);
		font-size: 1.15rem;
		font-weight: 600;
		color: var(--color-fg-primary);
	}

	.task-card__description {
		margin: 0;
		font-size: 0.9rem;
		color: var(--color-fg-secondary);
	}


	.task-card__footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.task-card__meta {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
		color: var(--color-fg-muted);
		font-size: 0.8rem;
	}

	.task-card__meta-item {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
	}

	.task-card__action {
		padding: 0.6rem 1.1rem;
		border-radius: var(--radius-lg);
		border: 1px solid transparent;
		background: linear-gradient(135deg, var(--color-brand-600) 0%, var(--color-brand-500) 100%);
		color: var(--color-fg-inverse);
		font-family: var(--font-display);
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
		transition: background-color 160ms ease, transform 160ms ease, box-shadow 160ms ease;
	}

	.task-card__action:hover {
		transform: translateY(-1px);
		box-shadow: var(--shadow-soft);
		background: linear-gradient(135deg, var(--color-brand-700) 0%, var(--color-brand-500) 100%);
	}

	.task-card__action:focus-visible {
		outline: none;
		box-shadow: var(--shadow-focus);
	}

	.task-card__status {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--color-state-success);
	}

	.task-card {
		padding: 1.25rem;
	}

	.task-card__footer {
		flex-direction: column;
		align-items: stretch;
		gap: 0.75rem;
	}

	.task-card__action {
		width: 100%;
	}

</style>
