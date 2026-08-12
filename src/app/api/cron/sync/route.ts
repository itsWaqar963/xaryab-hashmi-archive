import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { fetchLatestVideosFromChannel } from '@/lib/youtube';

// YouTube Channel IDs for Journey Towards Karbala, The Grey Lounge, and Xaryab Haschmi Podcast
const CHANNEL_IDS = {
  JTK: 'UCoYZg0JUn7SuLQI7WBUsvjg', // Journey Towards Karbala
  TGL: 'UCDm4rZQ0sFUa5-os5ipg0Lw', // The Grey Lounge
  XHP: 'UCOBcqyI4sNm5gcJmGmvDcaA', // Xaryab Haschmi Podcast (@XaryabHaschmiOfficial)
};

// Categorization rules for new videos
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

  // Check each categorization rule
  for (const [categoryName, rule] of Object.entries(CATEGORIZATION_RULES)) {
    const matchesKeyword = rule.keywords.some(keyword => 
      textToSearch.includes(keyword.toLowerCase())
    );

    if (matchesKeyword) {
      rule.categories.forEach(cat => assignedCategories.add(cat));
      rule.tags.forEach(tag => assignedTags.add(tag));
    }
  }

  // If no categories assigned, use default
  if (assignedCategories.size === 0) {
    assignedCategories.add('podcasts');
    assignedTags.add('Podcasts');
  }

  return {
    categories: Array.from(assignedCategories),
    tags: Array.from(assignedTags)
  };
}

// Get YouTube API key from environment
function getYouTubeApiKey(): string {
  return process.env.YOUTUBE_API_KEY || process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || '';
}

export async function GET(request: Request) {
  try {
    // Authorization check
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    const isAdminCall = request.headers.get('x-admin-sync') === 'true';

    // Allow if request has correct bearer token OR comes from Admin UI header
    if (cronSecret && authHeader !== `Bearer ${cronSecret}` && !isAdminCall) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔄 Starting incremental sync (only fetching latest 15 videos per channel)...');

    // Fetch ONLY latest videos from all 3 channels (15 each = 45 total max)
    const allVideos = [];
    let videosProcessed = 0;
    let videosAdded = 0;
    let videosUpdated = 0;

    for (const [channelName, channelId] of Object.entries(CHANNEL_IDS)) {
      try {
        console.log(`📺 Fetching latest videos from ${channelName}...`);
        const videos = await fetchLatestVideosFromChannel(channelId, 500);
        
        for (const video of videos) {
          videosProcessed++;
          
          // Auto-categorize new videos
          const categorization = categorizeVideo(video.title, video.description);
          
          // Check if video already exists
          const { data: existingVideo } = await supabase
            .from('videos')
            .select('id')
            .eq('youtube_id', video.videoId)
            .single();

          if (existingVideo) {
            // Video exists, update it if needed
            const { error } = await supabase
              .from('videos')
              .update({
                title: video.title,
                description: video.description,
                thumbnail_url: video.thumbnailUrl,
                published_at: video.publishedAt,
                channel_title: video.channelTitle,
                categories: categorization.categories,
                tags: categorization.tags,
              })
              .eq('youtube_id', video.videoId);

            if (error) {
              console.error(`Error updating video ${video.videoId}:`, error);
            } else {
              videosUpdated++;
              console.log(`🔄 Updated existing video: ${video.title}`);
            }
          } else {
            // New video, insert it
            const { error } = await supabase
              .from('videos')
              .insert({
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

            if (error) {
              console.error(`Error inserting video ${video.videoId}:`, error);
            } else {
              videosAdded++;
              console.log(`✅ Added new video: ${video.title}`);
            }
          }
        }
        
        allVideos.push(...videos);
      } catch (error) {
        console.error(`Error fetching videos from ${channelName}:`, error);
      }
    }

    console.log(`✅ Incremental sync completed: ${videosAdded} new, ${videosUpdated} updated, ${videosProcessed} total processed`);

    return NextResponse.json({
      success: true,
      message: 'Incremental sync completed',
      videosProcessed,
      videosAdded,
      videosUpdated,
      newVideos: videosAdded,
    });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { error: 'Sync failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
