<script lang="ts">
	interface Props {
		message: string;
		isLoading?: boolean;
	}
	let { message, isLoading = true }: Props = $props();
</script>

<div class="lazy-fallback" aria-live="polite" aria-busy={isLoading}>
	<div class="lazy-spinner" aria-hidden="true"></div>
	<p class="lazy-text">{message}</p>
</div>

<style>
	.lazy-fallback {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		gap: 0.75rem;
		color: rgb(51, 51, 51);
	}

	.lazy-spinner {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		border: 3px solid rgba(0, 0, 0, 0.08);
		border-top-color: rgba(25, 25, 239, 0.9);
		animation: lazy-spin 0.8s linear infinite;
	}

	.lazy-text {
		font-size: 0.9rem;
		font-weight: 500;
	}

	@keyframes lazy-spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>