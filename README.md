# Xaryab Haschmi Video Directory

A YouTube Video Directory Progressive Web App (PWA) dedicated to the teachings of Xaryab Haschmi (Journey Towards Karbala & The Grey Lounge).

## Features

- **YouTube Video Directory**: Organized video content from Journey Towards Karbala & The Grey Lounge
- **Automatic Sync**: Vercel cron job for automatic YouTube channel sync
- **Admin Panel**: Password-protected admin for adding external videos
- **Mobile Deep-Linking**: Direct YouTube app integration with web fallback
- **Category Filtering**: Filter by Podcasts, Shorts, Geopolitics, Metaphysics, Adeem Hashmi
- **Real-time Search**: Multi-field search across titles, descriptions, and tags
- **Social Integration**: WhatsApp Channel, Group, and Linktree integration
- **Dark Mode**: "The Grey Lounge" theme with academic, calm aesthetic
- **Urdu Support**: Native support for Urdu text and special characters
- **PWA**: Offline support, installable on mobile devices

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with dark theme
- **Database**: Supabase (PostgreSQL)
- **PWA**: next-pwa with Workbox
- **YouTube API**: v3 integration for video metadata
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase project configured
- YouTube API key
- Environment variables set

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_ADMIN_EMAIL=your_admin_email
NEXT_PUBLIC_ADMIN_PASSWORD=your_admin_password
YOUTUBE_API_KEY=your_youtube_api_key
CRON_SECRET=your_cron_secret
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

## Database Schema

The database uses a single `videos` table:

```sql
CREATE TABLE public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  youtube_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  custom_title TEXT,
  description TEXT,
  thumbnail_url TEXT NOT NULL,
  published_at TIMESTAMPTZ NOT NULL,
  channel_title TEXT NOT NULL,
  categories TEXT[] DEFAULT ARRAY['podcasts'],
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_external BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

## Project Structure

```
src/
├── app/
│   ├── admin/           # Password-protected admin panel
│   ├── api/
│   │   └── cron/        # Automatic sync endpoint
│   │       └── sync/    # Vercel cron job
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Home video feed
│   └── globals.css      # Dark theme styles
├── lib/
│   ├── supabase.ts      # Supabase client
│   └── youtube.ts       # YouTube API helpers
└── components/
    └── ui/              # Reusable UI components
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `node scripts/generate-icons.js` - Generate PWA icons

## Admin Panel

Access the admin panel at `/admin` with credentials from environment variables:

- Add external YouTube videos
- Auto-fetch video metadata via YouTube API
- Set custom titles and descriptions
- Assign categories and tags
- Support for Urdu text and special characters

## Automatic Sync

Configure Vercel cron job for automatic YouTube channel sync:

```json
{
  "crons": [{
    "path": "/api/cron/sync",
    "schedule": "0,30 * * * *"
  }]
}
```

This runs twice per hour to fetch new videos from configured channels.

## Social Links

- **WhatsApp Channel**: https://whatsapp.com/channel/0029VbAwYQX4IBhIy9RScc1b
- **WhatsApp Group**: https://chat.whatsapp.com/KMvwE31A22GBHOKvQUQD0V
- **Linktree**: https://linktr.ee/JourneyTowardsKarbala

## PWA Features

- Offline support via service worker
- Installable on mobile devices
- Custom app icons (192x192 and 512x512)
- App shortcuts for quick access
- Mobile deep-linking to YouTube app

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Configure cron job in `vercel.json`
5. Deploy

### Environment Variables Required

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `NEXT_PUBLIC_ADMIN_EMAIL` - Admin panel email
- `NEXT_PUBLIC_ADMIN_PASSWORD` - Admin panel password
- `YOUTUBE_API_KEY` - YouTube Data API v3 key
- `CRON_SECRET` - Secret for cron job authentication

## Customization

### YouTube Channels
Update channel IDs in `src/app/api/cron/sync/route.ts`:
```typescript
const CHANNEL_IDS = {
  JTK: 'YOUR_JTK_CHANNEL_ID',
  TGL: 'YOUR_TGL_CHANNEL_ID',
};
```

### Color Theme
Edit `src/app/globals.css` to customize the dark theme:
- `--background`: Main background (#121212)
- `--card-surface`: Card background (#1E1E1E)
- `--border-color`: Border color (#2A2A2A)
- `--accent-purple`: Primary accent (#8B5CF6)

### Categories
Modify categories in `src/app/page.tsx`:
```typescript
const CATEGORIES = ['All', 'Podcasts', 'Shorts', 'Geopolitics', 'Metaphysics', 'Adeem Hashmi'];
```

## License

This project is dedicated to the spiritual teachings of Xaryab Haschmi.
