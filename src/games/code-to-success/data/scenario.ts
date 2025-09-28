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
    id: 'mikhail',
    name: 'Михаил',
    age: 45,
    profession: 'Семьянин',
    description: 'Заботливый семьянин, который всегда думает о благополучии своей семьи.',
    avatar: '/games/code-to-success/avatar2.png',
    dialogueImages: [],
    isAvailable: false
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

const educationScreen: EducationScreen = {
  id: 'education-main',
  title: 'Отличная работа! Вы распознали мошенника!',
  summary: 'Перепроверять информацию и никогда не диктовать коды из СМС – золотые правила безопасности. Помните: сотрудники банка НИКОГДА не просят эти данные по телефону!',
  correctDecision: 'Правильным решением было положить трубку и самостоятельно перезвонить в банк по официальному номеру или использовать знания об услугах защиты от мошенничества.',
  rewardPoints: 100,
  productIntegration: {
    title: 'Защита от мошенничества',
    description: 'Узнайте больше о том, как защитить свои финансы от мошенников с помощью современных банковских технологий.',
    buttonText: 'Узнать подробнее об услуге',
    url: undefined,
    isActive: false
  }
};

export const scenes: Scene[] = [
  introScene,
  phoneCallScene,
  choiceMomentScene,
  goodEndingScene,
  badEndingScene
];

export const codeToSuccessScenario: NovellaScenario = {
  id: 'code-to-success-main',
  name: 'Код к Успеху',
  description: 'Интерактивная визуальная новелла о кибербезопасности и защите от мошенничества',
  version: '1.0.0',
  characters,
  scenes,
  educationScreen,
  metadata: {
    estimatedDuration: 180,
    difficulty: 'easy',
    category: 'Кибербезопасность',
    tags: ['мошенничество', 'безопасность', 'банковские услуги', 'финансовая грамотность']
  }
};
