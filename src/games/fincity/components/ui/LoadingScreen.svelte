<script lang="ts">
  import { Icon, ProgressBar } from '.';

  import type { LoadingStageInfo } from '../game/ResourceManager';

  interface Props {
    progress?: number;
    stage?: string;
    stageInfo?: LoadingStageInfo;
    class?: string;
  }

  let {
    progress = 0,
    stage = 'Загрузка...',
    stageInfo,
    class: className = ''
  }: Props = $props();

  const stages = [
    'Инициализация игры...',
    'Загрузка критических ресурсов...',
    'Загрузка основных ресурсов...',
    'Загрузка дополнительных ресурсов...',
    'Финализация...'
  ];

  let currentStageIndex = $state(0);
  let displayStage = $state(stage);
  let assetsLoaded = $state(0);
  let totalAssets = $state(0);
  let animatedProgress = $state(0);
  let memoryUsage = $state(0);

  $effect(() => {
    if (stageInfo) {
      displayStage = stageInfo.stage;
      assetsLoaded = stageInfo.assetsLoaded;
      totalAssets = stageInfo.totalAssets;
      progress = stageInfo.progress;
    } else if (progress > 0) {
      currentStageIndex = Math.min(Math.floor(progress / 20), stages.length - 1);
      displayStage = stages[currentStageIndex];
    }

    const targetProgress = Math.min(progress, 100);
    const interval = setInterval(() => {
      animatedProgress += (targetProgress - animatedProgress) * 0.1;
      if (Math.abs(targetProgress - animatedProgress) < 0.1) {
        animatedProgress = targetProgress;
        clearInterval(interval);
      }
    }, 16);

    return () => clearInterval(interval);
  });

  $effect(() => {
    const estimatedMemory = (assetsLoaded * 0.5) + (progress * 0.1);
    memoryUsage = Math.min(estimatedMemory, 50);
  });
</script>

<div class="loading-screen {className}">
  <div class="loading-content">
    <!-- Логотип и заголовок -->
    <div class="logo-section">
      <div class="logo-icon">
        <Icon name="building" size="3xl" color="var(--color-violet)" />
      </div>

      <h1 class="app-title">
        <span class="text-violet">Fin</span><span class="text-mint">City</span>
      </h1>

      <p class="app-subtitle">Построй свою финансовую империю</p>
    </div>

    <!-- Прогресс бар -->
    <div class="progress-section">
      <ProgressBar
        value={animatedProgress}
        color="violet"
        showLabel={true}
        showPercentage={true}
        label={displayStage}
        animated={true}
        glowing={true}
      />

      <!-- Детальная информация -->
      {#if totalAssets > 0}
        <div class="progress-details">
          <div class="assets-counter">
            <Icon name="building" size="xs" color="var(--color-violet)" />
            <span class="counter-text">{assetsLoaded} / {totalAssets} ресурсов</span>
          </div>
          <div class="memory-indicator">
            <Icon name="grid" size="xs" color="var(--color-mint)" />
            <span class="memory-text">~{memoryUsage.toFixed(1)} МБ</span>
          </div>
        </div>
      {/if}

      <!-- Индикаторы этапов -->
      <div class="stage-dots">
        {#each stages.map((_, i) => i) as index}
          <div class="stage-dot {index <= currentStageIndex ? 'completed' : ''} {index === currentStageIndex ? 'current' : ''}">
            {#if index <= currentStageIndex}
              <Icon name="checkmark" size="xs" />
            {:else}
              <div class="dot-inner"></div>
            {/if}
          </div>
        {/each}
      </div>
    </div>

    <!-- Информационная подсказка -->
    <div class="tip-section">
      <div class="tip-bubble">
        <Icon name="shield" size="sm" color="var(--color-violet)" />
        <span class="tip-text">Каждое здание представляет продукт Газпромбанка</span>
      </div>
    </div>
  </div>
</div>

<style>
  .loading-screen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    background: var(--gradient-mint-violet);
  }

  .loading-content {
    width: 100%;
    max-width: 440px;
    background: rgba(222, 225, 238, 0.95);
    backdrop-filter: blur(12px);
    border-radius: var(--radius-xl);
    border: 1px solid rgba(141, 152, 164, 0.2);
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  }

  .logo-section {
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .logo-icon {
    display: flex;
    justify-content: center;
    margin-bottom: 0.5rem;
  }

  .app-title {
    font-family: var(--font-heading);
    font-size: 2rem;
    line-height: 2.25rem;
    font-weight: 700;
    letter-spacing: -0.025em;
    margin: 0;
  }

  .text-violet {
    color: var(--color-violet);
  }

  .text-mint {
    color: var(--color-mint);
  }

  .app-subtitle {
    font-family: var(--font-body);
    font-size: 1.125rem;
    line-height: 1.625rem;
    color: var(--color-henbane);
    margin: 0;
  }

  .progress-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    width: 100%;
  }

  .progress-details {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background: rgba(25, 25, 239, 0.05);
    border: 1px solid rgba(25, 25, 239, 0.1);
    border-radius: var(--radius-md);
    backdrop-filter: blur(2px);
  }

  .assets-counter, .memory-indicator {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: var(--font-body);
    font-size: 0.75rem;
    font-weight: 500;
  }

  .counter-text, .memory-text {
    color: var(--color-henbane);
    white-space: nowrap;
  }

  .stage-dots {
    display: flex;
    justify-content: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .stage-dot {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    border: 2px solid var(--color-henbane);
    background: var(--color-lily);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    flex-shrink: 0;
  }

  .stage-dot.completed {
    border-color: var(--color-gpb-emerald);
    background: var(--color-gpb-emerald);
    color: white;
  }

  .stage-dot.current {
    border-color: var(--color-mint);
    background: var(--color-mint);
    color: white;
    transform: scale(1.1);
    box-shadow: 0 0 12px rgba(88, 255, 255, 0.5);
  }

  .dot-inner {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background: var(--color-henbane);
    opacity: 0.6;
  }

  .tip-section {
    width: 100%;
  }

  .tip-bubble {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 1.25rem;
    background: rgba(25, 25, 239, 0.1);
    border: 1px solid rgba(25, 25, 239, 0.2);
    border-radius: var(--radius-lg);
    backdrop-filter: blur(4px);
  }

  .tip-text {
    font-family: var(--font-body);
    font-size: 0.875rem;
    line-height: 1.25rem;
    color: #000;
    font-weight: 400;
  }

  /* Мобильная адаптация */
  @media (max-width: 400px) {
    .loading-content {
      max-width: 320px;
      padding: 1.5rem;
      gap: 1.5rem;
    }

    .app-title {
      font-size: 1.5rem;
      line-height: 1.75rem;
    }

    .app-subtitle {
      font-size: 1rem;
      line-height: 1.5rem;
    }

    .stage-dot {
      width: 1.5rem;
      height: 1.5rem;
    }

    .tip-bubble {
      padding: 0.75rem 1rem;
      gap: 0.5rem;
    }

    .tip-text {
      font-size: 0.75rem;
      line-height: 1rem;
    }
  }

  @media (max-width: 320px) {
    .loading-content {
      max-width: 280px;
      padding: 1rem;
      gap: 1rem;
    }

    .app-title {
      font-size: 1.25rem;
      line-height: 1.5rem;
    }

    .stage-dots {
      gap: 0.5rem;
    }
  }
</style>