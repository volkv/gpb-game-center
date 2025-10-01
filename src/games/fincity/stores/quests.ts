import { writable, derived, get } from 'svelte/store';
import type { Quest, QuestReward, QuestRequirement } from '../types/Quest';
import { QuestType, QuestStatus } from '../types/Quest';
import { addResources, addCompletedQuest, addActiveQuest, unlockBuilding, checkLevelUp } from './playerData';
import { checkAchievements } from './achievements';

const initialQuests: Quest[] = [
  {
    id: 'tutorial_welcome',
    title: 'Добро пожаловать в ФинСити!',
    description: 'Изучите основы управления своим финансовым городом.',
    type: QuestType.TUTORIAL,
    status: QuestStatus.AVAILABLE,
    requirements: [{ type: 'build', target: 'central_bank', amount: 1 }],
    rewards: { coins: 100, experience: 50 },
    isMainQuest: true,
    order: 1
  },
  {
    id: 'first_building',
    title: 'Первое здание',
    description: 'Постройте Центральный банк - основу вашего города.',
    type: QuestType.BUILD,
    status: QuestStatus.LOCKED,
    requirements: [{ type: 'build', target: 'central_bank', amount: 1 }],
    rewards: { coins: 200, crystals: 5, experience: 100 },
    isMainQuest: true,
    order: 2
  },
  {
    id: 'collect_resources',
    title: 'Первый сбор',
    description: 'Соберите ресурсы с вашего Центрального банка.',
    type: QuestType.COLLECT,
    status: QuestStatus.LOCKED,
    requirements: [{ type: 'collect', target: 'coins', amount: 50 }],
    rewards: { crystals: 10, experience: 75 },
    isMainQuest: true,
    order: 3
  },
  {
    id: 'security_threat',
    title: 'Угроза безопасности',
    description: 'Защитите город от мошенников. Постройте Штаб-квартиру безопасности.',
    type: QuestType.BUILD,
    status: QuestStatus.LOCKED,
    requirements: [{ type: 'build', target: 'security_hq', amount: 1 }],
    rewards: { coins: 500, crystals: 15, experience: 200, unlockBuilding: 'partner_mall' },
    isMainQuest: true,
    order: 4
  },
  {
    id: 'level_up',
    title: 'Повышение уровня',
    description: 'Достигните 2-го уровня для разблокировки новых зданий.',
    type: QuestType.EXPLORE,
    status: QuestStatus.LOCKED,
    requirements: [{ type: 'level', target: 2 }],
    rewards: { crystals: 25, experience: 150 },
    isMainQuest: false,
    order: 5
  },
  {
    id: 'expand_city',
    title: 'Расширение города',
    description: 'Постройте 3 разных типа зданий.',
    type: QuestType.BUILD,
    status: QuestStatus.LOCKED,
    requirements: [{ type: 'building_count', target: 3 }],
    rewards: { coins: 1000, crystals: 30, experience: 300 },
    isMainQuest: false,
    order: 6
  },
  {
    id: 'learn_savings',
    title: 'Основы накоплений',
    description: 'Изучите продукт "Накопительный счет" и узнайте о преимуществах сбережений.',
    type: QuestType.EXPLORE,
    status: QuestStatus.LOCKED,
    requirements: [{ type: 'learn_product', target: 'savings_account' }],
    rewards: { coins: 300, crystals: 8, experience: 150 },
    isMainQuest: false,
    order: 7
  },
  {
    id: 'security_awareness',
    title: 'Финансовая безопасность',
    description: 'Пройдите обучение по защите от мошенничества и получите знания о безопасности.',
    type: QuestType.EXPLORE,
    status: QuestStatus.LOCKED,
    requirements: [{ type: 'learn_product', target: 'fraud_protection' }],
    rewards: { coins: 400, crystals: 12, experience: 200, unlockBuilding: 'capital_tower' },
    isMainQuest: false,
    order: 8
  },
  {
    id: 'investment_basics',
    title: 'Азы инвестирования',
    description: 'Изучите инвестиционное страхование жизни и поймите принципы долгосрочных вложений.',
    type: QuestType.EXPLORE,
    status: QuestStatus.LOCKED,
    requirements: [{ type: 'learn_product', target: 'investment_life_insurance' }],
    rewards: { coins: 800, crystals: 25, experience: 350 },
    isMainQuest: false,
    order: 9
  },
  {
    id: 'cashback_master',
    title: 'Мастер кэшбэка',
    description: 'Освойте программы кэшбэка и научитесь получать максимум выгоды от покупок.',
    type: QuestType.EXPLORE,
    status: QuestStatus.LOCKED,
    requirements: [{ type: 'learn_product', target: 'cashback_programs' }],
    rewards: { coins: 600, crystals: 18, experience: 250 },
    isMainQuest: false,
    order: 10
  },
  {
    id: 'long_term_planning',
    title: 'Долгосрочное планирование',
    description: 'Изучите принципы долгосрочных сбережений и составьте финансовый план.',
    type: QuestType.EXPLORE,
    status: QuestStatus.LOCKED,
    requirements: [{ type: 'learn_product', target: 'long_term_savings' }],
    rewards: { coins: 500, crystals: 15, experience: 200 },
    isMainQuest: false,
    order: 11
  },
  {
    id: 'financial_education_complete',
    title: 'Выпускник ФинСити',
    description: 'Пройдите полный курс финансовой грамотности и станьте экспертом.',
    type: QuestType.EXPLORE,
    status: QuestStatus.LOCKED,
    requirements: [{ type: 'learn_product', target: 'financial_education' }],
    rewards: { coins: 1500, crystals: 50, experience: 500 },
    isMainQuest: false,
    order: 12
  },
  {
    id: 'credit_office_build',
    title: 'Финансовая доступность',
    description: 'Постройте Кредитный офис и узнайте о кредитных решениях.',
    type: QuestType.BUILD,
    status: QuestStatus.LOCKED,
    requirements: [{ type: 'build', target: 'credit_office', amount: 1 }],
    rewards: { coins: 700, crystals: 20, experience: 250, unlockBuilding: 'auto_showroom' },
    isMainQuest: false,
    order: 13
  },
  {
    id: 'learn_credit_products',
    title: 'Кредитные программы',
    description: 'Изучите возможности кредита наличными и рефинансирования.',
    type: QuestType.EXPLORE,
    status: QuestStatus.LOCKED,
    requirements: [{ type: 'learn_product', target: 'credit_loans' }],
    rewards: { coins: 550, crystals: 15, experience: 220 },
    isMainQuest: false,
    order: 14
  },
  {
    id: 'auto_showroom_build',
    title: 'Автомобильная мечта',
    description: 'Постройте Автосалон "Драйв" для финансирования транспорта.',
    type: QuestType.BUILD,
    status: QuestStatus.LOCKED,
    requirements: [{ type: 'build', target: 'auto_showroom', amount: 1 }],
    rewards: { coins: 1100, crystals: 30, experience: 350 },
    isMainQuest: false,
    order: 15
  },
  {
    id: 'learn_auto_credit',
    title: 'Автокредитование',
    description: 'Изучите программы автокредитования и условия покупки автомобиля.',
    type: QuestType.EXPLORE,
    status: QuestStatus.LOCKED,
    requirements: [{ type: 'learn_product', target: 'auto_credit' }],
    rewards: { coins: 800, crystals: 22, experience: 300 },
    isMainQuest: false,
    order: 16
  },
  {
    id: 'real_estate_agency_build',
    title: 'Жилищный проект',
    description: 'Постройте Агентство недвижимости и откройте путь к ипотеке.',
    type: QuestType.BUILD,
    status: QuestStatus.LOCKED,
    requirements: [{ type: 'build', target: 'real_estate_agency', amount: 1 }],
    rewards: { coins: 1500, crystals: 40, experience: 450 },
    isMainQuest: false,
    order: 17
  },
  {
    id: 'learn_mortgage',
    title: 'Ипотечный эксперт',
    description: 'Изучите ипотечные программы: семейная, IT-специалисты, новостройки.',
    type: QuestType.EXPLORE,
    status: QuestStatus.LOCKED,
    requirements: [{ type: 'learn_product', target: 'mortgage_programs' }],
    rewards: { coins: 1200, crystals: 35, experience: 400 },
    isMainQuest: false,
    order: 18
  },
  {
    id: 'credit_expansion',
    title: 'Кредитная экспансия',
    description: 'Постройте все 3 кредитных здания: офис, автосалон и агентство.',
    type: QuestType.BUILD,
    status: QuestStatus.LOCKED,
    requirements: [{ type: 'building_count', target: 9 }],
    rewards: { coins: 2500, crystals: 70, experience: 600 },
    isMainQuest: false,
    order: 19
  }
];

