<script lang="ts">
	import Stories from './Stories.svelte';
	import SkeletonCard from './SkeletonCard.svelte';
	import SkeletonSection from './SkeletonSection.svelte';
	import { telegramUserName } from '$lib/stores/telegramStore';
</script>

<main class="bank-home">
	<section class="hero surface-contrast">
		<div class="hero-eyebrow">
			<img src="/logo.svg" alt="Газпромбанк логотип" class="hero-logo" />
			<p>ГАЗПРОМБАНК.ТЕХ</p>
		</div>
		<h1 class="hero-title">Привет, {$telegramUserName}!</h1>
		<p class="hero-subtitle text-balance">
			Все ваши продукты и игровые активности — в одном аккуратном пространстве.
		</p>
	</section>

	<section aria-label="Истории и акции" class="stories-wrapper">
		<Stories />
	</section>

	<section class="product-section surface-card" aria-labelledby="cards-heading">
		<div class="section-heading">
			<p class="section-heading__eyebrow">Карты</p>
			<div class="section-heading__title-row">
				<h2 class="section-heading__title" id="cards-heading">Ваши продукты</h2>
				<button class="ghost-action" type="button" disabled aria-disabled="true" title="Добавление пока недоступно">
					Добавить
				</button>
			</div>
		</div>
		<div class="cards-grid" role="group" aria-label="Скелетные карточки продуктов">
			<SkeletonCard width="100%" height="124px" hasIcon={true} hasText={true} textLines={2} />
			<SkeletonCard width="100%" height="124px" hasIcon={true} hasText={true} textLines={2} />
		</div>
		<div class="bank-card surface-muted" aria-hidden="true">
			<div class="card-info">
				<div class="card-icon" aria-hidden="true">💳</div>
				<div class="card-details">
					<div class="skeleton-line skeleton-line-small"></div>
					<div class="skeleton-line skeleton-line-mini"></div>
				</div>
			</div>
			<div class="skeleton-line skeleton-amount"></div>
		</div>
	</section>

	<SkeletonSection title="Кредит" hasAction={true} itemsCount={1} />
	<SkeletonSection title="Вклады" hasAction={true} itemsCount={2} />
</main>

<style>
	.bank-home {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		padding-top: 1.25rem;
		padding-bottom: 48px ;
	}

	.hero {
		padding: 1.75rem 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.hero-eyebrow {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.hero-eyebrow p {
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.72);
		margin: 0;
	}

	.hero-logo {
		width: 20px;
		height: auto;
		filter: brightness(0) invert(1);
		opacity: 0.72;
	}

	.hero-title {
		font-family: var(--font-display);
		font-size: clamp(1.5rem, 1.2rem + 1vw, 1.85rem);
		font-weight: 700;
		letter-spacing: -0.01em;
		color: var(--color-fg-inverse);
		margin: 0;
	}

	.hero-subtitle {
		font-size: 0.95rem;
		color: rgba(255, 255, 255, 0.82);
		margin: 0;
		max-width: 24rem;
	}

	.stories-wrapper {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.product-section {
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.section-heading__title-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.75rem;
	}

	.ghost-action {
		background: var(--color-surface-muted);
		border: 1px solid var(--color-border-muted);
		border-radius: var(--radius-full);
		padding: 0.35rem 0.9rem;
		font-size: 0.8125rem;
		font-weight: 600;
		letter-spacing: 0.02em;
		color: var(--color-fg-secondary);
		cursor: not-allowed;
		opacity: .4;
	}

	.cards-grid {
		display: grid;
		gap: 1rem;
		grid-template-columns: repeat(auto-fit, minmax(152px, 1fr));
	}

	.bank-card {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border-subtle);
	}

	.card-info {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.card-icon {
		font-size: 1.5rem;
	}

	.card-details {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.skeleton-line {
		border-radius: 999px;
		background: rgba(26, 37, 54, 0.08);
	}

	.skeleton-line-small {
		width: 140px;
		height: 0.75rem;
	}

	.skeleton-line-mini {
		width: 96px;
		height: 0.6rem;
	}

	.skeleton-amount {
		width: 110px;
		height: 0.8rem;
	}

</style>
