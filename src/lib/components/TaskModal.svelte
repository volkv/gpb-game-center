<script lang="ts">
	import { Star, Clock, ExternalLink, CheckCircle, Award } from 'lucide-svelte';
	import { tasksStore } from '$lib/stores/tasksStore';
	import Button from './Button.svelte';
	import Modal from './Modal.svelte';
	import type { Task } from '$lib/types/Tasks';

	interface Props {
		task: Task | null;
		isOpen?: boolean;
		onClose?: () => void;
	}

	let { task, isOpen = false, onClose }: Props = $props();

	const difficultyMap = {
		easy: {
			label: 'Легкое',
			accent: 'var(--color-state-success)',
			background: 'color-mix(in srgb, var(--color-state-success) 16%, white 84%)'
		},
		medium: {
			label: 'Среднее',
			accent: 'var(--color-brand-500)',
			background: 'var(--layer-brand-100)'
		},
		hard: {
			label: 'Сложное',
			accent: 'var(--color-state-danger)',
			background: 'rgba(209, 60, 106, 0.14)'
		}
	} as const;

	const defaultDifficulty = {
		label: 'Неизвестно',
		accent: 'var(--color-fg-muted)',
		background: 'rgba(86, 97, 124, 0.14)'
	};

	const SUCCESS_CLOSE_TIMEOUT = 3000;
	let showCompletionAnimation = $state(false);
	let earnedPoints = $state(0);

	const difficultyTheme = $derived(() => {
		if (!task) return defaultDifficulty;
		return difficultyMap[task.difficulty as keyof typeof difficultyMap] ?? defaultDifficulty;
	});

	function handleCompleteTask() {
		if (!task) return;

		const reward = tasksStore.completeTask(task.id);
		if (reward > 0) {
			earnedPoints = reward;
			showCompletionAnimation = true;

			setTimeout(() => {
				showCompletionAnimation = false;
				onClose?.();
			}, SUCCESS_CLOSE_TIMEOUT);
		}
	}

	function handleOpenProduct() {
		if (task?.productUrl) {
			window.open(task.productUrl, '_blank');
		}
	}

	function handleClose() {
		if (showCompletionAnimation) return;
		onClose?.();
	}

</script>

<Modal
	open={isOpen && task !== null}
	success={showCompletionAnimation}
	showClose={!showCompletionAnimation}
	closeOnBackdrop={!showCompletionAnimation}
	closeOnEscape={!showCompletionAnimation}
	onClose={handleClose}
	size="md"
