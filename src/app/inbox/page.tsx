import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import clientPromise from '@/lib/mongodb';
import styles from '../page.module.css';
import Link from 'next/link';

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleString();
}

export default async function InboxPage() {
  const session = await getServerSession();
  if (!session) {
    redirect('/api/auth/signin');
  }
  const client = await clientPromise;
  const db = client.db('telegram');
  const messages = await db.collection('messages').find().sort({ receivedAt: -1 }).limit(50).toArray();

  return (
    <div className={styles.centeredPage}>
      <div className={styles.card} style={{ maxWidth: 600 }}>
        <h1>Inbox</h1>
        <p className={styles.description}>Messages received by your Telegram bot.</p>
        <div className={styles.inboxList}>
          {messages.length === 0 && <div className={styles.emptyInbox}>No messages yet.</div>}
          {messages.map((msg: any) => (
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
          <a href="/api/auth/signout" className={styles.inboxLink}>Logout</a>
        </div>
      </div>
    </div>
  );
} 