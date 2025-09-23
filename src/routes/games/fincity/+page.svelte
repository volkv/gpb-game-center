<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { currentScreen, navigateToGame } from '$lib/stores/navigationStore';
	import { gameStore } from '$lib/stores/gameStore';
	import { getGameById } from '$lib/data/games';
	import { GAME_TYPES } from '$lib/utils/constants';

	onMount(async () => {
		const fincityGame = getGameById(GAME_TYPES.FINCITY);

		if (fincityGame) {
			await gameStore.loadGame(fincityGame.id);
			navigateToGame(fincityGame);
			goto('/', { replaceState: true });
		} else {
			goto('/', { replaceState: true });
		}
	});
</script>

<div class="loading-container">
	<div class="loading-content">
		<div class="spinner"></div>
		<p>Загрузка FinCity...</p>
	</div>
</div>

<style>
	.loading-container {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, var(--color-gpb-mint) 0%, var(--color-gpb-melissa) 100%);
	}

	.loading-content {
		text-align: center;
		color: white;
	}

	.spinner {
		width: 48px;
		height: 48px;
		border: 4px solid rgba(255, 255, 255, 0.3);
		border-top: 4px solid white;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin: 0 auto 1rem;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	p {
		font-size: 1.125rem;
		font-weight: 500;
	}
</style>