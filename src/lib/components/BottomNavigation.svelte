<script lang="ts">
	const navItems = [
		{ id: 'main', icon: '🏠', label: 'Главная', isActive: true },
		{ id: 'payments', icon: '💳', label: 'Платежи', isActive: false },
		{ id: 'transfers', icon: '💸', label: 'Переводы', isActive: false },
		{ id: 'chat', icon: '💬', label: 'Чат', isActive: false },
		{ id: 'more', icon: '⋯', label: 'Еще', isActive: false }
	];
</script>

<div class="bottom-navigation">
	{#each navItems as item}
		<button class="nav-item" class:active={item.isActive} disabled={!item.isActive}>
			<span class="nav-icon">{item.icon}</span>
			<span class="nav-label">{item.label}</span>
		</button>
	{/each}
</div>

<style>
	.bottom-navigation {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: white;
		border-top: 1px solid rgb(240, 240, 240);
		display: flex;
		justify-content: space-around;
		padding: 8px 0 calc(8px + var(--ios-safe-area-bottom, 0px));
		z-index: 50;
		box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
	}

	.nav-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		padding: 8px 12px;
		background: none;
		border: none;
		cursor: pointer;
		transition: all 0.2s ease;
		min-width: 60px;
		border-radius: 8px;
	}

	.nav-item:disabled {
		cursor: default;
		opacity: 0.5;
	}

	.nav-item.active {
		color: var(--color-gpb-violet);
	}

	.nav-item:not(.active):not(:disabled):hover {
		background: rgb(248, 248, 248);
	}

	.nav-icon {
		font-size: 20px;
		line-height: 1;
	}

	.nav-label {
		font-size: 11px;
		font-weight: 500;
		text-align: center;
		line-height: 1.2;
	}

	.nav-item.active .nav-label {
		color: var(--color-gpb-violet);
		font-weight: 600;
	}

	.bottom-navigation {
		max-width: 500px;
		margin: 0 auto;
	}
</style>