export const quests = writable<Quest[]>(initialQuests);

export const activeQuests = derived(quests, $quests =>
  $quests.filter(quest => quest.status === QuestStatus.AVAILABLE || quest.status === QuestStatus.IN_PROGRESS)
);

export const completedQuests = derived(quests, $quests =>
  $quests.filter(quest => quest.status === QuestStatus.COMPLETED)
);

export const mainQuests = derived(quests, $quests =>
  $quests.filter(quest => quest.isMainQuest).sort((a, b) => a.order - b.order)
);

export const sideQuests = derived(quests, $quests =>
  $quests.filter(quest => !quest.isMainQuest).sort((a, b) => a.order - b.order)
);

export const nextMainQuest = derived(mainQuests, $mainQuests =>
  $mainQuests.find(quest => quest.status === QuestStatus.AVAILABLE || quest.status === QuestStatus.LOCKED)
);

export function startQuest(questId: string) {
  quests.update(list =>
    list.map(quest => {
      if (quest.id === questId && quest.status === QuestStatus.AVAILABLE) {
        addActiveQuest(questId);
        return { ...quest, status: QuestStatus.IN_PROGRESS };
      }
      return quest;
    })
  );
}

export function completeQuest(questId: string) {
  let completedQuest: Quest | null = null;

  quests.update(list =>
    list.map(quest => {
      if (quest.id === questId && quest.status === QuestStatus.IN_PROGRESS) {
        completedQuest = quest;
        addCompletedQuest(questId);
        giveQuestRewards(quest.rewards);
        return { ...quest, status: QuestStatus.COMPLETED };
      }
      return quest;
    })
  );

  if (completedQuest) {
    unlockNextQuests();
    checkAchievements();
  }

  return completedQuest;
}

