import type {
  Character,
  Scene,
  DialogueStep,
  Choice,
  ChoiceOption,
  EducationScreen,
  NovellaScenario
} from '../types';

import {
  SpeakerType,
  ChoiceConsequence,
  ContinueAction
} from '../types';

export const characters: Character[] = [

  {
    id: 'maxim',
    name: 'Максим',
    age: 31,
    profession: 'Фотограф',
    description: 'Талантливый фотограф-фрилансер. Только что получил оплату за съёмку свадьбы — 180 тысяч рублей.',
    avatar: '/games/code-to-success/2/maxim-avatar.png',
    dialogueImages: [
      '/games/code-to-success/2/maxim-happy.png',
      '/games/code-to-success/2/maxim-thoughtful.png',
      '/games/code-to-success/2/maxim-concerned.png',
      '/games/code-to-success/2/maxim-shocked.png',
      '/games/code-to-success/2/maxim-relieved.png',
      '/games/code-to-success/2/maxim-devastated.png'
    ],
    isAvailable: true
  },

  {
    id: 'anna',
    name: 'Анна',
    age: 30,
    profession: 'Фрилансер',
    description: 'Талантливый фрилансер. Только что завершила крупный проект, и на счет пришла приличная сумма – 250 тысяч рублей.',
    avatar: '/games/code-to-success/avatar.png',
    dialogueImages: [
      '/games/code-to-success/3.png',
      '/games/code-to-success/4.png',
      '/games/code-to-success/5.png',
      '/games/code-to-success/6.png',
      '/games/code-to-success/7.png'
    ],
    isAvailable: true
  },
  {
    id: 'fraudster',
    name: 'Мошенник',
    age: 35,
    profession: 'Мошенник',
    description: 'Преступник, выдающий себя за сотрудника службы безопасности банка.',
    avatar: '',
    dialogueImages: [],
    isAvailable: false
  },
  {
    id: 'elena',
    name: 'Елена',
    age: 35,
    profession: 'Молодая мама',
    description: 'Мама двоих детей. Получает SMS о выигрыше 500 тысяч рублей в лотерею от Газпромбанка. Для получения приза нужно оплатить "налог".',
    avatar: '/games/code-to-success/elena-avatar.png',
    dialogueImages: [],
    isAvailable: false
  },
  {
    id: 'dmitry',
    name: 'Дмитрий',
    age: 45,
    profession: 'Предприниматель',
    description: 'Владелец малого бизнеса. Получает звонок от "налоговой службы" о блокировке расчетного счета и требованием срочно оплатить штраф.',
    avatar: '/games/code-to-success/dmitry-avatar.png',
    dialogueImages: [],
    isAvailable: false
  },
  {
    id: 'olga',
    name: 'Ольга',
    age: 22,
    profession: 'Студентка',
    description: 'Студентка университета. Откликается на вакансию "удаленный менеджер", где требуют оплатить обучающий курс за 15 тысяч рублей.',
    avatar: '/games/code-to-success/olga-avatar.png',
    dialogueImages: [],
    isAvailable: false
  },
  {
    id: 'viktor',
    name: 'Виктор',
    age: 67,
    profession: 'Пенсионер',
    description: 'Ветеран труда. Получает звонок от "внука", который попал в ДТП и срочно нужны деньги на адвоката и возмещение ущерба.',
    avatar: '/games/code-to-success/viktor-avatar.png',
    dialogueImages: [],
    isAvailable: false
  }
];

const introScene: Scene = {
  id: 'intro',
  name: 'Радостные планы',
  description: 'Анна радуется успешному завершению проекта и планирует потратить заработанные деньги',
  backgroundImage: '/games/code-to-success/3.png',
  dialogueSteps: [
    {
      id: 'intro-1',
      speaker: SpeakerType.ANNA,
      text: 'Наконец-то! Можно закрыть часть кредита и подумать о накоплениях. А может, пора обновить технику?',
      characterImage: '/games/code-to-success/3.png',
      continueAction: ContinueAction.TAP,
      nextStepId: 'intro-2'
    },
    {
      id: 'intro-2',
      speaker: SpeakerType.ANNA,
      text: 'Эх, столько всего хочется! Главное, чтобы этих денег хватило на все мои задумки...',
      characterImage: '/games/code-to-success/3.png',
      continueAction: ContinueAction.TAP,
      nextStepId: undefined
    }
  ],
  nextSceneId: 'phone-call'
};

