<script lang="ts" module>
  // Type declaration for DOM API
  declare const getComputedStyle: (element: globalThis.Element) => globalThis.CSSStyleDeclaration;
</script>

<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { isTutorialActive } from '../../stores/ui';
  import { tutorialManager } from '../../lib/TutorialManager';
  import { playerData } from '../../stores/playerData';
  import { Button, Icon, ProgressBar } from './';

  let isFirstTime = $state(false);
  let showWelcomeScreen = $state(false);
  let currentStep = $state(tutorialManager.getCurrentStep());
  let currentStepIndex = $state(tutorialManager.getCurrentStepIndex());
  let progress = $state(0);
  let totalSteps = $state(tutorialManager.getTotalSteps());

  onMount(() => {
    console.log('🎬 [ONBOARDING] Onboarding.svelte onMount() called');
    
    const data = $playerData;
    console.log('📊 [ONBOARDING] Current playerData in component:', {
      tutorialCompleted: data.tutorialCompleted,
      buildingsCount: data.buildings.length,
      cityName: data.cityName
    });
    
    isFirstTime = !data.tutorialCompleted && data.buildings.length === 0;
    console.log('🔍 [ONBOARDING] Component isFirstTime check:', isFirstTime);

    if (isFirstTime) {
      console.log('✨ [ONBOARDING] Showing welcome screen');
      showWelcomeScreen = true;
      
      // Добавляем небольшую задержку для отладки
      setTimeout(() => {
        console.log('🔍 [ONBOARDING] showWelcomeScreen state after timeout:', showWelcomeScreen);
        const element = document.querySelector('.onboarding-welcome');
        console.log('🎭 [ONBOARDING] DOM element found:', !!element);
        if (element) {
          const styles = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          console.log('🎨 [ONBOARDING] Element styles:', {
            position: styles.position,
            zIndex: styles.zIndex,
            display: styles.display,
            opacity: styles.opacity,
            visibility: styles.visibility,
            width: styles.width,
            minWidth: styles.minWidth,
            maxWidth: styles.maxWidth,
            actualWidth: rect.width,
            actualHeight: rect.height
          });
          
          const contentCard = element.querySelector('.content-card');
          if (contentCard) {
            const cardStyles = getComputedStyle(contentCard);
            const cardRect = contentCard.getBoundingClientRect();
            console.log('📦 [ONBOARDING] Content card styles:', {
              width: cardStyles.width,
              minWidth: cardStyles.minWidth,
              maxWidth: cardStyles.maxWidth,
              actualWidth: cardRect.width,
              actualHeight: cardRect.height
            });
          }
        }
      }, 100);
    } else {
      console.log('👤 [ONBOARDING] Not showing welcome screen - returning user');
    }

    updateProgress();

    const interval = globalThis.setInterval(() => {
      currentStep = tutorialManager.getCurrentStep();
      currentStepIndex = tutorialManager.getCurrentStepIndex();
      updateProgress();
    }, 500);

    onDestroy(() => {
      globalThis.clearInterval(interval);
    });
  });

  function updateProgress() {
    progress = tutorialManager.getProgress();
    totalSteps = tutorialManager.getTotalSteps();
  }

  function startTutorial() {
    showWelcomeScreen = false;
    tutorialManager.startTutorial();
  }

  function skipTutorial() {
    showWelcomeScreen = false;
    tutorialManager.skipTutorial();
  }

  function handleCityNameChange(event: globalThis.Event) {
    const target = event.target as globalThis.HTMLInputElement;
    if (target.value.trim()) {
      playerData.update(data => ({
        ...data,
        cityName: target.value.trim()
      }));
    }
  }
</script>

