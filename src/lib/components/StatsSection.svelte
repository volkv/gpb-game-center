<script lang="ts">
	import type { ComponentType } from 'svelte';

	interface StatMetric {
		label: string;
		value: string | number;
		icon: ComponentType;
		iconSize?: number;
	}

	interface Props {
		ariaLabel: string;
		metrics: StatMetric[];
		columns?: number;
	}

	let { ariaLabel, metrics, columns = 3 }: Props = $props();

	function formatValue(value: string | number): string {
		if (typeof value === 'number') {
			return value.toLocaleString();
		}
		return value;
	}
</script>

<section class="stats surface-card" aria-label={ariaLabel}>
	<div class="stats-grid" style="--columns: {columns}">
		{#each metrics as metric}
			{@const Icon = metric.icon}
			<div class="metric-card">
				<span class="metric-card__label">{metric.label}</span>
				<div class="metric-card__value-row">
					<span class="metric-card__value">{formatValue(metric.value)}</span>
					<Icon size={metric.iconSize || 16} aria-hidden="true" />
		
				
				</div>
			</div>
		{/each}
	</div>
</section>

<style>
	.stats {
		padding: 1rem 1.5rem;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(var(--columns), 1fr);
		gap: 0.75rem;
	}

	.metric-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border-subtle);
		padding: 0.75rem;
		background: linear-gradient(135deg, rgba(6, 6, 152, 0.12) 0%, rgba(31, 196, 217, 0.08) 100%);
		text-align: center;
	}

	.metric-card:nth-child(2) {
		background: linear-gradient(135deg, rgba(31, 196, 217, 0.14) 0%, rgba(31, 196, 217, 0.05) 100%);
	}

	.metric-card:nth-child(3) {
		background: linear-gradient(135deg, rgba(6, 6, 152, 0.14) 0%, rgba(6, 6, 152, 0.05) 100%);
	}

	.metric-card :global(svg) {
		color: var(--color-brand-500);
	}

	.metric-card__label {
		display: block;
		font-size: 0.7rem;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--color-fg-muted);
	}

	.metric-card__value-row {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		justify-content: center;
	}

	.metric-card__value {
		font-family: var(--font-display);
		font-size: 1.2rem;
		font-weight: 600;
		color: var(--color-fg-primary);
	}

	.stats {
		padding: 1rem 1.25rem;
	}

	.metric-card {
		padding: 0.8rem;
	}
</style>