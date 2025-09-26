<script lang="ts">
	import { navigateToGameCenter } from '$lib/stores/navigationStore';

	const stories = [
		{
			id: 'game-center',
			title: 'Игровой центр',
			isActive: true,
			gradient: 'from-gpb-violet to-gpb-mint'
		},
		{ id: 'story-1', title: '', isActive: false },
		{ id: 'story-2', title: '', isActive: false },
		{ id: 'story-3', title: '', isActive: false },
		{ id: 'story-4', title: '', isActive: false },
		{ id: 'story-5', title: '', isActive: false }
	];

	function handleStoryClick(storyId: string) {
		if (storyId === 'game-center') {
			navigateToGameCenter();
		}
	}
</script>

<div class="stories-container">
	<div class="stories-list">
		{#each stories as story}
			<button
				class="story-item {story.isActive ? 'active' : 'skeleton'}"
				class:gradient={story.isActive}
				onclick={() => handleStoryClick(story.id)}
				disabled={!story.isActive}
			>
				{#if story.isActive}
					<div class="story-gradient bg-gradient-to-br {story.gradient}">
						<div class="story-badge">
							Новинка
						</div>
						<div class="story-content">
							<div class="story-icon">
								🎮
							</div>
							<div class="story-text">
								Игровой центр
							</div>
						</div>
					</div>
				{:else}
					<div class="skeleton-circle"></div>
				{/if}
			</button>
		{/each}
	</div>
</div>

<style>
	.stories-container {
		padding-bottom: 16px;
		border-bottom: 1px solid rgb(240, 240, 240);
	}

	.stories-list {
		display: flex;
		gap: 12px;
		overflow-x: auto;
		scrollbar-width: none;
		-ms-overflow-style: none;
		padding: 4px 0;
	}

	.stories-list::-webkit-scrollbar {
		display: none;
	}

	.story-item {
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		background: none;
		border: none;
		cursor: pointer;
		transition: transform 0.2s ease;
		position: relative;
		padding: 4px;
	}

	.story-item:not(:disabled):hover {
		transform: scale(1.05);
	}

	.story-item:disabled {
		cursor: default;
	}

	.story-gradient {
		width: 90px;
		height: 120px;
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		border: 2px solid white;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.story-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 2px;
		text-align: center;
		padding: 8px;
	}

	.story-icon {
		font-size: 28px;
		filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
	}

	.story-text {
		font-size: 14px;
		font-weight: 600;
		color: white;
		line-height: 1.2;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
	}

	.story-badge {
		position: absolute;
		top: -4px;
		right: -4px;
		background: #ff4757;
		color: white;
		font-size: 8px;
		font-weight: 700;
		padding: 2px 6px;
		border-radius: 8px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		border: 2px solid white;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
		z-index: 10;
	}

	.skeleton-circle {
		width: 90px;
		height: 120px;
		border-radius: 12px;
		background: #f0f0f0;
	}


</style>