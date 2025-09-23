import type { TelegramWebApp, TelegramWebAppUser } from '$lib/types/Telegram';

export function isTelegramEnvironment(): boolean {
  return typeof window !== 'undefined' &&
         window.Telegram?.WebApp !== undefined;
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
  }

  if (user.first_name) {
    return user.first_name;
  }

  if (user.username) {
    return user.username;
  }

  return 'Клиент';
}

export function initializeTelegramApp(): boolean {
  const webApp = getTelegramWebApp();
  if (!webApp) {
    console.log('📱 [TELEGRAM] App not running in Telegram environment');
    return false;
  }

  console.log('📱 [TELEGRAM] Initializing Telegram WebApp');
  console.log('📱 [TELEGRAM] Platform:', webApp.platform);
  console.log('📱 [TELEGRAM] Version:', webApp.version);
  console.log('📱 [TELEGRAM] User:', webApp.initDataUnsafe?.user);

  webApp.ready();

  if (webApp.expand) {
    webApp.expand();
  }

  enableFullscreen();

  return true;
}

export function enableFullscreen(): void {
  const webApp = getTelegramWebApp();
  if (!webApp) {
    console.log('📱 [TELEGRAM] Cannot enable fullscreen: not in Telegram environment');
    return;
  }

  try {
    console.log('📱 [TELEGRAM] Enabling fullscreen mode');

    if (webApp.postEvent) {
      webApp.postEvent('web_app_expand');
      webApp.postEvent('web_app_request_fullscreen');
    }

    if (webApp.expand) {
      webApp.expand();
    }

    console.log('📱 [TELEGRAM] Fullscreen mode enabled');
  } catch (error) {
    console.warn('📱 [TELEGRAM] Failed to enable fullscreen:', error);
  }
}

export function isTelegramUserAvailable(): boolean {
  return getTelegramUser() !== null;
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