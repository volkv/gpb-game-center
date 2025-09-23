import { startTutorial, nextTutorialStep, completeTutorial, showInfoToast } from '../stores/ui';
import { setGameMode } from '../stores/gameState';
import { completeQuest } from '../stores/quests';
import { playerData } from '../stores/playerData';
import { GameMode } from '../types/GameState';

export interface TutorialStep {
  id: string;
  title: string;
  message: string;
  target?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'highlight' | 'wait' | 'modal';
  nextTrigger?: 'auto' | 'click' | 'manual';
  duration?: number;
  skipable?: boolean;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Добро пожаловать в FinCity!',
    message: 'Вас приветствует ваш персональный помощник. Сейчас мы изучим основы управления финансовым городом.',
    position: 'center',
    action: 'modal',
    nextTrigger: 'click',
    skipable: false
  },
  {
    id: 'interface_overview',
    title: 'Знакомство с интерфейсом',
    message: 'В верхней части экрана вы видите ваши ресурсы: монеты, кристаллы, энергию и опыт. Они нужны для развития города.',
    target: '.top-bar',
    position: 'bottom',
    action: 'highlight',
    nextTrigger: 'click',
    skipable: true
  },
  {
    id: 'city_name',
    title: 'Ваш город',
    message: 'Здесь отображается название вашего города и ваш текущий уровень мэра.',
    target: '.city-info',
    position: 'bottom',
    action: 'highlight',
    nextTrigger: 'click',
    skipable: true
  },
  {
    id: 'game_field',
    title: 'Игровое поле',
    message: 'Это ваше игровое поле - место, где будет расти ваш финансовый город. Каждая клетка может вместить одно здание.',
    target: '.game-canvas',
    position: 'top',
    action: 'highlight',
    nextTrigger: 'click',
    skipable: true
  },
  {
    id: 'build_button',
    title: 'Кнопка строительства',
    message: 'Нажмите эту кнопку, чтобы открыть каталог зданий. Каждое здание представляет банковский продукт.',
    target: '.build-button',
    position: 'top',
    action: 'highlight',
    nextTrigger: 'click',
    skipable: false
  },
  {
    id: 'first_building',
    title: 'Первое здание',
    message: 'Отлично! Выберите "Центральный банк" - это основа любого финансового города. Нажмите на него.',
    target: '.building-card[data-type="central_bank"]',
    position: 'right',
    action: 'highlight',
    nextTrigger: 'manual',
    skipable: false
  },
  {
    id: 'placement',
    title: 'Размещение здания',
    message: 'Теперь выберите место для постройки. Наведите курсор на свободную клетку и кликните для размещения.',
    target: '.game-canvas',
    position: 'top',
    action: 'highlight',
    nextTrigger: 'manual',
    skipable: false
  },
  {
    id: 'building_placed',
    title: 'Поздравляем!',
    message: 'Вы построили своё первое здание! Теперь оно будет приносить вам доход в виде монет.',
    position: 'center',
    action: 'modal',
    nextTrigger: 'click',
    skipable: false
  },
  {
    id: 'quest_button',
    title: 'Система квестов',
    message: 'Нажмите на эту кнопку, чтобы открыть журнал квестов. Квесты помогают изучать банковские продукты.',
    target: '.quest-button',
    position: 'top',
    action: 'highlight',
    nextTrigger: 'click',
    skipable: true
  },
  {
    id: 'quest_system',
    title: 'Журнал квестов',
    message: 'Здесь вы найдете задания, которые помогут освоить финансовые инструменты и получить награды.',
    target: '.quest-log',
    position: 'left',
    action: 'highlight',
    nextTrigger: 'click',
    skipable: true
  },
  {
    id: 'tutorial_complete',
    title: 'Обучение завершено!',
    message: 'Отлично! Теперь вы знаете основы FinCity. Продолжайте строить город, выполнять квесты и изучать банковские продукты!',
    position: 'center',
    action: 'modal',
    nextTrigger: 'click',
    skipable: false
  }
];

export class TutorialManager {
  private currentStepIndex = 0;
  private isActive = false;
  private highlightElement: globalThis.HTMLElement | null = null;
  private overlay: globalThis.HTMLElement | null = null;

