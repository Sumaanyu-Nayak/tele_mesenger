import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

async function getTelegramFileUrl(fileId: string): Promise<string | null> {
  if (!TELEGRAM_BOT_TOKEN) return null;
  const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile?file_id=${fileId}`);
  const data = await res.json();
  if (data.ok && data.result && data.result.file_path) {
    return `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${data.result.file_path}`;
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const client = await clientPromise;
    const db = client.db('telegram');
    const messages = db.collection('messages');

    let media: { type: string; url: string } | undefined;
    const msg = body.message;
    if (msg) {
      if (msg.photo && Array.isArray(msg.photo) && msg.photo.length > 0) {
        // Get the largest photo
        const fileId = msg.photo[msg.photo.length - 1].file_id;
        const url = await getTelegramFileUrl(fileId);
        if (url) media = { type: 'photo', url };
      } else if (msg.document && msg.document.mime_type?.startsWith('image/')) {
        // GIF or image as document
        const url = await getTelegramFileUrl(msg.document.file_id);
        if (url) media = { type: 'image', url };
      } else if (msg.animation) {
        // GIF
        const url = await getTelegramFileUrl(msg.animation.file_id);
        if (url) media = { type: 'gif', url };
      } else if (msg.audio) {
        const url = await getTelegramFileUrl(msg.audio.file_id);
        if (url) media = { type: 'audio', url };
      } else if (msg.voice) {
        const url = await getTelegramFileUrl(msg.voice.file_id);
        if (url) media = { type: 'voice', url };
      }
    }

    // Store the incoming message, with media if present
    await messages.insertOne({ ...body, receivedAt: new Date(), media });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: (error as Error).message }, { status: 500 });
  }
} 