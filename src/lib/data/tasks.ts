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
		requirements: ['Перейти по ссылке', 'Изучить условия карты', 'Узнать о кешбэке'],
		gradient: 'linear-gradient(130deg, rgba(82, 173, 228, 0.70) 0%, rgba(31, 196, 217, 0.60) 55%, rgba(113, 229, 241, 0.50) 100%)',
		themeColor: 'var(--color-accent-500)'
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
		requirements: ['Изучить процентные ставки', 'Узнать минимальную сумму', 'Ознакомиться с условиями'],
		gradient: 'linear-gradient(140deg, rgba(43, 180, 138, 0.70) 0%, rgba(226, 165, 58, 0.60) 50%, rgba(0, 122, 195, 0.50) 100%)',
		themeColor: 'var(--color-state-success)'
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
		requirements: ['Изучить привилегии', 'Узнать о консьерж-сервисе', 'Ознакомиться со страхованием'],
		gradient: 'linear-gradient(155deg, rgba(226, 165, 58, 0.75) 0%, rgba(215, 139, 44, 0.65) 50%, rgba(0, 106, 165, 0.55) 100%)',
		themeColor: 'var(--color-state-warning)'
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
		requirements: ['Заполнить анкету', 'Указать доходы', 'Отправить заявку'],
		gradient: 'linear-gradient(125deg, rgba(0, 106, 165, 0.80) 0%, rgba(38, 147, 212, 0.70) 50%, rgba(31, 196, 217, 0.60) 100%)',
		themeColor: 'var(--color-brand-500)'
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
		requirements: ['Изучить услуги', 'Выбрать тариф', 'Оставить заявку'],
		gradient: 'linear-gradient(145deg, rgba(11, 15, 33, 0.85) 0%, rgba(0, 59, 92, 0.75) 50%, rgba(0, 106, 165, 0.65) 100%)',
		themeColor: 'var(--color-brand-600)'
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
		requirements: ['Изучить тарифы', 'Выбрать тип терминала', 'Подать заявку'],
		gradient: 'linear-gradient(135deg, rgba(113, 229, 241, 0.75) 0%, rgba(64, 214, 230, 0.65) 50%, rgba(0, 122, 195, 0.55) 100%)',
		themeColor: 'var(--color-accent-400)'
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
		requirements: ['Выбрать тип депозита', 'Внести средства от 10 000₽', 'Подписать договор'],
		gradient: 'linear-gradient(130deg, rgba(226, 165, 58, 0.90) 0%, rgba(43, 180, 138, 0.80) 50%, rgba(0, 122, 195, 0.70) 100%)',
		themeColor: 'var(--color-state-warning)'
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
		requirements: ['Открыть брокерский счет', 'Пополнить счет', 'Совершить сделку'],
		gradient: 'linear-gradient(120deg, rgba(0, 59, 92, 0.90) 0%, rgba(0, 106, 165, 0.80) 50%, rgba(31, 196, 217, 0.70) 100%)',
		themeColor: 'var(--color-brand-700)'
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
		requirements: ['Выбрать программу страхования', 'Рассчитать стоимость', 'Оформить полис'],
		gradient: 'linear-gradient(150deg, rgba(209, 60, 106, 0.80) 0%, rgba(0, 59, 92, 0.75) 50%, rgba(0, 106, 165, 0.65) 100%)',
		themeColor: 'var(--color-state-danger)'
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
		requirements: ['Изучить условия', 'Подготовить документы', 'Заключить договор'],
		gradient: 'linear-gradient(160deg, rgba(43, 180, 138, 0.85) 0%, rgba(64, 214, 230, 0.75) 50%, rgba(0, 90, 137, 0.65) 100%)',
		themeColor: 'var(--color-state-success)'
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