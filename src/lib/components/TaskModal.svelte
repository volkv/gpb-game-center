<script lang="ts">
	import { Star, Clock, ExternalLink, CheckCircle, Award, X } from 'lucide-svelte';
	import { fade } from 'svelte/transition';
	import { tasksStore } from '$lib/stores/tasksStore';
	import Button from './Button.svelte';
	import type { Task } from '$lib/types/Tasks';

	interface Props {
		task: Task | null;
		isOpen?: boolean;
		onClose?: () => void;
	}

	let { task, isOpen = false, onClose }: Props = $props();

	let showCompletionAnimation = $state(false);
	let earnedPoints = $state(0);

	function handleCompleteTask() {
		if (!task) return;

		const reward = tasksStore.completeTask(task.id);
		if (reward > 0) {
			earnedPoints = reward;
			showCompletionAnimation = true;

			setTimeout(() => {
				showCompletionAnimation = false;
				onClose?.();
			}, 3000);
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

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			handleClose();
		}
	}

	function getDifficultyColor(difficulty: string): string {
		switch (difficulty) {
			case 'easy':
				return 'text-green-400';
			case 'medium':
				return 'text-yellow-400';
			case 'hard':
				return 'text-red-400';
			default:
				return 'text-gray-400';
		}
	}

	function getDifficultyText(difficulty: string): string {
		switch (difficulty) {
			case 'easy':
				return 'Легкое';
			case 'medium':
				return 'Среднее';
			case 'hard':
				return 'Сложное';
			default:
				return 'Неизвестно';
		}
	}
</script>

