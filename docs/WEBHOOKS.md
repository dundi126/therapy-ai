# Stream Video Webhooks

The app receives Stream Video events at **`POST /api/webhook`**. For the agent to join calls and for meeting status to update, Stream must be able to reach this URL.

## Why "can't reach" or "not responding"?

Stream’s servers call **your** server. If your app runs only on your machine:

- **`http://localhost:3000`** is only reachable on your computer.
- Stream runs on the internet and cannot access your localhost.

So the webhook URL you configure in Stream **must be a public URL** that points to your running app.

## Local development: use a tunnel

Expose your local server with a tunnel so Stream can reach it.

### Option 1: ngrok (free tier)

1. Install [ngrok](https://ngrok.com/download).
2. Run your app: `npm run dev` (e.g. on port 3000).
3. In another terminal: `ngrok http 3000`.
4. Copy the **HTTPS** URL (e.g. `https://xxxx.ngrok-free.app` or `https://xxxx.ngrok-free.dev`).
5. In **Stream Dashboard** → your app → **Webhooks**:
   - Webhook URL: `https://YOUR_NGROK_URL/api/webhook`
   - Subscribe to the events you need; save.

**If you see ERR_SSL_PROTOCOL_ERROR or “invalid response” in the browser:**  
On the **free tier**, ngrok shows an interstitial “Visit Site” page. Some browsers (especially on mobile) then report SSL or “invalid response” when loading it. That affects **browser** visits only.

- **Stream webhooks:** Stream’s servers send requests with a non-browser User-Agent, so they usually **do not** see the interstitial and can reach your app. Set the webhook URL in the dashboard and leave it; no need to “test” in the browser.
- **Testing in browser:** Use the skip header so the request is not treated as a browser visit:
  ```bash
  curl -H "ngrok-skip-browser-warning: true" https://YOUR_NGROK_URL/api/webhook
  ```
  Or from DevTools Console (same origin):  
  `fetch('/api/webhook', { headers: { 'ngrok-skip-browser-warning': 'true' } }).then(r => r.json()).then(console.log)`
- **Easier local testing:** Use **Cloudflare Tunnel** (Option 2) instead; it usually does not show an interstitial and avoids this error.

### Option 2: Cloudflare Tunnel (recommended for local dev)

No interstitial page and no browser SSL errors. Good if ngrok gives you ERR_SSL_PROTOCOL_ERROR.

1. Install [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/).
2. Run: `cloudflared tunnel --url http://localhost:3000`.
3. Copy the **HTTPS** URL (e.g. `https://xyz.trycloudflare.com`).
4. In Stream Dashboard set Webhook URL: `https://xyz.trycloudflare.com/api/webhook`.
5. You can open that URL in a browser; you should see the JSON response without SSL errors.

### Option 3: Deploy

Deploy the app (e.g. Vercel, Railway) and use the production URL:

- Webhook URL: `https://your-app.com/api/webhook`

## Testing that the endpoint is reachable

1. **GET (browser or dashboard test)**  
   Open in a browser or use curl:
   - Local: `http://localhost:3000/api/webhook`
   - Public: `https://YOUR_TUNNEL_OR_DOMAIN/api/webhook`  
     You should see JSON: `{"ok":true,"message":"Stream webhook endpoint. Use POST for events.","path":"/api/webhook"}`.

2. **POST**  
   Real events are sent by Stream as `POST` with a signed body. The route checks `x-signature` and `x-api-key` and returns 400/401 if they’re missing or invalid.

## Stream Dashboard checklist

- Webhook URL is **HTTPS** and **public** (no localhost unless using a tunnel).
- Correct path: `/api/webhook` (no trailing slash unless your app expects it).
- Required events are enabled (e.g. `call.session_started` for the agent to join).
- Webhook secret / signing is configured in Stream and matches what the app uses (`verifyWebhook` in `src/app/api/webhook/route.ts`).

## Troubleshooting

| Issue                                                                                                                       | What to do                                                                                                                                                                                                                                     |
| --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ERR_SSL_PROTOCOL_ERROR** or **“sent an invalid response”** when opening the ngrok URL in a browser (especially on mobile) | Caused by ngrok free-tier interstitial. Stream webhooks often still work (they’re not from a browser). To test in browser, use `curl -H "ngrok-skip-browser-warning: true" https://YOUR_NGROK_URL/api/webhook` or switch to Cloudflare Tunnel. |
| **Webhook “not reachable” in Stream dashboard**                                                                             | Your URL must be public. Use a tunnel (ngrok or Cloudflare) or a deployed app URL. Never use `localhost` in the dashboard.                                                                                                                     |
| **GET works, POST returns 401**                                                                                             | Stream sends POST with `x-signature` and `x-api-key`. 401 means signature verification failed; check that the webhook secret in Stream matches your app’s Stream secret.                                                                       |

| **curl: (35) SSL routines::wrong version number** when using `curl https://...ngrok-free.dev/...` | ngrok's HTTPS is failing for that tunnel. Use **Cloudflare Tunnel** (Option 2) for a working HTTPS URL. |

## Env and keys

- **`OPENAI_API_KEY`** – **Required** for the bot to join. Used in `call.session_started` to connect the OpenAI Realtime agent. If missing, the webhook returns 500 and the agent will not join the call.
- **Stream API key and secret** – Used for signing/verification and for the Stream client. The agent must be upserted to Stream (done when you create the meeting) so the same `agentUserId` can join via `connectOpenAi`.
