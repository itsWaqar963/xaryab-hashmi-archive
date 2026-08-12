// Complete YouTube sync script for Journey Towards Karbala & The Grey Lounge
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Import YouTube functions (we'll need to reimplement the pagination function here)
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!YOUTUBE_API_KEY) {
  console.error('ERROR: YOUTUBE_API_KEY is not set in environment variables');
  process.exit(1);
}

// Initialize Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Convert channel ID to uploads playlist ID (UC -> UU)
function channelIdToUploadsPlaylistId(channelId) {
  return channelId.replace('UC', 'UU');
}

// Fetch ALL videos from a channel using uploads playlist with pagination
async function fetchAllVideosFromChannel(channelId, channelName) {
  const uploadsPlaylistId = channelIdToUploadsPlaylistId(channelId);
  const allVideos = [];
  let nextPageToken = undefined;
  let pageCount = 0;

  console.log(`📡 Fetching ALL videos from ${channelName} using uploads playlist: ${uploadsPlaylistId}`);

  while (true) {
    pageCount++;
    const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?key=${YOUTUBE_API_KEY}&playlistId=${uploadsPlaylistId}&part=snippet&maxResults=50${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;

    try {
      const response = await fetch(playlistUrl);
      const data = await response.json();

      if (data.error) {
        console.error(`❌ YouTube API error: ${data.error.message}`);
        break;
      }

      if (!data.items || data.items.length === 0) {
        console.log(`✅ No more videos found for ${channelName} after ${pageCount} pages`);
        break;
      }

      const videos = data.items
        .map((item) => ({
          youtube_id: item.snippet.resourceId.videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnail_url: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
          published_at: item.snippet.publishedAt,
          channel_title: item.snippet.channelTitle || channelName,
          categories: ['podcasts'],
          tags: [],
          is_external: false,
        }));

      allVideos.push(...videos);
      console.log(`📄 Page ${pageCount}: Fetched ${videos.length} videos (Total: ${allVideos.length})`);

      // Check if there's a next page
      nextPageToken = data.nextPageToken;
      if (!nextPageToken) {
        console.log(`🏁 Reached end of playlist for ${channelName}`);
        break;
      }

      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error(`❌ Error fetching page ${pageCount} for ${channelName}:`, error);
      break;
    }
  }

  console.log(`✅ Completed fetching ${allVideos.length} total videos from ${channelName}`);
  return allVideos;
}

// Delete all existing videos
async function deleteAllVideos() {
  try {
    const { error } = await supabase.from('videos').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (error) {
      console.error('Error deleting existing videos:', error);
      return false;
    }
    
    console.log('🗑️ Deleted all existing videos from database');
    return true;
  } catch (error) {
    console.error('Error deleting existing videos:', error);
    return false;
  }
}

// Upsert videos to Supabase in batches
async function upsertVideos(videos) {
  const batchSize = 50;
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < videos.length; i += batchSize) {
    const batch = videos.slice(i, i + batchSize);
    
    for (const video of batch) {
      try {
        const { error } = await supabase
          .from('videos')
          .upsert(video, {
            onConflict: 'youtube_id',
            ignoreDuplicates: false,
          });

        if (error) {
          console.error(`❌ Error upserting video ${video.youtube_id}:`, error.message);
          errorCount++;
        } else {
          successCount++;
          if (successCount % 50 === 0) {
            console.log(`✅ Progress: ${successCount}/${videos.length} videos upserted`);
          }
        }
      } catch (error) {
        console.error(`❌ Error upserting video ${video.youtube_id}:`, error);
        errorCount++;
      }
    }
  }

  console.log(`📊 Upsert complete: ${successCount} successful, ${errorCount} errors`);
  return { successCount, errorCount };
}

// Main sync function
async function main() {
  console.log('🚀 Starting COMPLETE YouTube sync for Journey Towards Karbala & The Grey Lounge...\n');

  // Real channel IDs
  const CHANNEL_IDS = {
    JTK: 'UCoYZg0JUn7SuLQI7WBUsvjg', // Journey Towards Karbala
    TGL: 'UCDm4rZQ0sFUa5-os5ipg0Lw', // The Grey Lounge
  };

  // Delete existing videos first
  console.log('🗑️ Clearing existing database...');
  await deleteAllVideos();

  // Fetch videos from both channels
  const allVideos = [];

  console.log('\n📺 Fetching from Journey Towards Karbala...');
  const jtkVideos = await fetchAllVideosFromChannel(CHANNEL_IDS.JTK, 'Journey Towards Karbala');
  allVideos.push(...jtkVideos);

  console.log('\n📺 Fetching from The Grey Lounge...');
  const tglVideos = await fetchAllVideosFromChannel(CHANNEL_IDS.TGL, 'The Grey Lounge');
  allVideos.push(...tglVideos);

  if (allVideos.length === 0) {
    console.error('❌ ERROR: No videos fetched from any channel.');
    process.exit(1);
  }

  console.log(`\n📊 Total videos to upsert: ${allVideos.length}`);

  // Upsert to Supabase
  console.log('\n💾 Upserting videos to Supabase...');
  const { successCount, errorCount } = await upsertVideos(allVideos);

  console.log('\n🎉 Sync completed successfully!');
  console.log(`📈 Final statistics:`);
  console.log(`   - Total videos fetched: ${allVideos.length}`);
  console.log(`   - Successfully upserted: ${successCount}`);
  console.log(`   - Errors: ${errorCount}`);
  console.log(`   - Journey Towards Karbala: ${jtkVideos.length}`);
  console.log(`   - The Grey Lounge: ${tglVideos.length}`);
}

main().catch(error => {
  console.error('💥 Fatal error during sync:', error);
  process.exit(1);
});