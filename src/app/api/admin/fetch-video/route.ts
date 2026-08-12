import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('videoId');

  if (!videoId) {
    return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
  }

  // Try both environment variable names for flexibility
  const apiKey = process.env.YOUTUBE_API_KEY || process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({ 
      error: 'YouTube API key is not configured in server environment',
      details: 'Please add YOUTUBE_API_KEY or NEXT_PUBLIC_YOUTUBE_API_KEY to your environment variables'
    }, { status: 500 });
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`
    );
    
    const data = await response.json();
    
    if (data.error) {
      return NextResponse.json({ 
        error: `YouTube API error: ${data.error.message}`,
        details: data.error
      }, { status: 400 });
    }
    
    if (!data.items || data.items.length === 0) {
      return NextResponse.json({ error: 'Video not found on YouTube' }, { status: 404 });
    }

    const item = data.items[0];
    const videoDetails = {
      videoId: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
      publishedAt: item.snippet.publishedAt,
      channelTitle: item.snippet.channelTitle,
    };

    return NextResponse.json({ video: videoDetails }, { status: 200 });
  } catch (error) {
    console.error('Error fetching video details:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch video details from YouTube',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}