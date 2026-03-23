# meet.ai

A [Next.js](https://nextjs.org/) application for **video meetings** with **AI agents** powered by [Stream Video](https://getstream.io/video/), [OpenAI](https://openai.com/) (including Realtime for in-call agents), and background **meeting summaries** via [Inngest](https://www.inngest.com/). Authentication uses [Better Auth](https://www.better-auth.com/) with optional GitHub/Google sign-in and [Polar](https://polar.sh/) for checkout and customer portal (sandbox in this repo).

The dashboard UI is branded **Therapy.AI** in the sidebar; the repository name is `meet.ai`.

---

## What reviewers should know

| Area | Purpose |
|------|---------|
| **Dashboard** | Create **agents** (instructions + avatar), schedule **meetings**, manage a **free tier** (limits on agents/meetings) and **upgrade** flow. |
| **Calls** | Join meetings via Stream Video; an OpenAI Realtime **bot** can join when Stream fires `call.session_started` (see webhooks). |
| **After the call** | Transcripts and recordings trigger updates; **Inngest** runs summarization when a `meetings/processing` event is sent. |
| **API** | **tRPC** (`/api/trpc`) for typed server procedures; **Better Auth** at `/api/auth/*`. |

---

## Tech stack

- **Framework:** Next.js 15 (App Router), React 19, TypeScript  
- **API:** tRPC + TanStack Query  
- **Database:** PostgreSQL via [Drizzle ORM](https://orm.drizzle.team/) (connection string compatible with [Neon](https://neon.tech/) serverless driver)  
- **Auth:** Better Auth + `@polar-sh/better-auth` (checkout + customer portal)  
- **Video & chat:** Stream Video (`@stream-io/video-react-sdk`, `@stream-io/node-sdk`) and Stream Chat  
- **AI:** OpenAI (REST + Realtime for the in-call agent); Inngest Agent Kit for post-call summarization  
- **Background jobs:** Inngest (`/api/inngest`)  
- **UI:** Tailwind CSS 4, Radix / Base UI, etc.  

---

## Prerequisites

- **Node.js** 20+ (matches `@types/node` in the project)  
- **PostgreSQL** database URL (e.g. Neon)  
- Accounts and keys for **Stream** (Video + Chat), **OpenAI**, **Polar** (if using billing), and **OAuth apps** (if using GitHub/Google)  
- For **local webhook testing**, a public HTTPS URL ([ngrok](https://ngrok.com/) or [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/)) — see [docs/WEBHOOKS.md](docs/WEBHOOKS.md)  

---

## Getting started (from scratch)

### 1. Clone and install

```bash
git clone <your-fork-or-remote-url> meet.ai
cd meet.ai
npm install
```

### 2. Environment variables

Create a `.env` file in the project root (never commit real secrets). Use the following as a checklist; names match usage under `src/`.

| Variable | Required for | Notes |
|----------|----------------|-------|
| `DATABASE_URL` | App, Drizzle, scripts | PostgreSQL connection string |
| `NEXT_PUBLIC_APP_URL` | SSR tRPC | Full origin of the app (e.g. `http://localhost:3000`) so server-side tRPC calls resolve correctly |
| `OPENAI_API_KEY` | Webhook agent join, Inngest summarizer | Without it, the Realtime agent cannot join; webhook logs an error |
| `NEXT_PUBLIC_VIDEO_STREAM_API_KEY` | Video client + server SDK | Stream Video |
| `NEXT_PUBLIC_VIDEO_STREAM_SECRET_KEY` | `StreamClient` in `src/lib/stream-video.ts` | Used server-side for webhook verification (name is `NEXT_PUBLIC_*` in code) |
| `NEXT_PUBLIC_STREAM_CHAT_API_KEY` | Chat UI | Stream Chat (public key) |
| `STREAM_CHAT_SECRET_KEY` | Server Stream Chat client | Server-side secret |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | GitHub OAuth | Optional if you only use email/password |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth | Optional |
| `POLAR_ACCESS_TOKEN` | Polar plugin | `src/lib/polar.ts` uses Polar **sandbox** (`server: 'sandbox'`) |

**Better Auth:** Configure whatever your Better Auth + deployment setup expects (for example a strong secret and correct base URL for production). See the [Better Auth documentation](https://www.better-auth.com/docs) for your version.

**Inngest:** For local development, run the Inngest dev server (see below). In production, set the signing/event keys Inngest provides for your app.

### 3. Database schema

Push the Drizzle schema to your database (development-friendly):

```bash
npm run db:push
```

SQL migrations under `drizzle/` (e.g. enum changes) can be applied according to your workflow; there is also:

```bash
npm run db:fix-enum
```

for a meeting-status enum fix script when needed.

Optional: open Drizzle Studio:

```bash
npm run db:studio
```

### 4. Stream dashboard

1. Create a Stream app with **Video** (and **Chat** if you use chat).  
2. Set the **webhook URL** to a **public HTTPS** URL ending in `/api/webhook` (not `localhost` unless tunneled).  
3. Enable the events your implementation expects (e.g. `call.session_started` for the agent to join — see [docs/WEBHOOKS.md](docs/WEBHOOKS.md)).  
4. Ensure webhook signing secrets align with `verifyWebhook` usage in `src/app/api/webhook/route.ts`.

### 5. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 6. Inngest (local)

The summarization function is registered at `/api/inngest`. For local runs, start the Inngest dev server so events can be received and steps debugged:

```bash
npx inngest-cli@latest dev
```

Point it at your Next.js app URL if prompted (typically `http://localhost:3000`).

### 7. Optional: tunnel for Stream webhooks

Expose port 3000 with ngrok or Cloudflare Tunnel and paste `https://<your-tunnel>/api/webhook` into the Stream dashboard. Details, curl checks, and troubleshooting are in **[docs/WEBHOOKS.md](docs/WEBHOOKS.md)**.

The `dev:webhook` npm script is a convenience wrapper around ngrok; **update the URL** inside `package.json` to match your ngrok static domain or remove it and run `ngrok http 3000` manually.

---

## NPM scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Next.js development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint (Next.js config) |
| `npm run db:push` | Drizzle: push schema to DB |
| `npm run db:studio` | Drizzle Studio |
| `npm run db:fix-enum` | Script: meeting status enum fix |
| `npm run dev:webhook` | ngrok helper (customize URL in `package.json`) |

---

## Project layout (high level)

```
src/
  app/                 # App Router: pages, layouts, API routes
    (auth)/            # Sign-in / sign-up
    (dashboard)/       # Meetings, agents, upgrade
    call/[meetingId]/  # Call experience
    api/
      auth/            # Better Auth handler
      trpc/            # tRPC HTTP handler
      webhook/         # Stream Video webhooks
      inngest/         # Inngest serve endpoint
  db/                  # Drizzle client + schema
  modules/             # Feature modules (agents, meetings, premium, …)
  trpc/                # tRPC init + app router
  lib/                 # auth, polar, stream clients, etc.
  inngest/             # Inngest client + functions (e.g. meetings processing)
drizzle/               # SQL migrations (when used)
docs/
  WEBHOOKS.md          # Stream webhook setup and troubleshooting
```

---

## Main routes (for manual testing)

- `/` — Dashboard home (authenticated area)  
- `/meetings`, `/meetings/[meetingId]` — Meetings list and detail  
- `/agents`, `/agents/[agentId]` — Agents  
- `/upgrade` — Premium / Polar checkout context  
- `/call/[meetingId]` — Join call (Stream Video)  
- `/sign-in`, `/sign-up` — Auth  

API smoke checks:

- `GET /api/webhook` — Should return JSON confirming the Stream webhook endpoint (see [docs/WEBHOOKS.md](docs/WEBHOOKS.md)).  
- `GET /api/inngest` — Used by Inngest for sync (with dev server or cloud).  

---

## Data model (summary)

Defined in `src/db/schema.ts`:

- **Users**, **sessions**, **accounts**, **verification** (Better Auth)  
- **agents** — per-user AI agents with instructions  
- **meetings** — linked to an agent; status enum: `upcoming`, `active`, `completed`, `processing`, `cancelled`  

Free-tier limits are defined in `src/modules/premium/constants.ts` (`MAX_FREE_AGENTS`, `MAX_FREE_MEETINGS`).

---

## Deployment notes

- Set all production environment variables on your host (Vercel, Railway, etc.).  
- Use a **public** `NEXT_PUBLIC_APP_URL` matching the deployed origin.  
- Configure **Stream** webhooks to the production `/api/webhook` URL.  
- Register the **Inngest** app URL for `/api/inngest` and use production Inngest keys.  
- Switch Polar from sandbox to production in `src/lib/polar.ts` when you go live (`server: 'production'` or as per Polar SDK).  
- Update `src/lib/auth-client.ts` `baseURL` if it is still hardcoded to localhost (it should match your deployed site for OAuth and Polar client flows).  

---

## Further reading

- [Stream webhooks (local + production)](docs/WEBHOOKS.md)  
- [Next.js documentation](https://nextjs.org/docs)  

---

## License

No `LICENSE` file is present in this repository; assume all rights reserved unless the maintainer adds one.