  constructor() {
    this.bindEvents();
  }

  startTutorial() {
    this.isActive = true;
    this.currentStepIndex = 0;
    startTutorial();
    setGameMode('tutorial' as GameMode);
    this.showStep(this.currentStepIndex);
  }

  private showStep(stepIndex: number) {
    if (stepIndex >= tutorialSteps.length) {
      this.completeTutorial();
      return;
    }

    const step = tutorialSteps[stepIndex];
    this.currentStepIndex = stepIndex;

    this.clearHighlight();

    switch (step.action) {
      case 'modal':
        this.showModal(step);
        break;
      case 'highlight':
        this.highlightElementMethod(step);
        break;
      case 'wait':
        this.waitForDuration(step);
        break;
    }

    if (step.nextTrigger === 'auto') {
      globalThis.setTimeout(() => this.nextStep(), step.duration || 3000);
    }
  }

  private showModal(step: TutorialStep) {
    const modalContent = {
      title: step.title,
      message: step.message,
      skipable: step.skipable || false,
      onNext: () => this.nextStep(),
      onSkip: () => this.skipTutorial()
    };

    this.createTutorialModal(modalContent);
  }

  private highlightElementMethod(step: TutorialStep) {
    if (!step.target) return;

    const element = globalThis.document.querySelector(step.target) as globalThis.HTMLElement;
    if (!element) {
      globalThis.setTimeout(() => this.highlightElementMethod(step), 500);
      return;
    }

    this.createOverlay();
    this.createHighlight(element, step);
    this.showTooltip(element, step);
  }

  private createOverlay() {
    this.overlay = globalThis.document.createElement('div');
    this.overlay.className = 'tutorial-overlay fixed inset-0 bg-black/50 pointer-events-none';
    this.overlay.style.zIndex = '20';
    globalThis.document.body.appendChild(this.overlay);
  }

  private createHighlight(element: globalThis.HTMLElement, _step: TutorialStep) {
    const rect = element.getBoundingClientRect();
    const padding = 8;

    this.highlightElement = globalThis.document.createElement('div');
    this.highlightElement.className = 'tutorial-highlight fixed bg-white/20 border-2 border-gpb-blue rounded-lg pointer-events-none animate-pulse';
    this.highlightElement.style.left = `${rect.left - padding}px`;
    this.highlightElement.style.top = `${rect.top - padding}px`;
    this.highlightElement.style.width = `${rect.width + padding * 2}px`;
    this.highlightElement.style.height = `${rect.height + padding * 2}px`;
    this.highlightElement.style.zIndex = '25';

    globalThis.document.body.appendChild(this.highlightElement);

    element.style.position = 'relative';
    element.style.zIndex = '35';
  }

