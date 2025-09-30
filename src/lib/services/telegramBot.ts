const BOT_TOKEN = '8234177224:AAFDXWE56_T7D2Choi1KitfH-Zjc5nFj1eE';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

interface SendMessageParams {
  chat_id: number;
  text: string;
  parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2';
  disable_web_page_preview?: boolean;
}

interface TelegramApiResponse {
  ok: boolean;
  result?: any;
  description?: string;
  error_code?: number;
}

export async function sendTelegramMessage(
  userId: number,
  message: string,
  parseMode: 'HTML' | 'Markdown' | 'MarkdownV2' = 'HTML'
): Promise<{ success: boolean; error?: string }> {
  try {
    const params: SendMessageParams = {
      chat_id: userId,
      text: message,
      parse_mode: parseMode,
      disable_web_page_preview: true
    };

    const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });

    const data: TelegramApiResponse = await response.json();

    if (!data.ok) {
      return {
        success: false,
        error: data.description || 'Unknown error'
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}