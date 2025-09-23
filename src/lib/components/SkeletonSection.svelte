<script lang="ts">
	export let title = '';
	export let hasAction = true;
	export let itemsCount = 2;
</script>

<div class="skeleton-section">
	<div class="section-header">
		{#if title}
			<div class="section-title">
				<span>{title}</span>
				<div class="skeleton-chevron"></div>
			</div>
		{:else}
			<div class="skeleton-title"></div>
		{/if}

		{#if hasAction}
			<div class="skeleton-action"></div>
		{/if}
	</div>

	<div class="section-content">
		{#each Array(itemsCount) as _, i}
			<div class="skeleton-item">
				<div class="skeleton-icon"></div>
				<div class="skeleton-text">
					<div class="skeleton-line"></div>
					<div class="skeleton-line shorter"></div>
				</div>
				<div class="skeleton-value"></div>
			</div>
		{/each}
	</div>
</div>

<style>
	.skeleton-section {
		padding: 20px;
		border-bottom: 8px solid rgb(248, 248, 248);
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16px;
	}

	.section-title {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 18px;
		font-weight: 600;
		color: rgb(51, 51, 51);
	}

	.skeleton-chevron {
		width: 12px;
		height: 12px;
		border-radius: 2px;
		background: #f0f0f0;
	}

	.skeleton-title {
		width: 120px;
		height: 24px;
		border-radius: 8px;
		background: #f0f0f0;
	}

	.skeleton-action {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: #f0f0f0;
	}

	.section-content {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.skeleton-item {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 0;
	}

	.skeleton-icon {
		width: 40px;
		height: 40px;
		border-radius: 8px;
		background: #f0f0f0;
		flex-shrink: 0;
	}

	.skeleton-text {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.skeleton-line {
		height: 16px;
		border-radius: 8px;
		background: #f0f0f0;
	}

	.skeleton-line.shorter {
		width: 60%;
	}

	.skeleton-value {
		width: 80px;
		height: 20px;
		border-radius: 8px;
		background: #f0f0f0;
		flex-shrink: 0;
	}

</style>