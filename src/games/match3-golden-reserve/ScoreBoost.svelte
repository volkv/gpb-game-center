<script lang="ts">
	import { Star, Zap, Plus } from 'lucide-svelte';

	interface Props {
		amount: number;
		visible?: boolean;
		onComplete?: () => void;
	}

	let { amount, visible = false, onComplete }: Props = $props();

	let element: HTMLDivElement | undefined = $state();

	const getBoostType = (amount: number) => {
		if (amount >= 500) return { icon: Star, color: 'gpb-gold', label: 'ПОТРЯСАЮЩЕ!' };
		if (amount >= 300) return { icon: Zap, color: 'gpb-mint', label: 'ОТЛИЧНО!' };
		if (amount >= 200) return { icon: Plus, color: 'gpb-blue', label: 'ХОРОШО!' };
		return { icon: Plus, color: 'gpb-gray-600', label: 'НЕПЛОХО!' };
	};

	const boostType = getBoostType(amount);

	$effect(() => {
		if (visible && element) {
			const timer = setTimeout(() => {
				onComplete?.();
			}, 2000);

			return () => clearTimeout(timer);
		}
	});
</script>

{#if visible}
	<div
		bind:this={element}
		class="score-boost"
		class:visible
	>
		<div class="boost-icon text-{boostType.color}">
			{#if boostType.icon}
				{@const IconComponent = boostType.icon}
				<IconComponent size={24} />
			{/if}
		</div>
		<div class="boost-amount text-{boostType.color}">
			+{amount}
		</div>
		<div class="boost-label text-{boostType.color}">
			{boostType.label}
		</div>
	</div>
{/if}

<style>
	.score-boost {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		z-index: 100;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		background: white;
		padding: 1.5rem;
		border-radius: 1rem;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
		border: 2px solid rgba(31, 196, 217, 0.3);
		opacity: 0;
		transform: translate(-50%, -50%) scale(0.5);
		pointer-events: none;
		transition: all 0.3s ease-out;
	}

	.score-boost.visible {
		opacity: 1;
		transform: translate(-50%, -50%) scale(1);
		animation: boost-popup 2s ease-out;
	}

	.boost-icon {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		background: rgba(31, 196, 217, 0.1);
		display: flex;
		align-items: center;
		justify-content: center;
		animation: icon-pulse 0.6s ease-out;
	}

	.boost-amount {
		font-size: 2rem;
		font-weight: 700;
		font-family: var(--font-display);
		animation: number-scale 0.5s ease-out 0.2s both;
	}

	.boost-label {
		font-size: 0.875rem;
		font-weight: 600;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		animation: label-fade-in 0.4s ease-out 0.4s both;
	}

	@keyframes boost-popup {
		0% {
			opacity: 0;
			transform: translate(-50%, -50%) scale(0.5) rotate(-10deg);
		}
		20% {
			opacity: 1;
			transform: translate(-50%, -50%) scale(1.1) rotate(5deg);
		}
		40% {
			transform: translate(-50%, -50%) scale(1) rotate(0deg);
		}
		80% {
			opacity: 1;
			transform: translate(-50%, -50%) scale(1) rotate(0deg);
		}
		100% {
			opacity: 0;
			transform: translate(-50%, -80%) scale(0.8) rotate(0deg);
		}
	}

	@keyframes icon-pulse {
		0% {
			transform: scale(0);
			background: rgba(31, 196, 217, 0.3);
		}
		50% {
			transform: scale(1.2);
			background: rgba(31, 196, 217, 0.2);
		}
		100% {
			transform: scale(1);
			background: rgba(31, 196, 217, 0.1);
		}
	}

	@keyframes number-scale {
		0% {
			transform: scale(0);
			opacity: 0;
		}
		70% {
			transform: scale(1.2);
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
	}

	@keyframes label-fade-in {
		0% {
			opacity: 0;
			transform: translateY(10px);
		}
		100% {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.text-gpb-gold {
		color: var(--color-gpb-gold);
	}

	.text-gpb-mint {
		color: var(--color-gpb-mint);
	}

	.text-gpb-blue {
		color: var(--color-gpb-blue);
	}

	.text-gpb-gray-600 {
		color: var(--color-gpb-gray-600);
	}
</style>