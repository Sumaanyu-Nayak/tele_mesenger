# Telegram Messenger Web App

A modern, full-stack Next.js app to send and receive messages (text, images, GIFs, audio) with a Telegram chat, featuring a chat UI, login-protected inbox, and MongoDB storage.

## Features

- **Send messages** (text, images, GIFs, audio) to a Telegram chat from the web UI
- **Receive messages** from Telegram (webhook-based)
- **Chat UI**: Modern, real-time chat interface
- **Media support**: Inline images, GIFs, and audio
- **Login-protected inbox** (GitHub OAuth via NextAuth.js)
- **MongoDB storage** for all messages
- **Vercel-ready**: Instant deploy

## Getting Started

1. **Clone the repo & install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file in the root with:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   TELEGRAM_CHAT_ID=your_telegram_chat_id
   NEXTAUTH_SECRET=your_random_secret
   GITHUB_ID=your_github_oauth_client_id
   GITHUB_SECRET=your_github_oauth_client_secret
   NEXTAUTH_URL=http://localhost:3000
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Telegram Webhook Setup

After deploying, set your Telegram webhook:
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -d "url=https://<your-vercel-app>.vercel.app/api/telegram-webhook"
```

## Deployment

- Deploy instantly on [Vercel](https://vercel.com/)
- Set the same environment variables in the Vercel dashboard

## Project Structure
- `src/app/page.tsx` — Main chat UI (send/receive)
- `src/app/inbox/page.tsx` — Login-protected inbox 
- `src/app/api/` — API routes for Telegram, auth, and messages
- `src/lib/mongodb.ts` — MongoDB connection

---

Built with [Next.js](https://nextjs.org/), [MongoDB](https://mongodb.com/), [Telegram Bot API](https://core.telegram.org/bots/api), and [Vercel](https://vercel.com/).