  private showTooltip(element: globalThis.HTMLElement, step: TutorialStep) {
    const rect = element.getBoundingClientRect();
    const windowWidth = globalThis.window.innerWidth;
    const windowHeight = globalThis.window.innerHeight;
    const padding = 12;

    const tooltip = globalThis.document.createElement('div');

    // Адаптивные стили для разных размеров экрана
    if (windowWidth < 480) {
      tooltip.className = 'tutorial-tooltip fixed z-[9999] max-w-[95vw] min-w-[280px] p-4 bg-white rounded-lg shadow-xl border text-sm';
    } else if (windowWidth < 768) {
      tooltip.className = 'tutorial-tooltip fixed z-[9999] max-w-[90vw] min-w-[320px] p-5 bg-white rounded-lg shadow-xl border';
    } else {
      tooltip.className = 'tutorial-tooltip fixed z-[9999] max-w-md min-w-80 p-6 bg-white rounded-lg shadow-xl border';
    }

    // Создаем контент тултипа для определения размеров
    tooltip.innerHTML = `
      <div class="mb-4">
        <h3 class="text-xl font-bold text-gray-900 mb-2">${step.title}</h3>
        <p class="text-gray-700 leading-relaxed">${step.message}</p>
      </div>
      <div class="flex gap-3 justify-end">
        ${step.skipable ? '<button class="tutorial-skip px-4 py-2 text-gray-600 hover:text-gray-800 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">Пропустить</button>' : ''}
        <button class="tutorial-next px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">Далее</button>
      </div>
    `;

    // Временно добавляем элемент в DOM для измерения
    tooltip.style.position = 'absolute';
    tooltip.style.top = '-9999px';
    tooltip.style.left = '-9999px';
    tooltip.style.visibility = 'hidden';
    globalThis.document.body.appendChild(tooltip);

    // Получаем реальные размеры
    const tooltipRect = tooltip.getBoundingClientRect();
    const tooltipWidth = tooltipRect.width;
    const tooltipHeight = tooltipRect.height;

    // Удаляем временный элемент
    globalThis.document.body.removeChild(tooltip);

    // Определяем лучшую позицию с учетом размеров
    const position = this.calculateOptimalPosition(
      rect,
      { width: tooltipWidth, height: tooltipHeight },
      { width: windowWidth, height: windowHeight },
      step.position,
      padding
    );

    // Применяем позицию
    tooltip.style.position = 'fixed';
    tooltip.style.top = `${position.top}px`;
    tooltip.style.left = `${position.left}px`;
    tooltip.style.transform = position.transform;
    tooltip.style.visibility = 'visible';

    tooltip.innerHTML = `
      <div class="mb-4">
        <h3 class="text-xl font-bold text-gray-900 mb-2">${step.title}</h3>
        <p class="text-gray-700 leading-relaxed">${step.message}</p>
      </div>
      <div class="flex gap-3 justify-end">
        ${step.skipable ? '<button class="tutorial-skip px-4 py-2 text-gray-600 hover:text-gray-800 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">Пропустить</button>' : ''}
        <button class="tutorial-next px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">Далее</button>
      </div>
    `;

    const nextButton = tooltip.querySelector('.tutorial-next') as globalThis.HTMLElement;
    const skipButton = tooltip.querySelector('.tutorial-skip') as globalThis.HTMLElement;

    nextButton?.addEventListener('click', () => this.nextStep());
    skipButton?.addEventListener('click', () => this.skipTutorial());

    globalThis.document.body.appendChild(tooltip);
  }

  private calculateOptimalPosition(
    elementRect: { top: number; left: number; right: number; bottom: number; width: number; height: number },
    tooltipSize: { width: number; height: number },
    viewport: { width: number; height: number },
    preferredPosition?: 'top' | 'bottom' | 'left' | 'right' | 'center',
    padding: number = 12
  ): { top: number; left: number; transform: string } {
    const { width: tooltipWidth, height: tooltipHeight } = tooltipSize;
    const { width: windowWidth, height: windowHeight } = viewport;

    // Для очень маленьких экранов используем адаптивный центр
    if (windowWidth < 360 || windowHeight < 600) {
      return {
        top: Math.max(padding, Math.min(windowHeight - tooltipHeight - padding, windowHeight / 2 - tooltipHeight / 2)),
        left: Math.max(padding, windowWidth / 2 - tooltipWidth / 2),
        transform: 'none'
      };
    }

    // Пробуем разные позиции в порядке приоритета
    const positions = this.getPositionFallbacks(preferredPosition);

    for (const position of positions) {
      const calc = this.calculatePosition(elementRect, tooltipSize, position, padding);

      // Проверяем, помещается ли тултип в viewport
      if (this.fitsInViewport(calc, tooltipSize, viewport, padding)) {
        return calc;
      }
    }

    // Fallback: центр экрана с коррекцией границ
    return {
      top: Math.max(padding, Math.min(windowHeight - tooltipHeight - padding, windowHeight / 2 - tooltipHeight / 2)),
      left: Math.max(padding, Math.min(windowWidth - tooltipWidth - padding, windowWidth / 2 - tooltipWidth / 2)),
      transform: 'none'
    };
  }

