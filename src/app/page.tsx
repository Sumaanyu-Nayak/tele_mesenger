"use client";
import { useState } from 'react';
import styles from "./page.module.css";
import Link from "next/link";

export default function Home() {
  const [text, setText] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus("");
    const res = await fetch("/api/send-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.ok) {
      setStatus("Message sent!");
      setText("");
    } else {
      setStatus("Error: " + (data.error || "Unknown error"));
    }
  }

  return (
    <div className={styles.centeredPage}>
      <div className={styles.card}>
        <h1>Send a Message to Telegram</h1>
        <p className={styles.description}>Type your message below and send it instantly to your Telegram chat.</p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Type your message..."
            required
            rows={4}
            className={styles.textarea}
            disabled={loading}
          />
          <button type="submit" className={styles.sendButton} disabled={loading || !text.trim()}>
            {loading ? "Sending..." : "Send"}
          </button>
        </form>
        {status && (
          <div className={status.startsWith("Error") ? styles.statusError : styles.statusSuccess}>
            {status}
          </div>
        )}
        <div className={styles.inboxLinkWrap}>
          <Link href="/inbox" className={styles.inboxLink}>Go to Inbox →</Link>
        </div>
      </div>
    </div>
  );
}
