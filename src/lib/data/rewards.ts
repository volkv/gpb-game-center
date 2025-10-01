import type { Reward } from '$lib/types/Points';

export const rewards: Reward[] = [
	{
		id: 'gpb-premium',
		title: 'Газпромбанк премиум',
		description: 'Подписка на 1 месяц',
		cost: 10000,
		category: 'banking',
		icon: '💳',
		partner: 'Газпромбанк',
		isAvailable: true,
		validUntil: new Date('2025-12-31'),
		terms: 'Подписка активируется в течение 24 часов после покупки',
		gradient: 'linear-gradient(135deg, rgba(0, 106, 165, 0.80) 0%, rgba(31, 196, 217, 0.65) 60%, rgba(113, 229, 241, 0.50) 100%)',
		themeColor: 'var(--color-brand-600)'
	},
	{
		id: 'cashback-restaurants',
		title: 'Повышенный кешбек рестораны',
		description: '+ 1% кешбека на категорию рестораны',
		cost: 5000,
		category: 'banking',
		icon: '🍽️',
		partner: 'Газпромбанк',
		isAvailable: true,
		validUntil: new Date('2025-12-31'),
		terms: 'Действует 30 дней с момента активации',
		gradient: 'linear-gradient(140deg, rgba(43, 180, 138, 0.75) 0%, rgba(64, 214, 230, 0.60) 50%, rgba(0, 122, 195, 0.50) 100%)',
		themeColor: 'var(--color-state-success)'
	},
	{
		id: 'ozon-premium',
		title: 'Ozon Premium',
		description: 'Бесплатная доставка курьером',
		cost: 2000,
		category: 'shopping',
		icon: '📦',
		partner: 'Ozon',
		isAvailable: true,
		validUntil: new Date('2025-12-31'),
		terms: 'Подписка на 1 месяц, активация в личном кабинете Ozon',
		gradient: 'linear-gradient(150deg, rgba(82, 173, 228, 0.70) 0%, rgba(38, 147, 212, 0.65) 55%, rgba(0, 122, 195, 0.55) 100%)',
		themeColor: 'var(--color-brand-500)'
	},
	{
		id: 'lenta-discount',
		title: 'Магазин Лента',
		description: 'Скидка 13% на 5 покупок в месяц',
		cost: 1000,
		category: 'shopping',
		icon: '🛒',
		partner: 'Лента',
		isAvailable: true,
		validUntil: new Date('2025-12-31'),
		terms: 'Промокод действует 30 дней с момента получения',
		gradient: 'linear-gradient(160deg, rgba(113, 229, 241, 0.70) 0%, rgba(31, 196, 217, 0.65) 55%, rgba(43, 180, 138, 0.60) 100%)',
		themeColor: 'var(--color-accent-500)'
	},
	{
		id: 'gazpromneft-bonus',
		title: 'АЗС «Газпромнефть»',
		description: 'Повышенные бонусы — до 2 бонусов за каждый литр топлива',
		cost: 1000,
		category: 'fuel',
		icon: '⛽',
		partner: 'Газпромнефть',
		isAvailable: true,
		validUntil: new Date('2025-12-31'),
		terms: 'Активируется в мобильном приложении «АЗС Газпромнефть»',
		gradient: 'linear-gradient(145deg, rgba(226, 165, 58, 0.85) 0%, rgba(215, 139, 44, 0.70) 50%, rgba(0, 90, 137, 0.55) 100%)',
		themeColor: 'var(--color-state-warning)'
	},
	{
		id: 'dodo-pizza',
		title: 'Додо Пицца',
		description: '2 пиццы в подарок к заказам',
		cost: 1000,
		category: 'food',
		icon: '🍕',
		partner: 'Додо Пицца',
		isAvailable: true,
		validUntil: new Date('2025-12-31'),
		terms: 'Промокод действует 14 дней с момента получения',
		gradient: 'linear-gradient(125deg, rgba(209, 60, 106, 0.75) 0%, rgba(203, 58, 75, 0.65) 50%, rgba(0, 59, 92, 0.55) 100%)',
		themeColor: 'var(--color-state-danger)'
	}
];

export function getRewardsByCategory(category?: string): Reward[] {
	if (!category) return rewards;
	return rewards.filter(reward => reward.category === category);
}

export function getRewardById(id: string): Reward | undefined {
	return rewards.find(reward => reward.id === id);
}

export function getAvailableRewards(): Reward[] {
	return rewards.filter(reward => reward.isAvailable);
}