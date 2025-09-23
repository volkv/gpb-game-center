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
				on:click={() => handleStoryClick(story.id)}
				disabled={!story.isActive}
			>
				{#if story.isActive}
					<div class="story-gradient bg-gradient-to-br {story.gradient}">
						<div class="story-icon">
							🎮
						</div>
					</div>
				{:else}
					<div class="skeleton-circle"></div>
				{/if}
			</button>
			{#if story.isActive}
				<span class="story-title">{story.title}</span>
			{:else}
				<div class="skeleton-title"></div>
			{/if}
		{/each}
	</div>
</div>

<style>
	.stories-container {
		padding: 16px 20px;
		border-bottom: 1px solid rgb(240, 240, 240);
	}

	.stories-list {
		display: flex;
		gap: 16px;
		overflow-x: auto;
		scrollbar-width: none;
		-ms-overflow-style: none;
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
	}

	.story-item:not(:disabled):hover {
		transform: scale(1.05);
	}

	.story-item:disabled {
		cursor: default;
	}

	.story-gradient {
		width: 64px;
		height: 64px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		border: 3px solid white;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.story-icon {
		font-size: 24px;
		filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
	}

	.skeleton-circle {
		width: 64px;
		height: 64px;
		border-radius: 50%;
		background: #f0f0f0;
	}

	.story-title {
		font-size: 12px;
		color: rgb(51, 51, 51);
		font-weight: 500;
		text-align: center;
		max-width: 64px;
		line-height: 1.2;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.skeleton-title {
		width: 48px;
		height: 12px;
		border-radius: 6px;
		background: #f0f0f0;
		margin-top: 4px;
	}

</style>