>
	{#snippet children()}
		{#if !showCompletionAnimation && task}
			<div class="task-modal-content">
				<div class="task-header">
					<div class="task-icon-large">{task.icon}</div>
					<div class="task-info">
						<h2 class="task-title">{task.title}</h2>
					<div class="task-badges">
						<span
							class="difficulty-badge"
							style={`--difficulty-accent:${difficultyTheme.accent}; --difficulty-background:${difficultyTheme.background};`}
						>
							{difficultyTheme.label}
						</span>
						<div class="reward-badge">
								<Star size={14} />
								<span>+{task.reward.toLocaleString()} баллов</span>
							</div>
						</div>
					</div>
				</div>

				<div class="task-body">
					<div class="section">
						<h3 class="section-title">Описание</h3>
						<p class="task-description">{task.fullDescription}</p>
					</div>

					{#if task.productName && task.productUrl}
						<div class="section">
							<h3 class="section-title">Продукт</h3>
							<div class="product-card">
								<div class="product-info">
								<ExternalLink size={16} />
									<span class="product-name">{task.productName}</span>
								</div>
								<Button
									variant="secondary"
									size="sm"
									onclick={handleOpenProduct}
								>
									Открыть
								</Button>
							</div>
						</div>
					{/if}

					<div class="section">
						<h3 class="section-title">Требования для выполнения</h3>
						<ul class="requirements-list">
							{#each task.requirements as requirement}
								<li class="requirement-item">
									<CheckCircle size={16} />
									<span>{requirement}</span>
								</li>
							{/each}
						</ul>
					</div>

					<div class="task-meta-info">
						<div class="meta-item">
							<Clock size={16} />
							<span>Примерное время: {task.estimatedTime}</span>
						</div>
						<div class="meta-item">
							<Award size={16} />
							<span>Награда: +{task.reward.toLocaleString()} баллов</span>
						</div>
					</div>
				</div>

				{#if task.status === 'completed'}
					<div class="completion-notice">
						<CheckCircle size={24} />
						<div>
							<h4>Задание выполнено!</h4>
							<p>Вы получили {task.reward.toLocaleString()} баллов</p>
						</div>
					</div>
				{/if}
			</div>
		{:else if showCompletionAnimation}
			<div class="success-content">
				<div class="success-icon">
					<Award size={48} />
				</div>
				<h2 class="success-title">Задание выполнено!</h2>
				<p class="success-message">
					Поздравляем! Вы получили {earnedPoints.toLocaleString()} баллов
				</p>
				<div class="success-progress" style={`--timer-duration: ${SUCCESS_CLOSE_TIMEOUT}ms;`}></div>
			</div>
		{/if}
	{/snippet}

	{#snippet footer()}
		{#if !showCompletionAnimation && task?.status === 'available'}
			<button
				type="button"
				class="btn-secondary"
				onclick={handleClose}
			>
				Отмена
			</button>
			<button
				type="button"
				class="btn-primary"
				onclick={handleCompleteTask}
			>
				Я выполнил все условия
			</button>
		{/if}
	{/snippet}
</Modal>

<style>
	.task-modal-content {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.task-header {
		display: flex;
		gap: 1rem;
		align-items: flex-start;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--color-border-subtle);
	}

	.task-icon-large {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 2.4rem;
		width: 5rem;
		height: 5rem;
		border-radius: var(--radius-xl);
		background: linear-gradient(135deg, rgba(6, 6, 152, 0.16) 0%, rgba(31, 196, 217, 0.18) 100%);
		color: var(--color-brand-600);
	}

	.task-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.task-title {
		margin: 0;
		font-family: var(--font-display);
		font-size: 1.45rem;
		font-weight: 600;
		color: var(--color-fg-primary);
		letter-spacing: -0.01em;
	}

	.task-badges {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.difficulty-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.3rem 0.75rem;
		border-radius: var(--radius-full);
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--difficulty-accent);
		background: var(--difficulty-background);
		border: 1px solid color-mix(in srgb, var(--difficulty-accent) 20%, transparent);
	}

	.reward-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.3rem 0.75rem;
		border-radius: var(--radius-full);
		background: var(--layer-brand-050);
		color: var(--color-brand-600);
		font-size: 0.78rem;
		font-weight: 600;
	}

	.task-body {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.section {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.section-title {
		margin: 0;
		font-family: var(--font-display);
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-fg-primary);
	}

	.task-description {
		margin: 0;
		font-size: 0.95rem;
		line-height: 1.6;
		color: var(--color-fg-secondary);
	}

	.product-card {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border-subtle);
		background: var(--color-neutral-50);
	}

	.product-info {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--color-fg-secondary);
	}

	.product-info :global(svg) {
		color: var(--color-brand-500);
	}

	.product-name {
		font-weight: 600;
	}

	.requirements-list {
		margin: 0;
		padding: 0;
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0.65rem;
	}

	.requirement-item {
		display: inline-flex;
		align-items: flex-start;
		gap: 0.6rem;
		color: var(--color-fg-secondary);
		font-size: 0.9rem;
	}

	.requirement-item :global(svg) {
		color: var(--color-state-success);
	}

	.task-meta-info {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 1rem;
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border-subtle);
		background: var(--color-neutral-50);
	}

	.meta-item {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.85rem;
		color: var(--color-fg-muted);
	}

	.meta-item :global(svg) {
		color: var(--color-brand-500);
	}

	.completion-notice {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem;
		border-radius: var(--radius-lg);
		border: 1px solid color-mix(in srgb, var(--color-state-success) 28%, transparent);
		background: color-mix(in srgb, var(--color-state-success) 18%, white 82%);
		color: var(--color-state-success);
	}

	.completion-notice h4 {
		margin: 0 0 0.25rem;
		font-size: 1rem;
		font-weight: 600;
	}

	.completion-notice p {
		margin: 0;
		font-size: 0.85rem;
		color: color-mix(in srgb, var(--color-state-success) 70%, white 30%);
	}

	.success-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		padding: 1.75rem 1.25rem;
		text-align: center;
	}

	.success-icon {
		width: 56px;
		height: 56px;
		border-radius: 999px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: color-mix(in srgb, var(--color-state-success) 18%, white 82%);
		border: 1px solid color-mix(in srgb, var(--color-state-success) 38%, transparent);
		color: color-mix(in srgb, var(--color-state-success) 72%, var(--color-fg-primary) 28%);
	}

	.success-title {
		margin: 0;
		font-family: var(--font-display);
		font-size: 1.25rem;
		font-weight: 600;
		color: color-mix(in srgb, var(--color-state-success) 70%, var(--color-fg-primary) 30%);
	}

	.success-message {
		margin: 0;
		font-size: 0.95rem;
		color: var(--color-fg-secondary);
	}

	.success-progress {
		position: relative;
		width: 100%;
		height: 4px;
		margin-top: 0.5rem;
		border-radius: 999px;
		background: color-mix(in srgb, var(--color-state-success) 12%, transparent);
		overflow: hidden;
		align-self: stretch;
	}

	.success-progress::after {
		content: '';
		display: block;
		width: 100%;
		height: 100%;
		background: color-mix(in srgb, var(--color-state-success) 70%, var(--color-fg-primary) 30%);
		transform-origin: left center;
		animation: success-close var(--timer-duration, 3000ms) linear forwards;
		will-change: transform;
	}

	@keyframes success-close {
		from {
			transform: scaleX(1);
		}

		to {
			transform: scaleX(0);
		}
	}

	@media (max-width: 560px) {
		.task-header {
			flex-direction: column;
			align-items: center;
		}

		.task-info {
			align-items: center;
			text-align: center;
		}

		.task-meta-info {
			gap: 0.75rem;
		}

		.meta-item {
			justify-content: center;
		}
	}
</style>
