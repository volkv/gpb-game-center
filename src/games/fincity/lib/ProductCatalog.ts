import { BuildingType } from '../types/Building';

export interface BankProduct {
  id: string;
  title: string;
  subtitle: string;
  shortDescription: string;
  detailedDescription: string;
  benefits: string[];
  conditions: string[];
  ctaText: string;
  ctaUrl: string;
  iconName?: string;
  category: 'savings' | 'investment' | 'protection' | 'services' | 'education';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface BuildingProductMapping {
  buildingType: BuildingType;
  product: BankProduct;
  unlockQuest?: string;
  educationQuest?: string;
}

export const bankProducts: Record<BuildingType, BankProduct> = {
  [BuildingType.CENTRAL_BANK]: {
    id: 'savings_account',
    title: 'Накопительный счет',
    subtitle: 'Надежная основа для ваших сбережений',
    shortDescription: 'Сохраняйте и приумножайте свои средства с гарантированной доходностью.',
    detailedDescription: 'Накопительный счет Газпромбанка — это простой и надежный способ сохранить и приумножить ваши сбережения. Деньги всегда под рукой, а доходность выше, чем по обычному счету.',
    benefits: [
      'Доходность до 8% годовых',
      'Без комиссий за обслуживание',
      'Мгновенное пополнение и снятие',
      'Страхование вкладов до 1,4 млн ₽',
      'Управление через мобильное приложение'
    ],
    conditions: [
      'Минимальная сумма: от 1 ₽',
      'Возможность пополнения в любое время',
      'Снятие без потери процентов',
      'Процент начисляется ежедневно'
    ],
    ctaText: 'Открыть накопительный счет',
    ctaUrl: '/products/savings-account',
    iconName: 'bank',
    category: 'savings',
    difficulty: 'beginner'
  },

  [BuildingType.SECURITY_HQ]: {
    id: 'fraud_protection',
    title: 'Защита от мошенничества',
    subtitle: 'Комплексная защита ваших финансов',
    shortDescription: 'Современные технологии защиты от финансовых мошенников и киберугроз.',
    detailedDescription: 'Многоуровневая система защиты Газпромбанка обеспечивает безопасность ваших средств и персональных данных. Искусственный интеллект анализирует операции в режиме реального времени.',
    benefits: [
      '24/7 мониторинг подозрительных операций',
      'SMS-уведомления о всех транзакциях',
      'Блокировка карты одной командой',
      'Возмещение украденных средств',
      'Обучение распознаванию мошенничества'
    ],
    conditions: [
      'Подключается автоматически',
      'Бесплатно для всех клиентов',
      'Работает со всеми продуктами банка',
      'Поддержка экспертов 24/7'
    ],
    ctaText: 'Узнать о защите',
    ctaUrl: '/security/fraud-protection',
    iconName: 'shield',
    category: 'protection',
    difficulty: 'beginner'
  },

  [BuildingType.CAPITAL_TOWER]: {
    id: 'investment_life_insurance',
    title: 'Инвестиционное страхование жизни',
    subtitle: 'Инвестиции + защита в одном продукте',
    shortDescription: 'Современный инструмент для роста капитала с дополнительной защитой жизни.',
    detailedDescription: 'ИСЖ Газпромбанка сочетает возможности инвестирования с надежной страховой защитой. Ваши средства работают на фондовом рынке, а семья защищена от финансовых рисков.',
    benefits: [
      'Потенциальная доходность до 15% годовых',
      'Страховая защита жизни',
      'Налоговые льготы до 52 000 ₽ в год',
      'Профессиональное управление активами',
      'Возможность досрочного расторжения'
    ],
    conditions: [
      'Минимальный взнос: от 50 000 ₽',
      'Срок договора: от 5 лет',
      'Страховая сумма: от 100 000 ₽',
      'Комиссия управляющей компании: до 2%'
    ],
    ctaText: 'Рассчитать доходность',
    ctaUrl: '/investments/life-insurance',
    iconName: 'building',
    category: 'investment',
    difficulty: 'advanced'
  },

  [BuildingType.LONGEVITY_PARK]: {
    id: 'long_term_savings',
    title: 'Долгосрочные сбережения',
    subtitle: 'Планируйте финансовое будущее уже сегодня',
    shortDescription: 'Специальные программы накоплений для достижения долгосрочных финансовых целей.',
    detailedDescription: 'Программы долгосрочных сбережений помогают планомерно накапливать средства на пенсию, образование детей или крупные покупки. Дисциплинированный подход к накоплениям гарантирует финансовую стабильность.',
    benefits: [
      'Повышенная доходность за длительность',
      'Автоматическое пополнение счета',
      'Капитализация процентов',
      'Персональный финансовый план',
      'Защита от инфляции'
    ],
    conditions: [
      'Минимальный срок: от 3 лет',
      'Регулярные взносы: от 5 000 ₽/мес',
      'Досрочное снятие с потерей бонусов',
      'Гибкие условия пополнения'
    ],
    ctaText: 'Составить план накоплений',
    ctaUrl: '/savings/long-term',
    iconName: 'tree',
    category: 'savings',
    difficulty: 'intermediate'
  },

  [BuildingType.PARTNER_MALL]: {
    id: 'cashback_programs',
    title: 'Программы кэшбэка',
    subtitle: 'Возвращайте часть средств с каждой покупки',
    shortDescription: 'Получайте кэшбэк до 30% у партнеров и до 5% по всем остальным покупкам.',
    detailedDescription: 'Карты Газпромбанка с кэшбэком превращают каждую покупку в выгоду. Развитая сеть партнеров и высокие ставки возврата делают расходы более осознанными и выгодными.',
    benefits: [
      'Кэшбэк до 30% у партнеров',
      'До 5% на все остальные покупки',
      'Более 10 000 партнерских магазинов',
      'Ежемесячные специальные предложения',
      'Накопление и обмен на бонусы'
    ],
    conditions: [
      'Обслуживание карты: от 0 ₽',
      'Минимальная сумма для кэшбэка: 100 ₽',
      'Максимальный кэшбэк: 3 000 ₽/мес',
      'Кэшбэк зачисляется до 60 дней'
    ],
    ctaText: 'Выбрать карту с кэшбэком',
    ctaUrl: '/cards/cashback',
    iconName: 'gift',
    category: 'services',
    difficulty: 'beginner'
  },

  [BuildingType.RESEARCH_INSTITUTE]: {
    id: 'financial_education',
    title: 'Финансовая грамотность',
    subtitle: 'Знания для принятия правильных финансовых решений',
    shortDescription: 'Бесплатные курсы, вебинары и материалы для повышения финансовой грамотности.',
    detailedDescription: 'Образовательная программа Газпромбанка поможет разобраться в финансовых инструментах, научиться планировать бюджет и принимать взвешенные инвестиционные решения.',
    benefits: [
      'Бесплатные онлайн-курсы',
      'Вебинары с экспертами',
      'Персональные консультации',
      'Сертификаты об окончании курсов',
      'Практические задания и тесты'
    ],
    conditions: [
      'Доступно всем клиентам банка',
      'Курсы различного уровня сложности',
      'Гибкий график обучения',
      'Поддержка наставников'
    ],
    ctaText: 'Начать обучение',
    ctaUrl: '/education/financial-literacy',
    iconName: 'book',
    category: 'education',
    difficulty: 'beginner'
  },

  [BuildingType.CREDIT_OFFICE]: {
    id: 'consumer_credits',
    title: 'Потребительские кредиты',
    subtitle: 'Кредиты на любые цели с выгодными условиями',
    shortDescription: 'Получите кредит наличными или на карту для реализации ваших планов.',
    detailedDescription: 'Потребительские кредиты Газпромбанка помогут воплотить в жизнь ваши планы и мечты. Гибкие условия, быстрое рассмотрение заявки и удобное погашение.',
    benefits: [
      'Сумма до 5 млн ₽',
      'Ставка от 4,9% годовых',
      'Срок до 7 лет',
      'Без поручителей и залога',
      'Быстрое рассмотрение заявки'
    ],
    conditions: [
      'Возраст от 20 до 70 лет',
      'Стаж работы от 3 месяцев',
      'Гражданство РФ',
      'Постоянная регистрация'
    ],
    ctaText: 'Оформить кредит',
    ctaUrl: '/credits/consumer',
    iconName: 'credit-card',
    category: 'services',
    difficulty: 'intermediate'
  },

  [BuildingType.AUTO_SHOWROOM]: {
    id: 'car_credits',
    title: 'Автокредиты',
    subtitle: 'Специальные условия на покупку автомобиля',
    shortDescription: 'Кредиты на покупку нового или подержанного автомобиля на выгодных условиях.',
    detailedDescription: 'Автокредиты Газпромбанка позволяют приобрести автомобиль мечты с минимальными затратами. Специальные партнерские программы с автосалонами и выгодные ставки.',
    benefits: [
      'Сумма до 7 млн ₽',
      'Первоначальный взнос от 0%',
      'Ставка от 3,9% годовых',
      'Срок до 7 лет',
      'Партнерские программы с автосалонами'
    ],
    conditions: [
      'Возраст от 21 до 65 лет',
      'Стаж работы от 6 месяцев',
      'Гражданство РФ',
      'Автомобиль не старше 10 лет'
    ],
    ctaText: 'Выбрать автокредит',
    ctaUrl: '/credits/car',
    iconName: 'car',
    category: 'services',
    difficulty: 'intermediate'
  },

  [BuildingType.REAL_ESTATE_AGENCY]: {
    id: 'mortgage',
    title: 'Ипотека',
    subtitle: 'Квартира мечты в кредит на выгодных условиях',
    shortDescription: 'Ипотечные кредиты на покупку квартиры или дома с государственной поддержкой.',
    detailedDescription: 'Ипотека Газпромбанка — это возможность приобрести собственное жилье на выгодных условиях. Различные программы с государственной поддержкой и партнерские программы с застройщиками.',
    benefits: [
      'Сумма до 30 млн ₽',
      'Первоначальный взнос от 10%',
      'Ставка от 5,9% годовых',
      'Срок до 30 лет',
      'Программы с господдержкой'
    ],
    conditions: [
      'Возраст от 21 до 65 лет',
      'Стаж работы от 6 месяцев',
      'Гражданство РФ',
      'Первоначальный взнос от 10%'
    ],
    ctaText: 'Рассчитать ипотеку',
    ctaUrl: '/credits/mortgage',
    iconName: 'home',
    category: 'services',
    difficulty: 'advanced'
  }
};

export function getProductByBuildingType(buildingType: BuildingType): BankProduct {
  return bankProducts[buildingType];
}

export function getProductsByCategory(category: BankProduct['category']): BankProduct[] {
  return Object.values(bankProducts).filter(product => product.category === category);
}

export function getProductsByDifficulty(difficulty: BankProduct['difficulty']): BankProduct[] {
  return Object.values(bankProducts).filter(product => product.difficulty === difficulty);
}

export function getAllProducts(): BankProduct[] {
  return Object.values(bankProducts);
}