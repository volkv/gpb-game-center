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
    target: '.resources-bar',
    position: 'bottom',
    action: 'highlight',
    nextTrigger: 'click',
    skipable: true
  },
  {
    id: 'city_name',
    title: 'Ваш город',
    message: 'Здесь отображается ваш текущий уровень мэра.',
    target: '.resources-bar__level',
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
    id: 'action_buttons',
    title: 'Панель действий',
    message: 'Здесь расположены основные действия: кнопка "Строить" для постройки зданий, "Квесты" для заданий и "Награды" для достижений.',
    target: '.action-toolbar',
    position: 'top',
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
    console.log('🎓 [TUTORIAL] startTutorial() called');
    this.isActive = true;
    this.currentStepIndex = 0;
    startTutorial();
    setGameMode('tutorial' as GameMode);
    this.showStep(this.currentStepIndex);
  }

  private showStep(stepIndex: number) {
    console.log('📖 [TUTORIAL] showStep:', stepIndex, '/ Total steps:', tutorialSteps.length);
    if (stepIndex >= tutorialSteps.length) {
      console.log('✅ [TUTORIAL] All steps completed, calling completeTutorial()');
      this.completeTutorial();
      return;
    }

    const step = tutorialSteps[stepIndex];
    console.log('📄 [TUTORIAL] Current step:', step.id, 'action:', step.action, 'nextTrigger:', step.nextTrigger);
    this.currentStepIndex = stepIndex;

    this.clearHighlight();

    switch (step.action) {
      case 'modal':
        console.log('🎭 [TUTORIAL] Showing modal');
        this.showModal(step);
        break;
      case 'highlight':
        console.log('✨ [TUTORIAL] Highlighting element:', step.target);
        this.highlightElementMethod(step);
        break;
      case 'wait':
        console.log('⏳ [TUTORIAL] Waiting');
        this.waitForDuration(step);
        break;
    }

    if (step.nextTrigger === 'auto') {
      console.log('⏰ [TUTORIAL] Auto-advancing in', step.duration || 3000, 'ms');
      globalThis.setTimeout(() => this.nextStep(), step.duration || 3000);
    }
  }

  private showModal(step: TutorialStep) {
    console.log('🎭 [TUTORIAL] showModal called with step:', step.title);
    const modalContent = {
      title: step.title,
      message: step.message,
      skipable: step.skipable || false,
      onNext: () => this.nextStep(),
      onSkip: () => this.skipTutorial()
    };

    this.createTutorialModal(modalContent);
    console.log('✅ [TUTORIAL] Modal created');
  }

  private highlightElementMethod(step: TutorialStep) {
    if (!step.target) return;

    const element = globalThis.document.querySelector(step.target) as globalThis.HTMLElement;
    if (!element) {
      console.warn('⚠️ [TUTORIAL] Element not found:', step.target);
      globalThis.setTimeout(() => this.highlightElementMethod(step), 500);
      return;
    }

    console.log('✅ [TUTORIAL] Element found, highlighting:', step.target);
    this.createHighlight(element, step);
    this.showTooltip(element, step);
  }

  private createOverlay() {
    this.overlay = globalThis.document.createElement('div');
    this.overlay.className = 'tutorial-overlay';
    this.overlay.style.zIndex = '9998';
    globalThis.document.body.appendChild(this.overlay);
  }

  private createHighlight(element: globalThis.HTMLElement, _step: TutorialStep) {
    const rect = element.getBoundingClientRect();
    const padding = 8;

    this.highlightElement = globalThis.document.createElement('div');
    this.highlightElement.className = 'tutorial-highlight';
    this.highlightElement.style.left = `${rect.left - padding}px`;
    this.highlightElement.style.top = `${rect.top - padding}px`;
    this.highlightElement.style.width = `${rect.width + padding * 2}px`;
    this.highlightElement.style.height = `${rect.height + padding * 2}px`;
    this.highlightElement.style.zIndex = '10000';

    globalThis.document.body.appendChild(this.highlightElement);

    element.style.position = 'relative';
    element.style.zIndex = '10001';
  }

  private showTooltip(element: globalThis.HTMLElement, step: TutorialStep) {
    const rect = element.getBoundingClientRect();
    const windowWidth = globalThis.window.innerWidth;
    const windowHeight = globalThis.window.innerHeight;
    const padding = 12;

    const tooltip = globalThis.document.createElement('div');
    tooltip.className = 'tutorial-tooltip';

    if (windowWidth < 480) {
      tooltip.style.maxWidth = '95vw';
      tooltip.style.minWidth = '280px';
    } else if (windowWidth < 768) {
      tooltip.style.maxWidth = '90vw';
      tooltip.style.minWidth = '320px';
    } else {
      tooltip.style.maxWidth = '420px';
      tooltip.style.minWidth = '320px';
    }

    tooltip.innerHTML = `
      <div style="margin-bottom: 1rem;">
        <h3>${step.title}</h3>
        <p>${step.message}</p>
      </div>
      <div style="display: flex; gap: 0.75rem; justify-content: flex-end;">
        ${step.skipable ? '<button class="tutorial-skip">Пропустить</button>' : ''}
        <button class="tutorial-next">Далее</button>
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
      <div style="margin-bottom: 1rem;">
        <h3>${step.title}</h3>
        <p>${step.message}</p>
      </div>
      <div style="display: flex; gap: 0.75rem; justify-content: flex-end;">
        ${step.skipable ? '<button class="tutorial-skip">Пропустить</button>' : ''}
        <button class="tutorial-next">Далее</button>
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
    console.log('🏗️ [TUTORIAL] createTutorialModal:', content.title);

    if (!globalThis.document || !globalThis.document.body) {
      console.error('❌ [TUTORIAL] document.body is not available');
      return;
    }

    const modal = globalThis.document.createElement('div');
    modal.className = 'tutorial-modal';
    console.log('✅ [TUTORIAL] Modal element created with class:', modal.className);

    const windowWidth = globalThis.window.innerWidth;
    const isSmallMobile = windowWidth < 480;

    const buttonContainerStyle = isSmallMobile
      ? 'display: flex; flex-direction: column; gap: 0.75rem;'
      : 'display: flex; gap: 0.75rem; justify-content: flex-end;';

    const buttonStyle = isSmallMobile ? 'width: 100%;' : '';

    modal.innerHTML = `
      <div>
        <h2>${content.title}</h2>
        <p>${content.message}</p>
        <div style="${buttonContainerStyle}">
          ${content.skipable ? `<button class="tutorial-skip" style="${buttonStyle}">Пропустить обучение</button>` : ''}
          <button class="tutorial-next" style="${buttonStyle}">Понятно</button>
        </div>
      </div>
    `;
    console.log('📝 [TUTORIAL] Modal HTML set');

    const nextButton = modal.querySelector('.tutorial-next') as globalThis.HTMLElement;
    const skipButton = modal.querySelector('.tutorial-skip') as globalThis.HTMLElement;

    console.log('🔘 [TUTORIAL] Buttons found:', { next: !!nextButton, skip: !!skipButton });

    nextButton?.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      console.log('➡️ [TUTORIAL] Next button clicked');
      if (modal.parentNode) {
        globalThis.document.body.removeChild(modal);
      }
      content.onNext();
    });

    skipButton?.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      console.log('⏭️ [TUTORIAL] Skip button clicked');
      if (modal.parentNode) {
        globalThis.document.body.removeChild(modal);
      }
      content.onSkip();
    });

    globalThis.document.body.appendChild(modal);
    console.log('📌 [TUTORIAL] Modal appended to body');
    console.log('🔍 [TUTORIAL] Modal in DOM:', globalThis.document.body.contains(modal));
    console.log('🎨 [TUTORIAL] Modal computed style:', globalThis.getComputedStyle(modal).display);
  }

  private waitForDuration(step: TutorialStep) {
    showInfoToast(step.title, step.message);
    globalThis.setTimeout(() => this.nextStep(), step.duration || 3000);
  }

  nextStep() {
    console.log('⏭️ [TUTORIAL] nextStep() called, current:', this.currentStepIndex);
    this.clearHighlight();
    this.currentStepIndex++;
    console.log('➡️ [TUTORIAL] Moving to step:', this.currentStepIndex);
    nextTutorialStep();
    this.showStep(this.currentStepIndex);
  }

  skipTutorial() {
    this.isActive = false;
    this.clearHighlight();
    completeTutorial();
    setGameMode('normal' as GameMode);

    showInfoToast('Обучение пропущено', 'Вы можете начать строить свой город');
  }

  completeTutorial() {
    this.isActive = false;
    this.clearHighlight();
    completeTutorial();
    setGameMode('normal' as GameMode);

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