<script lang="ts">
  import { Icon, Button, Card } from '.';
  import { modal, closeModal } from '../../stores/ui';
  import { settings, updateSettings, gameState } from '../../stores/gameState';
  import { forceSave, clearAllData, resetAllStores } from '../../lib/autoSave';
  import { showToast } from '../../stores/ui';

  interface Props {
    class?: string;
  }

  let { class: className = '' }: Props = $props();

  const isOpen = $derived($modal.type === 'settings' && $modal.isOpen);

  let tempSettings = $state({...$settings});

  $effect(() => {
    if (isOpen) {
      tempSettings = {...$settings};
    }
  });

  function applySettings() {
    updateSettings(tempSettings);
    showToast('success', 'Настройки сохранены', 'Изменения успешно применены');
    closeModal();
  }

  function resetSettings() {
    tempSettings = {
      soundEnabled: true,
      musicEnabled: true,
      notificationsEnabled: true,
      language: 'ru'
    };
  }

  function exportData() {
    try {
      const gameData = {
        gameState: $gameState,
        timestamp: Date.now(),
      };

      const dataStr = JSON.stringify(gameData, null, 2);
      const dataBlob = new globalThis.Blob([dataStr], { type: 'application/json' });
      const url = globalThis.URL.createObjectURL(dataBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `fincity-save-${new Date().toISOString().split('T')[0]}.json`;
      link.click();

      globalThis.URL.revokeObjectURL(url);
      showToast('success', 'Данные экспортированы', 'Файл сохранения загружен');
    } catch {
      showToast('error', 'Ошибка экспорта', 'Не удалось экспортировать данные');
    }
  }

  function confirmClearData() {
    if (globalThis.confirm('Вы уверены, что хотите сбросить все данные? Это действие нельзя отменить.')) {
      const storesReset = resetAllStores();
      const dataCleared = clearAllData();

      if (storesReset && dataCleared) {
        showToast('warning', 'Данные сброшены', 'Вся информация о игре удалена');
        closeModal();
        globalThis.location.reload();
      } else {
        showToast('error', 'Ошибка сброса', 'Не удалось полностью сбросить данные');
      }
    }
  }

  function saveGame() {
    const success = forceSave();
    if (success) {
      showToast('success', 'Игра сохранена', 'Прогресс успешно сохранен');
    } else {
      showToast('error', 'Ошибка сохранения', 'Не удалось сохранить игру');
    }
  }
</script>

{#if isOpen}
  <div
    class="settings-overlay {className}"
    onclick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
    onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); closeModal(); } }}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    <div class="settings-panel">
      <header class="settings-header">
        <div class="header-content">
          <div class="title-section">
            <Icon name="settings" color="var(--color-gpb-blue)" size="lg" />
            <h2 class="settings-title">Настройки</h2>
          </div>

          <Button variant="ghost" size="sm" onclick={closeModal} class="close-btn">
            <Icon name="close" />
          </Button>
        </div>
      </header>

      <div class="settings-content">
        <div class="settings-section">
          <Card size="none">
            {#snippet header()}
              <h3 class="section-title">
                <Icon name="heart" color="var(--color-gpb-blue)" />
                Общие настройки
              </h3>
            {/snippet}

            <div class="settings-grid">
              <div class="setting-item">
                <div class="setting-info">
                  <label for="sound-enabled" class="setting-label">Звуковые эффекты</label>
                  <p class="setting-description">Воспроизведение звуков в игре</p>
                </div>
                <div class="setting-control">
                  <input
                    id="sound-enabled"
                    type="checkbox"
                    bind:checked={tempSettings.soundEnabled}
                    class="setting-checkbox"
                  />
                </div>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <label for="music-enabled" class="setting-label">Фоновая музыка</label>
                  <p class="setting-description">Воспроизведение музыки во время игры</p>
                </div>
                <div class="setting-control">
                  <input
                    id="music-enabled"
                    type="checkbox"
                    bind:checked={tempSettings.musicEnabled}
                    class="setting-checkbox"
                  />
                </div>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <label for="notifications-enabled" class="setting-label">Push-уведомления</label>
                  <p class="setting-description">Уведомления о событиях в игре</p>
                </div>
                <div class="setting-control">
                  <input
                    id="notifications-enabled"
                    type="checkbox"
                    bind:checked={tempSettings.notificationsEnabled}
                    class="setting-checkbox"
                  />
                </div>
              </div>


              <div class="setting-item">
                <div class="setting-info">
                  <label for="language-select" class="setting-label">Язык интерфейса</label>
                  <p class="setting-description">Выберите предпочитаемый язык</p>
                </div>
                <div class="setting-control">
                  <select id="language-select" bind:value={tempSettings.language} class="setting-select">
                    <option value="ru">Русский</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div class="settings-section">
          <Card size="none">
            {#snippet header()}
              <h3 class="section-title">
                <Icon name="shield" color="var(--color-success-green)" />
                Управление данными
              </h3>
            {/snippet}

            <div class="data-actions">
              <div class="action-item">
                <div class="action-info">
                  <h4 class="action-title">Сохранить игру</h4>
                  <p class="action-description">Принудительно сохранить текущий прогресс</p>
                </div>
                <Button variant="primary" size="sm" onclick={saveGame}>
                  <Icon name="shield" />
                  Сохранить
                </Button>
              </div>

              <div class="action-item">
                <div class="action-info">
                  <h4 class="action-title">Экспорт данных</h4>
                  <p class="action-description">Скачать файл с сохранением игры</p>
                </div>
                <Button variant="secondary" size="sm" onclick={exportData}>
                  <Icon name="quest" />
                  Экспорт
                </Button>
              </div>

              <div class="action-item danger">
                <div class="action-info">
                  <h4 class="action-title">Сброс данных</h4>
                  <p class="action-description">Сбросить все данные игры и перезагрузить страницу</p>
                </div>
                <Button variant="danger" size="sm" onclick={confirmClearData}>
                  <Icon name="close" />
                  Сбросить
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div class="settings-section">
          <Card size="none">
            {#snippet header()}
              <h3 class="section-title">
                <Icon name="building" color="var(--color-crystal-purple)" />
                О приложении
              </h3>
            {/snippet}

            <div class="app-info">

              <div class="info-item">
                <span class="info-label">Последнее обновление:</span>
                <span class="info-value">{new Date($gameState.lastUpdate).toLocaleString('ru-RU')}</span>
              </div>

              <div class="info-item">
                <span class="info-label">Платформа:</span>
                <span class="info-value">WebView</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <footer class="settings-footer">
        <div class="footer-buttons">
          <Button variant="secondary" onclick={resetSettings}>
            Сбросить
          </Button>

          <Button variant="ghost" onclick={closeModal}>
            Отмена
          </Button>

          <Button variant="primary" onclick={applySettings}>
            Применить
          </Button>
        </div>
      </footer>
    </div>
  </div>
{/if}


<style>
  /* svelte-ignore css-unused-selector */
  @reference "../../app.css";
  .settings-overlay {
    @apply fixed top-0 left-0 right-0 bottom-0 z-50 flex items-center justify-center p-4;
    @apply bg-black bg-opacity-50 backdrop-blur-sm;
  }

  .settings-panel {
    @apply w-full max-w-modal-xl max-h-90vh flex flex-col;
    @apply bg-white rounded-[var(--radius-lg)];
    @apply border border-gray-200 shadow-2xl;
    @apply modal-slide-up;
  }

  .settings-header { @apply flex-shrink-0 border-b border-gray-200; }

  .header-content {
    @apply flex items-center justify-between p-md;
  }

  .title-section {
    @apply flex items-center gap-3;
  }

  .settings-title { @apply text-xl font-bold text-gray-900; }

  :global(.close-btn) { @apply p-2 rounded-full; }
  :global(.close-btn:hover) { @apply bg-gray-100; }

  .settings-content { @apply flex-1 overflow-y-auto p-md space-y-lg; }

  .settings-section {
    @apply space-y-4;
  }

  :global(.section-title) { @apply flex items-center gap-sm text-lg font-semibold text-gray-900; }

  .settings-grid {
    @apply space-y-4;
  }

  .setting-item { @apply flex items-center justify-between py-sm border-b border-gray-100 last:border-b-0; }

  .setting-info {
    @apply flex-1;
  }

  .setting-label { @apply block font-medium text-gray-900; }

  .setting-description { @apply text-sm text-gray-600 mt-1; }

  .setting-control {
    @apply flex-shrink-0;
  }

  .setting-checkbox {
    @apply w-5 h-5 text-gpb-blue bg-gray-100 border-gray-300 rounded;
    @apply focus:ring-gpb-blue focus:ring-2;
  }

  .setting-select {
    @apply px-3 py-2 text-sm border border-gray-300 rounded-[var(--radius)];
    @apply bg-white text-gray-900;
    @apply focus:ring-2 focus:ring-gpb-blue focus:border-gpb-blue;
  }

  .data-actions {
    @apply space-y-4;
  }

  :global(.action-item) { @apply flex items-center justify-between py-sm border-b border-gray-100 last:border-b-0; }

  .action-item.danger {
    @apply border-danger-red-20;
  }

  .action-info {
    @apply flex-1;
  }

  .action-title { @apply font-medium text-gray-900; }

  .action-description { @apply text-sm text-gray-600 mt-1; }

  .action-item.danger .action-title {
    @apply text-danger-red;
  }

  .app-info {
    @apply space-y-3;
  }

  .info-item {
    @apply flex justify-between items-center py-sm;
    @apply text-sm;
  }

  .info-label { @apply text-gray-600; }

  .info-value { @apply font-medium text-gray-900; }

  .settings-footer { @apply flex-shrink-0 border-t border-gray-200 p-md; }

  .footer-buttons {
    @apply flex justify-end;
    gap: var(--spacing-mobile);
  }

  @media (max-width: 400px) {
    .settings-panel {
      @apply max-h-screen;
    }

    .header-content {
      @apply p-sm;
    }

    .settings-content {
      @apply p-sm;
    }

    .settings-footer {
      @apply p-sm;
    }

    .footer-buttons {
      @apply flex-col;
      gap: var(--spacing-mobile);
    }

    .setting-item,
    .action-item {
      @apply flex-col items-start space-y-2;
    }

    .setting-control {
      @apply self-end;
    }
  }
</style>