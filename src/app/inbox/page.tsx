import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import clientPromise from '@/lib/mongodb';
import styles from '../page.module.css';
import Link from 'next/link';
import { ObjectId, Document } from 'mongodb';
import { signOut } from 'next-auth/react';

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleString();
}

interface TelegramMessage {
  _id?: ObjectId;
  receivedAt: string;
  message?: {
    from?: { username?: string };
    text?: string;
  };
}

export default async function InboxPage() {
  const session = await getServerSession();
  if (!session) {
    redirect('/api/auth/signin');
  }
  const client = await clientPromise;
  const db = client.db('telegram');
  const rawMessages: Document[] = await db.collection('messages').find().sort({ receivedAt: -1 }).limit(50).toArray();
  const messages: TelegramMessage[] = rawMessages.map((msg) => ({
    _id: msg._id,
    receivedAt: typeof msg.receivedAt === 'string' ? msg.receivedAt : new Date(msg.receivedAt).toISOString(),
    message: msg.message,
  }));

  return (
    <div className={styles.centeredPage}>
      <div className={styles.card} style={{ maxWidth: 600 }}>
        <h1>Inbox</h1>
        <p className={styles.description}>Messages received by your Telegram bot.</p>
        <div className={styles.inboxList}>
          {messages.length === 0 && <div className={styles.emptyInbox}>No messages yet.</div>}
          {messages.map((msg) => (
            <div className={styles.inboxMsg} key={msg._id?.toString()}>
              <div className={styles.msgHeader}>
                <span className={styles.msgSender}>
                  {msg.message?.from?.username ? `@${msg.message.from.username}` : 'Unknown'}
                </span>
                <span className={styles.msgDate}>{formatDate(msg.receivedAt)}</span>
              </div>
              <div className={styles.msgText}>
                {msg.message?.text || <span className={styles.msgFaded}>(no text)</span>}
              </div>
            </div>
          ))}
        </div>
        <div className={styles.inboxActions}>
          <Link href="/" className={styles.inboxLink}>← Back to Home</Link>
          <button onClick={() => signOut()} className={styles.inboxLink} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>Logout</button>
        </div>
      </div>
    </div>
  );
} 