  private getPositionFallbacks(preferred?: 'top' | 'bottom' | 'left' | 'right' | 'center'): ('top' | 'bottom' | 'left' | 'right' | 'center')[] {
    const all: ('top' | 'bottom' | 'left' | 'right' | 'center')[] = ['top', 'bottom', 'right', 'left', 'center'];

    if (!preferred || preferred === 'center') {
      return ['center', 'bottom', 'top', 'right', 'left'];
    }

    // Ставим предпочитаемую позицию первой, затем остальные в логическом порядке
    const others = all.filter(p => p !== preferred);
    return [preferred, ...others];
  }

  private calculatePosition(
    elementRect: { top: number; left: number; right: number; bottom: number; width: number; height: number },
    tooltipSize: { width: number; height: number },
    position: 'top' | 'bottom' | 'left' | 'right' | 'center',
    padding: number
  ): { top: number; left: number; transform: string } {
    const { width: tooltipWidth, height: tooltipHeight } = tooltipSize;

    switch (position) {
      case 'top':
        return {
          top: elementRect.top - tooltipHeight - padding,
          left: elementRect.left + elementRect.width / 2,
          transform: 'translateX(-50%)'
        };
      case 'bottom':
        return {
          top: elementRect.bottom + padding,
          left: elementRect.left + elementRect.width / 2,
          transform: 'translateX(-50%)'
        };
      case 'left':
        return {
          top: elementRect.top + elementRect.height / 2,
          left: elementRect.left - tooltipWidth - padding,
          transform: 'translateY(-50%)'
        };
      case 'right':
        return {
          top: elementRect.top + elementRect.height / 2,
          left: elementRect.right + padding,
          transform: 'translateY(-50%)'
        };
      case 'center':
      default:
        return {
          top: globalThis.window.innerHeight / 2,
          left: globalThis.window.innerWidth / 2,
          transform: 'translate(-50%, -50%)'
        };
    }
  }

  private fitsInViewport(
    position: { top: number; left: number; transform: string },
    tooltipSize: { width: number; height: number },
    viewport: { width: number; height: number },
    padding: number
  ): boolean {
    const { width: tooltipWidth, height: tooltipHeight } = tooltipSize;
    const { width: windowWidth, height: windowHeight } = viewport;

    // Рассчитываем итоговые границы с учетом transform
    let { top, left } = position;

    if (position.transform.includes('translateX(-50%)')) {
      left -= tooltipWidth / 2;
    }
    if (position.transform.includes('translateY(-50%)')) {
      top -= tooltipHeight / 2;
    }
    if (position.transform.includes('translate(-50%, -50%)')) {
      left -= tooltipWidth / 2;
      top -= tooltipHeight / 2;
    }

    // Проверяем границы
    return (
      left >= padding &&
      top >= padding &&
      left + tooltipWidth <= windowWidth - padding &&
      top + tooltipHeight <= windowHeight - padding
    );
  }

  private createTutorialModal(content: {
    title: string;
    message: string;
    skipable: boolean;
    onNext: () => void;
    onSkip: () => void;
  }) {
    const modal = globalThis.document.createElement('div');
    modal.className = 'tutorial-modal fixed inset-0 z-50 flex items-center justify-center p-4';

    const windowWidth = globalThis.window.innerWidth;
    const isMobile = windowWidth < 768;
    const isSmallMobile = windowWidth < 480;

    // Адаптивные стили для модального окна
    const modalContentClass = isSmallMobile
      ? 'bg-white rounded-lg shadow-xl p-6 max-w-[95vw] min-w-[300px] w-full mx-2 relative'
      : isMobile
        ? 'bg-white rounded-lg shadow-xl p-7 max-w-[90vw] min-w-[320px] w-full mx-3 relative'
        : 'bg-white rounded-lg shadow-xl p-8 max-w-lg min-w-96 w-full mx-4 relative';

    const titleClass = isSmallMobile
      ? 'text-xl font-bold text-gray-900 mb-3'
      : 'text-2xl font-bold text-gray-900 mb-4';

    const textClass = isSmallMobile
      ? 'text-gray-700 mb-5 leading-relaxed text-base'
      : 'text-gray-700 mb-6 leading-relaxed text-lg';

    const buttonContainerClass = isSmallMobile
      ? 'flex flex-col gap-3'
      : 'flex gap-3 justify-end';

    const skipButtonClass = isSmallMobile
      ? 'px-6 py-3 text-gray-600 hover:text-gray-800 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors w-full'
      : 'px-6 py-3 text-gray-600 hover:text-gray-800 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors';

    const nextButtonClass = isSmallMobile
      ? 'px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium w-full'
      : 'px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium';

    modal.innerHTML = `
      <div class="bg-black/50 absolute inset-0"></div>
      <div class="${modalContentClass}">
        <h2 class="${titleClass}">${content.title}</h2>
        <p class="${textClass}">${content.message}</p>
        <div class="${buttonContainerClass}">
          ${content.skipable ? `<button class="tutorial-skip ${skipButtonClass}">Пропустить обучение</button>` : ''}
          <button class="tutorial-next ${nextButtonClass}">Понятно</button>
        </div>
      </div>
    `;

    const nextButton = modal.querySelector('.tutorial-next') as globalThis.HTMLElement;
    const skipButton = modal.querySelector('.tutorial-skip') as globalThis.HTMLElement;

    nextButton?.addEventListener('click', () => {
      globalThis.document.body.removeChild(modal);
      content.onNext();
    });

    skipButton?.addEventListener('click', () => {
      globalThis.document.body.removeChild(modal);
      content.onSkip();
    });

    globalThis.document.body.appendChild(modal);
  }