const phoneCallScene: Scene = {
  id: 'phone-call',
  name: 'Подозрительный звонок',
  description: 'Анна получает подозрительный звонок от мошенника',
  backgroundImage: '/games/code-to-success/4.png',
  dialogueSteps: [
    {
      id: 'phone-1',
      speaker: SpeakerType.PHONE,
      text: 'Входящий звонок. Анонимный номер.',
      continueAction: ContinueAction.TAP,
      nextStepId: 'phone-2'
    },
    {
      id: 'phone-2',
      speaker: SpeakerType.ANNA,
      text: 'Кто это может быть в такое время?',
      characterImage: '/games/code-to-success/4.png',
      continueAction: ContinueAction.TAP,
      nextStepId: 'phone-3'
    },
    {
      id: 'phone-3',
      speaker: SpeakerType.FRAUDSTER,
      text: 'Добрый день, Анна. Вас беспокоит служба безопасности Газпромбанка. Мы зафиксировали попытку несанкционированного перевода средств с вашего счета.',
      continueAction: ContinueAction.TAP,
      nextStepId: 'phone-4'
    },
    {
      id: 'phone-4',
      speaker: SpeakerType.ANNA,
      text: 'Что? Перевод? Какой еще перевод?',
      characterImage: '/games/code-to-success/4.png',
      continueAction: ContinueAction.TAP,
      nextStepId: 'phone-5'
    },
    {
      id: 'phone-5',
      speaker: SpeakerType.FRAUDSTER,
      text: 'Для отмены операции и блокировки подозрительной активности, пожалуйста, продиктуйте код из СМС, который сейчас придет на ваш номер.',
      continueAction: ContinueAction.TAP,
      nextStepId: undefined
    }
  ],
  nextSceneId: 'choice-moment'
};

const choiceMomentScene: Scene = {
  id: 'choice-moment',
  name: 'Момент выбора',
  description: 'Ключевой момент принятия решения',
  backgroundImage: '/games/code-to-success/5.png',
  dialogueSteps: [
    {
      id: 'choice-setup',
      speaker: SpeakerType.NARRATOR,
      text: 'Что делать? Это действительно банк или мошенник?',
      characterImage: '/games/code-to-success/5.png',
      continueAction: ContinueAction.TAP,
      choiceId: 'main-choice'
    }
  ],
  choices: [
    {
      id: 'main-choice',
      title: 'Критический выбор',
      text: 'Как поступить в этой ситуации?',
      options: [
        {
          id: 'choice-a',
          text: 'Продиктовать код из СМС – ведь это же банк!',
          description: 'Доверяю звонящему и выполняю его требования',
          consequence: ChoiceConsequence.BAD,
          nextSceneId: 'bad-ending',
          points: 0
        },
        {
          id: 'choice-b',
          text: 'Положить трубку и перезвонить в банк самому по официальному номеру',
          description: 'Проверяю информацию через официальные каналы',
          consequence: ChoiceConsequence.GOOD,
          nextSceneId: 'good-ending',
          points: 100
        },
        {
          id: 'choice-c',
          text: 'Напомнить про услугу "Защита от мошенничества", которая у меня подключена',
          description: 'Использую знания о банковских услугах безопасности',
          consequence: ChoiceConsequence.GOOD,
          nextSceneId: 'good-ending',
          points: 100
        }
      ]
    }
  ]
};

const goodEndingScene: Scene = {
  id: 'good-ending',
  name: 'Правильное решение',
  description: 'Анна приняла правильное решение и избежала мошенничества',
  backgroundImage: '/games/code-to-success/6.png',
  dialogueSteps: [
    {
      id: 'good-1',
      speaker: SpeakerType.ANNA,
      text: 'Я знаю, что Газпромбанк никогда не просит коды по телефону! Кладу трубку и перезвоню сама.',
      characterImage: '/games/code-to-success/6.png',
      continueAction: ContinueAction.TAP,
      nextStepId: 'good-2'
    },
    {
      id: 'good-2',
      speaker: SpeakerType.FRAUDSTER,
      text: 'Подождите! Вы упускаете свой шанс!',
      continueAction: ContinueAction.TAP,
      nextStepId: 'good-3'
    },
    {
      id: 'good-3',
      speaker: SpeakerType.ANNA,
      text: 'Фух, какая же я молодец! Чуть не попалась на уловку!',
      characterImage: '/games/code-to-success/6.png',
      continueAction: ContinueAction.TAP,
      nextStepId: undefined
    }
  ],
  nextSceneId: 'education',
  isEducational: false
};

