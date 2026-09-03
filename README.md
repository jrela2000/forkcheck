# ForkCheck

A web platform for discovering, reviewing, and sharing culinary experiences through **video critiques** and **community-driven insights**. Diners record short video reviews, an AI pipeline transcribes and summarizes them, and emoji-based ratings capture the full experience across five dimensions. Black-owned restaurants are highlighted with verified badges, and an owner dashboard surfaces sentiment trends and platform reach.

**Live app:** https://fork-check-feed.base44.app

---

## Features

### Discovery
- **Home feed** — card-based restaurant discovery with quick filters (All · Black-Owned · Top Rated · Near Me).
- **Search** — live text search plus an advanced filter drawer: cuisine, price range, minimum rating, Black-owned toggle, and sort order.
- **Restaurant profile** — hero imagery, contact details, reservation link (OpenTable / Resy / SevenRooms), five-category rating breakdown, and a scrollable feed of published video reviews with AI summaries and highlight quotes.

### Reviewing
- **Record review** — in-browser camera capture (or upload), preview, retake/continue flow.
- **AI processing** — backend function transcribes the video (Whisper) and generates a summary, sentiment score, and highlight quote (LLM), then simulates multi-platform distribution (Google / Yelp / Foursquare).
- **Rate your experience** — five emoji sliders (Food, Service, Value, Atmosphere, Wait Time) with a live overall score, then publish.
- **Black-owned verification** — restaurants flagged `is_black_owned` can earn a verified badge.

### Account
- **Profile** — avatar, reviewer badge, lifetime stats (reviews, helpful votes, platform reach), and a gallery of past reviews.
- **Owner dashboard** — restaurant switcher, review/sentiment/helpful counts, a sentiment-vs-overall trend chart, platform breakdown, and recent reviews with their AI summaries.

### Auth
Email/password and Google OAuth, powered by Base44 Auth.

---

## Data Model

Three entities (defined in `base44/entities/`):

| Entity | Purpose | Key fields |
| --- | --- | --- |
| **Restaurant** | A venue listed on the platform | `name`, `city`, `cuisine_type`, `price_range`, `is_black_owned`, `black_owned_verified`, `reservation_platform`, `reservation_url`, `hero_image_url`, `rating_average`, `review_count` |
| **Review** | A user's video critique of a restaurant | `restaurant_id`, `video_url`, `transcription_text`, `ai_generated_summary`, `sentiment_score`, `highlight_quote`, `food/service/value/atmosphere/wait_time_rating`, `overall_rating`, `status` (`processing` / `published` / `failed`), `platforms_published`, `helpful_votes` |
| **Reservation** | A booking tracked for review reminders | `restaurant_id`, `reservation_datetime`, `party_size`, `status`, `review_reminder_sent` |

Built-in fields on every record: `id`, `created_date`, `updated_date`, `created_by_id`.

---

## Architecture

### Backend function
- `base44/functions/processReview/entry.ts` — invoked after a review video is uploaded. It:
  1. Fetches the review record.
  2. Calls `Core.TranscribeAudio` on the video URL to get the transcript.
  3. Calls `Core.InvokeLLM` with a structured prompt to produce a JSON `{ summary, sentiment_score, highlight_quote }`.
  4. Persists those fields back on the review.

### Pages (`src/pages/`)
`Home` · `Search` · `RestaurantProfile` · `ReviewRecord` · `ReviewProcessing` · `ReviewRate` · `Profile` · `OwnerDashboard`

Auth pages (`Login`, `Register`, `ForgotPassword`, `ResetPassword`) ship from the Base44 scaffold.

### Components (`src/components/`)
`TopBar`, `AppNav`, `RestaurantCard`, `StarRating`, `BrandBadge`, `EmojiSlider` — small, focused, reused across pages.

### Styling
Tailwind CSS with a warm, food-forward token system (amber `--brand` accent on a light canvas, inverted for dark mode) defined in `src/index.css` and mapped in `tailwind.config.js`. Fonts: Plus Jakarta Sans (heading/display) + Inter (body).

### Integrations
- **Core.UploadFile** — client-side video upload to storage.
- **Core.TranscribeAudio** + **Core.InvokeLLM** — server-side (via `base44.asServiceRole`) in `processReview`.

---

## Tech Stack
React 18 · Vite · React Router · Tailwind CSS · shadcn/ui · lucide-react · recharts · @base44/sdk

---

## Run Locally

### Prerequisites
1. Clone the repository.
2. `npm install`
3. Install the Base44 CLI: `npm install -g base44@latest`
4. Install [Deno](https://docs.deno.com/runtime/getting_started/installation/) — the local Base44 backend runs on it.

### Three commands
```bash
base44 login   # one-time per machine
base44 link    # one-time per clone (writes the gitignored base44/.app.jsonc)
base44 dev     # local backend + frontend together
```
Open the frontend URL `base44 dev` prints (typically `http://localhost:5173`).

Notes:
- **`base44 dev` runs the frontend for you** — never run `npm run dev` yourself (alone it serves a UI with no backend; alongside `base44 dev` it silently grabs the next port).
- **The app must be published at least once** for the UI to load under `base44 dev` (the frontend fetches settings from the hosted app). The local API works regardless.
- Entity data is **in-memory only** under `base44 dev`, wiped on restart. Core integrations and OAuth are forwarded to your deployed app.

### Frontend only, hosted backend
```bash
base44 dev --remote
```
⚠️ Writes go to your app's **production data** in this mode — plain `base44 dev` keeps everything local.

---

## Publish Your Changes

This repo syncs to Base44 through git, so publish from the dashboard rather than `base44 deploy` (a CLI deploy bypasses the sync and diverges from the repo):

```bash
base44 dashboard open
```

---

## Docs & Support
- GitHub integration: https://docs.base44.com/developers/app-code/local-development/github
- Local development: https://docs.base44.com/developers/backend/overview/local-dev/local-development-overview
- Support: https://app.base44.com/support