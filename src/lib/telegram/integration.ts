import type { TelegramWebApp, TelegramWebAppUser } from '$lib/types/Telegram';

export function isTelegramEnvironment(): boolean {
  const isInTelegram = typeof window !== 'undefined' &&
                       window.Telegram?.WebApp !== undefined;
  console.log('📱 [DEBUG] isTelegramEnvironment:', {
    hasWindow: typeof window !== 'undefined',
    hasTelegram: typeof window !== 'undefined' && !!window.Telegram,
    hasWebApp: typeof window !== 'undefined' && !!window.Telegram?.WebApp,
    isInTelegram
  });
  return isInTelegram;
}

export function getTelegramWebApp(): TelegramWebApp | null {
  if (!isTelegramEnvironment()) {
    return null;
  }
  return window.Telegram!.WebApp;
}

export function getTelegramUser(): TelegramWebAppUser | null {
  console.log('📱 [DEBUG] getTelegramUser: starting');
  const webApp = getTelegramWebApp();

  if (!webApp) {
    console.log('📱 [DEBUG] getTelegramUser: webApp is null');
    return null;
  }

  console.log('📱 [DEBUG] getTelegramUser: webApp exists', {
    platform: webApp.platform,
    version: webApp.version,
    hasInitDataUnsafe: !!webApp.initDataUnsafe,
    initDataUnsafeKeys: webApp.initDataUnsafe ? Object.keys(webApp.initDataUnsafe) : []
  });

  const user = webApp.initDataUnsafe?.user || null;
  console.log('📱 [DEBUG] getTelegramUser: user data', {
    hasUser: !!user,
    userId: user?.id,
    firstName: user?.first_name,
    lastName: user?.last_name,
    username: user?.username
  });

  return user;
}

export function getTelegramUserName(): string {
  console.log('📱 [DEBUG] getTelegramUserName: starting');
  const user = getTelegramUser();

  if (!user) {
    console.log('📱 [DEBUG] getTelegramUserName: no user data, returning default');
    return 'Клиент';
  }

  console.log('📱 [DEBUG] getTelegramUserName: processing user name', {
    firstName: user.first_name,
    lastName: user.last_name,
    username: user.username
  });

  let finalName = 'Клиент';

  if (user.first_name && user.last_name) {
    finalName = `${user.first_name} ${user.last_name}`;
    console.log('📱 [DEBUG] getTelegramUserName: using first + last name:', finalName);
  } else if (user.first_name) {
    finalName = user.first_name;
    console.log('📱 [DEBUG] getTelegramUserName: using first name:', finalName);
  } else if (user.username) {
    finalName = user.username;
    console.log('📱 [DEBUG] getTelegramUserName: using username:', finalName);
  } else {
    console.log('📱 [DEBUG] getTelegramUserName: no name fields available, using default');
  }

  return finalName;
}

export function initializeTelegramApp(): boolean {
  try {
    const webApp = getTelegramWebApp();
    if (!webApp) {
      console.warn('📱 [TELEGRAM] App not running in Telegram environment');
      console.warn('📱 [TELEGRAM] This means user data will not be available from Telegram');
      return false;
    }

    console.log('📱 [TELEGRAM] Initializing Telegram WebApp');
    console.log('📱 [TELEGRAM] Platform:', webApp.platform);
    console.log('📱 [TELEGRAM] Version:', webApp.version);

    if (!webApp.initDataUnsafe) {
      console.warn('📱 [TELEGRAM] initDataUnsafe is not available - user data may not be accessible');
    } else if (!webApp.initDataUnsafe.user) {
      console.warn('📱 [TELEGRAM] User data is not available in initDataUnsafe');
      console.warn('📱 [TELEGRAM] This may be due to Telegram privacy settings or bot configuration');
    } else {
      console.log('📱 [TELEGRAM] User data available:', {
        id: webApp.initDataUnsafe.user.id,
        firstName: webApp.initDataUnsafe.user.first_name,
        username: webApp.initDataUnsafe.user.username
      });
    }

    webApp.ready();

    if (webApp.expand) {
      webApp.expand();
    }

    enableFullscreen();
    lockOrientation();

    return true;
  } catch (error) {
    console.error('📱 [TELEGRAM] Failed to initialize Telegram WebApp:', error);
    return false;
  }
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

export function triggerHapticFeedback(): void {
  if (!isTelegramEnvironment()) {
    return;
  }

  const webApp = getTelegramWebApp();
  if (webApp?.HapticFeedback?.impactOccurred) {
    try {
      webApp.HapticFeedback.impactOccurred('heavy');
    } catch (error) {
      console.warn('📱 [TELEGRAM] Failed to trigger haptic feedback:', error);
    }
  }
}

export function lockOrientation(): void {
  const webApp = getTelegramWebApp();
  if (!webApp) {
    console.log('📱 [TELEGRAM] Cannot lock orientation: not in Telegram environment');
    return;
  }

  try {
    console.log('📱 [TELEGRAM] Locking screen orientation');

    if (webApp.lockOrientation) {
      webApp.lockOrientation();
      console.log('📱 [TELEGRAM] Screen orientation locked successfully');
    } else {
      console.warn('📱 [TELEGRAM] lockOrientation method not available - may require Bot API 8.0+');
    }
  } catch (error) {
    console.warn('📱 [TELEGRAM] Failed to lock orientation:', error);
  }
}

export function unlockOrientation(): void {
  const webApp = getTelegramWebApp();
  if (!webApp) {
    console.log('📱 [TELEGRAM] Cannot unlock orientation: not in Telegram environment');
    return;
  }

  try {
    console.log('📱 [TELEGRAM] Unlocking screen orientation');

    if (webApp.unlockOrientation) {
      webApp.unlockOrientation();
      console.log('📱 [TELEGRAM] Screen orientation unlocked successfully');
    } else {
      console.warn('📱 [TELEGRAM] unlockOrientation method not available - may require Bot API 8.0+');
    }
  } catch (error) {
    console.warn('📱 [TELEGRAM] Failed to unlock orientation:', error);
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