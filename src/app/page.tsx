"use client";
import { useState, useEffect, useRef, ChangeEvent, DragEvent } from 'react';
import styles from "./page.module.css";
import Link from "next/link";
import Image from "next/image";

const SUPPORTED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/mp3', 'audio/x-wav', 'audio/webm', 'audio/aac', 'audio/mp4', 'audio/x-m4a', 'audio/flac', 'audio/x-flac', 'audio/3gpp', 'audio/3gpp2', 'audio/amr', 'audio/aac', 'audio/midi', 'audio/x-midi', 'audio/x-aiff', 'audio/aiff', 'audio/x-mpegurl', 'audio/x-pn-realaudio', 'audio/x-ms-wma', 'audio/x-ms-wax', 'audio/vnd.rn-realaudio', 'audio/vnd.wave', 'audio/x-wav', 'audio/x-ms-wma', 'audio/x-ms-wax', 'audio/x-m4a', 'audio/mp4', 'audio/ogg', 'audio/webm', 'audio/flac', 'audio/x-flac', 'audio/opus', 'audio/3gpp', 'audio/3gpp2', 'audio/amr', 'audio/aac', 'audio/midi', 'audio/x-midi', 'audio/x-aiff', 'audio/aiff', 'audio/x-mpegurl', 'audio/x-pn-realaudio', 'audio/x-ms-wma', 'audio/x-ms-wax', 'audio/vnd.rn-realaudio', 'audio/vnd.wave', 'audio/x-wav', 'audio/x-ms-wma', 'audio/x-ms-wax', 'audio/x-m4a', 'audio/mp4', 'audio/ogg', 'audio/webm', 'audio/flac', 'audio/x-flac', 'audio/opus'
];

interface TelegramMessage {
  _id?: string;
  receivedAt: string;
  message?: {
    from?: { username?: string };
    text?: string;
  };
  media?: {
    type: string;
    url: string;
  };
}