  private waitForDuration(step: TutorialStep) {
    showInfoToast(step.title, step.message);
    globalThis.setTimeout(() => this.nextStep(), step.duration || 3000);
  }

  nextStep() {
    this.clearHighlight();
    this.currentStepIndex++;
    nextTutorialStep();
    this.showStep(this.currentStepIndex);
  }

  skipTutorial() {
    this.isActive = false;
    this.clearHighlight();
    completeTutorial();
    setGameMode('normal' as GameMode);

    playerData.update(data => ({
      ...data,
      tutorialCompleted: true
    }));

    showInfoToast('Обучение пропущено', 'Вы всегда можете вернуться к обучению в настройках');
  }

  completeTutorial() {
    this.isActive = false;
    this.clearHighlight();
    completeTutorial();
    setGameMode('normal' as GameMode);

    playerData.update(data => ({
      ...data,
      tutorialCompleted: true
    }));

    completeQuest('tutorial_welcome');
    showInfoToast('Обучение завершено!', 'Поздравляем! Теперь вы готовы строить свой финансовый город.');
  }

  private clearHighlight() {
    if (this.highlightElement) {
      globalThis.document.body.removeChild(this.highlightElement);
      this.highlightElement = null;
    }

    if (this.overlay) {
      globalThis.document.body.removeChild(this.overlay);
      this.overlay = null;
    }

    globalThis.document.querySelectorAll('.tutorial-tooltip, .tutorial-modal').forEach(element => {
      element.remove();
    });

    globalThis.document.querySelectorAll('[style*="z-index: 35"]').forEach((element: globalThis.Element) => {
      const htmlElement = element as globalThis.HTMLElement;
      htmlElement.style.zIndex = '';
      htmlElement.style.position = '';
    });
  }

  private bindEvents() {
    globalThis.document.addEventListener('keydown', (event) => {
      if (!this.isActive) return;

      if (event.key === 'Escape') {
        const currentStep = tutorialSteps[this.currentStepIndex];
        if (currentStep?.skipable) {
          this.skipTutorial();
        }
      }

      if (event.key === 'Enter' || event.key === ' ') {
        this.nextStep();
      }
    });
  }

  getCurrentStep(): TutorialStep | null {
    return tutorialSteps[this.currentStepIndex] || null;
  }

  isStepActive(stepId: string): boolean {
    const currentStep = this.getCurrentStep();
    return currentStep?.id === stepId && this.isActive;
  }

  getTotalSteps(): number {
    return tutorialSteps.length;
  }

  getCurrentStepIndex(): number {
    return this.currentStepIndex;
  }

  getProgress(): number {
    return Math.round((this.currentStepIndex / tutorialSteps.length) * 100);
  }
}

export const tutorialManager = new TutorialManager();