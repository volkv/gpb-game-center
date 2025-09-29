<script lang="ts">
	import { Button } from '$lib';

	interface GameLoadError {
		message: string;
		retryCount: number;
		timestamp: number;
	}

	interface Props {
		loadingError: string;
		isOfflineError: boolean;
		isOnline: boolean;
		loadError: GameLoadError | null;
		canRetry: boolean;
		retryCount: number;
		onretry: () => void;
		onback: () => void;
	}

	let { loadingError, isOfflineError, isOnline, loadError, canRetry, retryCount, onretry, onback }: Props = $props();
</script>

<div class="error-screen">
	<div class="error-content">
		<div class="error-icon">
			<svg class="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
					  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
		</div>

		<h2 class="font-heading text-h3 text-gpb-black mb-2">
			{isOfflineError ? 'Нет подключения' : 'Ошибка загрузки'}
		</h2>

		<p class="error-message font-body text-body text-gray-700 mb-4">
			{loadingError}
		</p>

		{#if isOfflineError}
			<div class="offline-indicator">
				<div class="offline-icon">
					<svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
							  d="M18.364 5.636l-12.728 12.728m0 0L18.364 5.636m-12.728 12.728L18.364 18.364" />
					</svg>
				</div>
				<p class="font-body text-body-sm text-gray-500">
					Статус подключения: {isOnline ? 'Подключено' : 'Отключено'}
				</p>
			</div>
		{/if}

		{#if loadError}
			<div class="error-details">
				<p class="font-body text-body-sm text-gray-600 mb-2">
					Попытка {loadError.retryCount} из 3
				</p>
				<p class="font-body text-caption text-gray-500">
					{new Date(loadError.timestamp).toLocaleTimeString()}
				</p>
			</div>
		{/if}

		<div class="error-actions">
			{#if canRetry}
				<Button variant="primary" onclick={onretry}>
					{retryCount > 0 ? 'Попробовать снова' : 'Повторить'}
				</Button>
			{/if}

			<Button variant="secondary" onclick={onback}>
				Вернуться назад
			</Button>
		</div>
	</div>
</div>

<style>
	.error-screen {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: linear-gradient(to bottom, #ffffff 0%, var(--color-gpb-lily) 100%);
		position: relative;
		padding: 2rem 1rem;
	}

	.error-content {
		max-width: 400px;
		width: 100%;
		text-align: center;
		background: white;
		border-radius: 16px;
		padding: 2rem;
		box-shadow: 0 8px 24px -6px rgba(0, 0, 0, 0.1);
		border: 1px solid var(--color-gpb-viola);
		animation: errorBounceIn 0.6s ease-out;
	}

	.error-icon {
		margin-bottom: 1.5rem;
		display: flex;
		justify-content: center;
	}

	.error-message {
		background: rgba(239, 68, 68, 0.05);
		border: 1px solid rgba(239, 68, 68, 0.1);
		border-radius: 8px;
		padding: 1rem;
		text-align: left;
	}

	.error-details {
		background: #f9fafb;
		border-radius: 8px;
		padding: 1rem;
		margin-bottom: 1.5rem;
	}

	.error-actions {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.offline-indicator {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 1rem;
		background: #f9fafb;
		border-radius: 8px;
		margin-bottom: 1.5rem;
	}

	.offline-icon {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	@keyframes errorBounceIn {
		0% {
			opacity: 0;
			transform: scale(0.3) translateY(30px);
		}
		50% {
			transform: scale(1.05) translateY(-5px);
		}
		70% {
			transform: scale(0.9) translateY(2px);
		}
		100% {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}
</style>