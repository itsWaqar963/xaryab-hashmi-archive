# Xaryab Haschmi Video Directory - Agent Instructions

## Project Overview
YouTube Video Directory PWA for Xaryab Haschmi's teachings (Journey Towards Karbala & The Grey Lounge). Built with Next.js 15, Supabase, YouTube API v3, and Tailwind CSS with "The Grey Lounge" dark theme.

## Development Commands
- `npm run dev` - Start development server (http://localhost:3000)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `node scripts/generate-icons.js` - Generate PWA icons

## Database
- Supabase project: https://xbgtruldcucekigbcybc.supabase.co
- Single table: `videos` with YouTube video metadata
- RLS policies: Public read, full write access
- Arrays for categories and tags
- Migration files in Supabase dashboard

## Environment Variables
Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `NEXT_PUBLIC_ADMIN_EMAIL` - Admin panel email
- `NEXT_PUBLIC_ADMIN_PASSWORD` - Admin panel password
- `YOUTUBE_API_KEY` - YouTube Data API v3 key
- `CRON_SECRET` - Secret for cron job authentication

## Key Features
- YouTube video directory with automatic sync
- PWA with offline support (next-pwa)
- Admin panel for external video management
- Mobile deep-linking to YouTube app
- "The Grey Lounge" dark theme aesthetic
- Category filtering (Podcasts, Shorts, Geopolitics, Metaphysics, Adeem Hashmi)
- Real-time multi-field search
- Urdu text support
- Social integration (WhatsApp, Linktree)

## Code Conventions
- Use TypeScript strictly
- Client-side components for interactivity (marked with 'use client')
- Maintain dark theme aesthetic in CSS
- Use Supabase client from `@/lib/supabase`
- Use YouTube API helpers from `@/lib/youtube`
- Support Urdu text and special characters

## File Structure
- `src/app/` - Next.js App Router pages
- `src/app/admin/` - Password-protected admin panel
- `src/app/api/cron/sync/` - Automatic YouTube sync endpoint
- `src/lib/supabase.ts` - Supabase client
- `src/lib/youtube.ts` - YouTube API helpers
- `public/` - Static assets and PWA files
- `scripts/` - Build and utility scripts

## Design System - "The Grey Lounge" Theme
Colors:
- Background: `#121212` (dark)
- Card Surface: `#1E1E1E` (dark gray)
- Border: `#2A2A2A` (subtle)
- Text Primary: `#FFFFFF` (white)
- Text Secondary: `#A0A0A0` (gray)
- Accent: `#8B5CF6` (purple)

Typography:
- Font: Geist Sans (via next/font)
- Academic, calm, reflective feel
- Native Urdu text support

## YouTube API Integration
- `fetchLatestVideosFromChannel()` - Get videos from channel
- `fetchVideoDetailsById()` - Get video metadata
- `extractYouTubeId()` - Parse YouTube URLs
- Channel IDs configured in `src/app/api/cron/sync/route.ts`

## Admin Panel
- Access at `/admin`
- Credentials from environment variables
- Add external YouTube videos
- Auto-fetch video metadata
- Custom titles and descriptions
- Category and tag management
- Urdu text support

## Social Links
- WhatsApp Channel: https://whatsapp.com/channel/0029VbAwYQX4IBhIy9RScc1b
- WhatsApp Group: https://chat.whatsapp.com/KMvwE31A22GBHOKvQUQD0V
- Linktree: https://linktr.ee/JourneyTowardsKarbala

## Testing
Before deploying:
1. Run `npm run build` to check for errors
2. Test admin panel login
3. Verify YouTube API integration
4. Test video deep-linking on mobile
5. Check search functionality
6. Test category filtering
7. Verify Urdu text display

## Deployment
- Optimized for Vercel
- Configure cron job in `vercel.json` for auto-sync
- Update sitemap.ts with actual domain
- Ensure all environment variables are set in production
- PWA features work in production mode only
- Admin panel protected from search engines (robots.txt)

## Learned User Preferences
- Wants custom PWA install popup on visit; should not rely on hunting browser Install app controls
- Prefer in-app YouTube embed playback plus an Open in YouTube action so visitors stay on site longer
- Do not show hardcoded or flashing placeholder stats (e.g. video counts); render the real number once
- Live presence UI: green pulsing dot + online count; place it where THE XARYAB HASHMI ARCHIVE eyebrow was; show HH:MM:SS clock in front of the online label
- Deploy by committing and pushing to GitHub so Vercel auto-deploys

## Learned Workspace Facts
- Production site: https://xaryabhashmi.vercel.app
- GitHub remote: https://github.com/itsWaqar963/xaryab-hashmi-archive.git
- Site intent: master knowledge archive for Xaryab Hashmi teachings, not only a YouTube thumbnail directory
- Default deployment branch in use: `master`