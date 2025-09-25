<script lang="ts">
	import { Clock, Star, CheckCircle, ExternalLink } from 'lucide-svelte';
	import type { Task } from '$lib/types/Tasks';

	interface Props {
		task: Task;
		onTaskClick?: (task: Task) => void;
	}

	let { task, onTaskClick }: Props = $props();

	function getDifficultyColor(difficulty: string): string {
		switch (difficulty) {
			case 'easy':
				return 'bg-green-500';
			case 'medium':
				return 'bg-yellow-500';
			case 'hard':
				return 'bg-red-500';
			default:
				return 'bg-gray-500';
		}
	}

	function getDifficultyText(difficulty: string): string {
		switch (difficulty) {
			case 'easy':
				return 'Легко';
			case 'medium':
				return 'Средне';
			case 'hard':
				return 'Сложно';
			default:
				return 'Неизвестно';
		}
	}

	function getGradientClass(difficulty: string): string {
		switch (difficulty) {
			case 'easy':
				return 'gradient-wealth';
			case 'medium':
				return 'gradient-electric';
			case 'hard':
				return 'gradient-power';
			default:
				return 'gradient-mystery';
		}
	}

	function handleCardClick() {
		if (task.status !== 'completed') {
			onTaskClick?.(task);
		}
	}

	function handleTaskAction(event: MouseEvent) {
		event.stopPropagation();
		if (task.status === 'available') {
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
	class="task-card game-card {getGradientClass(task.difficulty)}"
	class:completed={task.status === 'completed'}
	onclick={handleCardClick}
	onkeydown={handleCardKeydown}
	role="button"
	tabindex="0"
	aria-label="Задание: {task.title}"
>
	<div class="task-card-content">
		<div class="task-header">
			<div class="task-icon-wrapper">
				<span class="task-icon">{task.icon}</span>
			</div>
			<div class="task-badges">
				<span class="difficulty-badge {getDifficultyColor(task.difficulty)}">
					{getDifficultyText(task.difficulty)}
				</span>
				{#if task.status === 'completed'}
					<span class="status-badge completed">
						<CheckCircle size={12} />
						Выполнено
					</span>
				{/if}
			</div>
		</div>

		<div class="task-body">
			<h3 class="task-title">{task.title}</h3>
			<p class="task-description">{task.description}</p>

			{#if task.productName}
				<div class="product-info">
					<ExternalLink size={14} />
					<span class="product-name">{task.productName}</span>
				</div>
			{/if}
		</div>

		<div class="task-footer">
			<div class="task-meta">
				<div class="time-info">
					<Clock size={14} />
					<span>{task.estimatedTime}</span>
				</div>
				<div class="reward-info">
					<Star size={14} />
					<span class="reward-amount">+{task.reward.toLocaleString()}</span>
				</div>
			</div>

			{#if task.status === 'available'}
				<button
					type="button"
					class="task-action-btn"
					onclick={handleTaskAction}
				>
					Выполнить
				</button>
			{:else if task.status === 'completed'}
				<div class="completed-status">
					<CheckCircle size={16} />
					<span>Завершено</span>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.task-card {
		cursor: pointer;
		min-height: 200px;
		position: relative;
		transition: all 0.3s ease;
	}

	.task-card.completed {
		opacity: 0.8;
		cursor: default;
	}

	.task-card.completed::after {
		content: '';
		position: absolute;
		inset: 0;
		background: rgba(80, 200, 120, 0.2);
		backdrop-filter: blur(1px);
		border-radius: inherit;
		z-index: 1;
	}

	.task-card-content {
		position: relative;
		z-index: 2;
		height: 100%;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1.25rem;
		color: white;
	}

	.task-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
	}

	.task-icon-wrapper {
		background: rgba(255, 255, 255, 0.2);
		backdrop-filter: blur(8px);
		border: 1px solid rgba(255, 255, 255, 0.3);
		border-radius: 12px;
		padding: 0.75rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.task-icon {
		font-size: 1.5rem;
		display: block;
	}

	.task-badges {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		align-items: flex-end;
	}

	.difficulty-badge {
		padding: 0.25rem 0.75rem;
		border-radius: 12px;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: white;
		text-shadow: 0 1px 2px rgba(0,0,0,0.3);
	}

	.status-badge {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.25rem 0.75rem;
		border-radius: 12px;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.status-badge.completed {
		background: rgba(80, 200, 120, 0.3);
		color: #50C878;
		border: 1px solid rgba(80, 200, 120, 0.5);
	}

	.task-body {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.task-title {
		font-family: var(--font-heading);
		font-size: 1.125rem;
		font-weight: 700;
		line-height: 1.3;
		margin: 0;
		text-shadow: 0 2px 4px rgba(0,0,0,0.3);
	}

	.task-description {
		font-size: 0.875rem;
		line-height: 1.4;
		color: rgba(255, 255, 255, 0.9);
		margin: 0;
		flex: 1;
	}

	.product-info {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.8);
		background: rgba(255, 255, 255, 0.1);
		padding: 0.5rem;
		border-radius: 8px;
		backdrop-filter: blur(4px);
	}

	.product-name {
		font-weight: 500;
	}

	.task-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.task-meta {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.time-info,
	.reward-info {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.8);
	}

	.reward-amount {
		font-weight: 700;
		color: #FFD700;
		text-shadow: 0 1px 2px rgba(0,0,0,0.3);
	}

	.task-action-btn {
		background: rgba(255, 255, 255, 0.2);
		backdrop-filter: blur(8px);
		border: 1px solid rgba(255, 255, 255, 0.3);
		border-radius: 8px;
		color: white;
		font-size: 0.875rem;
		font-weight: 600;
		padding: 0.5rem 1rem;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.task-action-btn:hover {
		background: rgba(255, 255, 255, 0.3);
		transform: translateY(-1px);
	}

	.completed-status {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: #50C878;
		font-size: 0.875rem;
		font-weight: 600;
	}

	@media (max-width: 480px) {
		.task-card-content {
			padding: 1rem;
		}

		.task-title {
			font-size: 1rem;
		}

		.task-description {
			font-size: 0.8rem;
		}

		.task-footer {
			flex-direction: column;
			align-items: stretch;
			gap: 0.75rem;
		}

		.task-meta {
			flex-direction: row;
			justify-content: space-between;
		}

		.task-action-btn {
			width: 100%;
			justify-content: center;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.task-card {
			transition: none;
		}

		.task-action-btn:hover {
			transform: none;
		}
	}

	@media (prefers-contrast: high) {
		.task-card {
			background: #000000 !important;
			border: 2px solid white;
		}

		.task-card-content {
			color: white;
		}

		.difficulty-badge {
			background: white !important;
			color: #000000 !important;
		}
	}
</style>