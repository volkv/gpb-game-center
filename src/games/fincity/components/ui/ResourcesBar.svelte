<script lang="ts">
	import { Coins, Gem, Battery, TrendingUp } from 'lucide-svelte';
	import { resources, experienceToNextLevel, level, cityName } from '../../stores/playerData';
	import { incomePerHour } from '../../stores/buildings';

	interface Props {
		class?: string;
	}

	let { class: className = '' }: Props = $props();

	const energyPercent = $derived(
		$resources.maxEnergy
			? Math.min(100, Math.round(($resources.energy / $resources.maxEnergy) * 100))
			: 0
	);

	const experiencePercent = $derived(
		$experienceToNextLevel
			? Math.min(100, Math.round(($resources.experience / $experienceToNextLevel) * 100))
			: 0
	);
</script>

<div class="resources-bar {className}">
	<div class="resources-bar__container">
		<div class="resources-bar__header">
			<div class="resources-bar__city">
				<span class="resources-bar__city-name">{$cityName}</span>
				<span class="resources-bar__level">Ур {$level}</span>
			</div>

			<div class="resources-bar__xp">
				<span class="resources-bar__xp-track">
					<span class="resources-bar__xp-fill" style={`width: ${experiencePercent}%`}></span>
				</span>
				<span class="resources-bar__xp-text">{experiencePercent}%</span>
			</div>
		</div>

		<div class="resources-bar__resources" role="list">
			<div class="resources-bar__item" data-variant="coins" role="listitem">
				<Coins size={14} />
				<div class="resources-bar__item-content">
					<span class="resources-bar__value">{Math.floor($resources.coins).toLocaleString('ru-RU')}</span>
					{#if $incomePerHour.coins > 0}
						<span class="resources-bar__income">
							<TrendingUp size={10} />
							{Math.floor($incomePerHour.coins).toLocaleString('ru-RU')}/ч
						</span>
					{/if}
				</div>
			</div>

			<div class="resources-bar__item" data-variant="crystals" role="listitem">
				<Gem size={14} />
				<div class="resources-bar__item-content">
					<span class="resources-bar__value">{Math.floor($resources.crystals).toLocaleString('ru-RU')}</span>
					{#if $incomePerHour.crystals > 0}
						<span class="resources-bar__income">
							<TrendingUp size={10} />
							{Math.floor($incomePerHour.crystals).toLocaleString('ru-RU')}/ч
						</span>
					{/if}
				</div>
			</div>

			<div class="resources-bar__item resources-bar__item--energy" data-variant="energy" role="listitem">
				<Battery size={14} />
				<div class="resources-bar__energy-meter">
					<span class="resources-bar__energy-track">
						<span class="resources-bar__energy-fill" style={`width: ${energyPercent}%`}></span>
					</span>
					<span class="resources-bar__energy-text">{Math.floor($resources.energy)}/{Math.floor($resources.maxEnergy)}</span>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.resources-bar {
		width: 100%;
		display: flex;
		justify-content: center;
		pointer-events: none;
	}

	.resources-bar__container {
		pointer-events: auto;
		width: min(var(--game-shell-max-width, 840px), 100%);
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		padding: 0.5rem 0.6rem;
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border-muted);
		background: color-mix(in srgb, var(--color-surface-card) 92%, white 8%);
		box-shadow: var(--shadow-soft);
		backdrop-filter: blur(8px);
	}

	.resources-bar__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}

	.resources-bar__city {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.resources-bar__city-name {
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--color-fg-primary);
		letter-spacing: -0.01em;
	}

	.resources-bar__level {
		display: inline-flex;
		align-items: center;
		padding: 0.2rem 0.5rem;
		border-radius: var(--radius-full);
		background: var(--layer-brand-150);
		color: var(--color-brand-700);
		font-size: 0.6rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		white-space: nowrap;
	}

	.resources-bar__xp {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 0.4rem;
		max-width: 120px;
	}

	.resources-bar__xp-track {
		flex: 1;
		position: relative;
		height: 4px;
		border-radius: var(--radius-full);
		background: var(--color-neutral-100);
		overflow: hidden;
	}

	.resources-bar__xp-fill {
		display: block;
		height: 100%;
		border-radius: inherit;
		background: linear-gradient(90deg, var(--color-brand-500) 0%, var(--color-accent-400) 100%);
		transition: width 300ms ease-out;
	}

	.resources-bar__xp-text {
		font-size: 0.65rem;
		font-weight: 600;
		color: var(--color-fg-muted);
		font-family: var(--font-display);
		min-width: 32px;
		text-align: right;
	}

	.resources-bar__resources {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		overflow-x: auto;
		scrollbar-width: none;
	}

	.resources-bar__resources::-webkit-scrollbar {
		display: none;
	}

	.resources-bar__item {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.3rem 0.5rem;
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border-subtle);
		background: color-mix(in srgb, var(--color-neutral-50) 80%, white 20%);
		color: var(--color-fg-primary);
		font-size: 0.7rem;
		font-weight: 600;
		white-space: nowrap;
	}

	.resources-bar__item--energy {
		flex: 1;
		min-width: 0;
	}

	.resources-bar__item-content {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
		min-width: 0;
	}

	.resources-bar__value {
		font-family: var(--font-display);
		letter-spacing: -0.01em;
		font-size: 0.75rem;
	}

	.resources-bar__income {
		display: inline-flex;
		align-items: center;
		gap: 0.2rem;
		font-size: 0.6rem;
		color: var(--color-fg-muted);
		font-weight: 500;
	}

	.resources-bar__energy-meter {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		flex: 1;
		min-width: 0;
	}

	.resources-bar__energy-track {
		flex: 1;
		position: relative;
		height: 4px;
		border-radius: var(--radius-full);
		background: var(--color-neutral-100);
		overflow: hidden;
	}

	.resources-bar__energy-fill {
		display: block;
		height: 100%;
		border-radius: inherit;
		background: linear-gradient(90deg, var(--color-brand-500) 0%, var(--color-accent-400) 100%);
		transition: width 200ms ease-out;
	}

	.resources-bar__energy-text {
		font-size: 0.65rem;
		font-family: var(--font-display);
		color: var(--color-fg-primary);
		white-space: nowrap;
	}

	.resources-bar__item[data-variant='coins'] {
		border-color: rgba(226, 165, 58, 0.32);
		background: rgba(226, 165, 58, 0.15);
		color: var(--color-gpb-gold);
	}

	.resources-bar__item[data-variant='crystals'] {
		border-color: rgba(31, 196, 217, 0.32);
		background: rgba(31, 196, 217, 0.16);
		color: var(--color-accent-600);
	}

	.resources-bar__item[data-variant='energy'] {
		border-color: rgba(25, 25, 239, 0.28);
		background: rgba(25, 25, 239, 0.12);
	}

	.resources-bar__item :global(svg) {
		flex-shrink: 0;
	}

	@media (max-width: 400px) {
		.resources-bar__container {
			padding: 0.4rem 0.5rem;
			gap: 0.35rem;
		}

		.resources-bar__city-name {
			font-size: 0.7rem;
		}

		.resources-bar__level {
			font-size: 0.55rem;
			padding: 0.15rem 0.4rem;
		}

		.resources-bar__xp {
			max-width: 100px;
		}

		.resources-bar__item {
			padding: 0.25rem 0.4rem;
			gap: 0.3rem;
		}

		.resources-bar__value {
			font-size: 0.7rem;
		}

		.resources-bar__income {
			font-size: 0.55rem;
		}
	}
</style>
