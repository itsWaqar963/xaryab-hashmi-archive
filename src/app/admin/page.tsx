'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { extractYouTubeId } from '@/lib/youtube';

// Categorization rules (same as sync route)
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

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState<string[]>(['podcasts']);
  const [tags, setTags] = useState('');
  const [customChannelName, setCustomChannelName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [videoPreview, setVideoPreview] = useState<any>(null);

  // States for Manual Sync Button
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@xaryab.com';
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';

    if (email === adminEmail && password === adminPassword) {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Invalid credentials');
    }
  };

  // Manual Channel Sync Handler with x-admin-sync header bypass
  const handleManualSync = async () => {
    setSyncLoading(true);
    setSyncMessage(null);

    try {
      const response = await fetch('/api/cron/sync', {
        headers: {
          'x-admin-sync': 'true'
        }
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Sync failed');
      }

      setSyncMessage(`✅ Sync Complete! Added: ${data.videosAdded || 0}, Updated: ${data.videosUpdated || 0}, Total Processed: ${data.videosProcessed || 0}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Manual sync error:', error);
      setSyncMessage(`❌ Error during sync: ${errorMessage}`);
    } finally {
      setSyncLoading(false);
    }
  };

  const handleFetchVideo = async () => {
    const videoId = extractYouTubeId(youtubeUrl);
    if (!videoId) {
      setMessage('Invalid YouTube URL. Please enter a valid YouTube URL or 11-character video ID.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/fetch-video?videoId=${videoId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch video details');
      }

      setVideoPreview(data.video);
      setCustomTitle(data.video.title);
      setDescription(data.video.description);
      
      const categorization = categorizeVideo(data.video.title, data.video.description);
      setCategories(categorization.categories);
      setTags(categorization.tags.join(', '));
      
      setMessage('Video details fetched successfully with auto-categorization');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching video details:', error);
      
      if (errorMessage.includes('API key')) {
        setMessage('YouTube API key is not configured on the server. Please contact administrator.');
      } else if (errorMessage.includes('not found')) {
        setMessage('Video not found. Please check the YouTube URL or video ID.');
      } else if (errorMessage.includes('quota')) {
        setMessage('YouTube API quota exceeded. Please try again later.');
      } else {
        setMessage(`Error fetching video details: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    const videoId = extractYouTubeId(youtubeUrl);
    if (!videoId) {
      setMessage('Invalid YouTube URL. Please enter a valid YouTube URL or 11-character video ID.');
      return;
    }

    if (!videoPreview) {
      setMessage('Please fetch video details first before adding.');
      return;
    }

    setLoading(true);
    try {
      const finalCategories = categories.length > 0 ? categories : categorizeVideo(videoPreview.title, videoPreview.description).categories;
      const finalTags = tags.trim() ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : categorizeVideo(videoPreview.title, videoPreview.description).tags;

      const { error } = await supabase.from('videos').insert({
        youtube_id: videoId,
        title: videoPreview?.title || customTitle,
        custom_title: customTitle,
        description: description,
        thumbnail_url: videoPreview?.thumbnailUrl || '',
        published_at: videoPreview?.publishedAt || new Date().toISOString(),
        channel_title: customChannelName || videoPreview?.channelTitle || 'External',
        categories: finalCategories,
        tags: finalTags,
        is_external: true,
      });

      if (error) {
        if (error.code === '23505') {
          setMessage('This video already exists in the database.');
        } else {
          throw error;
        }
      } else {
        setMessage('Video added successfully!');
        setYoutubeUrl('');
        setCustomTitle('');
        setCustomChannelName('');
        setDescription('');
        setTags('');
        setVideoPreview(null);
        setCategories(['podcasts']);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error adding video:', error);
      setMessage(`Error adding video: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (category: string) => {
    setCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">
        <div className="w-full max-w-md p-8 bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg">
          <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#121212] border border-[#2A2A2A] rounded-lg text-white focus:outline-none focus:border-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#121212] border border-[#2A2A2A] rounded-lg text-white focus:outline-none focus:border-purple-500"
                required
              />
            </div>
            {authError && (
              <p className="text-red-500 text-sm">{authError}</p>
            )}
            <button
              type="submit"
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <header className="border-b border-[#2A2A2A] bg-[#1E1E1E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Admin Panel</h1>
            <div className="flex gap-3">
              {/* Manual Sync Button */}
              <button
                onClick={handleManualSync}
                disabled={syncLoading}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                {syncLoading ? '🔄 Syncing...' : '🔄 Sync YouTube Channels'}
              </button>
              <button
                onClick={() => setIsAuthenticated(false)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Sync Result Banner */}
        {syncMessage && (
          <div className={`mb-6 p-4 rounded-lg text-sm font-medium border ${
            syncMessage.startsWith('✅') 
              ? 'bg-green-900/40 text-green-300 border-green-700' 
              : 'bg-red-900/40 text-red-300 border-red-700'
          }`}>
            {syncMessage}
          </div>
        )}

        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Add External Video</h2>
          
          {message && (
            <div className={`mb-4 p-3 rounded ${
              message.includes('success') ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleAddVideo} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">YouTube URL or ID</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://youtu.be/... or https://www.youtube.com/watch?v=..."
                  className="flex-1 px-4 py-3 bg-[#121212] border border-[#2A2A2A] rounded-lg text-white focus:outline-none focus:border-purple-500"
                  required
                />
                <button
                  type="button"
                  onClick={handleFetchVideo}
                  disabled={loading}
                  className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  Fetch
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Supported formats: youtube.com/watch?v=, youtu.be/, shorts/, embed/, or 11-char video ID
              </p>
            </div>

            {videoPreview && (
              <div className="bg-[#121212] border border-[#2A2A2A] rounded-lg p-4">
                <h3 className="font-semibold mb-3">Video Preview</h3>
                <img
                  src={videoPreview.thumbnailUrl}
                  alt="Video thumbnail"
                  className="w-full aspect-video object-cover rounded mb-3"
                />
                <p className="text-sm text-gray-400">{videoPreview.title}</p>
                <p className="text-xs text-gray-500">Channel: {videoPreview.channelTitle}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Custom Title (Optional)</label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Custom title for the video"
                className="w-full px-4 py-3 bg-[#121212] border border-[#2A2A2A] rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Custom Channel Name (Optional)</label>
              <input
                type="text"
                value={customChannelName}
                onChange={(e) => setCustomChannelName(e.target.value)}
                placeholder="Custom channel name (e.g., 'Shysta Nazir Podcast')"
                className="w-full px-4 py-3 bg-[#121212] border border-[#2A2A2A] rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty to use YouTube channel name</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Video description"
                rows={4}
                className="w-full px-4 py-3 bg-[#121212] border border-[#2A2A2A] rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Categories</label>
              <div className="flex flex-wrap gap-2">
                {['podcasts', 'shorts', 'geopolitics', 'metaphysics', 'adeem hashmi'].map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => toggleCategory(category)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      categories.includes(category)
                        ? 'bg-purple-600 text-white'
                        : 'bg-[#121212] text-gray-400 border border-[#2A2A2A]'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="#Alam-e-Barzakh, #5•7•12•72, #Imamat vs Khilafat"
                className="w-full px-4 py-3 bg-[#121212] border border-[#2A2A2A] rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">Supports Urdu text and special characters</p>
            </div>

            {videoPreview && (
              <div className="bg-[#121212] border border-[#2A2A2A] rounded-lg p-4">
                <h3 className="font-semibold mb-2">Channel Information</h3>
                <p className="text-sm text-gray-400">YouTube Channel: {videoPreview.channelTitle}</p>
                <p className="text-xs text-gray-500 mt-1">This will be used unless you enter a custom channel name above</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Adding Video...' : 'Add Video'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
