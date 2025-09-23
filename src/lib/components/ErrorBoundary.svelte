<script lang="ts">
	import { onMount } from 'svelte';
	import { errorHandler, type AppError } from '$lib/utils/errorHandler.js';
	import Button from './Button.svelte';

	let { children } = $props();

	let hasError = $state(false);
	let error: AppError | null = $state(null);
	let mounted = $state(false);

	onMount(() => {
		mounted = true;
		
		const handleError = (appError: AppError) => {
			if (appError.severity === 'critical' || appError.code === 'COMPONENT_ERROR') {
				hasError = true;
				error = appError;
			}
		};

		errorHandler.addHandler(handleError);

		return () => {
			errorHandler.removeHandler(handleError);
		};
	});

	function handleRetry() {
		hasError = false;
		error = null;
	}

	function handleReload() {
		window.location.reload();
	}
</script>

{#if hasError && error}
	<div class="error-boundary">
		<div class="error-content">
			<div class="error-icon">
				<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<circle cx="12" cy="12" r="10"/>
					<line x1="12" y1="8" x2="12" y2="12"/>
					<line x1="12" y1="16" x2="12.01" y2="16"/>
				</svg>
			</div>
			
			<h2 class="error-title">Что-то пошло не так</h2>
			
			<p class="error-message">
				Произошла ошибка при загрузке приложения. Попробуйте обновить страницу или повторите попытку позже.
			</p>

			{#if import.meta.env.DEV}
				<details class="error-details">
					<summary>Техническая информация</summary>
					<pre>{JSON.stringify(error, null, 2)}</pre>
				</details>
			{/if}

			<div class="error-actions">
				<Button variant="primary" onclick={handleRetry}>
					Попробовать снова
				</Button>
				<Button variant="secondary" onclick={handleReload}>
					Обновить страницу
				</Button>
			</div>
		</div>
	</div>
{:else if mounted}
	{@render children?.()}
{:else}
	<div class="loading-fallback">
		<div class="loading-spinner"></div>
		<p>Загрузка...</p>
	</div>
{/if}

<style>
	.error-boundary {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		padding: 2rem;
		background: linear-gradient(to bottom, #ffffff 0%, var(--color-gpb-lily) 100%);
	}

	.error-content {
		max-width: 400px;
		text-align: center;
		background: white;
		padding: 2rem;
		border-radius: 1rem;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
	}

	.error-icon {
		color: var(--color-gpb-raspberry, #ef4444);
		margin-bottom: 1.5rem;
	}

	.error-title {
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--color-gpb-black, #1f2937);
		margin-bottom: 1rem;
	}

	.error-message {
		color: var(--color-gpb-henbane, #6b7280);
		margin-bottom: 2rem;
		line-height: 1.5;
	}

	.error-details {
		margin-bottom: 2rem;
		text-align: left;
	}

	.error-details summary {
		cursor: pointer;
		color: var(--color-gpb-violet, #6366f1);
		margin-bottom: 0.5rem;
	}

	.error-details pre {
		background: #f3f4f6;
		padding: 1rem;
		border-radius: 0.5rem;
		overflow-x: auto;
		font-size: 0.75rem;
		white-space: pre-wrap;
	}

	.error-actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	.loading-fallback {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		gap: 1rem;
	}

	.loading-spinner {
		width: 40px;
		height: 40px;
		border: 3px solid #f3f4f6;
		border-top: 3px solid var(--color-gpb-violet, #6366f1);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	@media (max-width: 480px) {
		.error-content {
			margin: 1rem;
			padding: 1.5rem;
		}

		.error-actions {
			flex-direction: column;
		}
	}
</style>
