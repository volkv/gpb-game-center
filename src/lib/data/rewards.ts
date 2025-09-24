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
		terms: 'Подписка активируется в течение 24 часов после покупки'
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
		terms: 'Действует 30 дней с момента активации'
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
		terms: 'Подписка на 1 месяц, активация в личном кабинете Ozon'
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
		terms: 'Промокод действует 30 дней с момента получения'
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
		terms: 'Активируется в мобильном приложении «АЗС Газпромнефть»'
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
		terms: 'Промокод действует 14 дней с момента получения'
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