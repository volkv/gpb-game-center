<script lang="ts">
	import { Lightbulb, X, ChevronRight } from 'lucide-svelte';
	import { Button } from '$lib';

	interface Props {
		visible?: boolean;
		hint: string;
		step: number;
		onClose?: () => void;
		onNext?: () => void;
	}

	let { visible = false, hint, step, onClose, onNext }: Props = $props();

	const stepTitles = {
		1: 'Шаг 1: Первая комбинация',
		2: 'Шаг 2: Зарядка бустера',
		3: 'Шаг 3: Применение бустера'
	};

	const stepTitle = stepTitles[step as keyof typeof stepTitles] || `Шаг ${step}`;
</script>

{#if visible}
	<div class="demo-hint-overlay" role="dialog" aria-labelledby="demo-hint-title">
		<div class="demo-hint-card glass-effect">
			<div class="hint-header">
				<div class="hint-icon">
					<Lightbulb size={24} class="text-gpb-mint" />
				</div>
				<div class="hint-title-section">
					<h3 id="demo-hint-title" class="hint-title">{stepTitle}</h3>
					<div class="step-indicator">
						{#each Array(3) as _, i}
							<div class="step-dot {i + 1 === step ? 'active' : i + 1 < step ? 'completed' : ''}"></div>
						{/each}
					</div>
				</div>
				{#if onClose}
					<button
						class="close-button"
						onclick={onClose}
						aria-label="Закрыть подсказку"
					>
						<X size={20} />
					</button>
				{/if}
			</div>

			<div class="hint-content">
				<p class="hint-text">{hint}</p>
			</div>

			<div class="hint-actions">
				{#if step < 3 && onNext}
					<Button
						variant="primary"
						size="sm"
						onclick={onNext}
						class="hint-next-btn"
					>
						Понятно
						<ChevronRight size={16} class="ml-1" />
					</Button>
				{:else}
					<Button
						variant="primary"
						size="sm"
						onclick={onClose}
						class="hint-next-btn"
					>
						Готов!
					</Button>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.demo-hint-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.6);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 1rem;
		backdrop-filter: blur(4px);
		animation: overlay-appear 0.3s ease-out;
	}

	.demo-hint-card {
		background: rgba(255, 255, 255, 0.95);
		border-radius: 1rem;
		border: 1px solid rgba(255, 255, 255, 0.3);
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
		backdrop-filter: blur(20px);
		max-width: 400px;
		width: 100%;
		animation: card-slide-up 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
		overflow: hidden;
	}

	.hint-header {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		padding: 1.5rem 1.5rem 1rem;
		border-bottom: 1px solid rgba(0, 0, 0, 0.1);
	}

	.hint-icon {
		width: 48px;
		height: 48px;
		background: linear-gradient(135deg, var(--color-gpb-mint), var(--color-gpb-blue));
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		flex-shrink: 0;
		box-shadow: 0 4px 12px rgba(31, 196, 217, 0.3);
	}

	.hint-title-section {
		flex: 1;
	}

	.hint-title {
		font-family: var(--font-display);
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--color-gpb-gray-900);
		margin: 0 0 0.5rem;
		line-height: 1.3;
	}

	.step-indicator {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.step-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--color-gpb-gray-300);
		transition: all 0.3s ease;
	}

	.step-dot.active {
		background: var(--color-gpb-mint);
		transform: scale(1.25);
		box-shadow: 0 0 10px rgba(31, 196, 217, 0.4);
	}

	.step-dot.completed {
		background: var(--color-gpb-blue);
	}

	.close-button {
		background: rgba(0, 0, 0, 0.1);
		border: none;
		border-radius: 50%;
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-gpb-gray-600);
		cursor: pointer;
		transition: all 0.2s ease;
		flex-shrink: 0;
	}

	.close-button:hover {
		background: rgba(0, 0, 0, 0.15);
		color: var(--color-gpb-gray-900);
		transform: scale(1.1);
	}

	.hint-content {
		padding: 1rem 1.5rem;
	}

	.hint-text {
		font-size: 0.9rem;
		line-height: 1.5;
		color: var(--color-gpb-gray-700);
		margin: 0;
	}

	.hint-actions {
		padding: 1rem 1.5rem 1.5rem;
		display: flex;
		justify-content: flex-end;
	}

	:global(.hint-next-btn) {
		background: linear-gradient(135deg, var(--color-gpb-mint), var(--color-gpb-blue)) !important;
		border: none !important;
		color: white !important;
		font-weight: 500 !important;
		box-shadow: 0 4px 12px rgba(31, 196, 217, 0.3) !important;
		transition: all 0.2s ease !important;
	}

	:global(.hint-next-btn:hover) {
		transform: translateY(-2px) !important;
		box-shadow: 0 6px 20px rgba(31, 196, 217, 0.4) !important;
	}

	:global(.hint-next-btn:active) {
		transform: translateY(0) !important;
	}

	@keyframes overlay-appear {
		0% {
			opacity: 0;
		}
		100% {
			opacity: 1;
		}
	}

	@keyframes card-slide-up {
		0% {
			opacity: 0;
			transform: translateY(30px) scale(0.9);
		}
		100% {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	@media (max-width: 480px) {
		.demo-hint-overlay {
			padding: 0.5rem;
		}

		.demo-hint-card {
			max-width: 100%;
		}

		.hint-header {
			padding: 1rem 1rem 0.75rem;
		}

		.hint-content {
			padding: 0.75rem 1rem;
		}

		.hint-actions {
			padding: 0.75rem 1rem 1rem;
		}

		.hint-title {
			font-size: 1rem;
		}

		.hint-text {
			font-size: 0.875rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.demo-hint-overlay,
		.demo-hint-card,
		.step-dot,
		.close-button,
		:global(.hint-next-btn) {
			animation: none !important;
			transition: none !important;
		}
	}
</style>