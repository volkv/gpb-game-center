import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sendTelegramMessage } from '$lib/services/telegramBot';
import { getDemoNotificationMessage, type PlayerContext } from '$lib/utils/notificationMessages';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { userId, userName, context } = await request.json();

    if (!userId || typeof userId !== 'number') {
      return json(
        { success: false, error: 'Invalid userId' },
        { status: 400 }
      );
    }

    const finalUserName = userName && typeof userName === 'string' ? userName : 'Клиент';
    const playerContext: Partial<PlayerContext> | undefined = context;

    const message = getDemoNotificationMessage(finalUserName, playerContext);
    const result = await sendTelegramMessage(userId, message, 'HTML');

    if (!result.success) {
      return json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return json({ success: true });
  } catch (error) {
    return json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
};