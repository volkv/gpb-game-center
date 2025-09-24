<script lang="ts">
	import Stories from './Stories.svelte';
	import SkeletonCard from './SkeletonCard.svelte';
	import SkeletonSection from './SkeletonSection.svelte';
	import { telegramUserName } from '$lib/stores/telegramStore';
</script>

<div class="bank-home">
	<div class="content">
		<div class="greeting">
			<h1 class="greeting-text">Привет, {$telegramUserName}!</h1>
		</div>

		<Stories />

		<div class="cards-section">
			<div class="section-header">
				<h2 class="section-title">Карты</h2>
				<button class="add-button" disabled>+</button>
			</div>

			<div class="cards-grid">
				<SkeletonCard width="calc(50% - 8px)" height="120px" hasIcon={true} hasText={true} textLines={3} />
				<SkeletonCard width="calc(50% - 8px)" height="120px" hasIcon={true} hasText={true} textLines={2} />
			</div>

			<div class="bank-card">
				<div class="card-info">
					<div class="card-icon">💳</div>
					<div class="card-details">
						<div class="skeleton-line-small"></div>
						<div class="skeleton-line-mini"></div>
					</div>
				</div>
				<div class="skeleton-amount"></div>
			</div>
		</div>

		<SkeletonSection title="Кредит" hasAction={true} itemsCount={1} />
		<SkeletonSection title="Вклады" hasAction={true} itemsCount={2} />

	</div>
</div>

<style>
	.bank-home {
		min-height: 100%;
		background: rgb(248, 248, 248);
	}

	.content {
		background: white;
		min-height: 100%;
	}

	.greeting {
		padding: 20px 20px 16px 20px;
		background: white;
		border-bottom: 1px solid rgb(240, 240, 240);
	}

	.greeting-text {
		font-size: 24px;
		font-weight: 600;
		color: rgb(51, 51, 51);
		margin: 0;
		font-family: var(--font-heading);
	}

	.cards-section {
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
		font-size: 18px;
		font-weight: 600;
		color: rgb(51, 51, 51);
		margin: 0;
	}

	.add-button {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: rgb(240, 240, 240);
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 18px;
		color: rgb(160, 160, 160);
		cursor: not-allowed;
	}

	.cards-grid {
		display: flex;
		gap: 16px;
		margin-bottom: 16px;
	}

	.bank-card {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16px;
		background: white;
		border-radius: 12px;
		border: 1px solid rgb(240, 240, 240);
	}

	.card-info {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.card-icon {
		font-size: 24px;
	}

	.card-details {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.skeleton-line-small {
		width: 120px;
		height: 16px;
		border-radius: 8px;
		background: #f0f0f0;
	}

	.skeleton-line-mini {
		width: 80px;
		height: 12px;
		border-radius: 6px;
		background: #f0f0f0;
	}

	.skeleton-amount {
		width: 100px;
		height: 20px;
		border-radius: 8px;
		background: #f0f0f0;
	}


</style>
