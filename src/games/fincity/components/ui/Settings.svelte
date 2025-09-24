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
    class="fincity-settings-overlay {className}"
    onclick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
    onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); closeModal(); } }}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    <div class="fincity-settings-panel">
      <header class="fincity-settings-header">
        <div class="fincity-header-content">
          <div class="fincity-title-section">
            <Icon name="settings" color="var(--color-gpb-blue)" size="lg" />
            <h2 class="fincity-settings-title">Настройки</h2>
          </div>

          <Button variant="ghost" size="sm" onclick={closeModal} class="close-btn">
            <Icon name="close" />
          </Button>
        </div>
      </header>

      <div class="fincity-settings-content">
        <div class="fincity-settings-section">
          <Card size="none">
            {#snippet header()}
              <h3 class="fincity-section-title">
                <Icon name="heart" color="var(--color-gpb-blue)" />
                Общие настройки
              </h3>
            {/snippet}

            <div class="fincity-settings-grid">
              <div class="fincity-setting-item">
                <div class="fincity-setting-info">
                  <label for="sound-enabled" class="fincity-setting-label">Звуковые эффекты</label>
                  <p class="fincity-setting-description">Воспроизведение звуков в игре</p>
                </div>
                <div class="fincity-setting-control">
                  <input
                    id="sound-enabled"
                    type="checkbox"
                    bind:checked={tempSettings.soundEnabled}
                    class="fincity-setting-checkbox"
                  />
                </div>
              </div>

              <div class="fincity-setting-item">
                <div class="fincity-setting-info">
                  <label for="music-enabled" class="fincity-setting-label">Фоновая музыка</label>
                  <p class="fincity-setting-description">Воспроизведение музыки во время игры</p>
                </div>
                <div class="fincity-setting-control">
                  <input
                    id="music-enabled"
                    type="checkbox"
                    bind:checked={tempSettings.musicEnabled}
                    class="fincity-setting-checkbox"
                  />
                </div>
              </div>

              <div class="fincity-setting-item">
                <div class="fincity-setting-info">
                  <label for="notifications-enabled" class="fincity-setting-label">Push-уведомления</label>
                  <p class="fincity-setting-description">Уведомления о событиях в игре</p>
                </div>
                <div class="fincity-setting-control">
                  <input
                    id="notifications-enabled"
                    type="checkbox"
                    bind:checked={tempSettings.notificationsEnabled}
                    class="fincity-setting-checkbox"
                  />
                </div>
              </div>


              <div class="fincity-setting-item">
                <div class="fincity-setting-info">
                  <label for="language-select" class="fincity-setting-label">Язык интерфейса</label>
                  <p class="fincity-setting-description">Выберите предпочитаемый язык</p>
                </div>
                <div class="fincity-setting-control">
                  <select id="language-select" bind:value={tempSettings.language} class="fincity-setting-select">
                    <option value="ru">Русский</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div class="fincity-settings-section">
          <Card size="none">
            {#snippet header()}
              <h3 class="fincity-section-title">
                <Icon name="shield" color="var(--color-success-green)" />
                Управление данными
              </h3>
            {/snippet}

            <div class="fincity-data-actions">
              <div class="fincity-action-item">
                <div class="fincity-action-info">
                  <h4 class="fincity-action-title">Сохранить игру</h4>
                  <p class="fincity-action-description">Принудительно сохранить текущий прогресс</p>
                </div>
                <Button variant="primary" size="sm" onclick={saveGame}>
                  <Icon name="shield" />
                  Сохранить
                </Button>
              </div>

              <div class="fincity-action-item">
                <div class="fincity-action-info">
                  <h4 class="fincity-action-title">Экспорт данных</h4>
                  <p class="fincity-action-description">Скачать файл с сохранением игры</p>
                </div>
                <Button variant="secondary" size="sm" onclick={exportData}>
                  <Icon name="quest" />
                  Экспорт
                </Button>
              </div>

              <div class="fincity-action-item danger">
                <div class="fincity-action-info">
                  <h4 class="fincity-action-title">Сброс данных</h4>
                  <p class="fincity-action-description">Сбросить все данные игры и перезагрузить страницу</p>
                </div>
                <Button variant="danger" size="sm" onclick={confirmClearData}>
                  <Icon name="close" />
                  Сбросить
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div class="fincity-settings-section">
          <Card size="none">
            {#snippet header()}
              <h3 class="fincity-section-title">
                <Icon name="building" color="var(--color-crystal-purple)" />
                О приложении
              </h3>
            {/snippet}

            <div class="fincity-app-info">

              <div class="fincity-info-item">
                <span class="fincity-info-label">Последнее обновление:</span>
                <span class="fincity-info-value">{new Date($gameState.lastUpdate).toLocaleString('ru-RU')}</span>
              </div>

              <div class="fincity-info-item">
                <span class="fincity-info-label">Платформа:</span>
                <span class="fincity-info-value">WebView</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <footer class="fincity-settings-footer">
        <div class="fincity-footer-buttons">
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

