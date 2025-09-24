<script lang="ts">
  import { Icon, Button } from '.';
  import { openModal } from '../../stores/ui';
  import { resources } from '../../stores/playerData';

  interface Props {
    class?: string;
  }

  let { class: className = '' }: Props = $props();

  function openBuildMenu() {
    openModal('build_menu');
  }

  function openQuestLog() {
    openModal('quest_log');
  }

  function openAchievements() {
    openModal('achievements');
  }

  const canBuild = $derived($resources.coins >= 100);
</script>

<div class="game-action-buttons {className}">
  <div class="buttons-container">
    <Button
      variant="primary"
      size="lg"
      onclick={openBuildMenu}
      disabled={!canBuild}
      class="action-button build-button btn-game-primary hover-lift active-press neon-glow"
    >
      <Icon name="hammer" class="button-icon text-white neon-glow" />
      <span class="button-text">Строить</span>
    </Button>

    <Button
      variant="secondary"
      size="lg"
      onclick={openQuestLog}
      class="action-button quest-button btn-game-secondary hover-lift active-press"
    >
      <Icon name="quest" class="button-icon neon-glow" />
      <span class="button-text">Квесты</span>
    </Button>

    <Button
      variant="secondary"
      size="lg"
      onclick={openAchievements}
      class="action-button achievements-button btn-game-secondary hover-lift active-press"
    >
      <Icon name="star" class="button-icon text-gpb-gold neon-glow" />
      <span class="button-text">Достижения</span>
    </Button>
  </div>

  {#if !canBuild}
    <div class="build-hint glass-effect">
      <Icon name="coin" size="sm" class="hint-icon text-gpb-gold neon-glow" />
      <span class="hint-text">Нужно минимум 100 монет для строительства</span>
    </div>
  {/if}

  <!-- Decorative elements -->
  <div class="decoration-orb bg-gpb-mint w-4 h-4 -top-1 -right-2"></div>
  <div class="decoration-orb bg-gpb-raspberry w-3 h-3 -bottom-1 -left-1"></div>
</div>

<style>


  .buttons-container {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(12px);
    border-radius: 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }

  :global(.action-button) {
    display: flex !important;
    align-items: center !important;
    gap: 0.5rem !important;
    min-height: 48px !important;
    font-weight: 600 !important;
    border-radius: 1rem !important;
    transition: all 0.3s ease-out !important;
    position: relative !important;
    overflow: hidden !important;
  }

  :global(.action-button::before) {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.1);
    opacity: 0;
    transition: opacity 0.3s ease-out;
  }

  :global(.action-button:hover::before) {
    opacity: 1;
  }

  :global(.build-button) {
    background: linear-gradient(135deg, #1919EF 0%, #58FFFF 100%) !important;
    color: white !important;
    border: none !important;
    box-shadow: 0 4px 15px rgba(25, 25, 239, 0.3) !important;
  }

  :global(.quest-button), :global(.achievements-button) {
    background: rgba(255, 255, 255, 0.1) !important;
    color: white !important;
    border: 2px solid rgba(25, 25, 239, 0.3) !important;
    backdrop-filter: blur(8px) !important;
  }

  :global(.quest-button:hover), :global(.achievements-button:hover) {
    background: linear-gradient(135deg, #1919EF 0%, #58FFFF 100%) !important;
    border-color: transparent !important;
    transform: translateY(-2px) !important;
  }

  :global(.button-icon) {
    flex-shrink: 0;
  }

  :global(.button-text) {
    font-size: 0.875rem;
    font-weight: 600;
    letter-spacing: 0.025em;
  }

  .build-hint {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: rgba(221, 65, 219, 0.1);
    border: 1px solid rgba(221, 65, 219, 0.3);
    border-radius: 0.75rem;
    color: white;
    font-size: 0.875rem;
    max-width: 300px;
    text-align: center;
    backdrop-filter: blur(8px);
    animation: pulse-border 2s ease-in-out infinite alternate;
  }

  .hint-icon {
    flex-shrink: 0;
  }

  .hint-text {
    font-weight: 500;
  }

  @keyframes pulse-border {
    0% {
      border-color: rgba(221, 65, 219, 0.3);
      box-shadow: 0 0 0 rgba(221, 65, 219, 0.4);
    }
    100% {
      border-color: rgba(221, 65, 219, 0.6);
      box-shadow: 0 0 20px rgba(221, 65, 219, 0.4);
    }
  }

  @media (max-width: 400px) {
    .buttons-container {
      gap: 0.5rem;
      padding: 0.75rem;
    }

    :global(.button-text) {
      font-size: 0.75rem;
    }

    .build-hint {
      max-width: calc(100vw - 2rem);
      font-size: 0.75rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    :global(.action-button), .build-hint {
      animation: none;
      transition: none;
    }
  }
</style>

