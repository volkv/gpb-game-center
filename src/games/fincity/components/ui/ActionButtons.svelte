<script lang="ts">
	import { Icon, Button } from '.';
	import { openModal } from '../../stores/ui';
	import { resources } from '../../stores/playerData';

	interface Props {
		class?: string;
	}

	let { class: className = '' }: Props = $props();

	const requiredCoins = 100;

	function openBuildMenu() {
		openModal('build_menu');
	}

	function openQuestLog() {
		openModal('quest_log');
	}

	function openAchievements() {
		openModal('achievements');
	}

	const canBuild = $derived($resources.coins >= requiredCoins);
</script>

<div class="action-toolbar {className}">
	<div class="action-toolbar__card">
		<div class="action-toolbar__actions">
			<Button
				variant="primary"
				size="lg"
				onclick={openBuildMenu}
				disabled={!canBuild}
				class="action-toolbar__button action-toolbar__button--primary"
			>
				<Icon name="hammer" size="sm" class="action-toolbar__icon" />
				<span>Строить</span>
			</Button>

			<Button
				variant="secondary"
				size="lg"
				onclick={openQuestLog}
				class="action-toolbar__button action-toolbar__button--secondary"
			>
				<Icon name="quest" size="sm" class="action-toolbar__icon action-toolbar__icon--accent" />
				<span>Квесты</span>
			</Button>

			<Button
				variant="secondary"
				size="lg"
				onclick={openAchievements}
				class="action-toolbar__button action-toolbar__button--secondary"
			>
				<Icon name="star" size="sm" class="action-toolbar__icon action-toolbar__icon--gold" />
				<span>Достижения</span>
			</Button>
		</div>

		{#if !canBuild}
			<div class="action-toolbar__hint">
				<Icon name="coin" size="sm" class="action-toolbar__hint-icon" />
				<span>Нужно минимум {requiredCoins.toLocaleString('ru-RU')} монет для строительства</span>
			</div>
		{/if}
	</div>
</div>

<style>
	.action-toolbar {
		width: 100%;
		display: flex;
		justify-content: center;
		pointer-events: none;
	}

	.action-toolbar__card {
		pointer-events: auto;
		width: min(var(--game-shell-max-width, 680px), 100%);
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: clamp(0.75rem, 1.4vw, 1.2rem);
		border-radius: var(--radius-full);
		border: 1px solid var(--color-border-muted);
		background: color-mix(in srgb, var(--color-surface-card) 94%, white 6%);
		box-shadow: var(--shadow-soft);
	}

	.action-toolbar__actions {
		display: flex;
		flex-wrap: nowrap;
		gap: clamp(0.45rem, 1vw, 0.75rem);
		justify-content: flex-start;
		overflow-x: auto;
		scrollbar-width: none;
		padding-bottom: 0.2rem;
		scroll-snap-type: x proximity;
	}

	.action-toolbar__actions::-webkit-scrollbar {
		display: none;
	}

	.action-toolbar__button {
		display: inline-flex !important;
		align-items: center !important;
		justify-content: center !important;
		gap: 0.5rem !important;
		flex: 0 0 auto;
		min-width: 150px;
		font-family: var(--font-display) !important;
		font-size: 0.9rem !important;
		letter-spacing: -0.01em;
		padding-inline: clamp(0.9rem, 1.4vw, 1.25rem) !important;
		scroll-snap-align: center;
	}

	.action-toolbar__button--primary {
		box-shadow: var(--shadow-medium);
	}

	.action-toolbar__button--primary:global([disabled]) {
		box-shadow: none;
	}

	.action-toolbar__button--secondary {
		background: color-mix(in srgb, var(--color-neutral-50) 85%, white 15%) !important;
		border: 1px solid var(--color-border-muted) !important;
		color: var(--color-fg-primary) !important;
	}

	.action-toolbar__button--secondary:global(:hover) {
		border-color: var(--layer-brand-150) !important;
	}

	.action-toolbar__button--secondary:global(:focus-visible) {
		box-shadow: var(--shadow-focus) !important;
	}

	.action-toolbar__button:global([disabled]) {
		cursor: not-allowed;
		opacity: 0.65;
	}

	.action-toolbar__icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		color: inherit;
	}

	.action-toolbar__icon--accent {
		color: var(--color-brand-600);
	}

	.action-toolbar__icon--gold {
		color: var(--color-gpb-gold);
	}

	.action-toolbar__hint {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.75rem 1rem;
		border-radius: var(--radius-lg);
		border: 1px dashed var(--color-brand-200);
		background: color-mix(in srgb, var(--color-brand-50) 40%, white 60%);
		color: var(--color-brand-700);
		font-size: 0.85rem;
		font-weight: 500;
	}

	.action-toolbar__hint-icon {
		color: var(--color-brand-600);
	}

	@media (min-width: 640px) {
		.action-toolbar__actions {
			flex-wrap: wrap;
			justify-content: center;
			overflow: visible;
			scroll-snap-type: none;
		}

		.action-toolbar__button {
			flex: 1 1 0;
			min-width: 0;
		}
	}

	@media (max-width: 520px) {
		.action-toolbar__card {
			padding: 0.75rem;
		}

		.action-toolbar__button {
			min-width: 140px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.action-toolbar__button {
			transition: none !important;
		}
	}
</style>
