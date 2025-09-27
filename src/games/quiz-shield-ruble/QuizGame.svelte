<script lang="ts">
  import {
    Shield,
    Trophy,
    CheckCircle,
    XCircle,
    Star,
    Zap,
    BookOpen,
    BarChart3,
    ShieldCheck,
    CreditCard,
    BellRing,
    BadgeCheck,
    MessageCircleWarning,
    ShieldAlert
  } from 'lucide-svelte';
  import { fade } from 'svelte/transition';
  import { onMount, onDestroy, type ComponentType } from 'svelte';
  import { gameStore, currentGameState } from '$lib/stores/gameStore';
  import { Button, ProgressBar, GameLayout, LazyImage } from '$lib';
  import EvidencePreview, { type QuestionEvidence } from './components/EvidencePreview.svelte';
  import ExpertAdvice from './components/ExpertAdvice.svelte';
  import ProductSpotlight, { type ProductSpotlightData } from './components/ProductSpotlight.svelte';
  import ReminderOptIn from './components/ReminderOptIn.svelte';
  import ReminderBanner from './components/ReminderBanner.svelte';
  import type StatsDashboardType from './components/StatsDashboard.svelte';
  import type {
    AchievementView,
    FavoriteCategory,
    LevelOverview,
    SummaryMetrics
  } from './components/StatsDashboard.svelte';
  import {
    initReminderService,
    enableReminderSchedule,
    disableReminderSchedule,
    requestNotificationPermission,
    updateReminderPermission,
    getReminderSettings,
    markReminderAsHandled,
    type ReminderSettingsState,
    type ReminderRecord,
    type ReminderPermissionState
  } from './notifications';
  import { trackEvent, trackError } from './analytics';

  interface Props {
    onexit?: () => void;
  }

  interface ResultStats {
    accuracy: number;
    correctAnswers: number;
    level: string;
  }

  type Difficulty = 'easy' | 'medium' | 'hard';

  interface ExplanationBlock {
    summary: string;
    insights: string[];
  }

  interface ExpertAdviceContent {
    title: string;
    recommendations: string[];
  }

  interface MicroLesson {
    title: string;
    fact: string;
  }

  interface QuestionProductContext {
    name: string;
    description: string;
    highlight: string;
  }

  interface ProductMoment extends ProductSpotlightData {
    triggerQuestionId: number;
  }

  interface QuizQuestion {
    id: number;
    category: string;
    threat: string;
    text: string;
    answers: string[];
    correctAnswer: number;
    difficulty: Difficulty;
    explanation: ExplanationBlock;
    expertAdvice: ExpertAdviceContent;
    microLesson: MicroLesson;
    relatedProduct?: QuestionProductContext;
    tip?: string;
    evidence?: QuestionEvidence;
  }

  interface CategorySessionStats {
    correct: number;
    total: number;
  }

  interface StoredCategoryStats extends CategorySessionStats {
    currentStreak: number;
    bestStreak: number;
  }

  interface AchievementRecord {
    unlocked: boolean;
    unlockedAt?: string;
  }

  interface StoredProgress {
    totalSessions: number;
    totalCorrect: number;
    totalQuestions: number;
    bestScore: number;
    bestAccuracy: number;
    bestDefense: number;
    levelXp: number;
    currentLevelId: string;
    categoryStats: Record<string, StoredCategoryStats>;
    achievements: Record<string, AchievementRecord>;
    lastUpdated?: string;
  }

  interface SessionSummary {
    score: number;
    accuracy: number;
    defenseScore: number;
    correctAnswers: number;
    totalQuestions: number;
    completedAt: string;
    categoryBreakdown: Record<string, CategorySessionStats>;
  }

  interface AchievementContext {
    session: SessionSummary;
    progress: StoredProgress;
  }

  interface AchievementDefinition {
    id: string;
    title: string;
    description: string;
    icon: ComponentType;
    condition: (context: AchievementContext) => boolean;
    progressHint: (context: AchievementContext) => string;
  }

  interface LevelStage {
    id: string;
    name: string;
    minXp: number;
    description: string;
  }

  type ReminderOrigin = 'restored' | 'scheduled';

  interface ReminderQueueItem extends ReminderRecord {
    origin: ReminderOrigin;
  }

  const scorePerQuestion = 100;

  let { onexit }: Props = $props();

  let currentQuestionIndex = $state(0);
  let score = $state(0);
  let showResult = $state(false);
  let selectedAnswer = $state<number | null>(null);
  let showExplanation = $state(false);
  let resultStats = $state<ResultStats>({ accuracy: 0, correctAnswers: 0, level: 'Новичок' });
  let defenseScore = $state(0);
  let unlockedProductIds = $state<string[]>([]);
  let activeProduct = $state<ProductMoment | null>(null);
  let scorePulse = $state(false);

  let StatsDashboardComponent = $state<StatsDashboardType | null>(null);
  let isStatsComponentLoading = $state(false);
  let statsComponentError = $state<string | null>(null);

  let reminderSettings = $state<ReminderSettingsState>(getReminderSettings());
  let reminderQueue = $state<ReminderQueueItem[]>([]);
  let activeReminder = $state<ReminderQueueItem | null>(null);
  let reminderProcessing = $state(false);

  let prefersReducedMotion = $state(false);
  let motionQuery: MediaQueryList | null = null;

  const reminderPermission = $derived<ReminderPermissionState>(() => reminderSettings.permission);
  const nextReminderFireAt = $derived<number | undefined>(() => {
    const upcoming = reminderSettings.reminders
      .filter((record) => !record.delivered)
      .sort((a, b) => a.fireAt - b.fireAt)[0];
    return upcoming?.fireAt;
  });
  function accessibleFade(node: Element, options?: Parameters<typeof fade>[1]) {
    const requested = options?.duration ?? 220;
    const duration = prefersReducedMotion ? Math.max(1, Math.min(requested, 120)) : requested;
    return fade(node, { ...options, duration });
  }

  const questions: QuizQuestion[] = [
    {
      id: 1,
      category: 'SMS-фишинг',
      threat: 'Ложная блокировка карты',
      text:
        'Вы получили SMS якобы от Газпромбанка с сообщением о блокировке карты и требованием перейти по ссылке. Как поступить безопаснее всего?',
      answers: [
        'Перейти по ссылке из SMS и выполнить инструкции',
        'Игнорировать ссылку и самостоятельно позвонить в банк по официальному номеру',
        'Ответить на SMS и попросить подтверждение'
      ],
      correctAnswer: 1,
      difficulty: 'easy',
      explanation: {
        summary:
          'Официальные уведомления банка не содержат сторонних ссылок и не требуют вводить реквизиты через незнакомые формы.',
        insights: [
          'Имя отправителя и домен ссылки легко подделываются — проверяйте их напрямую в приложении банка.',
          'В SMS с угрозой блокировки всегда присутствует давление временем — это признак мошенничества.',
          'Самая безопасная реакция — связаться с банком по номеру с оборота карты или внутри приложения.'
        ]
      },
      expertAdvice: {
        title: 'Совет эксперта: как реагировать на подозрительные SMS',
        recommendations: [
          'Не переходите по ссылке и не отвечайте на сообщение — сохраните его для жалобы.',
          'Позвоните в банк через официальный номер и опишите ситуацию оператору.',
          'Добавьте номер отправителя в спам, чтобы не получать новые сообщения с того же канала.'
        ]
      },
      microLesson: {
        title: 'Факт по безопасности',
        fact: 'Фишинговые SMS почти всегда заставляют «действовать немедленно». Спокойный тон и отсутствие давления — признак официального уведомления.'
      },
      tip: 'Опасные SMS всегда торопят и содержат подозрительные ссылки.',
      evidence: {
        type: 'sms',
        sender: 'Газпромбанк',
        timestamp: '11:42',
        message: [
          'Служба безопасности: карта заблокирована!',
          'Для подтверждения личности перейдите по ссылке:'
        ],
        link: 'gpbank-verify.ru',
        caption: 'Ссылка ведёт на поддельный сайт — адрес не принадлежит банку.',
        ariaLabel: 'SMS с предупреждением о блокировке и ссылкой gpbank-verify.ru'
      }
    },
    {
      id: 2,
      category: 'Телефонные звонки',
      threat: 'Выигрыш с предоплатой',
      text:
        'Вам звонит «служба безопасности» и рассказывает о выигрыше, хотя push-контроль операций в приложении Газпромбанка не показывает списаний. Как поступить безопаснее всего?',
      answers: [
        'Перевести налог, чтобы не потерять приз',
        'Попросить прислать документы и дождаться подтверждения',
        'Прервать разговор и сообщить о звонке в банк'
      ],
      correctAnswer: 2,
      difficulty: 'easy',
      explanation: {
        summary:
          'Сотрудники банка не проводят розыгрыши и не требуют оплачивать «налоги» или комиссии за призы.',
        insights: [
          'Push-контроль операций показывает реальную активность по счёту — отсутствие списаний значит, что история с выигрышем выдумана.',
          'Запрос назвать номер карты, CVV или SMS-код — прямое нарушение банковских правил.',
          'Правильный алгоритм — немедленно прекратить разговор и связаться с банком самостоятельно.'
        ]
      },
      expertAdvice: {
        title: 'Совет эксперта: что делать при сомнительном звонке',
        recommendations: [
          'Не продолжайте диалог — вежливо завершите разговор и положите трубку.',
          'Проверьте последние операции в приложении и перезвоните в банк по официальному номеру.',
          'Запишите номер и время звонка и передайте информацию оператору банка.'
        ]
      },
      microLesson: {
        title: 'Факт по безопасности',
        fact: 'Push-уведомления банка появляются мгновенно — они надёжнее любого рассказа «сотрудника» по телефону.'
      },
      relatedProduct: {
        name: 'Push-контроль операций',
        description: 'Моментально уведомляет о каждой операции по карте и счёту прямо в приложении.',
        highlight: 'Сверяйте push до принятия решений — мошенники часто не знают про активные уведомления.'
      },
      tip: 'Мошенники часто представляются сотрудниками банка и требуют деньги «для проверки».',
      evidence: {
        type: 'call',
        caller: 'Служба безопасности',
        phone: '+7 (495) 123-45-67',
        riskNote: 'Требуют оплату «налога»',
        script: [
          '— Вы выиграли 1 000 000 ₽, нужно только оплатить налог.',
          '— Переведите 3 200 ₽ на указанный счёт прямо сейчас.',
          '— Для подтверждения назовите номер карты и CVV.'
        ],
        caption: 'Типичный сценарий телефонного мошенничества с предоплатой.',
        ariaLabel: 'Экран звонка с требованием оплатить налог за «выигрыш»'
      }
    },
    {
      id: 3,
      category: 'Фишинговые сайты',
      threat: 'Поддельная страница оплаты',
      text:
        'Вы открыли ссылку из письма: страница копирует интернет-банк и обещает «перепривязать виртуальную карту для онлайн-покупок», требуя ввести все реквизиты. Как поступить безопасно?',
      answers: [
        'Заполнить форму, чтобы быстрее вернуть доступ',
        'Проверить адрес и закрыть страницу, если домен подозрительный',
        'Перезагрузить страницу и попробовать снова'
      ],
      correctAnswer: 1,
      difficulty: 'medium',
      explanation: {
        summary:
          'Поддельные страницы имитируют дизайн банка, но выдают себя доменом и отсутствием защищённого соединения.',
        insights: [
          'Настоящие сервисы банка используют домен gpb.ru и защищённый протокол https с закрытым замком.',
          'Виртуальная карта создаётся и управляется только в приложении банка — подключение через сторонние формы опасно.',
          'Если сомневаетесь в источнике письма, откройте интернет-банк вручную, а не по ссылке.'
        ]
      },
      expertAdvice: {
        title: 'Совет эксперта: проверяем страницы оплаты',
        recommendations: [
          'Всегда сверяйте домен в адресной строке с закладкой на официальный сайт.',
          'Нажмите на замок в браузере и изучите сертификат — он должен быть выдан Газпромбанку.',
          'Используйте отдельную виртуальную карту для онлайн-платежей, чтобы снизить риск утечки.'
        ]
      },
      microLesson: {
        title: 'Факт по безопасности',
        fact: 'Виртуальная карта помогает изолировать риски — её можно моментально заморозить и задать лимит для сомнительных сайтов.'
      },
      relatedProduct: {
        name: 'Виртуальная карта для онлайн-покупок',
        description: 'Отдельные реквизиты для интернет-платежей, которые легко заморозить или заменить.',
        highlight: 'Оформляйте и управляйте виртуальной картой только в приложении Газпромбанка.'
      },
      tip: 'Всегда проверяйте домен и управляйте виртуальными картами только в приложении банка.',
      evidence: {
        type: 'website',
        url: 'gazprombank-secure-pay.ru',
        isSecure: false,
        title: 'Подтвердите отмену блокировки',
        prompts: [
          'Введите номер карты полностью',
          'Укажите срок действия и CVV',
          'Подтвердите одноразовый код'
        ],
        warning: 'Нет замка в адресной строке, домен отличается от официального.',
        caption: 'Адрес сайта выдает мошенников — это не домен Газпромбанка.',
        ariaLabel: 'Фальшивая страница оплаты с требованием реквизитов карты'
      }
    },
    {
      id: 4,
      category: 'Банкоматы',
      threat: 'Вмешательство в устройство',
      text:
        'У банкомата, которым вы собирались воспользоваться, слот для карт кажется перекрытым накладкой, а рядом мигает сторонний датчик. Ваши действия?',
      answers: [
        'Продолжить операцию — времени мало',
        'Прервать операцию, выбрать другой банкомат и сообщить в банк',
        'Попросить прохожего помочь вставить карту'
      ],
      correctAnswer: 1,
      difficulty: 'medium',
      explanation: {
        summary:
          'Лишние накладки, камеры или датчики на банкомате указывают на попытку скимминга и требуют немедленного прекращения операции.',
        insights: [
          'Скиммеры собирают данные карты и PIN с помощью накладок и скрытых камер.',
          'При малейших сомнениях используйте другой банкомат, лучше внутри отделения.',
          'Сообщение в банк помогает оперативно заблокировать устройство и предупредить других клиентов.'
        ]
      },
      expertAdvice: {
        title: 'Совет эксперта: безопасно пользуемся банкоматом',
        recommendations: [
          'Перед операцией осматривайте слот, клавиатуру и панель на предмет люфта или следов клея.',
          'Прикрывайте клавиатуру рукой, даже если картоприемник выглядит безопасно.',
          'Не стесняйтесь отменить операцию и позвонить в банк, если что-то смущает.'
        ]
      },
      microLesson: {
        title: 'Факт по безопасности',
        fact: 'Банкоматы в людных местах под видеонаблюдением и внутри отделений реже подвергаются скиммингу.'
      },
      tip: 'Неровные панели, накладки и скрытые камеры — признаки скимминга.',
      evidence: {
        type: 'atm',
        location: 'ТЦ «Океан»',
        status: 'Есть вмешательство',
        anomalies: [
          'Слот для карт закрыт пластиковой накладкой',
          'Над клавиатурой закреплён сторонний кожух',
          'Мигает незнакомый датчик рядом с экраном'
        ],
        caption: 'Любые накладки на банкомате — повод отказаться от операции.',
        ariaLabel: 'Банкомат с накладкой на слоте и посторонним оборудованием'
      }
    },
    {
      id: 5,
      category: 'Мобильные приложения',
      threat: 'Фальшивое обновление',
      text:
        'В стороннем приложении на телефоне появляется окно «обновления службы безопасности Газпромбанка», которое просит отключить защиту и ввести PIN. Что делать?',
      answers: [
        'Следовать инструкциям окна и отключить защиту',
        'Закрыть окно и проверять обновления только в официальном магазине приложений',
        'Отправить PIN «сотруднику» для проверки'
      ],
      correctAnswer: 1,
      difficulty: 'hard',
      explanation: {
        summary:
          'Настоящие обновления приходят только из App Store или Google Play и не требуют отключать защиту или вводить PIN в сторонних окнах.',
        insights: [
          'Всплывающие окна в сторонних приложениях не имеют доступа к служебным функциям банка — это приманка мошенников.',
          'Банк никогда не попросит отключить защиту устройства или повторно ввести PIN вне официального приложения.',
          'Если окно возникло само, удалите подозрительное приложение и просканируйте устройство антивирусом.'
        ]
      },
      expertAdvice: {
        title: 'Совет эксперта: контроль обновлений приложения',
        recommendations: [
          'Проверяйте наличие обновлений только в официальном магазине приложений.',
          'Включите многофакторную аутентификацию и биометрию — это усложнит доступ злоумышленникам.',
          'Регулярно просматривайте список установленных приложений и удаляйте лишние.'
        ]
      },
      microLesson: {
        title: 'Факт по безопасности',
        fact: 'Вредоносные приложения часто маскируются под расширения безопасности и появляются после установки со сторонних сайтов.'
      },
      tip: 'Проверяйте источник обновлений и не вводите данные в всплывающих окнах сторонних приложений.',
      evidence: {
        type: 'app',
        title: 'Security Update',
        prompt: 'Подключите расширение «Антифрод» к аккаунту',
        actions: ['Отключить «Безопасный вход»', 'Ввести PIN-код повторно'],
        warning: 'Запрос появился вне официального приложения — это фишинг.',
        caption: 'Окно маскируется под обновление, но просит отключить защиту.',
        ariaLabel: 'Фальшивое окно обновления, требующее отключить защиту и ввести PIN'
      }
    },
    {
      id: 6,
      category: 'Социальная инженерия',
      threat: 'Запрос одноразового кода',
      text:
        'В мессенджере пишет «куратор безопасности» и пугает отключением страховки карт и счетов, требуя код из SMS «для подтверждения защиты». Push из приложения показывает, что страховка активна. Как правильно реагировать?',
      answers: [
        'Отправить код, чтобы не потерять деньги',
        'Переслать сообщение друзьям и спросить, что делать',
        'Не передавать код и связаться с банком через официальные каналы'
      ],
      correctAnswer: 2,
      difficulty: 'hard',
      explanation: {
        summary:
          'Одноразовые коды — завершающий этап подтверждения операций. Передача кода равносильна согласию на перевод.',
        insights: [
          'Настоящие сотрудники банка не пишут в мессенджерах и не запрашивают коды из SMS.',
          'Страхование карт и счетов подключается и управляется только в приложении — для него не нужно «подтверждать» коды из чатов.',
          'После отказа сообщите о попытке мошенничества в банк, чтобы заблокировать канал.'
        ]
      },
      expertAdvice: {
        title: 'Совет эксперта: охраняем одноразовые коды',
        recommendations: [
          'Никогда не пересылайте проверочные коды и push-уведомления третьим лицам.',
          'Проверьте статус страховки и операции прямо в приложении, нажав на push-уведомление.',
          'Если код всё же отправили — немедленно позвоните в банк и заблокируйте операции.'
        ]
      },
      microLesson: {
        title: 'Факт по безопасности',
        fact: 'Страхование карт и счетов покрывает убытки при мошенничестве, если сразу сообщить в банк — передачи кодов страховка не требует.'
      },
      relatedProduct: {
        name: 'Страхование карт и счетов',
        description: 'Программа покрывает несанкционированные операции и помогает вернуть деньги при подтверждённом мошенничестве.',
        highlight: 'Активируйте и управляйте страховкой только через приложение Газпромбанка без сторонних «кураторов».'
      },
      tip: 'Сотрудники банка не запрашивают коды из SMS и push-уведомлений — даже для проверки страховки.',
      evidence: {
        type: 'social',
        platform: 'Messenger',
        contact: 'Куратор безопасности',
        messages: [
          { text: 'Мы заметили подозрительную операцию. Пришлите код из SMS для отмены.', highlight: true },
          { fromBank: true, text: 'Коды не передаю. Свяжусь с банком самостоятельно.' }
        ],
        caption: 'Сообщение от «куратора» просит код — прямой признак мошенничества.',
        ariaLabel: 'Переписка в мессенджере с запросом кода из SMS'
      }
    },
    {
      id: 7,
      category: 'Общественные сети',
      threat: 'Поддельный портал Wi‑Fi',
      text:
        'В общественной сети Wi‑Fi всплыла страница авторизации с просьбой ввести данные банковской карты «для подтверждения личности». Как действовать?',
      answers: [
        'Ввести данные карты — иначе не подключиться к сети',
        'Закрыть страницу и использовать мобильный интернет или VPN',
        'Сообщить данные частями: сначала номер, потом CVV'
      ],
      correctAnswer: 1,
      difficulty: 'hard',
      explanation: {
        summary:
          'Открытые сети Wi‑Fi не имеют отношения к банку и не требуют вводить реквизиты карт или коды подтверждения.',
        insights: [
          'Злоумышленники перехватывают данные в незашифрованных сетях и используют фальшивые порталы.',
          'Для авторизации в общедоступных сетях достаточно принять условия использования — реквизиты не нужны.',
          'Лучше перейти на мобильный интернет или VPN, если сайт требует конфиденциальные данные.'
        ]
      },
      expertAdvice: {
        title: 'Совет эксперта: безопасный доступ к Wi‑Fi',
        recommendations: [
          'Не вводите платежные данные в общественных сетях — используйте мобильную связь для финансовых операций.',
          'Включайте VPN, если необходимо использовать публичный Wi‑Fi для работы с чувствительной информацией.',
          'Удаляйте сохранённые публичные сети, чтобы телефон не подключался к ним автоматически.'
        ]
      },
      microLesson: {
        title: 'Факт по безопасности',
        fact: 'Поддельные порталы часто копируют логотип банка, но адрес сайта и сертификат принадлежат сторонним компаниям.'
      },
      tip: 'Для банковских операций используйте защищённые сети или мобильный интернет.',
      evidence: {
        type: 'website',
        url: 'freewifi-login.net',
        isSecure: false,
        title: 'Подтвердите личность для доступа',
        prompts: [
          'Введите номер карты Газпромбанка',
          'Укажите срок действия и CVV',
          'Внесите SMS-код подтверждения'
        ],
        warning: 'Запрос банковских реквизитов — признак мошеннического портала.',
        caption: 'Поддельный портал Wi‑Fi собирает реквизиты карты.',
        ariaLabel: 'Страница Wi-Fi с формой для ввода реквизитов карты'
      }
    }
  ];

  const STORAGE_KEY = 'quiz-shield-ruble-progress-v1';

  const levelStages: LevelStage[] = [
    {
      id: 'novice',
      name: 'Новичок',
      minXp: 0,
      description: 'Начальный уровень: вы знакомитесь с типовыми сценариями мошенничества.'
    },
    {
      id: 'analyst',
      name: 'Аналитик защиты',
      minXp: 200,
      description: 'Вы уверенно отличаете легитимные запросы от подозрительных и знаете основные приёмы защиты.'
    },
    {
      id: 'guardian',
      name: 'Страж финансов',
      minXp: 450,
      description: 'Вы системно обезвреживаете угрозы и подсказываете другим, как реагировать безопасно.'
    },
    {
      id: 'cyber-detective',
      name: 'Кибер-детектив',
      minXp: 700,
      description: 'Вы распознаёте атаки на лету и используете инструменты банка как профессионал.'
    }
  ];

  const achievementDefinitions: AchievementDefinition[] = [
    {
      id: 'fraud-detective',
      title: 'Детектив мошенничества',
      description: 'Пройдите тренировку без единой ошибки и наберите 100% точности.',
      icon: BadgeCheck,
      condition: ({ session }) => session.accuracy === 100,
      progressHint: ({ progress }) => `${progress.bestAccuracy}% лучшая точность`
    },
    {
      id: 'sms-expert',
      title: 'Эксперт по SMS',
      description: 'Безошибочно распознайте SMS-атаки в трёх сессиях подряд.',
      icon: MessageCircleWarning,
      condition: ({ progress }) => (progress.categoryStats['SMS-фишинг']?.bestStreak ?? 0) >= 3,
      progressHint: ({ progress }) => {
        const streak = progress.categoryStats['SMS-фишинг']?.currentStreak ?? 0;
        return `Текущая серия по SMS: ${Math.min(streak, 3)}/3`;
      }
    },
    {
      id: 'atm-guardian',
      title: 'Защитник банкоматов',
      description: 'Замечайте вмешательства в банкоматах в трёх сессиях подряд.',
      icon: ShieldAlert,
      condition: ({ progress }) => (progress.categoryStats['Банкоматы']?.bestStreak ?? 0) >= 3,
      progressHint: ({ progress }) => {
        const streak = progress.categoryStats['Банкоматы']?.currentStreak ?? 0;
        return `Текущая серия по банкоматам: ${Math.min(streak, 3)}/3`;
      }
    }
  ];

  function uniqueCategories() {
    return Array.from(new Set(questions.map((question) => question.category)));
  }

  function createEmptyStoredCategoryStats(): Record<string, StoredCategoryStats> {
    return uniqueCategories().reduce<Record<string, StoredCategoryStats>>((accumulator, category) => {
      accumulator[category] = { correct: 0, total: 0, currentStreak: 0, bestStreak: 0 };
      return accumulator;
    }, {});
  }

  function createEmptySessionCategoryStats(): Record<string, CategorySessionStats> {
    return uniqueCategories().reduce<Record<string, CategorySessionStats>>((accumulator, category) => {
      accumulator[category] = { correct: 0, total: 0 };
      return accumulator;
    }, {});
  }

  function createDefaultProgress(): StoredProgress {
    return {
      totalSessions: 0,
      totalCorrect: 0,
      totalQuestions: 0,
      bestScore: 0,
      bestAccuracy: 0,
      bestDefense: 0,
      levelXp: 0,
      currentLevelId: 'novice',
      categoryStats: createEmptyStoredCategoryStats(),
      achievements: {},
      lastUpdated: undefined
    };
  }

  let playerProgress = $state<StoredProgress>(createDefaultProgress());
  let sessionCategoryStats = $state<Record<string, CategorySessionStats>>(createEmptySessionCategoryStats());
  let sessionAchievements = $state<string[]>([]);
  let showStatistics = $state(false);
  let isProgressLoaded = $state(false);

  function determineLevelStage(xp: number): LevelStage {
    return levelStages.reduce((current, stage) => (xp >= stage.minXp ? stage : current), levelStages[0]);
  }

  function nextLevelStageFor(xp: number): LevelStage | null {
    const current = determineLevelStage(xp);
    const index = levelStages.findIndex((stage) => stage.id === current.id);
    if (index === -1 || index === levelStages.length - 1) {
      return null;
    }
    return levelStages[index + 1];
  }

  function alignCategoryStats(state: StoredProgress): StoredProgress {
    const template = createEmptyStoredCategoryStats();
    const merged: Record<string, StoredCategoryStats> = { ...template };

    for (const [category, stats] of Object.entries(state.categoryStats ?? {})) {
      merged[category] = {
        correct: stats.correct ?? 0,
        total: stats.total ?? 0,
        currentStreak: stats.currentStreak ?? 0,
        bestStreak: stats.bestStreak ?? 0
      };
    }

    return {
      ...state,
      categoryStats: merged
    };
  }

  function migrateProgress(raw: unknown): StoredProgress {
    if (!raw || typeof raw !== 'object') {
      return createDefaultProgress();
    }

    const base = createDefaultProgress();
    const value = raw as Partial<StoredProgress>;

    const achievements: Record<string, AchievementRecord> = { ...base.achievements };
    if (value.achievements) {
      for (const [id, record] of Object.entries(value.achievements)) {
        achievements[id] = {
          unlocked: !!record?.unlocked,
          unlockedAt: record?.unlockedAt
        };
      }
    }

    const merged: StoredProgress = {
      ...base,
      ...value,
      achievements,
      levelXp: value.levelXp ?? base.levelXp,
      currentLevelId: value.currentLevelId ?? base.currentLevelId,
      lastUpdated: value.lastUpdated ?? base.lastUpdated
    };

    return alignCategoryStats(merged);
  }

  function loadProgressFromStorage() {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      isProgressLoaded = true;
      return;
    }

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        playerProgress = migrateProgress(JSON.parse(stored));
      } else {
        playerProgress = createDefaultProgress();
      }
    } catch (error) {
      console.warn('Не удалось загрузить прогресс квиза', error);
      playerProgress = createDefaultProgress();
    } finally {
      isProgressLoaded = true;
    }
  }

  function persistProgress(state: StoredProgress) {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn('Не удалось сохранить прогресс квиза', error);
    }
  }

  function computeSummaryMetrics(state: StoredProgress): SummaryMetrics {
    const averageAccuracy = state.totalQuestions === 0
      ? 0
      : Math.round((state.totalCorrect / state.totalQuestions) * 100);

    return {
      totalSessions: state.totalSessions,
      bestScore: state.bestScore,
      bestAccuracy: state.bestAccuracy,
      averageAccuracy,
      bestDefense: state.bestDefense,
      totalCorrect: state.totalCorrect,
      totalQuestions: state.totalQuestions
    };
  }

  function computeFavoriteCategories(state: StoredProgress): FavoriteCategory[] {
    const categories = Object.entries(state.categoryStats)
      .filter(([, stats]) => stats.total > 0)
      .map(([name, stats]) => ({
        name,
        accuracy: Math.round((stats.correct / stats.total) * 100),
        total: stats.total,
        bestStreak: stats.bestStreak
      }))
      .sort((a, b) => {
        if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
        if (b.bestStreak !== a.bestStreak) return b.bestStreak - a.bestStreak;
        return b.total - a.total;
      });

    return categories.slice(0, 3);
  }

  function buildLevelOverview(state: StoredProgress): LevelOverview {
    const currentStage = determineLevelStage(state.levelXp);
    const nextStage = nextLevelStageFor(state.levelXp);
    const minBound = currentStage.minXp;
    const maxBound = nextStage ? nextStage.minXp : state.levelXp;
    const range = nextStage ? nextStage.minXp - minBound : 1;
    const ratio = nextStage ? Math.min(1, (state.levelXp - minBound) / range) : 1;

    return {
      name: currentStage.name,
      description: currentStage.description,
      xp: Math.round(state.levelXp),
      progressPercent: Math.round(ratio * 100),
      nextName: nextStage?.name,
      xpToNext: nextStage ? Math.max(0, Math.ceil(nextStage.minXp - state.levelXp)) : undefined
    };
  }

  function buildAchievementViews(state: StoredProgress, newlyUnlocked: string[]): AchievementView[] {
    const context: AchievementContext = {
      session: {
        score: 0,
        accuracy: 0,
        defenseScore: 0,
        correctAnswers: 0,
        totalQuestions: 0,
        completedAt: state.lastUpdated ?? new Date().toISOString(),
        categoryBreakdown: {}
      },
      progress: state
    };

    return achievementDefinitions.map((definition) => {
      const record = state.achievements[definition.id];
      const isUnlocked = record?.unlocked ?? false;
      const progressLabel = isUnlocked
        ? (record?.unlockedAt
            ? `Открыто ${new Date(record.unlockedAt).toLocaleDateString('ru-RU')}`
            : 'Открыто')
        : definition.progressHint(context);

      return {
        id: definition.id,
        title: definition.title,
        description: definition.description,
        icon: definition.icon,
        unlocked: isUnlocked,
        unlockedAt: record?.unlockedAt,
        progressLabel,
        isNew: newlyUnlocked.includes(definition.id)
      } satisfies AchievementView;
    });
  }

  function resolveSessionLevel(accuracy: number): string {
    if (accuracy >= 85) {
      return 'Кибер-детектив';
    }

    if (accuracy >= 65) {
      return 'Страж финансов';
    }

    if (accuracy >= 45) {
      return 'Аналитик защиты';
    }

    return 'Новичок';
  }

  function applySessionToProgress(session: SessionSummary) {
    const previous = alignCategoryStats(playerProgress);

    const updated: StoredProgress = {
      ...previous,
      totalSessions: previous.totalSessions + 1,
      totalCorrect: previous.totalCorrect + session.correctAnswers,
      totalQuestions: previous.totalQuestions + session.totalQuestions,
      bestScore: Math.max(previous.bestScore, session.score),
      bestAccuracy: Math.max(previous.bestAccuracy, session.accuracy),
      bestDefense: Math.max(previous.bestDefense, session.defenseScore),
      levelXp: previous.levelXp + session.accuracy,
      lastUpdated: session.completedAt,
      categoryStats: { ...previous.categoryStats },
      achievements: { ...previous.achievements }
    };

    for (const [category, stats] of Object.entries(session.categoryBreakdown)) {
      const stored = updated.categoryStats[category] ?? {
        correct: 0,
        total: 0,
        currentStreak: 0,
        bestStreak: 0
      };

      const questionTotal = stats.total ?? 0;
      const questionCorrect = stats.correct ?? 0;

      stored.total += questionTotal;
      stored.correct += questionCorrect;

      if (questionTotal > 0) {
        if (questionCorrect === questionTotal) {
          stored.currentStreak = (stored.currentStreak ?? 0) + 1;
        } else {
          stored.currentStreak = 0;
        }

        stored.bestStreak = Math.max(stored.bestStreak ?? 0, stored.currentStreak);
      }

      updated.categoryStats[category] = stored;
    }

    const currentStage = determineLevelStage(updated.levelXp);
    updated.currentLevelId = currentStage.id;

    const context: AchievementContext = { session, progress: updated };
    const newlyUnlocked: string[] = [];

    for (const definition of achievementDefinitions) {
      const existingRecord = updated.achievements[definition.id];
      const alreadyUnlocked = existingRecord?.unlocked ?? false;
      const conditionMet = definition.condition(context);

      if (conditionMet && !alreadyUnlocked) {
        updated.achievements[definition.id] = {
          unlocked: true,
          unlockedAt: session.completedAt
        };
        newlyUnlocked.push(definition.id);
      } else if (alreadyUnlocked) {
        updated.achievements[definition.id] = existingRecord;
      } else {
        updated.achievements[definition.id] = {
          unlocked: false,
          unlockedAt: existingRecord?.unlockedAt
        };
      }
    }

    return { updatedProgress: updated, unlockedAchievements: newlyUnlocked };
  }

  function handleMotionPreferenceChange(event: MediaQueryListEvent) {
    prefersReducedMotion = event.matches;
  }

  function detachMotionPreferenceListener() {
    if (!motionQuery) return;

    if (typeof motionQuery.removeEventListener === 'function') {
      motionQuery.removeEventListener('change', handleMotionPreferenceChange);
    } else if (typeof motionQuery.removeListener === 'function') {
      motionQuery.removeListener(handleMotionPreferenceChange);
    }

    motionQuery = null;
  }

  function enqueueReminder(record: ReminderRecord, origin: ReminderOrigin) {
    const item: ReminderQueueItem = { ...record, origin };
    reminderQueue = [...reminderQueue, item];

    if (!activeReminder) {
      showNextReminder();
    }
  }

  function showNextReminder() {
    if (reminderQueue.length === 0) {
      activeReminder = null;
      return;
    }

    const [next, ...rest] = reminderQueue;
    reminderQueue = rest;
    if (!next) {
      activeReminder = null;
      return;
    }

    activeReminder = next;

    trackEvent('reminder_presented', {
      reminderId: next.id,
      origin: next.origin,
      delayHours: next.delayHours
    });
  }

  function handleReminderDue(record: ReminderRecord) {
    trackEvent('reminder_due', {
      reminderId: record.id,
      delayHours: record.delayHours
    });

    enqueueReminder(record, 'scheduled');
  }

  function handleReminderDismiss() {
    if (!activeReminder) return;

    const dismissedId = activeReminder.id;
    markReminderAsHandled(dismissedId);
    trackEvent('reminder_dismissed', {
      reminderId: dismissedId,
      action: 'dismissed'
    });

    activeReminder = null;
    reminderQueue = reminderQueue.filter((item) => item.id !== dismissedId);
    showNextReminder();
    refreshReminderState();
  }

  function handleReminderAccept() {
    if (!activeReminder) return;

    const reminderId = activeReminder.id;
    markReminderAsHandled(reminderId);
    trackEvent('reminder_accepted', {
      reminderId,
      origin: activeReminder.origin
    });

    activeReminder = null;
    reminderQueue = reminderQueue.filter((item) => item.id !== reminderId);
    showNextReminder();
    refreshReminderState();

    handleStart();
  }

  function refreshReminderState() {
    reminderSettings = getReminderSettings();
  }

  async function handleReminderEnable() {
    if (reminderProcessing) return;
    reminderProcessing = true;

    try {
      if (reminderPermission === 'default' || reminderPermission === 'unknown') {
        const permission = await requestNotificationPermission();
        reminderSettings = updateReminderPermission(permission);
        trackEvent('notification_permission_resolved', { status: permission });
      }

      reminderSettings = enableReminderSchedule();
      trackEvent('reminder_opt_in', {
        permission: reminderSettings.permission,
        remindersPlanned: reminderSettings.reminders.length
      });
    } catch (error) {
      trackError('reminder_enable', error as Error);
    } finally {
      refreshReminderState();
      reminderProcessing = false;
    }
  }

  function handleReminderDisable() {
    if (reminderProcessing) return;
    reminderProcessing = true;

    try {
      reminderSettings = disableReminderSchedule();
      trackEvent('reminder_opt_out', {});
    } catch (error) {
      trackError('reminder_disable', error as Error);
    } finally {
      refreshReminderState();
      reminderProcessing = false;
      reminderQueue = [];
      activeReminder = null;
    }
  }

  async function ensureStatsComponent() {
    if (StatsDashboardComponent || isStatsComponentLoading) {
      return;
    }

    isStatsComponentLoading = true;
    statsComponentError = null;

    try {
      const module = await import('./components/StatsDashboard.svelte');
      StatsDashboardComponent = module.default as StatsDashboardType;
      trackEvent('stats_component_loaded');
    } catch (error) {
      statsComponentError = 'Не удалось загрузить статистику';
      trackError('stats_component_load', error as Error);
    } finally {
      isStatsComponentLoading = false;
    }
  }

  onMount(() => {
    loadProgressFromStorage();
    trackEvent('quiz_view', { questions: questions.length });

    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      const query = window.matchMedia('(prefers-reduced-motion: reduce)');
      prefersReducedMotion = query.matches;
      motionQuery = query;

      if (typeof query.addEventListener === 'function') {
        query.addEventListener('change', handleMotionPreferenceChange);
      } else if (typeof query.addListener === 'function') {
        query.addListener(handleMotionPreferenceChange);
      }
    }

    const { settings, dueReminders } = initReminderService(handleReminderDue);
    reminderSettings = settings;

    if (dueReminders.length > 0) {
      dueReminders.forEach((record) => enqueueReminder(record, 'restored'));
      trackEvent('reminder_queue_restored', { count: dueReminders.length });
    }

    return () => {
      detachMotionPreferenceListener();
    };
  });

  onDestroy(() => {
    detachMotionPreferenceListener();
  });

  const productMoments: ProductMoment[] = [
    {
      id: 'push-control',
      triggerQuestionId: 2,
      name: 'Push-контроль операций',
      tagline: 'Держите руку на пульсе счёта',
      description: 'Получайте мгновенные push-уведомления о списаниях и подтверждайте операции в один тап.',
      features: [
        'Моментально узнаёте о каждой операции по карте и счёту',
        'Встроенная кнопка «Это не я» для быстрого отклонения транзакций',
        'Работает даже в роуминге и без звонка оператору'
      ],
      bonusLabel: 'Бонус к защите',
      bonusValue: 25,
      icon: BellRing,
      contextLabel: 'После сценария «Телефонные звонки»'
    },
    {
      id: 'virtual-card',
      triggerQuestionId: 3,
      name: 'Виртуальная карта для онлайн-покупок',
      tagline: 'Отдельный слой безопасности',
      description: 'Создайте карту специально для интернета и управляйте лимитами в пару касаний.',
      features: [
        'Отдельные реквизиты не раскрывают данные основной карты',
        'Задавайте лимит на покупки и срок действия для редких оплат',
        'Замораживайте карту одной кнопкой при подозрении на мошенничество'
      ],
      bonusLabel: 'Бонус к защите',
      bonusValue: 35,
      icon: CreditCard,
      contextLabel: 'После сценария «Фишинговые сайты»'
    },
    {
      id: 'card-insurance',
      triggerQuestionId: 6,
      name: 'Страхование карт и счетов',
      tagline: 'Финансовый щит 24/7',
      description: 'Программа покрывает ущерб при мошеннических списаниях и помогает быстро вернуть средства.',
      features: [
        'Защита карт, счетов и мобильного банка от несанкционированных операций',
        'Поддержка специалистов и помощь в оспаривании транзакций',
        'Компенсация при подтверждённом мошенничестве'
      ],
      bonusLabel: 'Бонус к защите',
      bonusValue: 50,
      icon: ShieldCheck,
      contextLabel: 'После сценария «Социальная инженерия»',
      cta: {
        label: 'Узнать о страховке',
        href: 'https://www.gazprombank.ru/personal/insurance/insurance_cards/',
        external: true
      }
    }
  ];

  const maxDefenseScore = productMoments.reduce((total, product) => total + product.bonusValue, 0);

  const currentQuestion = $derived(questions[currentQuestionIndex]);
  const quizProgress = $derived(((currentQuestionIndex + 1) / questions.length) * 100);
  const maxScore = $derived(questions.length * scorePerQuestion);
  const isAnswerCorrect = $derived(selectedAnswer !== null && selectedAnswer === currentQuestion.correctAnswer);
  const defenseProgress = $derived(
    maxDefenseScore === 0 ? 0 : Math.round((defenseScore / maxDefenseScore) * 100)
  );
  const finalCtaMessage = $derived(() => {
    if (defenseProgress >= 80) {
      return `Вы собрали ${defenseProgress}% защитного потенциала — подключите страхование карт и счетов, чтобы закрепить уровень.`;
    }

    if (defenseProgress >= 40) {
      return `Вы нарастили ${defenseProgress}% защитного потенциала. Страхование карт и счетов добавит компенсацию и сопровождение специалистов.`;
    }

    return 'Начните с надежного щита: страхование карт и счетов поможет возместить потери, даже если атака произойдет неожиданно.';
  });

  const difficultyLabels: Record<Difficulty, string> = {
    easy: 'Базовый уровень',
    medium: 'Продвинутый уровень',
    hard: 'Экспертный уровень'
  };

  const difficultyOrder: Difficulty[] = ['easy', 'medium', 'hard'];

  const stageInfo = $derived(() => {
    const currentDifficulty = currentQuestion.difficulty;
    const stageIndex = difficultyOrder.indexOf(currentDifficulty);
    const totalStages = difficultyOrder.length;

    const questionsBefore = questions.filter(
      (question) => difficultyOrder.indexOf(question.difficulty) < stageIndex
    ).length;

    const questionsInStage = questions.filter((question) => question.difficulty === currentDifficulty).length;
    const stagePosition = currentQuestionIndex - questionsBefore + 1;

    return {
      stageLabel: difficultyLabels[currentDifficulty],
      stageIndex: stageIndex + 1,
      totalStages,
      stagePosition,
      questionsInStage,
      isStageStart: currentQuestionIndex === questionsBefore
    };
  });

  const currentMicroLesson = $derived(() => currentQuestion.microLesson);
  const summaryMetrics = $derived<SummaryMetrics>(() => computeSummaryMetrics(playerProgress));
  const topCategories = $derived<FavoriteCategory[]>(() => computeFavoriteCategories(playerProgress));
  const levelOverview = $derived<LevelOverview>(() => buildLevelOverview(playerProgress));
  const achievementViews = $derived<AchievementView[]>(() => buildAchievementViews(playerProgress, sessionAchievements));
  const hasRecordedSessions = $derived(playerProgress.totalSessions > 0);
  const recentAchievements = $derived(() => achievementViews.filter((achievement) => achievement.isNew));

  function isProductUnlocked(id: string) {
    return unlockedProductIds.includes(id);
  }

  function tryActivateProductMoment(questionId: number) {
    const moment = productMoments.find(
      (item) => item.triggerQuestionId === questionId && !isProductUnlocked(item.id)
    );

    if (!moment) {
      return false;
    }

    unlockedProductIds = [...unlockedProductIds, moment.id];
    defenseScore += moment.bonusValue;
    activeProduct = moment;
    trackEvent('product_spotlight_shown', {
      productId: moment.id,
      bonus: moment.bonusValue
    });
    return true;
  }

  function handleProductContinue() {
    if (!activeProduct) {
      return;
    }

    const product = activeProduct;
    activeProduct = null;

    if (currentQuestionIndex < questions.length - 1) {
      currentQuestionIndex += 1;
      selectedAnswer = null;
      showExplanation = false;
    } else {
      finishGame();
    }

    trackEvent('product_spotlight_continue', { productId: product.id });
  }

  function resetGameState() {
    currentQuestionIndex = 0;
    score = 0;
    showResult = false;
    selectedAnswer = null;
    showExplanation = false;
    resultStats = { accuracy: 0, correctAnswers: 0, level: 'Новичок' };
    defenseScore = 0;
    unlockedProductIds = [];
    activeProduct = null;
    sessionCategoryStats = createEmptySessionCategoryStats();
    sessionAchievements = [];
    showStatistics = false;
    scorePulse = false;
  }

  function handleStart() {
    resetGameState();
    trackEvent('quiz_start', {
      level: playerProgress.currentLevelId,
      totalQuestions: questions.length
    });
    gameStore.startGame('quiz-shield-ruble');
  }

  function handleAnswerSelect(index: number) {
    if (showExplanation) return;
    selectedAnswer = index;
  }

  function handleAnswerSubmit() {
    if (selectedAnswer === null || showExplanation) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    if (isCorrect) {
      score += scorePerQuestion;
      scorePulse = true;
      if (typeof window !== 'undefined') {
        window.setTimeout(() => {
          scorePulse = false;
        }, prefersReducedMotion ? 0 : 480);
      } else {
        scorePulse = false;
      }
    } else {
      scorePulse = false;
    }

    const category = currentQuestion.category;
    const currentStats = sessionCategoryStats[category] ?? { correct: 0, total: 0 };
    sessionCategoryStats = {
      ...sessionCategoryStats,
      [category]: {
        correct: currentStats.correct + (isCorrect ? 1 : 0),
        total: currentStats.total + 1
      }
    };

    showExplanation = true;

    trackEvent('quiz_answer', {
      questionId: currentQuestion.id,
      correct: isCorrect,
      difficulty: currentQuestion.difficulty,
      stageIndex: stageInfo.stageIndex,
      stagePosition: stageInfo.stagePosition
    });
  }

  function handleNext() {
    if (activeProduct) {
      handleProductContinue();
      return;
    }

    if (showExplanation) {
      const pausedForProduct = tryActivateProductMoment(currentQuestion.id);
      if (pausedForProduct) {
        showExplanation = false;
        return;
      }
    }

    if (currentQuestionIndex < questions.length - 1) {
      currentQuestionIndex += 1;
      selectedAnswer = null;
      showExplanation = false;
    } else {
      finishGame();
    }
  }

  function finishGame() {
    activeProduct = null;
    showExplanation = false;

    const finalScore = score;
    const totalQuestions = Object.values(sessionCategoryStats).reduce(
      (total, stats) => total + (stats?.total ?? 0),
      0
    ) || questions.length;
    const maxScoreValue = totalQuestions * scorePerQuestion;
    const correctAnswers = Math.round(finalScore / scorePerQuestion);
    const accuracyPercent = Math.round((finalScore / maxScoreValue) * 100);

    const sessionLevel = resolveSessionLevel(accuracyPercent);
    const completedAt = new Date().toISOString();

    const sessionSummary: SessionSummary = {
      score: finalScore,
      accuracy: accuracyPercent,
      defenseScore,
      correctAnswers,
      totalQuestions,
      completedAt,
      categoryBreakdown: sessionCategoryStats
    };

    const { updatedProgress, unlockedAchievements } = applySessionToProgress(sessionSummary);
    playerProgress = updatedProgress;
    sessionAchievements = unlockedAchievements;
    persistProgress(updatedProgress);

    gameStore.completeGame({
      score: finalScore,
      maxScore: maxScoreValue,
      correctAnswers,
      totalAnswers: totalQuestions,
      accuracy: accuracyPercent / 100
    });

    resultStats = { accuracy: accuracyPercent, correctAnswers, level: sessionLevel };
    showResult = true;

    trackEvent('quiz_complete', {
      score: finalScore,
      maxScore: maxScoreValue,
      accuracy: accuracyPercent,
      defenseScore,
      correctAnswers,
      achievementsUnlocked: sessionAchievements.length
    });

    if (sessionAchievements.length > 0) {
      sessionAchievements.forEach((achievementId) => {
        trackEvent('achievement_unlocked', { achievementId });
      });
    }

    if (reminderSettings.enabled) {
      reminderSettings = enableReminderSchedule();
      trackEvent('reminder_schedule_refreshed', { source: 'session_complete' });
    }
    refreshReminderState();
  }

  function handleRestart() {
    handleStart();
  }

  async function handleStatsOpen() {
    if (!isProgressLoaded) {
      return;
    }
    showStatistics = true;
    await ensureStatsComponent();
    trackEvent('stats_opened', { sessions: playerProgress.totalSessions });
  }

  function handleStatsClose() {
    showStatistics = false;
    trackEvent('stats_closed');
  }