const badEndingScene: Scene = {
  id: 'bad-ending',
  name: 'Неправильное решение',
  description: 'Анна попалась на уловку мошенников',
  backgroundImage: '/games/code-to-success/7.png',
  dialogueSteps: [
    {
      id: 'bad-1',
      speaker: SpeakerType.ANNA,
      text: 'Если это действительно банк, то нужно помочь им...',
      characterImage: '/games/code-to-success/7.png',
      continueAction: ContinueAction.TAP,
      nextStepId: 'bad-2'
    },
    {
      id: 'bad-2',
      speaker: SpeakerType.FRAUDSTER,
      text: 'Отлично! Теперь продиктуйте код: 1234.',
      continueAction: ContinueAction.TAP,
      nextStepId: 'bad-3'
    },
    {
      id: 'bad-3',
      speaker: SpeakerType.ANNA,
      text: 'Подождите... А почему у меня списались все деньги?! Что происходит?!',
      characterImage: '/games/code-to-success/7.png',
      continueAction: ContinueAction.TAP,
      nextStepId: undefined
    }
  ],
  nextSceneId: 'education',
  isEducational: false
};

const goodEducationScreen: EducationScreen = {
  id: 'education-good',
  title: 'Отличная работа! Вы распознали мошенника!',
  summary: 'Перепроверять информацию и никогда не диктовать коды из СМС – золотые правила безопасности. Помните: сотрудники банка НИКОГДА не просят эти данные по телефону!',
  correctDecision: 'Вы приняли правильное решение — положили трубку и самостоятельно перезвонили в банк по официальному номеру. Это лучший способ защитить свои средства от мошенников.',
  rewardPoints: 100,
  productIntegration: {
    title: 'Защита от мошенничества',
    description: 'Узнайте больше о том, как защитить свои финансы от мошенников с помощью современных банковских технологий.',
    buttonText: 'Узнать подробнее об услуге',
    url: undefined,
    isActive: false
  }
};

const badEducationScreen: EducationScreen = {
  id: 'education-bad',
  title: 'К сожалению, вы попались на уловку мошенников',
  summary: 'Перепроверять информацию и никогда не диктовать коды из СМС – золотые правила безопасности. Помните: сотрудники банка НИКОГДА не просят эти данные по телефону!',
  correctDecision: 'Правильным решением было бы положить трубку и самостоятельно перезвонить в банк по официальному номеру или использовать знания об услугах защиты от мошенничества. Никогда не сообщайте коды из СМС незнакомцам.',
  rewardPoints: 0,
  productIntegration: {
    title: 'Защита от мошенничества',
    description: 'Узнайте больше о том, как защитить свои финансы от мошенников с помощью современных банковских технологий.',
    buttonText: 'Узнать подробнее об услуге',
    url: undefined,
    isActive: false
  }
};

const maximIntroScene: Scene = {
  id: 'maxim-intro',
  name: 'Успешная съёмка',
  description: 'Максим радуется успешной съёмке свадьбы и планирует покупку нового оборудования',
  backgroundImage: '/games/code-to-success/2/maxim-intro-bg.png',
  dialogueSteps: [
    {
      id: 'maxim-intro-1',
      speaker: SpeakerType.MAXIM,
      text: 'Отличная съёмка! 180 тысяч на счету. Наконец-то могу купить новый объектив, о котором так давно мечтал!',
      characterImage: '/games/code-to-success/2/maxim-happy.png',
      continueAction: ContinueAction.TAP,
      nextStepId: 'maxim-intro-2'
    },
    {
      id: 'maxim-intro-2',
      speaker: SpeakerType.MAXIM,
      text: 'С таким оборудованием смогу брать более серьёзные заказы. Карьера фотографа набирает обороты!',
      characterImage: '/games/code-to-success/2/maxim-happy.png',
      continueAction: ContinueAction.TAP,
      nextStepId: undefined
    }
  ],
  nextSceneId: 'maxim-suspicious-sms'
};