{#if showWelcomeScreen}
  {(() => {
    console.log('🎭 [ONBOARDING] Rendering welcome screen - showWelcomeScreen:', showWelcomeScreen);
    return '';
  })()}
  <div class="onboarding-welcome">
    <div class="background-media"></div>
    <div class="content-card">
      <div class="header-section p-lg mb-lg">
        <div class="flex items-center gap-md mb-md">
          <Icon name="building" size="xl" class="text-mint" />
          <div>
            <h1 class="text-lg text-gray-900">Добро пожаловать в FinCity!</h1>
            <p class="text-body text-gray-600">Ваш финансовый город ждёт</p>
          </div>
        </div>
      </div>

      <div class="content-section p-6 space-y-6">
        <div class="space-y-4">
          <h2 class="text-heading-md text-gray-900">Создайте свой финансовый мегаполис</h2>
          <p class="text-body-sm text-gray-600 leading-relaxed">
            FinCity поможет вам изучить банковские продукты Газпромбанка через увлекательную игру.
            Стройте здания, выполняйте квесты и развивайте финансовую грамотность!
          </p>
        </div>

        <div class="space-y-2">
          <label for="cityName" class="block text-ui-label text-gray-900">
            Как назовём ваш город?
          </label>
          <input
            id="cityName"
            type="text"
            value={$playerData.cityName}
            oninput={handleCityNameChange}
            placeholder="Введите название города"
            class="w-full px-md py-sm border-2 border-gray-300 rounded-[var(--radius-lg)] bg-white text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-violet focus:border-violet transition-all duration-[var(--duration-fast)]"
            maxlength="20"
          />
        </div>

        <div class="space-y-4">
          <h3 class="text-ui-label text-gray-900">Что вас ждёт:</h3>
          <div class="grid grid-cols-1 gap-2">
            <div class="bubble-info bg-mint-20 border-mint-30">
              <Icon name="building" class="text-mint" />
              <div>
                <div class="text-ui-label text-gray-900">Строительство зданий</div>
                <div class="text-ui-caption text-gray-600">Каждое здание - банковский продукт</div>
              </div>
            </div>
            <div class="bubble-info bg-melissa-20 border-melissa-30">
              <Icon name="quest" class="text-melissa" />
              <div>
                <div class="text-ui-label text-gray-900">Обучающие квесты</div>
                <div class="text-ui-caption text-gray-600">Изучайте финансы играя</div>
              </div>
            </div>
            <div class="bubble-info bg-sakura-20 border-sakura-30">
              <Icon name="crystal" class="text-sakura" />
              <div>
                <div class="text-ui-label text-gray-900">Система наград</div>
                <div class="text-ui-caption text-gray-600">Получайте достижения и бонусы</div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex gap-4 pt-6">
          <Button variant="secondary" class="flex-1" onclick={skipTutorial}>
            Пропустить обучение
          </Button>
          <Button variant="primary" class="flex-1" onclick={startTutorial}>
            Начать обучение
          </Button>
        </div>
      </div>
    </div>
  </div>
{/if}

{#if $isTutorialActive && currentStep}
  <div class="onboarding-progress bubble-info fixed top-4 left-1/2 transform -translate-x-1/2 z-40 shadow-xl">
    <div class="flex items-center gap-sm min-w-48">
      <Icon name="book" size="sm" class="text-violet" />
      <div class="flex-1">
        <div class="text-ui-caption text-henbane mb-xs">Обучение</div>
        <ProgressBar value={progress} size="sm" />
      </div>
      <div class="text-ui-caption text-henbane">
        {currentStepIndex + 1}/{totalSteps}
      </div>
    </div>
  </div>
{/if}

<style>
  @reference "../../../../app.css";
  .onboarding-welcome {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    animation: fadeIn 0.3s ease-out;
    box-sizing: border-box;
  }

  .onboarding-welcome .content-card {
    min-width: 400px !important;
    max-width: 500px !important;
    width: 90vw !important;
    max-height: 90vh;
    overflow-y: auto;
    box-sizing: border-box;
    margin: 0 !important;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: var(--radius-lg);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }

  /* Мобильная адаптация */
  @media (max-width: 480px) {
    .onboarding-welcome .content-card {
      min-width: 320px !important;
      width: 95vw !important;
      margin: 0 !important;
    }
  }

  .onboarding-welcome .background-media {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: -1;
    background: linear-gradient(135deg, var(--color-violet) 0%, var(--color-sakura) 100%);
  }

  .onboarding-progress {
    animation: slideDown 0.3s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translate(-50%, -100%);
    }
    to {
      opacity: 1;
      transform: translate(-50%, 0);
    }
  }

  input:focus {
    outline: none;
  }
</style>