</script>

<GameLayout gameName="Щит и Рубль" background="gradient-electric" showScore={true}>
  <div class="quiz-game">
    {#if activeReminder}
      <div class="quiz-reminder" transition:accessibleFade|local={{ duration: 220 }}>
        <ReminderBanner
          title={activeReminder.title}
          message={activeReminder.body}
          onDismiss={handleReminderDismiss}
          onAction={handleReminderAccept}
        />
      </div>
    {/if}

    {#if showStatistics}
      <section
        class="quiz-stage quiz-stage--stats"
        aria-live="polite"
        transition:accessibleFade|local={{ duration: 220 }}
      >
        {#if StatsDashboardComponent}
          <StatsDashboardComponent
            levelInfo={levelOverview}
            metrics={summaryMetrics}
            favoriteCategories={topCategories}
            achievements={achievementViews}
            hasHistory={hasRecordedSessions}
            isLoaded={isProgressLoaded}
            onClose={handleStatsClose}
          />
        {:else if isStatsComponentLoading}
          <div class="stats-loader" role="status">
            <span class="stats-loader__spinner"></span>
            <span>Загружаем статистику…</span>
          </div>
        {:else if statsComponentError}
          <div class="stats-error" role="alert">{statsComponentError}</div>
        {:else}
          <div class="stats-loader" role="status">
            <span class="stats-loader__spinner"></span>
            <span>Готовим данные…</span>
          </div>
        {/if}
      </section>
    {:else if !$currentGameState || $currentGameState.status === 'idle'}
      <section
        class="quiz-stage quiz-stage--intro"
        aria-label="Информация об игре"
        transition:accessibleFade|local={{ duration: 220 }}
      >
        <article class="intro-card surface-card">
          <div class="intro-card__icon">
            <Shield size={36} aria-hidden="true" />
          </div>

          <LazyImage
            src="/images/games/quiz-shield-ruble.svg"
            alt="Иллюстрация защиты от финансовых мошенников"
            class="intro-card__art"
            loading="lazy"
          />

          <div class="intro-card__copy">
            <span class="chip intro-card__chip">Финансовая безопасность</span>
            <h1 class="intro-card__title">Щит и Рубль</h1>
            <p class="intro-card__subtitle text-balance">
              Проверьте, насколько уверенно вы распознаёте мошенников в повседневных сценариях.
            </p>
          </div>

          <div class="intro-card__metrics">
            <div class="intro-metric">
              <span class="intro-metric__value">{questions.length}</span>
              <span class="intro-metric__label">вопросов</span>
            </div>
            <div class="intro-metric">
              <span class="intro-metric__value">≈3</span>
              <span class="intro-metric__label">минуты</span>
            </div>
            <div class="intro-metric">
              <span class="intro-metric__value">{maxScore}</span>
              <span class="intro-metric__label">максимум очков</span>
            </div>
          </div>

          {#if hasRecordedSessions}
            <div class="intro-card__progress" aria-live="polite">
              <div class="intro-progress__header">
                <span class="intro-progress__label">Ваш уровень</span>
                <span class="intro-progress__value">{levelOverview.name}</span>
              </div>
              <p class="intro-progress__hint text-balance">{levelOverview.description}</p>
              <ProgressBar
                value={levelOverview.progressPercent}
                max={100}
                color="wealth"
                shimmer={false}
                showPercentage={false}
                class="intro-progress__bar"
              />
              {#if levelOverview.nextName}
                <span class="intro-progress__next">До уровня «{levelOverview.nextName}»: {levelOverview.xpToNext} XP</span>
              {:else}
                <span class="intro-progress__next">Вы на вершине — продолжайте тренировки для закрепления навыков.</span>
              {/if}
            </div>
          {/if}

          <div class="intro-card__actions">
            <Button variant="primary" size="lg" onclick={handleStart}>
              <Zap size={18} aria-hidden="true" />
              Начать тренировку
            </Button>
            <Button variant="secondary" size="md" onclick={handleStatsOpen} disabled={!isProgressLoaded}>
              <BarChart3 size={16} aria-hidden="true" />
              Статистика и достижения
            </Button>
            {#if onexit}
              <Button variant="secondary" size="md" onclick={onexit}>
                Вернуться назад
              </Button>
            {/if}
          </div>
        </article>
      </section>
    {:else if showResult}
      <section
        class="quiz-stage quiz-stage--result"
        aria-live="polite"
        transition:accessibleFade|local={{ duration: 220 }}
      >
        <article class="result-card surface-card">
          <div class="result-card__icon">
            <Trophy size={32} aria-hidden="true" />
          </div>

          <div>
            <h2 class="result-card__title">Вы прошли тренировку!</h2>
            <p class="result-card__subtitle text-balance">
              {resultStats.level}. Вы укрепили свою защиту от финансовых мошенников.
            </p>
          </div>

            <div class="result-score">
              <span class="result-score__label">Ваш результат</span>
            <span class="result-score__value" class:result-score__value--pulse={scorePulse}>{score}</span>
            <div class="score-pill score-pill--accent">
              <Star size={16} aria-hidden="true" />
              <span>из {maxScore}</span>
            </div>
          </div>

          <div class="result-level">
            <span class="level-badge">
              <Shield size={16} aria-hidden="true" />
              {resultStats.level}
            </span>
          </div>

          <div class="result-metrics">
            <div class="result-metric">
              <span class="result-metric__label">Правильных</span>
              <span class="result-metric__value">{resultStats.correctAnswers}</span>
              <span class="result-metric__hint">из {questions.length}</span>
            </div>
            <div class="result-metric">
              <span class="result-metric__label">Точность</span>
              <span class="result-metric__value">{resultStats.accuracy}%</span>
            </div>
            <div class="result-metric">
              <span class="result-metric__label">Максимум</span>
              <span class="result-metric__value">{maxScore}</span>
              <span class="result-metric__hint">очков</span>
            </div>
          </div>

          <div class="result-defense" aria-live="polite">
            <div class="result-defense__icon">
              <ShieldCheck size={20} aria-hidden="true" />
            </div>
            <div class="result-defense__body">
              <span class="result-defense__label">Защитные бонусы</span>
              <div class="result-defense__values">
                <span class="result-defense__score">+{defenseScore}</span>
                <span class="result-defense__hint">из {maxDefenseScore}</span>
              </div>
              <ProgressBar
                value={defenseProgress}
                max={100}
                color="wealth"
                shimmer={false}
                showPercentage={false}
                class="result-defense__progress"
              />
              <span class="result-defense__percent">{defenseProgress}% защитного потенциала</span>
            </div>
          </div>

          <div class="result-level-progress" aria-live="polite">
            <div class="result-level-progress__header">
              <span class="result-level-progress__label">Прогресс профиля</span>
              <span class="result-level-progress__value">{levelOverview.name}</span>
            </div>
            <ProgressBar
              value={levelOverview.progressPercent}
              max={100}
              color="wealth"
              shimmer={false}
              showPercentage={false}
              class="result-level-progress__bar"
            />
            <span class="result-level-progress__hint">
              {#if levelOverview.nextName}
                До уровня «{levelOverview.nextName}»: {levelOverview.xpToNext} XP
              {:else}
                Вы достигли мастерства — продолжайте закреплять навыки.
              {/if}
            </span>
          </div>

          <ReminderOptIn
            enabled={reminderSettings.enabled}
            permission={reminderPermission}
            isProcessing={reminderProcessing}
            onEnable={handleReminderEnable}
            onDisable={handleReminderDisable}
            nextFireAt={nextReminderFireAt}
          />

          {#if recentAchievements.length > 0}
            <div class="result-achievements" aria-live="polite">
              <span class="result-achievements__label">Новые достижения</span>
              <ul class="result-achievements__list">
                {#each recentAchievements as achievement}
                  <li class="result-achievements__item">
                    <span class="result-achievements__icon">
                      {@render achievement.icon({ size: 16, 'aria-hidden': true })}
                    </span>
                    <span class="result-achievements__title">{achievement.title}</span>
                  </li>
                {/each}
              </ul>
            </div>
          {/if}

          <div class="result-actions">
            <Button variant="secondary" size="md" onclick={handleStatsOpen} disabled={!isProgressLoaded}>
              <BarChart3 size={16} aria-hidden="true" />
              Статистика
            </Button>
            <Button variant="secondary" size="md" onclick={handleRestart}>
              Пройти снова
            </Button>
            {#if onexit}
              <Button variant="primary" size="md" onclick={onexit}>
                Завершить
              </Button>
            {/if}
          </div>
        </article>

        <article class="cta-card surface-card" aria-live="polite">
          <div class="cta-card__header">
            <div class="cta-card__icon">
              <ShieldCheck size={24} aria-hidden="true" />
            </div>
            <div>
              <span class="cta-card__eyebrow">Персональное предложение</span>
              <h3 class="cta-card__title">Страхование карт и счетов</h3>
            </div>
          </div>
          <p class="cta-card__lead text-balance">{finalCtaMessage}</p>
          <ul class="cta-card__bullets">
            <li>Компенсация при подтверждённых мошеннических транзакциях</li>
            <li>Круглосуточное сопровождение и помощь в оформлении заявления</li>
            <li>Защита операций по картам, счетам и в мобильном банке</li>
          </ul>
          <div class="cta-card__actions">
            <Button
              variant="primary"
              size="md"
              href="https://www.gazprombank.ru/personal/insurance/insurance_cards/"
              target="_blank"
              rel="noreferrer noopener"
            >
              <ShieldCheck size={18} aria-hidden="true" />
              Усилить защиту
            </Button>
          </div>
        </article>
      </section>
    {:else}
      {#if activeProduct}
        <section
          class="quiz-stage quiz-stage--product"
          aria-live="polite"
          transition:accessibleFade|local={{ duration: 220 }}
        >
          <div class="product-progress">
            <div
              class="score-pill"
              class:score-pill--pulse={scorePulse}
              aria-label={`Набрано очков: ${score}`}
            >
              <Star size={16} aria-hidden="true" />
              <span>{score}</span>
            </div>
            <div
              class="score-pill score-pill--defense"
              aria-label={`Уровень защиты: ${defenseScore} из ${maxDefenseScore}`}
            >
              <ShieldCheck size={16} aria-hidden="true" />
              <span>+{defenseScore}</span>
              <span class="score-pill__total">/ {maxDefenseScore}</span>
            </div>
          </div>
          <ProductSpotlight product={activeProduct} onContinue={handleProductContinue} />
        </section>
      {:else}
        <section
          class="quiz-stage quiz-stage--playing"
          aria-live="polite"
          transition:accessibleFade|local={{ duration: 220 }}
        >
          <header class="quiz-hud surface-card">
            <div class="quiz-hud__top">
              <div>
                <span class="quiz-hud__label">Вопрос</span>
                <p class="quiz-hud__value">
                  {currentQuestionIndex + 1}
                  <span class="quiz-hud__total">/ {questions.length}</span>
                </p>
              </div>
              <div class="quiz-hud__pills">
                <div
                  class="score-pill"
                  class:score-pill--pulse={scorePulse}
                  aria-label={`Набрано очков: ${score}`}
                >
                  <Star size={16} aria-hidden="true" />
                  <span>{score}</span>
                </div>
                <div
                  class="score-pill score-pill--defense"
                  aria-label={`Уровень защиты: ${defenseScore} из ${maxDefenseScore}`}
                >
                  <ShieldCheck size={16} aria-hidden="true" />
                  <span>+{defenseScore}</span>
                  <span class="score-pill__total">/ {maxDefenseScore}</span>
                </div>
              </div>
            </div>

            <div class="quiz-stage-info" aria-live="polite">
              <div class="quiz-stage-info__stage">
                <BarChart3 size={16} aria-hidden="true" />
              <span>Этап {stageInfo.stageIndex}/{stageInfo.totalStages}</span>
            </div>
            <div class="quiz-stage-info__details">
              <span class="quiz-stage-info__label">{stageInfo.stageLabel}</span>
              <span class="quiz-stage-info__counter">
                Вопрос {stageInfo.stagePosition} из {stageInfo.questionsInStage}
              </span>
            </div>
          </div>

          <div class="quiz-progress">
            <div class="quiz-progress__meta">
              <span>Прогресс</span>
              <span>{Math.round(quizProgress)}%</span>
            </div>
            <ProgressBar value={quizProgress} max={100} color="electric" shimmer={false} />
          </div>
        </header>

        <article class="question-card surface-card" aria-live="polite">
          {#if stageInfo.isStageStart}
            <div class="stage-banner" role="status">
              <span class="stage-banner__stage">Этап {stageInfo.stageIndex} из {stageInfo.totalStages}</span>
              <span class="stage-banner__label">{stageInfo.stageLabel}</span>
            </div>
          {/if}

          <div class="question-meta">
            <span class="question-chip">{currentQuestion.category}</span>
            <span class="question-threat">{currentQuestion.threat}</span>
            <span class={`question-difficulty question-difficulty--${currentQuestion.difficulty}`}>
              {difficultyLabels[currentQuestion.difficulty]}
            </span>
          </div>
          <h2 class="question-text">{currentQuestion.text}</h2>

          {#if currentQuestion.evidence}
            <EvidencePreview evidence={currentQuestion.evidence} />
          {/if}

          {#if currentQuestion.relatedProduct}
            <aside class="product-context-card" aria-live="polite">
              <span class="product-context-card__label">
                <ShieldCheck size={14} aria-hidden="true" />
                {currentQuestion.relatedProduct.name}
              </span>
              <p class="product-context-card__description text-balance">
                {currentQuestion.relatedProduct.description}
              </p>
              <span class="product-context-card__hint">{currentQuestion.relatedProduct.highlight}</span>
            </aside>
          {/if}

          {#if currentQuestion.tip}
            <p class="question-tip">{currentQuestion.tip}</p>
          {/if}
        </article>

        <div class="answer-list">
          {#each currentQuestion.answers as answer, index}
            <button
              type="button"
              class="answer-option"
              class:selected={!showExplanation && selectedAnswer === index}
              class:revealed-correct={showExplanation && index === currentQuestion.correctAnswer}
              class:revealed-incorrect={
                showExplanation &&
                selectedAnswer === index &&
                index !== currentQuestion.correctAnswer
              }
              onclick={() => handleAnswerSelect(index)}
              disabled={showExplanation}
              aria-pressed={selectedAnswer === index}
            >
              <span class="answer-option__prefix">{String.fromCharCode(65 + index)}</span>
              <span class="answer-option__text">{answer}</span>

              {#if showExplanation}
                {#if index === currentQuestion.correctAnswer}
                  <span class="answer-option__indicator" aria-hidden="true">
                    <CheckCircle size={18} />
                  </span>
                {:else if selectedAnswer === index}
                  <span class="answer-option__indicator" aria-hidden="true">
                    <XCircle size={18} />
                  </span>
                {/if}
              {/if}
            </button>
          {/each}
        </div>

        {#if showExplanation}
          <div class="post-answer-stack">
            <aside class="explanation-card" aria-live="polite">
              <div class="explanation-header">
                <div class={`explanation-icon ${isAnswerCorrect ? '' : 'error'}`}>
                  {#if isAnswerCorrect}
                    <CheckCircle size={18} aria-hidden="true" />
                  {:else}
                    <XCircle size={18} aria-hidden="true" />
                  {/if}
                </div>
                <div>
                  <h3 class="explanation-title">
                    {isAnswerCorrect ? 'Верно — так вы в безопасности' : 'Запомните на будущее'}
                  </h3>
                  <p class="explanation-text">{currentQuestion.explanation.summary}</p>
                </div>
              </div>

              <ul class="explanation-list">
                {#each currentQuestion.explanation.insights as insight}
                  <li>{insight}</li>
                {/each}
              </ul>
            </aside>

            <ExpertAdvice
              title={currentQuestion.expertAdvice.title}
              items={currentQuestion.expertAdvice.recommendations}
            />

            <aside class="micro-lesson-card" aria-live="polite">
              <div class="micro-lesson-card__icon">
                <BookOpen size={18} aria-hidden="true" />
              </div>
              <div>
                <span class="micro-lesson-card__title">{currentMicroLesson.title}</span>
                <p class="micro-lesson-card__text">{currentMicroLesson.fact}</p>
              </div>
            </aside>
          </div>
        {/if}

        <div class="quiz-actions">
          {#if !showExplanation}
            <Button
              variant="primary"
              size="lg"
              onclick={handleAnswerSubmit}
              disabled={selectedAnswer === null}
            >
              <CheckCircle size={18} aria-hidden="true" />
              Ответить
            </Button>
          {:else}
            <Button variant="primary" size="lg" onclick={handleNext}>
              {#if currentQuestionIndex < questions.length - 1}
                <Zap size={18} aria-hidden="true" />
                Далее
              {:else}
                <Trophy size={18} aria-hidden="true" />
                Завершить
              {/if}
            </Button>
          {/if}
        </div>
        </section>
      {/if}
    {/if}
  </div>
</GameLayout>

<style>
  .quiz-game {
    min-height: calc(100vh - 80px);
    padding: clamp(1.5rem, 5vw, 3rem) clamp(1rem, 5vw, 2.25rem);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    gap: 1rem;
  }

  .quiz-stage {
    width: min(640px, 100%);
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .quiz-reminder {
    width: min(640px, 100%);
  }

  .quiz-stage--intro,
  .quiz-stage--result {
    margin-block: auto;
    align-items: center;
    text-align: center;
  }

  .quiz-stage--stats {
    margin-block: auto;
  }

  .stats-loader {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1.25rem 1.5rem;
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border-muted);
    background: var(--color-surface-card);
    color: var(--color-fg-muted);
  }

  .stats-loader__spinner {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 2px solid var(--color-border-muted);
    border-top-color: var(--color-brand-500);
    animation: stats-spin 900ms linear infinite;
  }

  .stats-error {
    padding: 1.25rem 1.5rem;
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border-strong);
    background: rgba(255, 103, 103, 0.08);
    color: var(--color-state-danger);
    font-weight: 600;
  }

  .quiz-stage--product {
    margin-block: auto;
    align-items: center;
    gap: 1.5rem;
  }

  .intro-card,
  .result-card,
  .quiz-hud,
  .question-card,
  .explanation-card {
    border-radius: var(--radius-xl);
    border: 1px solid var(--color-border-muted);
    background: var(--color-surface-card);
    box-shadow: var(--shadow-soft);
  }

  .intro-card {
    width: 100%;
    padding: clamp(1.75rem, 3vw + 1.25rem, 2.5rem);
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    align-items: center;
  }

  .intro-card__icon {
    width: 72px;
    height: 72px;
    border-radius: var(--radius-full);
    background: var(--gradient-brand-muted);
    display: grid;
    place-items: center;
    color: var(--color-brand-600);
  }

  .intro-card__art {
    width: clamp(160px, 45%, 220px);
    aspect-ratio: 1;
    border-radius: var(--radius-xl);
    overflow: hidden;
    box-shadow: var(--shadow-soft);
    animation: intro-art-float 6s ease-in-out infinite alternate;
  }

  .intro-card__art :global(img) {
    width: 100%;
    height: 100%;
    display: block;
  }

  .intro-card__chip {
    background: var(--layer-brand-100);
    color: var(--color-brand-700);
  }

  .intro-card__title {
    margin: 0;
    font-family: var(--font-display);
    font-size: clamp(1.5rem, 1.2rem + 1vw, 2rem);
    color: var(--color-fg-primary);
  }

  .intro-card__subtitle {
    margin: 0;
    color: var(--color-fg-muted);
    font-size: 0.95rem;
    max-width: 32ch;
  }

  .intro-card__metrics {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 0.75rem;
  }

  .intro-card__progress {
    width: 100%;
    padding: 1.1rem 1.25rem;
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border-subtle);
    background: var(--color-surface-muted);
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
    text-align: left;
  }

  .intro-progress__header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
  }

  .intro-progress__label {
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-brand-600);
    font-weight: 600;
  }

  .intro-progress__value {
    font-family: var(--font-display);
    font-size: 1.1rem;
    color: var(--color-fg-primary);
  }

  .intro-progress__hint {
    margin: 0;
    font-size: 0.9rem;
    color: var(--color-fg-muted);
  }

  .intro-progress__bar {
    width: 100%;
  }

  .intro-progress__next {
    font-size: 0.8rem;
    color: var(--color-fg-muted);
  }

  .intro-metric {
    padding: 0.85rem;
    border-radius: var(--radius-lg);
    background: var(--color-surface-muted);
    border: 1px solid var(--color-border-subtle);
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    align-items: center;
  }

  .intro-metric__value {
    font-family: var(--font-display);
    font-size: 1.4rem;
    font-weight: 600;
    color: var(--color-fg-primary);
  }

  .intro-metric__label {
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-fg-muted);
  }

  .intro-card__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: center;
    width: 100%;
  }

  .result-card {
    width: 100%;
    padding: clamp(1.75rem, 3vw + 1.25rem, 2.5rem);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }

  .result-card__icon {
    width: 72px;
    height: 72px;
    border-radius: var(--radius-full);
    background: var(--gradient-accent-soft);
    display: grid;
    place-items: center;
    color: var(--color-fg-on-brand);
  }

  .result-card__title {
    margin: 0;
    font-family: var(--font-display);
    font-size: clamp(1.4rem, 1.1rem + 1vw, 1.9rem);
    color: var(--color-fg-primary);
  }

  .result-card__subtitle {
    margin: 0;
    color: var(--color-fg-muted);
    font-size: 0.95rem;
    max-width: 32ch;
  }

  .result-score {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
  }

  .result-score__label {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-fg-muted);
  }

  .result-score__value {
    font-family: var(--font-display);
    font-size: clamp(2.2rem, 1.8rem + 1vw, 2.8rem);
    font-weight: 700;
    color: var(--color-brand-600);
    transition: transform 220ms ease;
  }

  .result-score__value--pulse {
    animation: score-pulse 420ms ease;
  }

  .result-level {
    display: flex;
    justify-content: center;
  }

  .level-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 1.1rem;
    border-radius: var(--radius-full);
    background: var(--layer-brand-150);
    color: var(--color-brand-700);
    font-weight: 600;
    font-size: 0.9rem;
  }

  .level-badge :global(svg) {
    width: 18px;
    height: 18px;
  }

  .result-metrics {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 1rem;
  }

  .result-metric {
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border-subtle);
    background: var(--color-surface-muted);
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    align-items: center;
  }

  .result-metric__label {
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-fg-muted);
  }

  .result-metric__value {
    font-family: var(--font-display);
    font-size: 1.6rem;
    font-weight: 600;
    color: var(--color-fg-primary);
  }

  .result-metric__hint {
    font-size: 0.8rem;
    color: var(--color-fg-muted);
  }

  .result-defense {
    width: 100%;
    display: flex;
    gap: 1rem;
    align-items: center;
    padding: 1rem 1.25rem;
    border-radius: var(--radius-lg);
    background: var(--color-surface-muted);
    border: 1px solid var(--color-border-subtle);
  }

  .result-defense__icon {
    width: 44px;
    height: 44px;
    border-radius: var(--radius-full);
    background: var(--gradient-brand-muted);
    display: grid;
    place-items: center;
    color: var(--color-brand-600);
  }

  .result-defense__body {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    align-items: flex-start;
    width: 100%;
  }

  .result-defense__label {
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-brand-600);
    font-weight: 600;
  }

  .result-defense__values {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
  }

  .result-defense__score {
    font-family: var(--font-display);
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--color-fg-primary);
  }

  .result-defense__hint {
    font-size: 0.85rem;
    color: var(--color-fg-muted);
  }

  .result-defense__progress {
    width: 100%;
  }

  .result-defense__percent {
    font-size: 0.85rem;
    color: var(--color-fg-muted);
  }

  .result-level-progress {
    width: 100%;
    padding: 1rem 1.25rem;
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border-subtle);
    background: var(--color-surface-muted);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    text-align: left;
  }

  .result-level-progress__header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .result-level-progress__label {
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-brand-600);
    font-weight: 600;
  }

  .result-level-progress__value {
    font-family: var(--font-display);
    font-size: 1.05rem;
    color: var(--color-fg-primary);
  }

  .result-level-progress__bar {
    width: 100%;
  }

  .result-level-progress__hint {
    font-size: 0.85rem;
    color: var(--color-fg-muted);
  }

  .result-achievements {
    width: 100%;
    padding: 1rem 1.25rem;
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border-subtle);
    background: var(--color-surface-muted);
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .result-achievements__label {
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-brand-600);
    font-weight: 600;
  }

  .result-achievements__list {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 0.75rem;
    justify-content: center;
  }

  .result-achievements__item {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 0.9rem;
    border-radius: var(--radius-full);
    background: var(--layer-brand-100);
    color: var(--color-brand-600);
    font-weight: 600;
    font-size: 0.85rem;
  }

  .result-achievements__icon {
    display: grid;
    place-items: center;
  }

  .result-achievements__title {
    white-space: nowrap;
  }

  .result-actions {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: center;
  }

  .result-actions :global(button) {
    min-width: 180px;
  }

  .cta-card {
    margin-top: 1.5rem;
    padding: clamp(1.5rem, 1.25rem + 1vw, 2rem);
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    border-radius: var(--radius-xl);
    border: 1px solid var(--color-border-muted);
    background: var(--color-surface-card);
  }

  .cta-card__header {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .cta-card__icon {
    width: 54px;
    height: 54px;
    border-radius: var(--radius-full);
    background: var(--gradient-accent-soft);
    display: grid;
    place-items: center;
    color: var(--color-fg-on-brand);
  }

  .cta-card__eyebrow {
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-brand-600);
    font-weight: 600;
  }

  .cta-card__title {
    margin: 0.25rem 0 0;
    font-family: var(--font-display);
    font-size: clamp(1.2rem, 1rem + 1vw, 1.6rem);
    color: var(--color-fg-primary);
  }

  .cta-card__lead {
    margin: 0;
    color: var(--color-fg-muted);
    line-height: 1.5;
  }

  .cta-card__bullets {
    margin: 0;
    padding-left: 1.2rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    color: var(--color-fg-primary);
  }

  .cta-card__actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .quiz-hud {
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .quiz-hud__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .quiz-stage-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.75rem 1rem;
    border-radius: var(--radius-lg);
    background: var(--layer-brand-050);
    flex-wrap: wrap;
  }

  .quiz-stage-info__stage {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-weight: 600;
    color: var(--color-brand-600);
  }

  .quiz-stage-info__stage :global(svg) {
    width: 18px;
    height: 18px;
  }

  .quiz-stage-info__details {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    font-size: 0.85rem;
    color: var(--color-fg-muted);
    text-align: right;
    align-items: flex-end;
  }

  .quiz-stage-info__label {
    font-weight: 600;
    color: var(--color-fg-primary);
    font-size: 0.9rem;
  }

  .quiz-stage-info__counter {
    font-size: 0.8rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .quiz-hud__label {
    display: block;
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-fg-muted);
    margin-bottom: 0.25rem;
  }

  .quiz-hud__value {
    margin: 0;
    font-family: var(--font-display);
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--color-fg-primary);
  }

  .quiz-hud__total {
    font-size: 1rem;
    color: var(--color-fg-muted);
    margin-left: 0.25rem;
  }

  .score-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.9rem;
    border-radius: var(--radius-full);
    background: var(--layer-brand-100);
    color: var(--color-brand-600);
    font-weight: 600;
    font-size: 0.9rem;
    transition: transform 220ms ease, box-shadow 220ms ease;
  }

  .score-pill--pulse {
    animation: score-pulse 420ms ease;
    box-shadow: var(--shadow-soft);
  }

  .score-pill--accent {
    background: var(--gradient-accent-soft);
    color: var(--color-fg-on-brand);
  }

  .score-pill--defense {
    background: var(--layer-brand-080);
    color: var(--color-brand-700);
  }

  .score-pill :global(svg) {
    width: 18px;
    height: 18px;
  }

  .score-pill__total {
    font-size: 0.75rem;
    opacity: 0.85;
  }

  @keyframes score-pulse {
    0% {
      transform: scale(1);
    }
    40% {
      transform: scale(1.08);
    }
    100% {
      transform: scale(1);
    }
  }

  @keyframes intro-art-float {
    0% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-6px);
    }
    100% {
      transform: translateY(4px);
    }
  }

  @keyframes stats-spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .quiz-progress {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .quiz-hud__pills {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: flex-end;
    align-items: center;
  }

  .product-progress {
    display: flex;
    justify-content: center;
    gap: 0.75rem;
    flex-wrap: wrap;
    margin-bottom: 1rem;
  }

  .quiz-progress__meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.85rem;
    color: var(--color-fg-muted);
  }

  .question-card {
    padding: clamp(1.5rem, 1.25rem + 1vw, 2rem);
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .product-context-card {
    margin-top: 0.75rem;
    padding: 0.85rem 1rem;
    border-radius: var(--radius-lg);
    background: var(--color-surface-muted);
    border: 1px solid var(--color-border-subtle);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .product-context-card__label {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.8rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--color-brand-600);
    font-weight: 600;
  }

  .product-context-card__description {
    margin: 0;
    color: var(--color-fg-primary);
    font-size: 0.95rem;
    line-height: 1.45;
  }

  .product-context-card__hint {
    font-size: 0.85rem;
    color: var(--color-fg-muted);
  }

  .question-meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
  }

  .stage-banner {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    padding: 0.75rem 1rem;
    border-radius: var(--radius-lg);
    background: var(--layer-brand-080);
    color: var(--color-brand-700);
    margin-bottom: 0.75rem;
  }

  .stage-banner__stage {
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-brand-600);
  }

  .stage-banner__label {
    font-family: var(--font-display);
    font-size: 1rem;
  }

  .question-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.35rem 0.7rem;
    border-radius: var(--radius-lg);
    background: var(--layer-brand-050);
    color: var(--color-brand-600);
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .question-threat {
    display: inline-flex;
    padding: 0.3rem 0.65rem;
    border-radius: var(--radius-lg);
    background: rgba(255, 214, 107, 0.18);
    color: rgba(156, 105, 9, 0.85);
    font-size: 0.8rem;
    font-weight: 600;
  }

  .question-difficulty {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.3rem 0.7rem;
    border-radius: var(--radius-lg);
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .question-difficulty--easy {
    background: var(--layer-brand-050);
    color: var(--color-brand-600);
  }

  .question-difficulty--medium {
    background: rgba(255, 214, 107, 0.22);
    color: rgba(156, 105, 9, 0.85);
  }

  .question-difficulty--hard {
    background: rgba(209, 60, 106, 0.18);
    color: var(--color-state-danger);
  }

  .question-text {
    margin: 0;
    font-family: var(--font-display);
    font-size: clamp(1.2rem, 1rem + 0.8vw, 1.5rem);
    line-height: 1.35;
    color: var(--color-fg-primary);
  }

  .question-tip {
    margin: 0;
    font-size: 0.85rem;
    color: var(--color-fg-secondary);
    border-left: 3px solid var(--color-brand-500);
    padding-left: 0.65rem;
  }

  .answer-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .answer-option {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding: 0.9rem 1rem;
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border-muted);
    background: var(--color-surface-card);
    color: var(--color-fg-primary);
    transition: border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease, background-color 160ms ease, color 160ms ease;
    text-align: left;
    cursor: pointer;
  }

  .answer-option:not([disabled]):hover {
    border-color: var(--layer-brand-150);
    box-shadow: var(--shadow-soft);
    transform: translateY(-1px);
  }

  .answer-option:focus-visible {
    outline: none;
    box-shadow: var(--shadow-focus);
  }

  .answer-option[disabled] {
    cursor: default;
  }

  .answer-option.selected {
    border-color: var(--color-brand-500);
    background: rgba(25, 25, 239, 0.08);
    box-shadow: var(--shadow-soft);
  }

  .answer-option.revealed-correct {
    border-color: var(--color-state-success);
    background: rgba(43, 180, 138, 0.12);
  }

  .answer-option.revealed-incorrect {
    border-color: var(--color-state-danger);
    background: rgba(209, 60, 106, 0.12);
  }

  .answer-option__prefix {
    width: 34px;
    height: 34px;
    border-radius: var(--radius-full);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 0.95rem;
    background: var(--layer-brand-050);
    color: var(--color-brand-600);
    flex-shrink: 0;
  }

  .answer-option.selected .answer-option__prefix,
  .answer-option.revealed-correct .answer-option__prefix {
    background: var(--color-brand-500);
    color: var(--color-fg-on-brand);
  }

  .answer-option.revealed-incorrect .answer-option__prefix {
    background: rgba(209, 60, 106, 0.18);
    color: var(--color-state-danger);
  }

  .answer-option__text {
    flex: 1;
    font-size: 0.95rem;
  }

  .answer-option__indicator {
    margin-left: 0.75rem;
    display: flex;
    align-items: center;
  }

  .answer-option.revealed-correct .answer-option__indicator {
    color: var(--color-state-success);
  }

  .answer-option.revealed-incorrect .answer-option__indicator {
    color: var(--color-state-danger);
  }

  .explanation-card {
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .post-answer-stack {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .explanation-header {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
  }

  .explanation-icon {
    width: 36px;
    height: 36px;
    border-radius: var(--radius-full);
    background: rgba(43, 180, 138, 0.12);
    color: var(--color-state-success);
    display: grid;
    place-items: center;
    flex-shrink: 0;
  }

  .explanation-icon.error {
    background: rgba(209, 60, 106, 0.12);
    color: var(--color-state-danger);
  }

  .explanation-title {
    margin: 0 0 0.35rem;
    font-family: var(--font-display);
    font-size: 1.05rem;
    color: var(--color-fg-primary);
  }

  .explanation-text {
    margin: 0;
    color: var(--color-fg-secondary);
    font-size: 0.95rem;
  }

  .explanation-list {
    margin: 0;
    padding-left: 1.1rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    color: var(--color-fg-secondary);
    font-size: 0.9rem;
  }

  .explanation-list li {
    line-height: 1.45;
  }

  .micro-lesson-card {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1.1rem 1.25rem;
    border-radius: var(--radius-xl);
    border: 1px solid var(--color-border-subtle);
    background: var(--color-surface-muted);
  }

  .micro-lesson-card__icon {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-full);
    background: var(--layer-mint-080);
    color: var(--color-accent-500);
    display: grid;
    place-items: center;
    flex-shrink: 0;
  }

  .micro-lesson-card__title {
    display: inline-block;
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-fg-muted);
    margin-bottom: 0.2rem;
  }

  .micro-lesson-card__text {
    margin: 0;
    color: var(--color-fg-secondary);
    font-size: 0.95rem;
    line-height: 1.45;
  }

  .quiz-actions {
    display: flex;
    justify-content: flex-end;
  }

  .quiz-actions :global(button) {
    min-width: 200px;
  }

  @media (prefers-reduced-motion: reduce) {
    .intro-card__art,
    .score-pill--pulse,
    .result-score__value--pulse,
    .reminder-optin__spinner,
    .stats-loader__spinner {
      animation: none !important;
    }

    .score-pill,
    .result-score__value,
    .answer-option,
    .reminder-banner__close {
      transition: none !important;
    }
  }

  @media (max-width: 768px) {
    .quiz-game {
      padding: 1.5rem 1rem 2.5rem;
    }

    .quiz-hud__top {
      flex-direction: column;
      align-items: flex-start;
    }

    .score-pill {
      align-self: flex-start;
    }

    .quiz-stage-info {
      flex-direction: column;
      align-items: flex-start;
      text-align: left;
      width: 100%;
    }

    .quiz-stage-info__details {
      text-align: left;
      align-items: flex-start;
    }

    .quiz-actions :global(button) {
      min-width: 0;
      width: 100%;
    }

    .quiz-actions {
      justify-content: stretch;
    }
  }

  @media (max-width: 480px) {
    .intro-card,
    .result-card,
    .quiz-hud,
    .question-card,
    .explanation-card {
      border-radius: var(--radius-lg);
    }

    .result-actions :global(button) {
      flex: 1 1 100%;
      min-width: 0;
    }
  }
</style>