const maximSuspiciousSmsScene: Scene = {
  id: 'maxim-suspicious-sms',
  name: 'Подозрительное SMS',
  description: 'Максим получает подозрительное SMS о блокировке карты',
  backgroundImage: '/games/code-to-success/2/maxim-sms-bg.png',
  dialogueSteps: [
    {
      id: 'maxim-sms-1',
      speaker: SpeakerType.PHONE,
      text: 'Новое SMS сообщение.',
      continueAction: ContinueAction.TAP,
      nextStepId: 'maxim-sms-2'
    },
    {
      id: 'maxim-sms-2',
      speaker: SpeakerType.NARRATOR,
      text: 'SMS: "Ваша карта заблокирована! Для разблокировки перейдите по ссылке: gpb-security-check.ru/unblock"',
      continueAction: ContinueAction.TAP,
      nextStepId: 'maxim-sms-3'
    },
    {
      id: 'maxim-sms-3',
      speaker: SpeakerType.MAXIM,
      text: 'Что?! Карта заблокирована? Но я только что получил деньги!',
      characterImage: '/games/code-to-success/2/maxim-concerned.png',
      continueAction: ContinueAction.TAP,
      nextStepId: 'maxim-sms-4'
    },
    {
      id: 'maxim-sms-4',
      speaker: SpeakerType.MAXIM,
      text: 'Странно... Отправитель какой-то непонятный. Но ссылка похожа на настоящую...',
      characterImage: '/games/code-to-success/2/maxim-thoughtful.png',
      continueAction: ContinueAction.TAP,
      nextStepId: undefined
    }
  ],
  nextSceneId: 'maxim-phishing-site'
};

const maximPhishingSiteScene: Scene = {
  id: 'maxim-phishing-site',
  name: 'Фишинговый сайт',
  description: 'Максим переходит на сайт, который выглядит как сайт Газпромбанка',
  backgroundImage: '/games/code-to-success/2/maxim-phishing-bg.png',
  dialogueSteps: [
    {
      id: 'maxim-phishing-1',
      speaker: SpeakerType.NARRATOR,
      text: 'Максим переходит по ссылке. Сайт выглядит точь-в-точь как официальный сайт Газпромбанка...',
      continueAction: ContinueAction.TAP,
      nextStepId: 'maxim-phishing-2'
    },
    {
      id: 'maxim-phishing-2',
      speaker: SpeakerType.MAXIM,
      text: 'Так, здесь просят ввести номер карты и код из СМС... Выглядит официально.',
      characterImage: '/games/code-to-success/2/maxim-thoughtful.png',
      continueAction: ContinueAction.TAP,
      nextStepId: 'maxim-phishing-3'
    },
    {
      id: 'maxim-phishing-3',
      speaker: SpeakerType.NARRATOR,
      text: 'На экране большими буквами: "СРОЧНО! ВВЕДИТЕ ДАННЫЕ В ТЕЧЕНИЕ 5 МИНУТ!"',
      continueAction: ContinueAction.TAP,
      nextStepId: undefined
    }
  ],
  nextSceneId: 'maxim-scam-call'
};

const maximScamCallScene: Scene = {
  id: 'maxim-scam-call',
  name: 'Звонок мошенника',
  description: 'Одновременно с открытым сайтом Максиму звонит "служба безопасности"',
  backgroundImage: '/games/code-to-success/2/maxim-scam-call.png',
  dialogueSteps: [
    {
      id: 'maxim-call-1',
      speaker: SpeakerType.PHONE,
      text: 'Входящий звонок. Номер +7 (495) 913-XXXX',
      continueAction: ContinueAction.TAP,
      nextStepId: 'maxim-call-2'
    },
    {
      id: 'maxim-call-2',
      speaker: SpeakerType.FRAUDSTER,
      text: 'Добрый день, Максим. Служба безопасности Газпромбанка. Мы видим, что вы открыли страницу разблокировки. Это правильно!',
      continueAction: ContinueAction.TAP,
      nextStepId: 'maxim-call-3'
    },
    {
      id: 'maxim-call-3',
      speaker: SpeakerType.MAXIM,
      text: 'Да, я получил SMS... Моя карта действительно заблокирована?',
      characterImage: '/games/code-to-success/2/maxim-shocked.png',
      continueAction: ContinueAction.TAP,
      nextStepId: 'maxim-call-4'
    },
    {
      id: 'maxim-call-4',
      speaker: SpeakerType.FRAUDSTER,
      text: 'Да, была подозрительная активность. Для разблокировки введите данные на открытом сайте прямо сейчас. Я подожду на линии.',
      continueAction: ContinueAction.TAP,
      nextStepId: 'maxim-call-5'
    },
    {
      id: 'maxim-call-5',
      speaker: SpeakerType.MAXIM,
      text: 'Стоп... Что-то здесь не так. Двойное давление — и SMS, и звонок одновременно...',
      characterImage: '/games/code-to-success/2/maxim-thoughtful.png',
      continueAction: ContinueAction.TAP,
      nextStepId: undefined
    }
  ],
  nextSceneId: 'maxim-choice-moment'
};

