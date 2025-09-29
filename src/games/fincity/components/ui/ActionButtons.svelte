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
				size="sm"
				onclick={openBuildMenu}
				disabled={!canBuild}
				class="action-toolbar__button action-toolbar__button--primary"
			>
				<Icon name="hammer" size="sm" class="action-toolbar__icon" />
				<span>Строить</span>
			</Button>

			<Button
				variant="secondary"
				size="sm"
				onclick={openQuestLog}
				class="action-toolbar__button action-toolbar__button--secondary"
			>
				<Icon name="quest" size="sm" class="action-toolbar__icon action-toolbar__icon--accent" />
				<span>Квесты</span>
			</Button>

			<Button
				variant="secondary"
				size="sm"
				onclick={openAchievements}
				class="action-toolbar__button action-toolbar__button--secondary"
			>
				<Icon name="star" size="sm" class="action-toolbar__icon action-toolbar__icon--gold" />
				<span>Награды</span>
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
		gap: 0.5rem;
		padding: 0.5rem;
		border-radius: var(--radius-full);
		border: 1px solid var(--color-border-muted);
		background: color-mix(in srgb, var(--color-surface-card) 94%, white 6%);
		box-shadow: var(--shadow-soft);
	}

	.action-toolbar__actions {
		display: flex;
		flex-wrap: nowrap;
		gap: 0.35rem;
		justify-content: space-between;
		width: 100%;

		button {
			font-size: .8rem;
		}

	}

	.action-toolbar__button {
		display: inline-flex !important;
		align-items: center !important;
		justify-content: center !important;
		flex-direction: column !important;
		gap: 0.25rem !important;
		flex: 1;
		min-width: 0;
		font-family: var(--font-display) !important;
		font-size: 0.65rem !important;
		letter-spacing: -0.01em;
		padding: 0.45rem 0.35rem !important;
		white-space: nowrap;
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
		flex-shrink: 0;
	}

	.action-toolbar__icon :global(svg) {
		width: 18px;
		height: 18px;
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
		gap: 0.4rem;
		padding: 0.5rem 0.75rem;
		border-radius: var(--radius-lg);
		border: 1px dashed var(--color-brand-200);
		background: color-mix(in srgb, var(--color-brand-50) 40%, white 60%);
		color: var(--color-brand-700);
		font-size: 0.7rem;
		font-weight: 500;
	}

	.action-toolbar__hint-icon {
		color: var(--color-brand-600);
	}

</style>
