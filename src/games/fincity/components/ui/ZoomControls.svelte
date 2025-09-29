<script lang="ts">
	import { Button } from '.';

	interface Props {
		onZoomIn: () => void;
		onZoomOut: () => void;
		canZoomIn: boolean;
		canZoomOut: boolean;
		class?: string;
	}

	let {
		onZoomIn,
		onZoomOut,
		canZoomIn,
		canZoomOut,
		class: className = ''
	}: Props = $props();
</script>

<div class="zoom-controls {className}">
	<Button
		variant="secondary"
		size="sm"
		onclick={onZoomIn}
		disabled={!canZoomIn}
		class="zoom-controls__button"
	>
		<span class="zoom-controls__icon">+</span>
	</Button>

	<Button
		variant="secondary"
		size="sm"
		onclick={onZoomOut}
		disabled={!canZoomOut}
		class="zoom-controls__button"
	>
		<span class="zoom-controls__icon">−</span>
	</Button>
</div>

<style>
	.zoom-controls {
		position: absolute;
		z-index: 50;
		bottom: calc(140px + 0.5rem);
		right: 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		padding: 0.3rem;
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border-muted);
		background: color-mix(in srgb, var(--color-surface-card) 92%, white 8%);
		box-shadow: var(--shadow-soft);
		pointer-events: auto;
	}

	.zoom-controls__button {
		min-width: 0 !important;
		width: 2.25rem !important;
		height: 2.25rem !important;
		padding: 0 !important;
		border-radius: var(--radius-md) !important;
		border: 1px solid var(--color-border-subtle) !important;
		background: color-mix(in srgb, var(--color-neutral-50) 90%, white 10%) !important;
		color: var(--color-brand-600) !important;
		font-family: var(--font-display) !important;
		font-weight: 600 !important;
		transition: transform 160ms ease, box-shadow 160ms ease !important;
	}

	.zoom-controls__button:hover {
		transform: translateY(-1px);
		box-shadow: var(--shadow-soft);
	}

	.zoom-controls__button:active {
		transform: translateY(0);
	}

	.zoom-controls__button:focus-visible {
		box-shadow: var(--shadow-focus);
	}

	.zoom-controls__button:disabled {
		opacity: 0.45;
		transform: none;
		box-shadow: none;
		color: var(--color-fg-muted) !important;
		cursor: not-allowed;
	}

	.zoom-controls__icon {
		font-size: 1rem;
		font-weight: 700;
		line-height: 1;
	}


</style>