{#if isOpen && task}
	<div
		class="modal-backdrop"
		transition:fade={{ duration: 200 }}
		onclick={handleBackdropClick}
		onkeydown={(e) => e.key === 'Escape' && handleClose()}
		role="dialog"
		aria-modal="true"
		aria-labelledby="modal-title"
		tabindex="-1"
	>
		<div class="modal-content" class:success={showCompletionAnimation}>
			{#if !showCompletionAnimation}
				<div class="modal-header">
					<button
						type="button"
						class="close-button"
						onclick={handleClose}
						aria-label="Закрыть"
					>
						<X size={20} />
					</button>
				</div>

				<div class="modal-body">
					<div class="task-modal-content">
			<div class="task-header">
				<div class="task-icon-large">{task.icon}</div>
				<div class="task-info">
					<h2 class="task-title">{task.title}</h2>
					<div class="task-badges">
						<span class="difficulty-badge {getDifficultyColor(task.difficulty)}">
							{getDifficultyText(task.difficulty)}
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
								<ExternalLink size={16} class="text-gpb-violet" />
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
								<CheckCircle size={16} class="text-green-500" />
								<span>{requirement}</span>
							</li>
						{/each}
					</ul>
				</div>

				<div class="task-meta-info">
					<div class="meta-item">
						<Clock size={16} class="text-gpb-gray-500" />
						<span>Примерное время: {task.estimatedTime}</span>
					</div>
					<div class="meta-item">
						<Award size={16} class="text-gpb-gold" />
						<span>Награда: +{task.reward.toLocaleString()} баллов</span>
					</div>
				</div>
			</div>

				{#if task.status === 'available'}
					<div class="modal-footer">
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
					</div>
				{:else if task.status === 'completed'}
					<div class="completion-notice">
						<CheckCircle size={24} class="text-green-500" />
						<div>
							<h4>Задание выполнено!</h4>
							<p>Вы получили {task.reward.toLocaleString()} баллов</p>
						</div>
					</div>
				{/if}
				</div>
			{:else}
				<div class="success-content">
					<div class="success-icon">
						<Award size={48} />
					</div>
					<h2 class="success-title">Задание выполнено!</h2>
					<p class="success-message">
						Поздравляем! Вы получили {earnedPoints.toLocaleString()} баллов
					</p>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 1rem;
		backdrop-filter: blur(4px);
		-webkit-backdrop-filter: blur(4px);
	}

	.modal-content {
		background: white;
		border-radius: 1.5rem;
		max-width: 500px;
		width: 100%;
		max-height: 90vh;
		overflow-y: auto;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
		position: relative;
		transform: scale(0.95);
		animation: modalEnter 0.2s ease-out forwards;
	}

	.modal-content.success {
		background: linear-gradient(135deg, var(--color-gpb-emerald) 0%, #45b369 100%);
		color: white;
	}

	@keyframes modalEnter {
		to {
			transform: scale(1);
		}
	}

	.modal-header {
		padding: 1.5rem 1.5rem 0;
		display: flex;
		justify-content: flex-end;
	}

	.close-button {
		background: none;
		border: none;
		padding: 0.5rem;
		border-radius: 50%;
		cursor: pointer;
		color: var(--color-gpb-gray-600);
		transition: all 0.2s ease;
	}

	.close-button:hover {
		background: var(--color-gpb-gray-100);
		color: var(--color-gpb-gray-800);
	}

	.modal-body {
		padding: 0 1.5rem 1.5rem;
	}

	.task-modal-content {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.task-header {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		margin-bottom: 1.5rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid rgba(75, 85, 99, 0.2);
	}

	.task-icon-large {
		font-size: 2.5rem;
		width: 5rem;
		height: 5rem;
		border-radius: 50%;
		background: linear-gradient(135deg, var(--color-gpb-violet) 0%, var(--color-gpb-raspberry) 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		line-height: 1;
	}

	.task-info {
		flex: 1;
	}

	.task-title {
		font-family: var(--font-heading);
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--color-gpb-black);
		margin: 0 0 1rem 0;
		line-height: 1.2;
	}

	.task-badges {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.difficulty-badge {
		padding: 0.25rem 0.75rem;
		border-radius: 12px;
		background: rgba(75, 85, 99, 0.1);
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.reward-badge {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.25rem 0.75rem;
		border-radius: 12px;
		background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
		color: white;
		font-size: 0.75rem;
		font-weight: 600;
		text-shadow: 0 1px 2px rgba(0,0,0,0.3);
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
		font-family: var(--font-heading);
		font-size: 1rem;
		font-weight: 600;
		color: rgb(55, 65, 81);
		margin: 0;
	}

	.task-description {
		color: rgb(75, 85, 99);
		line-height: 1.6;
		margin: 0;
	}

	.product-card {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem;
		background: rgba(25, 25, 239, 0.05);
		border: 1px solid rgba(25, 25, 239, 0.1);
		border-radius: 12px;
		gap: 1rem;
	}

	.product-info {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex: 1;
	}

	.product-name {
		font-weight: 500;
		color: rgb(55, 65, 81);
	}

	.requirements-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.requirement-item {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		color: rgb(75, 85, 99);
		line-height: 1.5;
	}

	.task-meta-info {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 1rem;
		background: rgba(249, 250, 251, 1);
		border-radius: 12px;
		border: 1px solid rgba(229, 231, 235, 1);
	}

	.meta-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: rgb(75, 85, 99);
	}

	.modal-footer {
		padding: 1.5rem;
		border-top: 1px solid var(--color-gpb-gray-200);
		display: flex;
		gap: 1rem;
	}

	.btn-secondary,
	.btn-primary {
		flex: 1;
		padding: 0.875rem 1rem;
		border: none;
		border-radius: 0.75rem;
		font-family: var(--font-heading);
		font-size: 0.9375rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.btn-secondary {
		background: var(--color-gpb-gray-100);
		color: var(--color-gpb-gray-700);
	}

	.btn-secondary:hover:not(:disabled) {
		background: var(--color-gpb-gray-200);
	}

	.btn-primary {
		background: linear-gradient(135deg, var(--color-gpb-emerald) 0%, #45b369 100%);
		color: white;
		box-shadow: 0 4px 12px rgba(80, 200, 120, 0.3);
	}

	.btn-primary:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 6px 16px rgba(80, 200, 120, 0.4);
	}

	.btn-secondary:disabled,
	.btn-primary:disabled {
		opacity: 0.7;
		cursor: not-allowed;
		transform: none;
	}

	.completion-notice {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		background: rgba(16, 185, 129, 0.1);
		border: 1px solid rgba(16, 185, 129, 0.2);
		border-radius: 12px;
		margin-top: 1rem;
	}

	.completion-notice h4 {
		margin: 0 0 0.25rem 0;
		font-weight: 600;
		color: rgb(5, 150, 105);
	}

	.completion-notice p {
		margin: 0;
		font-size: 0.875rem;
		color: rgb(6, 78, 59);
	}

	.success-content {
		padding: 2rem;
		text-align: center;
	}

	.success-icon {
		margin: 0 auto 1rem;
		color: white;
		opacity: 0;
		animation: successIconEnter 0.5s ease-out 0.3s forwards;
	}

	.success-title {
		font-family: var(--font-heading);
		font-size: 1.5rem;
		font-weight: 700;
		margin: 0 0 0.75rem;
		color: white;
		opacity: 0;
		animation: successTextEnter 0.5s ease-out 0.6s forwards;
	}

	.success-message {
		font-family: var(--font-body);
		font-size: 1rem;
		line-height: 1.4;
		margin: 0;
		color: rgba(255, 255, 255, 0.9);
		opacity: 0;
		animation: successTextEnter 0.5s ease-out 0.9s forwards;
	}

	@keyframes successIconEnter {
		to {
			opacity: 1;
			transform: scale(1.1) rotate(10deg);
		}
	}

	@keyframes successTextEnter {
		to {
			opacity: 1;
		}
	}

	@media (max-width: 480px) {
		.modal-backdrop {
			padding: 0.5rem;
		}

		.modal-content {
			border-radius: 1rem;
		}

		.modal-header,
		.modal-body,
		.modal-footer {
			padding: 1rem;
		}

		.task-icon-large {
			width: 4rem;
			height: 4rem;
			font-size: 2rem;
		}

		.task-title {
			font-size: 1.25rem;
		}

		.task-header {
			flex-direction: column;
			text-align: center;
			align-items: center;
		}

		.task-badges {
			justify-content: center;
		}

		.success-content {
			padding: 1.5rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.modal-content {
			animation: none;
			transform: scale(1);
		}

		.success-icon,
		.success-title,
		.success-message {
			animation: none;
			opacity: 1;
		}

		.btn-primary:hover {
			transform: none;
		}
	}
</style>