const maximChoiceMomentScene: Scene = {
  id: 'maxim-choice-moment',
  name: 'Критический момент',
  description: 'Максим должен принять решение в ситуации двойного давления',
  backgroundImage: '/games/code-to-success/2/maxim-scam-call.png',
  dialogueSteps: [
    {
      id: 'maxim-choice-setup',
      speaker: SpeakerType.NARRATOR,
      text: 'Максим стоит перед выбором. Мошенник на линии, фишинговый сайт открыт. Что делать?',
      continueAction: ContinueAction.TAP,
      choiceId: 'maxim-main-choice'
    }
  ],
  choices: [
    {
      id: 'maxim-main-choice',
      title: 'Критический выбор',
      text: 'Как поступить в этой ситуации?',
      options: [
        {
          id: 'maxim-choice-a',
          text: 'Быстро ввести данные на сайте — ведь служба безопасности на линии!',
          description: 'Довериться звонящему и выполнить требования',
          consequence: ChoiceConsequence.BAD,
          nextSceneId: 'maxim-bad-ending',
          points: 0
        },
        {
          id: 'maxim-choice-b',
          text: 'Проверить отправителя SMS и закрыть подозрительный сайт',
          description: 'Остановиться и проверить источник информации',
          consequence: ChoiceConsequence.GOOD,
          nextSceneId: 'maxim-good-ending',
          points: 100
        },
        {
          id: 'maxim-choice-c',
          text: 'Положить трубку и открыть официальное приложение Газпромбанка',
          description: 'Использовать только официальные каналы связи',
          consequence: ChoiceConsequence.GOOD,
          nextSceneId: 'maxim-good-ending',
          points: 100
        }
      ]
    }
  ]
};

const maximGoodEndingScene: Scene = {
  id: 'maxim-good-ending',
  name: 'Правильное решение',
  description: 'Максим распознал мошенническую схему и избежал потери денег',
  backgroundImage: '/games/code-to-success/2/maxim-good-ending-bg.png',
  dialogueSteps: [
    {
      id: 'maxim-good-1',
      speaker: SpeakerType.MAXIM,
      text: 'Стоп! Я закрываю этот сайт и кладу трубку. Сейчас открою настоящее приложение банка.',
      characterImage: '/games/code-to-success/2/maxim-thoughtful.png',
      continueAction: ContinueAction.TAP,
      nextStepId: 'maxim-good-2'
    },
    {
      id: 'maxim-good-2',
      speaker: SpeakerType.FRAUDSTER,
      text: 'Подождите! Не кладите трубку! Ваша карта будет заблокирована навсегда!',
      continueAction: ContinueAction.TAP,
      nextStepId: 'maxim-good-3'
    },
    {
      id: 'maxim-good-3',
      speaker: SpeakerType.MAXIM,
      text: 'В приложении всё в порядке. Карта активна, деньги на месте. Это была мошенническая атака!',
      characterImage: '/games/code-to-success/2/maxim-relieved.png',
      continueAction: ContinueAction.TAP,
      nextStepId: 'maxim-good-4'
    },
    {
      id: 'maxim-good-4',
      speaker: SpeakerType.MAXIM,
      text: 'Фух! Чуть не попался. Хорошо, что остановился и подумал. Деньги в безопасности!',
      characterImage: '/games/code-to-success/2/maxim-relieved.png',
      continueAction: ContinueAction.TAP,
      nextStepId: undefined
    }
  ],
  nextSceneId: 'education',
  isEducational: false
};