export default function Home() {
  const [text, setText] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<TelegramMessage[]>([]);
  const [fetching, setFetching] = useState(false);
  const [polling, setPolling] = useState(false);
  const chatListRef = useRef<HTMLDivElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Store last sent message to differentiate sent/received
  const [lastSent, setLastSent] = useState<string | null>(null);

  async function fetchMessages() {
    setFetching(true);
    const res = await fetch("/api/messages");
    const data = await res.json();
    if (data.ok) setMessages(data.messages);
    setFetching(false);
  }

  useEffect(() => {
    fetchMessages();
    setPolling(true);
    const interval = setInterval(fetchMessages, 8000);
    return () => {
      clearInterval(interval);
      setPolling(false);
    };
  }, []);

  useEffect(() => {
    // Scroll to bottom on new messages
    if (chatListRef.current) {
      chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
    }
  }, [messages]);

  function validateFile(f: File) {
    if (!SUPPORTED_TYPES.includes(f.type)) {
      setFileError('Unsupported file type.');
      return false;
    }
    setFileError(null);
    return true;
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    if (f && !validateFile(f)) {
      setFile(null);
      setFilePreview(null);
      return;
    }
    setFile(f);
    if (f && f.type.startsWith('image/')) {
      setFilePreview(URL.createObjectURL(f));
    } else if (f && f.type.startsWith('audio/')) {
      setFilePreview('audio');
    } else {
      setFilePreview(null);
    }
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const f = e.dataTransfer.files[0];
      if (!validateFile(f)) {
        setFile(null);
        setFilePreview(null);
        return;
      }
      setFile(f);
      if (f.type.startsWith('image/')) {
        setFilePreview(URL.createObjectURL(f));
      } else if (f.type.startsWith('audio/')) {
        setFilePreview('audio');
      } else {
        setFilePreview(null);
      }
    }
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragActive(true);
  }
  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragActive(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus("");
    let res;
    if (file) {
      const formData = new FormData();
      formData.append('text', text);
      formData.append('file', file);
      res = await fetch('/api/send-message', {
        method: 'POST',
        body: formData,
      });
    } else {
      res = await fetch("/api/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
    }
    const data = await res.json();
    setLoading(false);
    if (data.ok) {
      setStatus("Message sent!");
      setLastSent(text);
      setText("");
      setFile(null);
      setFilePreview(null);
      setFileError(null);
      fetchMessages();
    } else {
      setStatus("Error: " + (data.error || "Unknown error"));
    }
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleString();
  }

  function getAvatar(username?: string) {
    if (!username) return "👤";
    return username[0].toUpperCase();
  }

  function renderMedia(media?: { type: string; url: string }) {
    if (!media) return null;
    if (media.type === 'photo' || media.type === 'image' || media.type === 'gif') {
      return (
        <Image src={media.url} alt={media.type} width={180} height={180} style={{ objectFit: 'contain', borderRadius: 8, marginTop: 8 }} />
      );
    }
    if (media.type === 'audio' || media.type === 'voice') {
      return (
        <audio controls style={{ marginTop: 8, width: 180 }}>
          <source src={media.url} />
          Your browser does not support the audio element.
        </audio>
      );
    }
    return <span style={{ color: '#888', fontSize: 12 }}>Unsupported media</span>;
  }

  function renderFilePreview() {
    if (!file || !filePreview) return null;
    if (filePreview === 'audio') {
      return <div style={{ margin: '8px 0' }}><b>Audio file selected</b></div>;
    }
    return <Image src={filePreview} alt="preview" width={120} height={120} style={{ objectFit: 'contain', borderRadius: 8, margin: '8px 0' }} />;
  }

  return (
    <div className={styles.centeredPage}>
      <div className={styles.card} style={{ maxWidth: 600 }}>
        <h1>Telegram Messenger</h1>
        <p className={styles.description}>Send a message and view the latest messages from your Telegram chat.</p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Type your message..."
            required={!file}
            rows={4}
            className={styles.textarea}
            disabled={loading}
          />
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={dragActive ? styles.dropActive : ''}
            style={{ border: '2px dashed #b3d1ff', borderRadius: 8, padding: 12, margin: '8px 0', background: dragActive ? '#e6f4ff' : '#fafcff', textAlign: 'center', transition: 'background 0.2s' }}
          >
            <input
              type="file"
              accept="image/*,audio/*,image/gif"
              onChange={handleFileChange}
              disabled={loading}
              style={{ margin: '8px 0' }}
            />
            <span>Drag & drop an image, GIF, or audio file here, or click to select.</span>
          </div>
          {fileError && <div style={{ color: 'red', fontSize: 13, marginBottom: 4 }}>{fileError}</div>}
          {renderFilePreview()}
          <button type="submit" className={styles.sendButton} disabled={loading || (!text.trim() && !file)}>
            {loading ? "Sending..." : file ? "Send File" : "Send"}
          </button>
        </form>
        {status && (
          <div className={status.startsWith("Error") ? styles.statusError : styles.statusSuccess}>
            {status}
          </div>
        )}
        <div className={styles.pollingIndicator}>
          {polling && "Polling for new messages..."}
        </div>
        <div className={styles.chatList} ref={chatListRef}>
          {fetching ? <div className={styles.emptyInbox}>Loading messages...</div> : null}
          {!fetching && messages.length === 0 && <div className={styles.emptyInbox}>No messages yet.</div>}
          {messages.map((msg) => {
            const isSent = lastSent && msg.message?.text === lastSent;
            return (
              <div className={styles.chatMsg} key={msg._id} style={{ justifyContent: isSent ? 'flex-end' : 'flex-start' }}>
                {!isSent && (
                  <div className={styles.avatar} title={msg.message?.from?.username || 'Unknown'}>
                    {getAvatar(msg.message?.from?.username)}
                  </div>
                )}
                <div className={`${styles.bubble} ${isSent ? styles.sent : styles.received}`}>
                  {msg.message?.text || <span className={styles.msgFaded}>(no text)</span>}
                  {renderMedia(msg.media)}
                  <div className={styles.msgMeta}>
                    {!isSent && (
                      <span className={styles.msgSender}>
                        {msg.message?.from?.username ? `@${msg.message.from.username}` : 'Unknown'}
                      </span>
                    )}
                    <span className={styles.msgDate} title={msg.receivedAt}>{formatDate(msg.receivedAt)}</span>
                  </div>
                </div>
                {isSent && (
                  <div className={styles.avatar} title="You">
                    🧑
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className={styles.inboxLinkWrap}>
          <Link href="/inbox" className={styles.inboxLink}>Go to Inbox →</Link>
        </div>
      </div>
    </div>
  );
}
