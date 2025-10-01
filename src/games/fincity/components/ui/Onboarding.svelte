<script lang="ts" module>
  declare const getComputedStyle: (element: globalThis.Element) => globalThis.CSSStyleDeclaration;
</script>

<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { fade, scale } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
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
    isFirstTime = true;
    showWelcomeScreen = true;

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
    console.log('🎯 [ONBOARDING] Start Tutorial button clicked');
    showWelcomeScreen = false;
    console.log('📱 [ONBOARDING] Welcome screen hidden, calling tutorialManager.startTutorial()');
    tutorialManager.startTutorial();
  }

  function skipTutorial() {
    console.log('⏭️ [ONBOARDING] Skip Tutorial button clicked');
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
  <div
    class="onboarding-overlay"
    transition:fade={{ duration: 300 }}
    role="dialog"
    aria-modal="true"
    aria-labelledby="onboarding-title"
  >
    <div
      class="onboarding-modal"
      transition:scale={{ duration: 400, easing: quintOut, start: 0.9 }}
    >
      <div class="onboarding-header">
        <div class="header-icon">
          <Icon name="building" size="xl" />
        </div>
        <div>
          <h1 id="onboarding-title" class="header-title">Добро пожаловать в ФинСити!</h1>
          <p class="header-subtitle">Ваш финансовый город ждёт</p>
        </div>
      </div>

      <div class="onboarding-content">
        <div class="content-section">
          <h2 class="section-title">Создайте свой финансовый мегаполис</h2>
          <p class="section-text">
            ФинСити поможет вам изучить банковские продукты Газпромбанка через увлекательную игру.
            Стройте здания, выполняйте квесты и развивайте финансовую грамотность!
          </p>
        </div>

        <div class="input-group">
          <label for="cityName" class="input-label">
            Как назовём ваш город?
          </label>
          <input
            id="cityName"
            type="text"
            value={$playerData.cityName}
            oninput={handleCityNameChange}
            placeholder="Введите название города"
            class="city-input"
            maxlength="20"
          />
        </div>

        <div class="features-section">
          <h3 class="features-title">Что вас ждёт:</h3>
          <div class="features-grid">
            <div class="feature-card feature-card--building">
              <Icon name="building" size="md" />
              <div>
                <div class="feature-title">Строительство зданий</div>
                <div class="feature-text">Каждое здание - банковский продукт</div>
              </div>
            </div>
            <div class="feature-card feature-card--quest">
              <Icon name="quest" size="md" />
              <div>
                <div class="feature-title">Обучающие квесты</div>
                <div class="feature-text">Изучайте финансы играя</div>
              </div>
            </div>
            <div class="feature-card feature-card--reward">
              <Icon name="crystal" size="md" />
              <div>
                <div class="feature-title">Система наград</div>
                <div class="feature-text">Получайте достижения и бонусы</div>
              </div>
            </div>
          </div>
        </div>

        <div class="button-group">
          <Button variant="secondary" class="action-button" onclick={skipTutorial}>
            Пропустить обучение
          </Button>
          <Button variant="primary" class="action-button" onclick={startTutorial}>
            Начать обучение
          </Button>
        </div>
      </div>
    </div>
  </div>
{/if}

{#if $isTutorialActive && currentStep}
  <div class="tutorial-progress">
    <div class="progress-content">
      <Icon name="book" size="sm" />
      <div class="progress-info">
        <div class="progress-label">Обучение</div>
        <ProgressBar value={progress} size="sm" />
      </div>
      <div class="progress-counter">
        {currentStepIndex + 1}/{totalSteps}
      </div>
    </div>
  </div>
{/if}

<style>
  .onboarding-overlay {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: clamp(1rem, 3vw, 2rem);
    background: color-mix(in srgb, var(--color-neutral-900) 74%, transparent 26%);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    z-index: 9999;
    overflow-y: auto;
  }

  .onboarding-modal {
    position: relative;
    width: min(560px, 100%);
    max-height: calc(100vh - clamp(2rem, 6vh, 4rem));
    display: flex;
    flex-direction: column;
    border-radius: calc(var(--radius-xl) + 4px);
    border: 1px solid var(--color-border-muted);
    background: color-mix(in srgb, var(--color-surface-card) 96%, white 4%);
    box-shadow: var(--shadow-hard);
    overflow: hidden;
  }

  .onboarding-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: clamp(1.25rem, 2vw, 1.75rem);
    border-bottom: 1px solid var(--color-border-subtle);
    background: color-mix(in srgb, var(--color-neutral-50) 68%, white 32%);
  }

  .header-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3.5rem;
    height: 3.5rem;
    border-radius: var(--radius-lg);
    background: color-mix(in srgb, var(--color-accent-100) 65%, white 35%);
    color: var(--color-accent-600);
  }

  .header-title {
    font-family: var(--font-display);
    font-size: clamp(1.25rem, 2vw, 1.5rem);
    font-weight: 700;
    letter-spacing: -0.015em;
    color: var(--color-fg-primary);
    margin: 0 0 0.25rem 0;
  }

  .header-subtitle {
    font-size: 0.9rem;
    color: var(--color-fg-secondary);
    margin: 0;
  }

  .onboarding-content {
    flex: 1;
    overflow-y: auto;
    padding: clamp(1.25rem, 2vw, 1.75rem);
    display: flex;
    flex-direction: column;
    gap: clamp(1.25rem, 2vw, 1.75rem);
    background: color-mix(in srgb, var(--color-surface-card) 92%, white 8%);
  }

  .content-section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .section-title {
    font-family: var(--font-display);
    font-size: 1.15rem;
    font-weight: 700;
    letter-spacing: -0.01em;
    color: var(--color-fg-primary);
    margin: 0;
  }

  .section-text {
    font-size: 0.95rem;
    line-height: 1.6;
    color: var(--color-fg-secondary);
    margin: 0;
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .input-label {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--color-fg-primary);
  }

  .city-input {
    width: 100%;
    padding: 0.75rem 1rem;
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border-muted);
    background: var(--color-surface-card);
    color: var(--color-fg-primary);
    font-family: var(--font-sans);
    font-size: 0.95rem;
    transition: border-color 160ms ease, box-shadow 160ms ease;
  }

  .city-input::placeholder {
    color: var(--color-fg-muted);
  }

  .city-input:focus {
    outline: none;
    border-color: var(--color-accent-500);
    box-shadow: var(--shadow-focus);
  }

  .features-section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .features-title {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--color-fg-primary);
    margin: 0;
  }

  .features-grid {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .feature-card {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding: 1rem;
    border-radius: var(--radius-lg);
    border: 1px solid transparent;
    transition: transform 160ms ease, box-shadow 160ms ease;
  }

  .feature-card--building {
    background: color-mix(in srgb, var(--color-accent-100) 65%, white 35%);
    border-color: rgba(31, 196, 217, 0.28);
    color: var(--color-accent-600);
  }

  .feature-card--quest {
    background: color-mix(in srgb, rgba(43, 180, 138, 0.12) 40%, white 60%);
    border-color: rgba(43, 180, 138, 0.28);
    color: var(--color-accent-600);
  }

  .feature-card--reward {
    background: color-mix(in srgb, rgba(232, 137, 181, 0.12) 40%, white 60%);
    border-color: rgba(232, 137, 181, 0.28);
    color: rgba(209, 60, 106, 0.85);
  }

  .feature-title {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--color-fg-primary);
  }

  .feature-text {
    font-size: 0.8rem;
    color: var(--color-fg-secondary);
  }

  .button-group {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    padding-top: 0.5rem;
  }

  .button-group :global(.action-button) {
    flex: 1 1 auto;
    min-width: 140px;
  }

  .tutorial-progress {
    position: fixed;
    top: 4rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 40;
    padding: 0.75rem 1rem;
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border-subtle);
    background: color-mix(in srgb, var(--color-surface-card) 96%, white 4%);
    box-shadow: var(--shadow-medium);
    animation: slideDown 0.3s ease-out;
  }

  .progress-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-width: 200px;
  }

  .progress-content :global(svg) {
    color: var(--color-brand-600);
    flex-shrink: 0;
  }

  .progress-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .progress-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-fg-secondary);
  }

  .progress-counter {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-fg-secondary);
    white-space: nowrap;
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

  @media (max-width: 480px) {
    .onboarding-overlay {
      padding: 0.75rem;
    }

    .onboarding-modal {
      width: 100%;
    }

    .onboarding-header {
      padding: 1rem;
    }

    .header-icon {
      width: 3rem;
      height: 3rem;
    }

    .onboarding-content {
      padding: 1rem;
      gap: 1rem;
    }

    .button-group {
      flex-direction: column;
    }

    .button-group :global(.action-button) {
      width: 100%;
      min-width: 0;
    }
  }
</style>