const maximBadEndingScene: Scene = {
  id: 'maxim-bad-ending',
  name: 'Ошибочное решение',
  description: 'Максим попался на комбинированную мошенническую атаку',
  backgroundImage: '/games/code-to-success/2/maxim-bad-ending-bg.png',
  dialogueSteps: [
    {
      id: 'maxim-bad-1',
      speaker: SpeakerType.MAXIM,
      text: 'Ладно, раз служба безопасности на линии, значит это точно мой банк... Ввожу данные.',
      characterImage: '/games/code-to-success/2/maxim-thoughtful.png',
      continueAction: ContinueAction.TAP,
      nextStepId: 'maxim-bad-2'
    },
    {
      id: 'maxim-bad-2',
      speaker: SpeakerType.FRAUDSTER,
      text: 'Отлично! Теперь введите код из SMS, который вам придёт... Отлично, всё прошло успешно!',
      continueAction: ContinueAction.TAP,
      nextStepId: 'maxim-bad-3'
    },
    {
      id: 'maxim-bad-3',
      speaker: SpeakerType.NARRATOR,
      text: 'Через 2 минуты на телефон Максима приходит уведомление: "Списание 180 000 ₽"',
      continueAction: ContinueAction.TAP,
      nextStepId: 'maxim-bad-4'
    },
    {
      id: 'maxim-bad-4',
      speaker: SpeakerType.MAXIM,
      text: 'Что?! Все деньги ушли! Номер не отвечает... Меня обманули! Вся оплата за свадьбу...',
      characterImage: '/games/code-to-success/2/maxim-devastated.png',
      continueAction: ContinueAction.TAP,
      nextStepId: undefined
    }
  ],
  nextSceneId: 'education',
  isEducational: false
};

const maximGoodEducationScreen: EducationScreen = {
  id: 'maxim-education-good',
  title: 'Отлично! Вы распознали комбинированную атаку!',
  summary: 'Фишинговые сайты + звонки мошенников = двойное давление. Настоящий банк никогда не просит вводить данные на сторонних сайтах и не звонит одновременно с SMS.',
  correctDecision: 'Вы приняли правильное решение — закрыли подозрительный сайт и проверили информацию через официальное приложение банка. Это золотое правило безопасности!',
  rewardPoints: 100,
  productIntegration: {
    title: 'Push-уведомления и биометрия',
    description: 'Настройте push-уведомления о всех операциях и используйте биометрический вход в приложение для максимальной защиты.',
    buttonText: 'Узнать подробнее об услугах безопасности',
    url: undefined,
    isActive: false
  }
};

const maximBadEducationScreen: EducationScreen = {
  id: 'maxim-education-bad',
  title: 'К сожалению, вы стали жертвой комбинированной атаки',
  summary: 'Фишинговые сайты + звонки мошенников = двойное давление. Настоящий банк никогда не просит вводить данные на сторонних сайтах и не звонит одновременно с SMS.',
  correctDecision: 'Правильным решением было бы закрыть подозрительный сайт, положить трубку и проверить информацию через официальное приложение банка. Никогда не вводите данные под давлением!',
  rewardPoints: 0,
  productIntegration: {
    title: 'Виртуальные карты для безопасности',
    description: 'Используйте виртуальные карты для онлайн-платежей. Даже если данные попадут к мошенникам, основной счёт останется в безопасности.',
    buttonText: 'Узнать подробнее о виртуальных картах',
    url: undefined,
    isActive: false
  }
};

export const annaScenes: Scene[] = [
  introScene,
  phoneCallScene,
  choiceMomentScene,
  goodEndingScene,
  badEndingScene
];

export const maximScenes: Scene[] = [
  maximIntroScene,
  maximSuspiciousSmsScene,
  maximPhishingSiteScene,
  maximScamCallScene,
  maximChoiceMomentScene,
  maximGoodEndingScene,
  maximBadEndingScene
];

export const scenes: Scene[] = [
  ...annaScenes,
  ...maximScenes
];

export const codeToSuccessScenario: NovellaScenario = {
  id: 'code-to-success-main',
  name: 'Код Безопасности',
  description: 'Интерактивная визуальная новелла о кибербезопасности и защите от мошенничества',
  version: '1.0.0',
  characters,
  scenes,
  educationScreen: goodEducationScreen,
  metadata: {
    estimatedDuration: 180,
    difficulty: 'easy',
    category: 'Кибербезопасность',
    tags: ['мошенничество', 'безопасность', 'банковские услуги', 'финансовая грамотность']
  }
};

export {
  goodEducationScreen,
  badEducationScreen,
  maximGoodEducationScreen,
  maximBadEducationScreen
};
