<script lang="ts">
	import { Coins, Gem, Battery, Star } from 'lucide-svelte';
	import { resources, experienceToNextLevel } from '../../stores/playerData';

	interface Props {
		class?: string;
	}

	let { class: className = '' }: Props = $props();
</script>

<div class="resources-bar {className}">
	<div class="resources-container">
		<!-- Coins -->
		<div class="resource-item mini-stat">
			<div class="resource-icon-container">
				<Coins size={16} class="resource-icon text-gpb-gold neon-glow" />
			</div>
			<div class="resource-details">
				<span class="resource-value font-score">{$resources.coins.toLocaleString()}</span>
				<span class="resource-label font-ui-caption">Монеты</span>
			</div>
		</div>

		<!-- Crystals -->
		<div class="resource-item mini-stat">
			<div class="resource-icon-container">
				<Gem size={16} class="resource-icon text-gpb-raspberry neon-glow" />
			</div>
			<div class="resource-details">
				<span class="resource-value font-score">{$resources.crystals.toLocaleString()}</span>
				<span class="resource-label font-ui-caption">Кристаллы</span>
			</div>
		</div>

		<!-- Energy -->
		<div class="resource-item mini-stat">
			<div class="resource-icon-container">
				<Battery size={16} class="resource-icon text-gpb-violet neon-glow" />
			</div>
			<div class="resource-details">
				<span class="resource-value font-score">{$resources.energy}/{$resources.maxEnergy}</span>
				<span class="resource-label font-ui-caption">Энергия</span>
			</div>
		</div>

		<!-- Experience -->
		<div class="resource-item mini-stat">
			<div class="resource-icon-container">
				<Star size={16} class="resource-icon text-gpb-emerald neon-glow" />
			</div>
			<div class="resource-details">
				<span class="resource-value font-score">{$resources.experience}/{$experienceToNextLevel}</span>
				<span class="resource-label font-ui-caption">Опыт</span>
			</div>
		</div>
	</div>

	<!-- Decorative elements -->
	<div class="particles-container">
		<div class="particle"></div>
		<div class="particle"></div>
		<div class="particle"></div>
	</div>
	<div class="decoration-orb bg-gpb-mint w-6 h-6 -top-1 -right-1"></div>
	<div class="decoration-orb bg-gpb-gold w-4 h-4 -bottom-1 -left-1"></div>
</div>

<style>
	.resources-bar {
		position: absolute;
		left: 0;
		right: 0;
		z-index: 40;
		background: linear-gradient(135deg, rgba(25, 25, 239, 0.9) 0%, rgba(88, 255, 255, 0.9) 100%);
		backdrop-filter: blur(12px);
		border-bottom: 1px solid rgba(255, 255, 255, 0.2);
		overflow: hidden;
		padding: 0.75rem 1rem;
		margin-bottom: 1rem;
	}

	.resources-container {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
		gap: 0.75rem;
		max-width: 28rem;
		margin: 0 auto;
		position: relative;
		z-index: 10;
	}

	.resource-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		padding: 0.5rem;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 0.75rem;
		transition: all 0.3s ease-out;
		position: relative;
		overflow: hidden;
	}

	.resource-item:hover {
		transform: translateY(-2px);
		background: rgba(255, 255, 255, 0.15);
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
	}

	.resource-icon-container {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		backdrop-filter: blur(8px);
		transition: all 0.3s ease-out;
	}

	.resource-item:hover .resource-icon-container {
		transform: scale(1.1);
		background: rgba(255, 255, 255, 0.2);
	}

	.resource-icon {
		flex-shrink: 0;
		filter: drop-shadow(0 0 8px currentColor);
	}

	.resource-details {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.125rem;
		text-align: center;
		min-width: 0;
	}

	.resource-value {
		color: white;
		font-size: 0.875rem;
		font-weight: 700;
		line-height: 1;
		white-space: nowrap;
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
		letter-spacing: -0.025em;
	}

	.resource-label {
		color: rgba(255, 255, 255, 0.8);
		font-size: 0.625rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		line-height: 1;
	}

	.particles-container {
		position: absolute;
		inset: 0;
		pointer-events: none;
		overflow: hidden;
	}

	.particle {
		position: absolute;
		width: 2px;
		height: 2px;
		background: rgba(255, 255, 255, 0.4);
		border-radius: 50%;
		animation: float-particle 4s ease-in-out infinite;
	}

	.particle:nth-child(1) {
		top: 20%;
		left: 10%;
		animation-delay: 0s;
		animation-duration: 5s;
	}

	.particle:nth-child(2) {
		top: 60%;
		left: 70%;
		animation-delay: 1s;
		animation-duration: 6s;
	}

	.particle:nth-child(3) {
		top: 40%;
		left: 90%;
		animation-delay: 2s;
		animation-duration: 4s;
	}

	@keyframes float-particle {
		0%, 100% {
			transform: translateY(0px) translateX(0px) scale(0.8);
			opacity: 0.4;
		}
		33% {
			transform: translateY(-8px) translateX(4px) scale(1);
			opacity: 0.8;
		}
		66% {
			transform: translateY(-4px) translateX(-2px) scale(0.9);
			opacity: 0.6;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.resource-item, .resource-icon-container, .particle {
			transition: none;
			animation: none;
		}
	}

	@media (max-width: 380px) {
		.resources-container {
			grid-template-columns: repeat(2, 1fr);
			gap: 0.5rem;
		}

		.resource-value {
			font-size: 0.75rem;
		}

		.resource-label {
			font-size: 0.5rem;
		}
	}
</style>