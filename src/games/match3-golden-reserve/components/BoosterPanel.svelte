<script lang="ts">
	import { Zap } from 'lucide-svelte';

	interface Props {
		charge: number;
		boosterProgress: number;
	}

	let { charge, boosterProgress }: Props = $props();
</script>

<div class="booster-panel glass-effect rounded-2xl p-4 text-gpb-gray-900 mb-4">
	<h3 class="font-card-title mb-3 flex items-center gap-2">
		<Zap size={20} class="text-gpb-mint" />
		Газпромбанк Бонус
	</h3>
	<div class="booster-charge-bar">
		<div class="charge-progress" style="width: {boosterProgress}%"></div>
	</div>
	<div class="text-xs text-gpb-gray-600 mt-2">
		Заряд: {charge}/100
	</div>
</div>

<style>
	.booster-panel {
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%);
		backdrop-filter: blur(16px) saturate(180%);
		-webkit-backdrop-filter: blur(16px) saturate(180%);
		border: 1px solid rgba(255, 255, 255, 0.4);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5);
	}

	.booster-charge-bar {
		width: 100%;
		height: 8px;
		background: rgba(255, 255, 255, 0.3);
		border-radius: 4px;
		overflow: hidden;
	}

	.charge-progress {
		height: 100%;
		background: linear-gradient(90deg, var(--color-gpb-mint), var(--color-gpb-blue));
		transition: width 0.6s cubic-bezier(0.4, 0.0, 0.2, 1);
		position: relative;
		overflow: hidden;
	}

	.charge-progress::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
		animation: charge-wave 2s infinite;
	}

	.charge-progress::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg,
			rgba(255, 255, 255, 0.2) 0%,
			transparent 50%,
			rgba(255, 255, 255, 0.2) 100%);
		animation: shimmer 3s infinite;
	}

	@keyframes charge-wave {
		0% {
			left: -100%;
		}
		100% {
			left: 100%;
		}
	}

	@keyframes shimmer {
		0% {
			transform: translateX(-100%);
		}
		100% {
			transform: translateX(100%);
		}
	}
</style>
