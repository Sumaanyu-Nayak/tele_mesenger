import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!botToken || !chatId) {
      throw new Error('Missing Telegram bot token or chat ID');
    }

    // Check if the request is multipart/form-data
    const contentType = req.headers.get('content-type') || '';
    let text = '';
    let file: File | null = null;
    let telegramUrl = '';
    let body: FormData | string = '';
    let headers: Record<string, string> = {};

    if (contentType.startsWith('multipart/form-data')) {
      const formData = await req.formData();
      text = formData.get('text') as string;
      file = formData.get('file') as File | null;
      if (file) {
        // Determine file type
        const mime = file.type;
        body = new FormData();
        (body as FormData).append('chat_id', chatId);
        if (text) (body as FormData).append('caption', text);
        if (mime.startsWith('image/')) {
          telegramUrl = `https://api.telegram.org/bot${botToken}/sendPhoto`;
          (body as FormData).append('photo', file);
        } else if (mime === 'image/gif' || mime === 'image/webp') {
          telegramUrl = `https://api.telegram.org/bot${botToken}/sendAnimation`;
          (body as FormData).append('animation', file);
        } else if (mime.startsWith('audio/')) {
          telegramUrl = `https://api.telegram.org/bot${botToken}/sendAudio`;
          (body as FormData).append('audio', file);
        } else {
          telegramUrl = `https://api.telegram.org/bot${botToken}/sendDocument`;
          (body as FormData).append('document', file);
        }
      } else {
        // No file, just text
        telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
        body = new FormData();
        (body as FormData).append('chat_id', chatId);
        (body as FormData).append('text', text);
      }
    } else {
      // Fallback: JSON body (text only)
      const json = await req.json();
      text = json.text;
      telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
      headers = { 'Content-Type': 'application/json' };
      body = JSON.stringify({ chat_id: chatId, text });
    }

    const res = await fetch(telegramUrl, {
      method: 'POST',
      body,
      headers,
    });
    const data = await res.json();

    // Store the sent message in MongoDB with fromWeb: true
    const client = await clientPromise;
    const db = client.db('telegram');
    await db.collection('messages').insertOne({
      message: { text },
      receivedAt: new Date(),
      fromWeb: true,
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ ok: false, error: (error as Error).message }, { status: 500 });
  }
} 