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
          <Icon name="building" size="lg" />
        </div>
        <h1 id="onboarding-title" class="header-title">Добро пожаловать в ФинСити!</h1>
      </div>

      <div class="onboarding-content">
        <div class="content-section">
          <p class="section-text">
            Стройте здания, выполняйте квесты и изучайте банковские продукты Газпромбанка!
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
          <div class="features-grid">
            <div class="feature-card feature-card--building">
              <Icon name="building" size="sm" />
              <div class="feature-text">Строительство зданий</div>
            </div>
            <div class="feature-card feature-card--quest">
              <Icon name="quest" size="sm" />
              <div class="feature-text">Обучающие квесты</div>
            </div>
            <div class="feature-card feature-card--reward">
              <Icon name="crystal" size="sm" />
              <div class="feature-text">Система наград</div>
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
    width: min(480px, 100%);
    max-height: calc(100vh - 2rem);
    display: flex;
    flex-direction: column;
    border-radius: var(--radius-xl);
    border: 1px solid var(--color-border-muted);
    background: color-mix(in srgb, var(--color-surface-card) 96%, white 4%);
    box-shadow: var(--shadow-hard);
    overflow: hidden;
  }

  .onboarding-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    border-bottom: 1px solid var(--color-border-subtle);
    background: color-mix(in srgb, var(--color-neutral-50) 68%, white 32%);
  }

  .header-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: var(--radius-md);
    background: color-mix(in srgb, var(--color-accent-100) 65%, white 35%);
    color: var(--color-accent-600);
    flex-shrink: 0;
  }

  .header-title {
    font-family: var(--font-display);
    font-size: 1.15rem;
    font-weight: 700;
    letter-spacing: -0.015em;
    color: var(--color-fg-primary);
    margin: 0;
  }

  .onboarding-content {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    background: color-mix(in srgb, var(--color-surface-card) 92%, white 8%);
  }

  .content-section {
    display: flex;
    flex-direction: column;
  }

  .section-text {
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--color-fg-secondary);
    margin: 0;
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .input-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-fg-primary);
  }

  .city-input {
    width: 100%;
    padding: 0.625rem 0.875rem;
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border-muted);
    background: var(--color-surface-card);
    color: var(--color-fg-primary);
    font-family: var(--font-sans);
    font-size: 0.875rem;
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
  }

  .features-grid {
    display: flex;
    gap: 0.5rem;
  }

  .feature-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.375rem;
    padding: 0.625rem 0.5rem;
    border-radius: var(--radius-md);
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

  .feature-text {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--color-fg-primary);
    text-align: center;
    line-height: 1.3;
  }

  .button-group {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding-top: 0;
  }

  .button-group :global(.action-button) {
    flex: 1 1 auto;
    min-width: 140px;
  }

  .tutorial-progress {
    position: fixed;
    bottom: 5rem;
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
      padding: 0.5rem;
    }

    .onboarding-modal {
      width: 100%;
      max-height: calc(100vh - 1rem);
    }

    .onboarding-header {
      padding: 0.875rem;
      gap: 0.625rem;
    }

    .header-icon {
      width: 2.25rem;
      height: 2.25rem;
    }

    .header-title {
      font-size: 1rem;
    }

    .onboarding-content {
      padding: 0.875rem;
      gap: 0.875rem;
    }

    .features-grid {
      flex-direction: column;
      gap: 0.375rem;
    }

    .feature-card {
      flex-direction: row;
      justify-content: flex-start;
      gap: 0.5rem;
      padding: 0.5rem 0.625rem;
    }

    .feature-text {
      text-align: left;
    }

    .button-group {
      flex-direction: column;
      gap: 0.5rem;
    }

    .button-group :global(.action-button) {
      width: 100%;
      min-width: 0;
    }
  }
</style>