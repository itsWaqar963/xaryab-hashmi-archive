import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { fetchLatestVideosFromChannel } from '@/lib/youtube';

const CHANNEL_IDS: Record<string, string> = {
  JTK: 'UCoYZg0JUn7SuLQI7WBUsvjg',
  TGL: 'UCDm4rZQ0sFUa5-os5ipg0Lw',
  XHP: 'UCOBcqyI4sNm5gcJmGmvDcaA',
};

function categorizeVideo(title: string, description: string | null): { categories: string[], tags: string[] } {
  const textToSearch = `${title.toLowerCase()} ${description?.toLowerCase() || ''}`;
  const assignedCategories = new Set<string>();
  const assignedTags = new Set<string>();

  const CATEGORIZATION_RULES = {
    'adeem hashmi': {
      categories: ['adeem hashmi'],
      keywords: ['adeem hashmi', 'kalam', 'poetry', 'shayari', 'verses', 'marsiya', 'nauha'],
      tags: ['Adeem Hashmi', 'Poetry', 'Kalam']
    },
    'shorts': {
      categories: ['shorts'],
      keywords: ['#shorts', '#short', 'short video', 'quick'],
      tags: ['Shorts', 'Quick']
    },
    'metaphysics': {
      categories: ['metaphysics'],
      keywords: ['philosophy', 'divine', 'ghaib', 'soul', 'ruh', 'barzakh', 'karbala', 'tawassul', 'imamat', 'marifat', 'spirituality', 'mysticism'],
      tags: ['Metaphysics', 'Spirituality', 'Philosophy']
    },
    'geopolitics': {
      categories: ['geopolitics'],
      keywords: ['system', 'world', 'gen z', 'society', 'order', 'state', 'politics', 'current affairs', 'democracy', 'governance', 'global'],
      tags: ['Geopolitics', 'Society', 'Current Affairs']
    }
  };

  for (const [_, rule] of Object.entries(CATEGORIZATION_RULES)) {
    if (rule.keywords.some(k => textToSearch.includes(k.toLowerCase()))) {
      rule.categories.forEach(c => assignedCategories.add(c));
      rule.tags.forEach(t => assignedTags.add(t));
    }
  }

  if (assignedCategories.size === 0) {
    assignedCategories.add('podcasts');
    assignedTags.add('Podcasts');
  }

  return {
    categories: Array.from(assignedCategories),
    tags: Array.from(assignedTags)
  };
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    const isAdminCall = request.headers.get('x-admin-sync') === 'true';

    if (cronSecret && authHeader !== `Bearer ${cronSecret}` && !isAdminCall) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const targetChannel = searchParams.get('channel') || 'ALL';
    const limit = parseInt(searchParams.get('limit') || '1000', 10);

    let channelsToProcess = Object.entries(CHANNEL_IDS);
    if (targetChannel !== 'ALL' && CHANNEL_IDS[targetChannel]) {
      channelsToProcess = [[targetChannel, CHANNEL_IDS[targetChannel]]];
    }

    let videosProcessed = 0;
    let videosAdded = 0;
    let videosUpdated = 0;

    for (const [channelName, channelId] of channelsToProcess) {
      console.log(`Starting smart sync for channel: ${channelName}`);
      const videos = await fetchLatestVideosFromChannel(channelId, limit);
      
      let consecutiveExistingCount = 0;
      const MATCH_THRESHOLD = 5; // Lagatar 5 pehle se synced videos milne par channel scan stop ho jaye ga

      for (const video of videos) {
        videosProcessed++;
        
        const { data: existingVideo } = await supabase
          .from('videos')
          .select('id')
          .eq('youtube_id', video.videoId)
          .single();

        if (existingVideo) {
          consecutiveExistingCount++;
          videosUpdated++;

          await supabase.from('videos').update({
            title: video.title,
            description: video.description,
            thumbnail_url: video.thumbnailUrl,
            published_at: video.publishedAt,
            channel_title: video.channelTitle,
          }).eq('youtube_id', video.videoId);

          // Smart Stop: Jab lagatar 5 videos DB mein pehle se maujood mil jayein
          if (consecutiveExistingCount >= MATCH_THRESHOLD) {
            console.log(`Smart Stop triggered for ${channelName}: ${MATCH_THRESHOLD} consecutive existing videos found.`);
            break;
          }
        } else {
          // Nayi video mili hai: Reset counter to 0
          consecutiveExistingCount = 0;
          videosAdded++;

          const categorization = categorizeVideo(video.title, video.description);

          await supabase.from('videos').insert({
            youtube_id: video.videoId,
            title: video.title,
            description: video.description,
            thumbnail_url: video.thumbnailUrl,
            published_at: video.publishedAt,
            channel_title: video.channelTitle,
            categories: categorization.categories,
            tags: categorization.tags,
            is_external: false,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      channel: targetChannel,
      videosProcessed,
      videosAdded,
      videosUpdated,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Sync failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