export function checkQuestProgress(action: { type: string; target: string; amount?: number }) {
  quests.update(list =>
    list.map(quest => {
      if (quest.status === QuestStatus.IN_PROGRESS) {
        const isCompleted = quest.requirements.every(req =>
          checkRequirement(req, action)
        );

        if (isCompleted) {
          completeQuest(quest.id);
        }
      }
      return quest;
    })
  );
}

function checkRequirement(requirement: QuestRequirement, action: { type: string; target: string; amount?: number }): boolean {
  if (requirement.type !== action.type) return false;

  switch (requirement.type) {
    case 'build':
      return requirement.target === action.target;

    case 'collect':
      return requirement.target === action.target &&
             (!requirement.amount || (action.amount || 0) >= requirement.amount);

    case 'level':
      return (action.amount || 0) >= Number(requirement.target);

    case 'building_count':
      return (action.amount || 0) >= Number(requirement.target);

    case 'learn_product':
      return requirement.target === action.target;

    default:
      return false;
  }
}

function giveQuestRewards(rewards: QuestReward) {
  const resourceRewards: Record<string, number> = {};

  if (rewards.coins) resourceRewards.coins = rewards.coins;
  if (rewards.crystals) resourceRewards.crystals = rewards.crystals;
  if (rewards.experience) resourceRewards.experience = rewards.experience;

  if (Object.keys(resourceRewards).length > 0) {
    addResources(resourceRewards);
    if (rewards.experience) {
      checkLevelUp();
    }
  }

  if (rewards.unlockBuilding) {
    unlockBuilding(rewards.unlockBuilding);
  }
}

function unlockNextQuests() {
  quests.update(list =>
    list.map(quest => {
      if (quest.status === QuestStatus.LOCKED) {
        const shouldUnlock = checkUnlockConditions(quest);
        if (shouldUnlock) {
          return { ...quest, status: QuestStatus.AVAILABLE };
        }
      }
      return quest;
    })
  );
}

function checkUnlockConditions(quest: Quest): boolean {
  const currentQuests = get(quests);

  if (quest.id === 'first_building') {
    const welcomeCompleted = currentQuests.find(q => q.id === 'tutorial_welcome')?.status === QuestStatus.COMPLETED;
    return welcomeCompleted || false;
  }

  if (quest.id === 'collect_resources') {
    const firstBuildingCompleted = currentQuests.find(q => q.id === 'first_building')?.status === QuestStatus.COMPLETED;
    return firstBuildingCompleted || false;
  }

  return quest.order <= 2;
}

export function trackProductLearning(productId: string) {
  checkQuestProgress({ type: 'learn_product', target: productId });
}

export function resetQuests() {
  quests.set(initialQuests);
}

unlockNextQuests();