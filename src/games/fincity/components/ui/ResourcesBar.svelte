<script lang="ts">
	import { Coins, Gem, Battery, Star } from 'lucide-svelte';
	import { resources, experienceToNextLevel, level } from '../../stores/playerData';

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

	const experienceRemaining = $derived(
		Math.max(0, ($experienceToNextLevel || 0) - $resources.experience)
	);
</script>

<div class="resources-bar {className}">
	<div class="resources-bar__container">
		<div class="resources-bar__level">
			<span class="resources-bar__chip">Ур {$level}</span>
			<span class="resources-bar__hint">До {$level + 1}: {experienceRemaining.toLocaleString('ru-RU')} XP</span>
		</div>

		<div class="resources-bar__scroller" role="list">
			<div class="resources-bar__item" data-variant="coins" role="listitem">
				<Coins size={16} />
				<span class="resources-bar__value">{$resources.coins.toLocaleString('ru-RU')}</span>
			</div>

			<div class="resources-bar__item" data-variant="crystals" role="listitem">
				<Gem size={16} />
				<span class="resources-bar__value">{$resources.crystals.toLocaleString('ru-RU')}</span>
			</div>

			<div class="resources-bar__item resources-bar__item--meter" data-variant="energy" role="listitem">
				<Battery size={16} />
				<div class="resources-bar__meter">
					<span class="resources-bar__label">Энергия</span>
					<span class="resources-bar__track">
						<span class="resources-bar__fill" style={`width: ${energyPercent}%`}></span>
					</span>
				</div>
				<span class="resources-bar__meta">{energyPercent}%</span>
			</div>

			<div class="resources-bar__item resources-bar__item--meter" data-variant="xp" role="listitem">
				<Star size={16} />
				<div class="resources-bar__meter">
					<span class="resources-bar__label">Опыт</span>
					<span class="resources-bar__track">
						<span class="resources-bar__fill" style={`width: ${experiencePercent}%`}></span>
					</span>
				</div>
				<span class="resources-bar__meta">{experiencePercent}%</span>
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
		align-items: center;
		gap: clamp(0.75rem, 1.6vw, 1.5rem);
		padding: 0.65rem 0.85rem;
		border-radius: var(--radius-full);
		border: 1px solid var(--color-border-muted);
		background: color-mix(in srgb, var(--color-surface-card) 92%, white 8%);
		box-shadow: var(--shadow-soft);
	}

	.resources-bar__level {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		white-space: nowrap;
	}

	.resources-bar__chip {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.3rem 0.8rem;
		border-radius: var(--radius-full);
		background: var(--layer-brand-150);
		color: var(--color-brand-700);
		font-size: 0.72rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.resources-bar__hint {
		font-size: 0.78rem;
		color: var(--color-fg-muted);
	}

	.resources-bar__scroller {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 0.65rem;
		overflow-x: auto;
		scrollbar-width: none;
	}

	.resources-bar__scroller::-webkit-scrollbar {
		display: none;
	}

	.resources-bar__item {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		padding: 0.45rem 0.75rem;
		border-radius: var(--radius-full);
		border: 1px solid var(--color-border-subtle);
		background: color-mix(in srgb, var(--color-neutral-50) 80%, white 20%);
		color: var(--color-fg-primary);
		font-size: 0.85rem;
		font-weight: 600;
		white-space: nowrap;
	}

	.resources-bar__item--meter {
		gap: 0.6rem;
	}

	.resources-bar__value {
		font-family: var(--font-display);
		letter-spacing: -0.01em;
	}

	.resources-bar__meter {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.resources-bar__label {
		font-size: 0.6rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--color-fg-muted);
	}

	.resources-bar__track {
		position: relative;
		width: 120px;
		height: 6px;
		border-radius: var(--radius-full);
		background: var(--color-neutral-100);
		overflow: hidden;
	}

	.resources-bar__fill {
		display: block;
		height: 100%;
		border-radius: inherit;
		background: linear-gradient(90deg, var(--color-brand-500) 0%, var(--color-accent-400) 100%);
		transition: width 200ms ease-out;
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

	.resources-bar__item[data-variant='xp'] {
		border-color: rgba(68, 80, 255, 0.28);
		background: rgba(68, 80, 255, 0.12);
	}

	.resources-bar__item[data-variant='energy'] .resources-bar__fill {
		background: linear-gradient(90deg, var(--color-brand-500) 0%, var(--color-accent-400) 100%);
	}

	.resources-bar__item[data-variant='xp'] .resources-bar__fill {
		background: linear-gradient(90deg, var(--color-accent-500) 0%, var(--color-brand-400) 100%);
	}

	.resources-bar__meta {
		font-family: var(--font-display);
		font-size: 0.85rem;
		color: var(--color-fg-primary);
	}

	@media (max-width: 768px) {
		.resources-bar__container {
			gap: 0.75rem;
			padding: 0.55rem 0.75rem;
		}

		.resources-bar__track {
			width: 88px;
		}
	}

	@media (max-width: 520px) {
		.resources-bar__hint {
			display: none;
		}

		.resources-bar__container {
			padding-inline: 0.6rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.resources-bar__fill {
			transition: none;
		}
	}
</style>
