import type { Task, TaskCategory } from '$lib/types/Tasks';

export const tasks: Task[] = [
	{
		id: 'task-1',
		title: 'Изучите умную дебетовую карту',
		description: 'Узнайте о преимуществах умной дебетовой карты "Мир"',
		fullDescription: 'Перейдите по ссылке и изучите преимущества умной дебетовой карты "Мир". Обратите внимание на кешбэк, условия обслуживания и дополнительные возможности.',
		reward: 1000,
		difficulty: 'easy',
		status: 'available',
		category: 'cards',
		estimatedTime: '2 мин',
		productUrl: 'https://www.gazprombank.ru/personal/cards/7579039/',
		productName: 'Умная дебетовая карта "Мир"',
		icon: '💳',
		requirements: ['Перейти по ссылке', 'Изучить условия карты', 'Узнать о кешбэке']
	},
	{
		id: 'task-7',
		title: 'Откройте депозит',
		description: 'Откройте депозит и получите высокую доходность',
		fullDescription: 'Выберите подходящий депозит из линейки продуктов, изучите условия и откройте вклад. Минимальная сумма от 10 000 рублей.',
		reward: 8000,
		difficulty: 'hard',
		status: 'available',
		category: 'deposits',
		estimatedTime: '25 мин',
		productUrl: 'https://www.gazprombank.ru/personal/deposits/',
		productName: 'Депозиты физических лиц',
		icon: '💰',
		requirements: ['Выбрать тип депозита', 'Внести средства от 10 000₽', 'Подписать договор']
	},
	{
		id: 'task-8',
		title: 'Начните инвестировать',
		description: 'Откройте брокерский счет и совершите первую сделку',
		fullDescription: 'Изучите инвестиционные возможности, откройте брокерский счет и совершите первую сделку на фондовом рынке через мобильное приложение или веб-платформу.',
		reward: 10000,
		difficulty: 'hard',
		status: 'available',
		category: 'investments',
		estimatedTime: '30 мин',
		productUrl: 'https://www.gazprombank.ru/personal/brokerage-service/',
		productName: 'Брокерское обслуживание',
		icon: '📊',
		requirements: ['Открыть брокерский счет', 'Пополнить счет', 'Совершить сделку']
	}
];

export const taskCategories: TaskCategory[] = [
	{
		id: 'cards',
		name: 'Банковские карты',
		icon: '💳',
		color: 'gradient-electric',
		tasks: tasks.filter(task => task.category === 'cards')
	},
	{
		id: 'deposits',
		name: 'Депозиты и вклады',
		icon: '💰',
		color: 'gradient-wealth',
		tasks: tasks.filter(task => task.category === 'deposits')
	},
	{
		id: 'credit',
		name: 'Кредитование',
		icon: '🏦',
		color: 'gradient-power',
		tasks: tasks.filter(task => task.category === 'credit')
	},
	{
		id: 'business',
		name: 'Для бизнеса',
		icon: '🏢',
		color: 'gradient-mystery',
		tasks: tasks.filter(task => task.category === 'business')
	},
	{
		id: 'investments',
		name: 'Инвестиции',
		icon: '📊',
		color: 'gradient-electric',
		tasks: tasks.filter(task => task.category === 'investments')
	},
	{
		id: 'premium',
		name: 'Премиум услуги',
		icon: '👑',
		color: 'gradient-wealth',
		tasks: tasks.filter(task => task.category === 'premium')
	}
];

export function getTasksData() {
	return tasks;
}

export function getTaskCategoriesData() {
	return taskCategories;
}