"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import VideoCard from "@/components/VideoCard";
import VideoCardSkeleton from "@/components/VideoCardSkeleton";
import AnimatedCounter from "@/components/AnimatedCounter";
import LiveOnlineBadge, {
  LiveOnlineProvider,
} from "@/components/LiveOnlineBadge";
import VideoPlayerModal from "@/components/VideoPlayerModal";

interface Video {
  id: string;
  youtube_id: string;
  title: string;
  custom_title: string | null;
  description: string | null;
  thumbnail_url: string;
  published_at: string;
  channel_title: string;
  categories: string[];
  tags: string[];
  is_external: boolean;
}

const VIDEOS_PER_PAGE = 20;

const topics = ["Philosophy", "Metaphysics", "Spirituality", "Dialogue"];

const features = [
  {
    icon: "bookmark",
    title: "Curated Collection",
    description: "Handpicked content in one place",
  },
  {
    icon: "bulb",
    title: "Deep Insights",
    description: "Timeless wisdom on life & reality",
  },
  {
    icon: "users",
    title: "Community Driven",
    description: "Join seekers and grow together",
  },
  {
    icon: "heart",
    title: "Ad-Free Learning",
    description: "Focused experience for true learners",
  },
];

function Icon({ type }: { type: string }) {
  if (type === "bookmark") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6 4.5A2.5 2.5 0 0 1 8.5 2h7A2.5 2.5 0 0 1 18 4.5V21l-6-3.5L6 21V4.5Z" />
      </svg>
    );
  }

  if (type === "bulb") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M9 18h6" />
        <path d="M10 22h4" />
        <path d="M8.2 14.8A7 7 0 1 1 15.8 14.8c-.8.7-1.3 1.5-1.5 2.2H9.7c-.2-.7-.7-1.5-1.5-2.2Z" />
      </svg>
    );
  }

  if (type === "users") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M16 20v-1.5a4.5 4.5 0 0 0-4.5-4.5h-3A4.5 4.5 0 0 0 4 18.5V20" />
        <circle cx="10" cy="7.5" r="3.5" />
        <path d="M16 11a3 3 0 1 0 0-6" />
        <path d="M17 14a4.5 4.5 0 0 1 3 4.25V20" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M20.8 8.7c0 5.5-8.8 10.4-8.8 10.4S3.2 14.2 3.2 8.7A4.7 4.7 0 0 1 12 6.2a4.7 4.7 0 0 1 8.8 2.5Z" />
    </svg>
  );
}

