import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!botToken || !chatId) {
      throw new Error('Missing Telegram bot token or chat ID');
    }

    // Check if the request is multipart/form-data
    const contentType = req.headers.get('content-type') || '';
    if (contentType.startsWith('multipart/form-data')) {
      const formData = await req.formData();
      const text = formData.get('text') as string;
      const file = formData.get('file') as File | null;
      let telegramUrl = '';
      let body: FormData;
      if (file) {
        // Determine file type
        const mime = file.type;
        body = new FormData();
        body.append('chat_id', chatId);
        if (text) body.append('caption', text);
        if (mime.startsWith('image/')) {
          telegramUrl = `https://api.telegram.org/bot${botToken}/sendPhoto`;
          body.append('photo', file);
        } else if (mime === 'image/gif' || mime === 'image/webp') {
          telegramUrl = `https://api.telegram.org/bot${botToken}/sendAnimation`;
          body.append('animation', file);
        } else if (mime.startsWith('audio/')) {
          telegramUrl = `https://api.telegram.org/bot${botToken}/sendAudio`;
          body.append('audio', file);
        } else {
          telegramUrl = `https://api.telegram.org/bot${botToken}/sendDocument`;
          body.append('document', file);
        }
      } else {
        // No file, just text
        telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
        body = new FormData();
        body.append('chat_id', chatId);
        body.append('text', text);
      }
      const res = await fetch(telegramUrl, {
        method: 'POST',
        body,
      });
      const data = await res.json();
      return NextResponse.json(data);
    } else {
      // Fallback: JSON body (text only)
      const { text } = await req.json();
      const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const res = await fetch(telegramUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text }),
      });
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    return NextResponse.json({ ok: false, error: (error as Error).message }, { status: 500 });
  }
} 