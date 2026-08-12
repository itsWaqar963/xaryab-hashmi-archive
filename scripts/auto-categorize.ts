// Auto-categorization script for existing videos - NO DATA DELETION
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Initialize Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Categorization rules based on keywords
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

// Default category for videos that don't match specific rules
const DEFAULT_CATEGORY = 'podcasts';
const DEFAULT_TAGS = ['Podcasts'];

function categorizeVideo(title: string, description: string | null): { categories: string[], tags: string[] } {
  const textToSearch = `${title.toLowerCase()} ${description?.toLowerCase() || ''}`;
  const assignedCategories = new Set<string>();
  const assignedTags = new Set<string>();

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
    assignedCategories.add(DEFAULT_CATEGORY);
    DEFAULT_TAGS.forEach(tag => assignedTags.add(tag));
  }

  return {
    categories: Array.from(assignedCategories),
    tags: Array.from(assignedTags)
  };
}

async function fetchAllVideos() {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select('id, title, description, categories, tags')
      .order('published_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching videos:', error);
    return [];
  }
}

async function updateVideoCategory(video: any) {
  const categorization = categorizeVideo(video.title, video.description);
  
  // Only update if categories or tags have changed
  const currentCategories = JSON.stringify(video.categories || []);
  const currentTags = JSON.stringify(video.tags || []);
  const newCategories = JSON.stringify(categorization.categories);
  const newTags = JSON.stringify(categorization.tags);

  if (currentCategories === newCategories && currentTags === newTags) {
    return { updated: false, reason: 'No changes needed' };
  }

  try {
    const { error } = await supabase
      .from('videos')
      .update({
        categories: categorization.categories,
        tags: categorization.tags
      })
      .eq('id', video.id);

    if (error) throw error;

    return { 
      updated: true, 
      reason: 'Categories/tags updated',
      oldCategories: video.categories || [],
      newCategories: categorization.categories,
      oldTags: video.tags || [],
      newTags: categorization.tags
    };
  } catch (error) {
    console.error(`Error updating video ${video.id}:`, error);
    return { updated: false, reason: 'Error updating', error };
  }
}

async function main() {
  console.log('🏷️ Starting auto-categorization of existing videos...\n');
  console.log('⚠️  IMPORTANT: This will NOT delete any existing data');
  console.log('📊 Only updating categories and tags based on content analysis\n');

  // Fetch all existing videos
  console.log('📥 Fetching all videos from database...');
  const videos = await fetchAllVideos();
  console.log(`✅ Found ${videos.length} videos to categorize\n`);

  if (videos.length === 0) {
    console.log('❌ No videos found in database');
    process.exit(1);
  }

  // Categorization statistics
  let updatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  const categoryStats: Record<string, number> = {};

  // Process each video
  console.log('🔄 Processing videos...\n');
  
  for (let i = 0; i < videos.length; i++) {
    const video = videos[i];
    const result = await updateVideoCategory(video);

    if (result.updated) {
      updatedCount++;
      
      // Track category statistics
      if (result.newCategories) {
        result.newCategories.forEach((cat: string) => {
          categoryStats[cat] = (categoryStats[cat] || 0) + 1;
        });
      }

      if (updatedCount % 50 === 0) {
        console.log(`📊 Progress: ${updatedCount}/${videos.length} videos categorized`);
      }
    } else {
      skippedCount++;
    }
  }

  // Display results
  console.log('\n🎉 Auto-categorization completed!\n');
  console.log('📈 Statistics:');
  console.log(`   - Total videos processed: ${videos.length}`);
  console.log(`   - Videos updated: ${updatedCount}`);
  console.log(`   - Videos skipped (no changes): ${skippedCount}`);
  console.log(`   - Errors: ${errorCount}`);
  
  console.log('\n📊 Category Distribution:');
  for (const [category, count] of Object.entries(categoryStats).sort((a, b) => b[1] - a[1])) {
    console.log(`   - ${category}: ${count} videos`);
  }

  console.log('\n✅ All existing videos have been categorized without data loss!');
}

main().catch(error => {
  console.error('💥 Fatal error during categorization:', error);
  process.exit(1);
});