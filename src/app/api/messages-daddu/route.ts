import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('telegram');
    const messages = await db.collection('daddu')
      .find()
      .sort({ receivedAt: -1 })
      .limit(50)
      .toArray();
    // Format ObjectId and receivedAt for the client
    const formatted = messages.map((msg) => ({
      _id: msg._id?.toString(),
      receivedAt: msg.receivedAt instanceof Date ? msg.receivedAt.toISOString() : msg.receivedAt,
      message: msg.message,
      media: msg.media,
      fromWeb: msg.fromWeb,
    }));
    return NextResponse.json({ ok: true, messages: formatted });
  } catch (error) {
    return NextResponse.json({ ok: false, error: (error as Error).message }, { status: 500 });
  }
} 