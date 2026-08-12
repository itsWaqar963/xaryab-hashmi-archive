// YouTube API v3 helper functions

function getYouTubeApiKey(): string {
  return process.env.YOUTUBE_API_KEY || process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || '';
}

export interface YouTubeVideo {
  videoId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
  channelTitle: string;
}

// Convert channel ID to uploads playlist ID (UC -> UU)
function channelIdToUploadsPlaylistId(channelId: string): string {
  return channelId.replace('UC', 'UU');
}

// Fetch ALL videos from a channel using uploads playlist with pagination
export async function fetchAllVideosFromChannel(channelId: string, channelName: string): Promise<YouTubeVideo[]> {
  const apiKey = getYouTubeApiKey();
  if (!apiKey) {
    throw new Error('YouTube API key is not configured');
  }

  const uploadsPlaylistId = channelIdToUploadsPlaylistId(channelId);
  const allVideos: YouTubeVideo[] = [];
  let nextPageToken: string | undefined = undefined;
  let pageCount = 0;

  console.log(`Fetching ALL videos from ${channelName} using uploads playlist: ${uploadsPlaylistId}`);

  while (true) {
    pageCount++;
    const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?key=${apiKey}&playlistId=${uploadsPlaylistId}&part=snippet&maxResults=50${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;

    try {
      const response = await fetch(playlistUrl);
      const data = await response.json();

      if (data.error) {
        throw new Error(`YouTube API error: ${data.error.message}`);
      }

      if (!data.items || data.items.length === 0) {
        console.log(`No more videos found for ${channelName} after ${pageCount} pages`);
        break;
      }

      const videos = data.items
        .map((item: any) => ({
          videoId: item.snippet.resourceId.videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
          publishedAt: item.snippet.publishedAt,
          channelTitle: item.snippet.channelTitle || channelName,
        }));

      allVideos.push(...videos);
      console.log(`Page ${pageCount}: Fetched ${videos.length} videos (Total: ${allVideos.length})`);

      // Check if there's a next page
      nextPageToken = data.nextPageToken;
      if (!nextPageToken) {
        console.log(`Reached end of playlist for ${channelName}`);
        break;
      }

      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error(`Error fetching page ${pageCount} for ${channelName}:`, error);
      break;
    }
  }

  console.log(`Completed fetching ${allVideos.length} total videos from ${channelName}`);
  return allVideos;
}

// Fetch videos with pagination support (Default maxResults set to 500 so all videos are fetched)
export async function fetchLatestVideosFromChannel(channelId: string, maxResults: number = 500): Promise<YouTubeVideo[]> {
  const apiKey = getYouTubeApiKey();
  if (!apiKey) {
    throw new Error('YouTube API key is not configured');
  }

  const uploadsPlaylistId = channelIdToUploadsPlaylistId(channelId);
  const allVideos: YouTubeVideo[] = [];
  let nextPageToken: string | undefined = undefined;

  try {
    while (allVideos.length < maxResults) {
      const fetchCount = Math.min(50, maxResults - allVideos.length);
      const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?key=${apiKey}&playlistId=${uploadsPlaylistId}&part=snippet&maxResults=${fetchCount}${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;

      const response = await fetch(playlistUrl);
      const data = await response.json();

      if (data.error) {
        throw new Error(`YouTube API error: ${data.error.message}`);
      }

      if (!data.items || data.items.length === 0) {
        break;
      }

      const videos: YouTubeVideo[] = data.items
        .filter((item: any) => item.snippet && item.snippet.resourceId && item.snippet.resourceId.videoId)
        .map((item: any) => ({
          videoId: item.snippet.resourceId.videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
          publishedAt: item.snippet.publishedAt,
          channelTitle: item.snippet.channelTitle,
        }));

      allVideos.push(...videos);

      nextPageToken = data.nextPageToken;
      if (!nextPageToken) {
        break; // Uploads playlist end reached
      }
    }

    return allVideos;
  } catch (error) {
    console.error('Error fetching videos from channel:', error);
    throw error;
  }
}

export async function fetchVideoDetailsById(videoId: string): Promise<YouTubeVideo> {
  const apiKey = getYouTubeApiKey();
  if (!apiKey) {
    throw new Error('YouTube API key is not configured');
  }

  const videoUrl = `https://www.googleapis.com/youtube/v3/videos?key=${apiKey}&id=${videoId}&part=snippet`;

  try {
    const response = await fetch(videoUrl);
    const data = await response.json();

    if (data.error) {
      throw new Error(`YouTube API error: ${data.error.message}`);
    }

    if (!data.items || data.items.length === 0) {
      throw new Error('Video not found');
    }

    const item = data.items[0];
    return {
      videoId: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
      publishedAt: item.snippet.publishedAt,
      channelTitle: item.snippet.channelTitle,
    };
  } catch (error) {
    console.error('Error fetching video details:', error);
    throw error;
  }
}

export function extractYouTubeId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  
  // If user directly enters 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = trimmed.match(regExp);

  return (match && match[2].length === 11) ? match[2] : null;
}

// Search for channel ID by channel name
export async function searchChannelId(channelName: string): Promise<string | null> {
  const apiKey = getYouTubeApiKey();
  if (!apiKey) {
    throw new Error('YouTube API key is not configured');
  }

  try {
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&q=${encodeURIComponent(channelName)}&type=channel&part=snippet`;
    const response = await fetch(searchUrl);
    const data = await response.json();

    if (data.error) {
      throw new Error(`YouTube API error: ${data.error.message}`);
    }

    if (data.items && data.items.length > 0) {
      return data.items[0].id.channelId;
    }

    return null;
  } catch (error) {
    console.error('Error searching for channel:', error);
    throw error;
  }
}
