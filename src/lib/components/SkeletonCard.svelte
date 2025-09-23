<script lang="ts">
	export let width = '100%';
	export let height = '100px';
	export let hasIcon = false;
	export let hasText = true;
	export let textLines = 1;
</script>

<div class="skeleton-card" style="width: {width}; height: {height};">
	{#if hasIcon}
		<div class="skeleton-icon"></div>
	{/if}

	{#if hasText}
		<div class="skeleton-content">
			{#each Array(textLines) as _, i}
				<div class="skeleton-line" class:shorter={i === textLines - 1}></div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.skeleton-card {
		background: white;
		border-radius: 16px;
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 12px;
		border: 1px solid rgb(240, 240, 240);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
	}

	.skeleton-icon {
		width: 32px;
		height: 32px;
		border-radius: 8px;
		background: #f0f0f0;
		flex-shrink: 0;
	}

	.skeleton-content {
		display: flex;
		flex-direction: column;
		gap: 8px;
		flex: 1;
	}

	.skeleton-line {
		height: 16px;
		border-radius: 8px;
		background: #f0f0f0;
	}

	.skeleton-line.shorter {
		width: 70%;
	}

</style>