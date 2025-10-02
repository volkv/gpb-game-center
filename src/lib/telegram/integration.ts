import type { TelegramWebApp, TelegramWebAppUser } from '$lib/types/Telegram';

export function isTelegramEnvironment(): boolean {
  const isInTelegram = typeof window !== 'undefined' &&
                       window.Telegram?.WebApp !== undefined;

  return isInTelegram;
}

export function getTelegramWebApp(): TelegramWebApp | null {
  if (!isTelegramEnvironment()) {
    return null;
  }
  return window.Telegram!.WebApp;
}

export function getTelegramUser(): TelegramWebAppUser | null {
  const webApp = getTelegramWebApp();

  if (!webApp) {
    return null;
  }

  return webApp.initDataUnsafe?.user || null;
}

export function getTelegramUserName(): string {
  const user = getTelegramUser();

  if (!user) {
    return 'Клиент';
  }

  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`;
  } else if (user.first_name) {
    return user.first_name;
  } else if (user.username) {
    return user.username;
  }

  return 'Клиент';
}

export function initializeTelegramApp(): boolean {
  try {
    const webApp = getTelegramWebApp();
    if (!webApp) {
      return false;
    }

    webApp.ready();

    if (webApp.expand) {
      webApp.expand();
    }

    enableFullscreen();
    lockOrientation();

    return true;
  } catch (error) {
    return false;
  }
}

export function enableFullscreen(): void {
  const webApp = getTelegramWebApp();
  if (!webApp) {
    return;
  }

  try {
    if (webApp.postEvent) {
      webApp.postEvent('web_app_expand');
      webApp.postEvent('web_app_request_fullscreen');
    }

    if (webApp.expand) {
      webApp.expand();
    }
  } catch {
    // Игнорируем ошибки fullscreen - не все платформы поддерживают
  }
}

export function isTelegramUserAvailable(): boolean {
  return getTelegramUser() !== null;
}

export function triggerHapticFeedback(): void {
  if (!isTelegramEnvironment()) {
    return;
  }

  const webApp = getTelegramWebApp();
  if (webApp?.HapticFeedback?.impactOccurred) {
    try {
      webApp.HapticFeedback.impactOccurred('heavy');
    } catch {
      // Игнорируем ошибки вибрации - не критично для работы
    }
  }
}

export function lockOrientation(): void {
  const webApp = getTelegramWebApp();
  if (!webApp) {
    return;
  }

  try {
    if (webApp.lockOrientation) {
      webApp.lockOrientation();
    }
  } catch {
    // Игнорируем ошибки блокировки ориентации - не все устройства поддерживают
  }
}

export function unlockOrientation(): void {
  const webApp = getTelegramWebApp();
  if (!webApp) {
    return;
  }

  try {
    if (webApp.unlockOrientation) {
      webApp.unlockOrientation();
    }
  } catch {
    // Игнорируем ошибки разблокировки ориентации
  }
}

export function isOrientationLocked(): boolean {
  const webApp = getTelegramWebApp();
  if (!webApp) {
    return false;
  }

  return webApp.isOrientationLocked || false;
}

export function getTelegramUserInfo() {
  const user = getTelegramUser();
  const webApp = getTelegramWebApp();

  return {
    isInTelegram: isTelegramEnvironment(),
    user: user,
    userName: getTelegramUserName(),
    platform: webApp?.platform || null,
    version: webApp?.version || null,
    colorScheme: webApp?.colorScheme || null
  };
}