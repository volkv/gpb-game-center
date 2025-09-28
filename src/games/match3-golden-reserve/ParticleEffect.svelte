<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		x: number;
		y: number;
		active?: boolean;
		onComplete?: () => void;
	}

	let { x, y, active = false, onComplete }: Props = $props();

	interface Particle {
		id: number;
		x: number;
		y: number;
		vx: number;
		vy: number;
		size: number;
		life: number;
		color: string;
		rotation: number;
		rotationSpeed: number;
	}

	let particles: Particle[] = $state([]);
	let animationFrame: number;
	let container: HTMLDivElement;

	function createParticles() {
		const newParticles: Particle[] = [];
		const colors = ['#FFD700', '#FF8C00', '#FF4500', '#1FC4D9', '#00A5C2'];

		for (let i = 0; i < 12; i++) {
			const angle = (i / 12) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
			const speed = 80 + Math.random() * 40;
			const size = 4 + Math.random() * 6;

			newParticles.push({
				id: i,
				x: x,
				y: y,
				vx: Math.cos(angle) * speed,
				vy: Math.sin(angle) * speed,
				size: size,
				life: 1.0,
				color: colors[Math.floor(Math.random() * colors.length)],
				rotation: Math.random() * 360,
				rotationSpeed: (Math.random() - 0.5) * 10
			});
		}

		particles = newParticles;
	}

	function updateParticles() {
		particles = particles.map(particle => ({
			...particle,
			x: particle.x + particle.vx * 0.016,
			y: particle.y + particle.vy * 0.016,
			vy: particle.vy + 120 * 0.016,
			life: particle.life - 0.025,
			rotation: particle.rotation + particle.rotationSpeed,
			size: particle.size * 0.995
		})).filter(particle => particle.life > 0);

		if (particles.length > 0) {
			animationFrame = requestAnimationFrame(updateParticles);
		} else {
			onComplete?.();
		}
	}

	$effect(() => {
		if (active) {
			createParticles();
			animationFrame = requestAnimationFrame(updateParticles);
		}

		return () => {
			if (animationFrame) {
				cancelAnimationFrame(animationFrame);
			}
		};
	});
</script>

{#if active}
	<div bind:this={container} class="particle-container">
		<div class="explosion-flash"></div>
		{#each particles as particle (particle.id)}
			<div
				class="particle"
				style="
					left: {particle.x}px;
					top: {particle.y}px;
					width: {particle.size}px;
					height: {particle.size}px;
					background-color: {particle.color};
					opacity: {particle.life};
					transform: rotate({particle.rotation}deg);
				"
			></div>
		{/each}
	</div>
{/if}

<style>
	.particle-container {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 1000;
	}

	.explosion-flash {
		position: absolute;
		left: 50%;
		top: 50%;
		width: 100px;
		height: 100px;
		border-radius: 50%;
		background: radial-gradient(circle,
			rgba(255, 255, 255, 0.9) 0%,
			rgba(255, 215, 0, 0.7) 30%,
			rgba(255, 140, 0, 0.4) 60%,
			transparent 100%);
		transform: translate(-50%, -50%);
		animation: explosion-flash 0.3s ease-out;
	}

	.particle {
		position: absolute;
		border-radius: 50%;
		box-shadow: 0 0 4px rgba(255, 255, 255, 0.8);
		will-change: transform, opacity;
	}

	@keyframes explosion-flash {
		0% {
			transform: translate(-50%, -50%) scale(0);
			opacity: 1;
		}
		50% {
			transform: translate(-50%, -50%) scale(1.5);
			opacity: 0.8;
		}
		100% {
			transform: translate(-50%, -50%) scale(2);
			opacity: 0;
		}
	}
</style>