export default function HomePage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedChannel, setSelectedChannel] = useState("All");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalVideos, setTotalVideos] = useState<number | null>(null);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableChannels, setAvailableChannels] = useState<string[]>([]);
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);

  useEffect(() => {
    fetchVideos();
    fetchFilters();
  }, []);

  useEffect(() => {
    filterVideos();
  }, [videos, selectedCategory, selectedChannel, search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedChannel, search]);

  async function fetchVideos() {
    try {
      const { data, error, count } = await supabase
        .from("videos")
        .select("*", { count: "exact" })
        .order("published_at", { ascending: false });

      if (error) throw error;
      setVideos(data || []);
      setTotalVideos(count || 0);
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchFilters() {
    try {
      const { data: vData } = await supabase
        .from("videos")
        .select("categories, channel_title");

      if (vData) {
        const allCats = new Set<string>();
        const allChans = new Set<string>();

        vData.forEach((v: any) => {
          if (v.categories && Array.isArray(v.categories)) {
            v.categories.forEach((c: string) => c && c.trim() && allCats.add(c));
          }
          if (v.channel_title && v.channel_title.trim()) {
            allChans.add(v.channel_title);
          }
        });

        setAvailableCategories(Array.from(allCats).sort());
        setAvailableChannels(Array.from(allChans).sort());
      }
    } catch (error) {
      console.error("Error fetching filters:", error);
    }
  }

  function filterVideos() {
    let filtered = videos;

    if (selectedCategory !== "All") {
      const catLower = selectedCategory.toLowerCase();
      filtered = filtered.filter((v) => {
        const catMatch = v.categories?.some((c) => c.toLowerCase() === catLower);
        const titleMatch =
          v.title.toLowerCase().includes(catLower) ||
          (v.custom_title && v.custom_title.toLowerCase().includes(catLower));
        const tagMatch = v.tags?.some((t) => t.toLowerCase().includes(catLower));
        return catMatch || titleMatch || tagMatch;
      });
    }

    if (selectedChannel !== "All") {
      filtered = filtered.filter((v) => v.channel_title === selectedChannel);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          (v.custom_title && v.custom_title.toLowerCase().includes(q)) ||
          (v.description && v.description.toLowerCase().includes(q)) ||
          v.tags?.some((t) => t.toLowerCase().includes(q)) ||
          v.categories?.some((c) => c.toLowerCase().includes(q)) ||
          v.channel_title.toLowerCase().includes(q)
      );
    }

    setFilteredVideos(filtered);
  }

  function openVideo(youtubeId: string) {
    const video =
      videos.find((v) => v.youtube_id === youtubeId) ||
      filteredVideos.find((v) => v.youtube_id === youtubeId) ||
      null;
    if (video) {
      setActiveVideo(video);
      return;
    }
    setActiveVideo({
      id: youtubeId,
      youtube_id: youtubeId,
      title: "Watch video",
      custom_title: null,
      description: null,
      thumbnail_url: "",
      published_at: new Date().toISOString(),
      channel_title: "",
      categories: [],
      tags: [],
      is_external: false,
    });
  }

  const podcastCount = useMemo(() => {
    return videos.filter((v) =>
      v.categories?.some((c) => c.toLowerCase().includes("podcast"))
    ).length;
  }, [videos]);

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  const totalPages = Math.ceil(filteredVideos.length / VIDEOS_PER_PAGE);
  const startIndex = (currentPage - 1) * VIDEOS_PER_PAGE;
  const endIndex = startIndex + VIDEOS_PER_PAGE;
  const currentVideos = filteredVideos.slice(startIndex, endIndex);

  function handlePageChange(page: number) {
    setCurrentPage(page);
    const elem = document.getElementById("archive");
    elem?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <LiveOnlineProvider>
    <main className="archive-page">
      {/* CINEMATIC PORTRAIT */}
      <div className="hero-portrait" aria-hidden="true">
        <img src="/images/xaryab-hashmi.jpg" alt="" />
        <div className="portrait-left-fade" />
        <div className="portrait-top-fade" />
        <div className="portrait-bottom-fade" />
        <div className="portrait-dark-overlay" />
        <div className="portrait-purple-glow" />
      </div>

      {/* BACKGROUNDS */}
      <div className="hero-background" />
      <div className="grid-background" />

      {/* CONTENT LAYER */}
      <div className="page-content">
        {/* HEADER */}
        <header className="site-header">
          <Link href="/" className="brand">
            <div className="brand-mark">Z</div>
            <div className="brand-text">
              <strong>XARYAB HASHMI</strong>
              <span>KNOWLEDGE ARCHIVE</span>
            </div>
          </Link>

          <nav className="main-nav">
            <Link href="/" className="active">Home</Link>
            <a href="#archive">Videos</a>
            <Link href="/about">About</Link>
          </nav>

          <a
            href="https://whatsapp.com/channel/0029VbAwYQX4IBhIy9RScc1b"
            target="_blank"
            rel="noopener noreferrer"
            className="community-button"
          >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M16 21v-1.5a4.5 4.5 0 0 0-4.5-4.5h-3A4.5 4.5 0 0 0 4 19.5V21" />
                <circle cx="10" cy="7" r="3.5" />
                <path d="M17 11a3 3 0 1 0 0-6" />
                <path d="M17 14.5a4.5 4.5 0 0 1 3 4.2V21" />
              </svg>
              Join Community
          </a>
        </header>

        {/* HERO SECTION */}
        <section className="hero-section">
          <div className="hero-content">
            <LiveOnlineBadge />

            <h1>
              Timeless Ideas.
              <br />
              <span>One Archive.</span>
            </h1>

            <p className="hero-description">
              Xaryab Hashmi&apos;s ideas, conversations and lectures — collected in one searchable archive.
            </p>

            {/* SEARCH BAR */}
            <div className="search-wrapper">
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
              </svg>

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search videos, podcasts, topics..."
              />

              <button
                aria-label="Search"
                onClick={() => {
                  const elem = document.getElementById("archive");
                  elem?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                →
              </button>
            </div>

            {/* TOPICS */}
            <div className="topics-row">
              <span className="topics-label">Top Topics:</span>
              {topics.map((topic) => (
                <button
                  key={topic}
                  onClick={() => {
                    setSearch(topic);
                    const elem = document.getElementById("archive");
                    elem?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="topic-pill cursor-pointer"
                >
                  {topic}
                </button>
              ))}
            </div>

            {/* FEATURE STRIP */}
            <div className="feature-strip">
              {features.map((feature) => (
                <div className="feature-item" key={feature.title}>
                  <div className="feature-icon">
                    <Icon type={feature.icon} />
                  </div>
                  <div>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* STATS STRIP */}
            <div className="stats-strip stats-strip--3">
              <div className="stat">
                <AnimatedCounter value={totalVideos} />
                <span>VIDEOS</span>
              </div>
              <div className="stat">
                <AnimatedCounter
                  value={loading ? null : podcastCount}
                />
                <span>PODCASTS</span>
              </div>
              <div className="stat">
                <AnimatedCounter
                  value={loading ? null : availableChannels.length}
                />
                <span>CHANNELS</span>
              </div>
            </div>
          </div>
        </section>

        {/* DYNAMIC SUPABASE VIDEO ARCHIVE SECTION */}
        <section id="archive" className="py-16 border-t border-white/10 mt-12">
          {/* Active Search & Channel Filter Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <p className="text-sm text-gray-400">
              {filteredVideos.length > 0 ? (
                <>
                  Showing <span className="text-white font-medium">{startIndex + 1}-{Math.min(endIndex, filteredVideos.length)}</span> of <span className="text-white font-medium">{filteredVideos.length}</span> videos
                  {selectedCategory !== "All" && <span className="ml-2 text-purple-400">in {selectedCategory}</span>}
                  {selectedChannel !== "All" && <span className="ml-2 text-purple-400">from {selectedChannel}</span>}
                  {search && <span className="ml-2 text-purple-400">matching &quot;{search}&quot;</span>}
                </>
              ) : (
                <><span className="text-white font-medium">{totalVideos ?? "…"}</span> total videos in archive</>
              )}
            </p>

            {availableChannels.length > 0 && (
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-400">Channel:</label>
                <select
                  value={selectedChannel}
                  onChange={(e) => setSelectedChannel(e.target.value)}
                  className="px-3 py-1.5 bg-[#0a090f] border border-white/10 rounded-lg text-xs text-white outline-none focus:border-purple-500"
                >
                  <option value="All">All Channels</option>
                  {availableChannels.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-8">
            <button
              onClick={() => setSelectedCategory("All")}
              className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === "All"
                  ? "bg-purple-600 text-white"
                  : "bg-[#0a090f] text-gray-400 border border-white/10 hover:text-white"
              }`}
            >
              All Categories
            </button>
            {availableCategories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? "bg-purple-600 text-white"
                    : "bg-[#0a090f] text-gray-400 border border-white/10 hover:text-white"
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>

          {/* Video Grid Render */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <VideoCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredVideos.length === 0 ? (
            <div className="text-center py-20 bg-[#0a090f]/50 border border-white/10 rounded-2xl">
              <p className="text-gray-400 text-base">No videos found matching your criteria</p>
              <button
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("All");
                  setSelectedChannel("All");
                }}
                className="mt-4 px-4 py-2 bg-purple-600/30 text-purple-300 text-xs rounded-lg border border-purple-500/30"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentVideos.map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    onPlay={openVideo}
                    formatDate={formatDate}
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-[#0a090f] border border-white/10 rounded-xl text-xs disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-gray-400 px-3">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-[#0a090f] border border-white/10 rounded-xl text-xs disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {activeVideo ? (
        <VideoPlayerModal
          youtubeId={activeVideo.youtube_id}
          title={activeVideo.custom_title || activeVideo.title}
          onClose={() => setActiveVideo(null)}
        />
      ) : null}
    </main>
    </LiveOnlineProvider>
  );
}