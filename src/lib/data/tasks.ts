import type { Task, TaskCategory } from '$lib/types/Tasks';

export const tasks: Task[] = [
	// ЛЕГКИЕ ЗАДАНИЯ (1000-2000 очков)
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
		id: 'task-2',
		title: 'Узнайте о депозитах',
		description: 'Изучите депозиты для бизнеса с доходностью до 16,4%',
		fullDescription: 'Ознакомьтесь с условиями депозитов для бизнеса. Изучите процентные ставки, минимальную сумму вклада и возможности досрочного снятия.',
		reward: 1200,
		difficulty: 'easy',
		status: 'available',
		category: 'deposits',
		estimatedTime: '3 мин',
		productUrl: 'https://www.gazprombank.ru/business/deposit/',
		productName: 'Депозиты для бизнеса',
		icon: '📈',
		requirements: ['Изучить процентные ставки', 'Узнать минимальную сумму', 'Ознакомиться с условиями']
	},
	{
		id: 'task-3',
		title: 'Премиальная карта Mir Supreme',
		description: 'Изучите возможности премиальной карты',
		fullDescription: 'Узнайте о привилегиях премиальной карты Mir Supreme: консьерж-сервис, программы лояльности, страховые программы и другие эксклюзивные услуги.',
		reward: 1500,
		difficulty: 'easy',
		status: 'available',
		category: 'premium',
		estimatedTime: '4 мин',
		productUrl: 'https://www.gazprombank.ru/premium/mirsupreme2/',
		productName: 'Премиальная карта Mir Supreme',
		icon: '👑',
		requirements: ['Изучить привилегии', 'Узнать о консьерж-сервисе', 'Ознакомиться со страхованием']
	},

	// СРЕДНИЕ ЗАДАНИЯ (3000-5000 очков)
	{
		id: 'task-4',
		title: 'Оформите кредитную карту',
		description: 'Подайте заявку на кредитную карту с льготным периодом до 120 дней',
		fullDescription: 'Оформите онлайн-заявку на кредитную карту с льготным периодом. Изучите условия, заполните анкету и отправьте заявку на рассмотрение.',
		reward: 3000,
		difficulty: 'medium',
		status: 'available',
		category: 'credit',
		estimatedTime: '10 мин',
		productUrl: 'https://www.gazprombank.ru/personal/credit-cards/7950641/',
		productName: 'Кредитная карта 120 дней',
		icon: '💳',
		requirements: ['Заполнить анкету', 'Указать доходы', 'Отправить заявку']
	},
	{
		id: 'task-5',
		title: 'Подключите банковское сопровождение',
		description: 'Изучите и подключите услугу банковского сопровождения для бизнеса',
		fullDescription: 'Ознакомьтесь с услугами банковского сопровождения: персональный менеджер, льготные тарифы, приоритетное обслуживание. Оставьте заявку на подключение.',
		reward: 4000,
		difficulty: 'medium',
		status: 'available',
		category: 'business',
		estimatedTime: '15 мин',
		productUrl: 'https://www.gazprombank.ru/business/bsk/',
		productName: 'Банковское сопровождение',
		icon: '🤝',
		requirements: ['Изучить услуги', 'Выбрать тариф', 'Оставить заявку']
	},
	{
		id: 'task-6',
		title: 'Настройте эквайринг',
		description: 'Подключите эквайринг для приема платежей по картам',
		fullDescription: 'Изучите возможности торгового эквайринга, тарифы и условия. Оставьте заявку на подключение терминала для приема платежных карт.',
		reward: 3500,
		difficulty: 'medium',
		status: 'available',
		category: 'payments',
		estimatedTime: '12 мин',
		productUrl: 'https://www.gazprombank.ru/business/trade-acquiring/',
		productName: 'Торговый эквайринг',
		icon: '💻',
		requirements: ['Изучить тарифы', 'Выбрать тип терминала', 'Подать заявку']
	},

	// СЛОЖНЫЕ ЗАДАНИЯ (7000-10000 очков)
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
	},
	{
		id: 'task-9',
		title: 'Оформите страхование',
		description: 'Подключите страхование карт и счетов',
		fullDescription: 'Защитите свои финансы с помощью страхования. Изучите программы страхования карт, счетов и имущества. Оформите полис онлайн.',
		reward: 7500,
		difficulty: 'hard',
		status: 'available',
		category: 'insurance',
		estimatedTime: '20 мин',
		productUrl: 'https://www.gazprombank.ru/personal/insurance/',
		productName: 'Страхование',
		icon: '🛡️',
		requirements: ['Выбрать программу страхования', 'Рассчитать стоимость', 'Оформить полис']
	},
	{
		id: 'task-10',
		title: 'Зарплатный проект',
		description: 'Подключите зарплатный проект для сотрудников',
		fullDescription: 'Оптимизируйте выплату зарплат сотрудникам. Изучите условия зарплатного проекта, льготные тарифы и дополнительные услуги для команды.',
		reward: 9000,
		difficulty: 'hard',
		status: 'available',
		category: 'business',
		estimatedTime: '35 мин',
		productUrl: 'https://www.gazprombank.ru/business/salary-project/',
		productName: 'Зарплатный проект',
		icon: '👥',
		requirements: ['Изучить условия', 'Подготовить документы', 'Заключить договор']
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