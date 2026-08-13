"use client";

import { useState } from "react";
import { generateAISummary } from "@/lib/summarizer";

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

interface VideoCardProps {
  video: Video;
  onPlay: (youtubeId: string) => void;
  formatDate: (dateString: string) => void;
}

type TLDRState = "idle" | "generating" | "expanded" | "collapsed";

export default function VideoCard({ video, onPlay, formatDate }: VideoCardProps) {
  const displayTitle = video.custom_title || video.title;

  // TL;DR States
  const [tldrState, setTldrState] = useState<TLDRState>("idle");
  const [progress, setProgress] = useState(0);
  const [summary, setSummary] = useState<string[]>([]);

  // Real Hugging Face AI TL;DR Trigger Function
  const handleTLDRClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevents video play trigger

    if (tldrState === "expanded") {
      setTldrState("collapsed");
      return;
    }

    if (tldrState === "collapsed") {
      setTldrState("expanded");
      return;
    }

    if (tldrState === "idle") {
      // If summary already generated before, reuse it instantly
      if (summary.length > 0) {
        setTldrState("expanded");
        return;
      }

      setTldrState("generating");
      setProgress(5);

      try {
        const textToSummarize = `${displayTitle}. ${video.description || ""}`;
        
        // Calling Transformers.js Local AI Model
        const aiPoints = await generateAISummary(textToSummarize, (percent) => {
          if (percent > 0) setProgress(percent);
        });

        setProgress(100);
        setSummary(aiPoints);
        setTldrState("expanded");
      } catch (err) {
        console.error("AI Generation Error:", err);
        setSummary([
          "Explores key concepts and deeper reflections.",
          "Highlights personal insights and wisdom.",
          "Discusses practical life applications."
        ]);
        setTldrState("expanded");
      }
    }
  };

  return (
    <div
      onClick={() => onPlay(video.youtube_id)}
      className="group bg-[#0f0e17]/80 border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col h-full shadow-lg hover:shadow-purple-500/10"
    >
      {/* THUMBNAIL CONTAINER */}
      <div className="relative aspect-video w-full overflow-hidden bg-black/40">
        <img
          src={video.thumbnail_url || `https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`}
          alt={displayTitle}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* External Badge */}
        {video.is_external && (
          <span className="absolute top-2 right-2 bg-indigo-600/90 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded-full border border-indigo-400/30">
            External
          </span>
        )}

        {/* Play Overlay Button */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
            <svg className="w-5 h-5 fill-current ml-0.5" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* CARD CONTENT */}
      <div className="p-4 flex flex-col flex-grow justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white line-clamp-2 leading-snug group-hover:text-purple-300 transition-colors">
            {displayTitle}
          </h3>

          {/* Meta Info & TL;DR Button Bar */}
          <div className="mt-2.5 flex items-center justify-between gap-2 text-xs text-gray-400">
            <div className="flex items-center gap-1.5 truncate">
              <span className="font-medium text-gray-300 truncate max-w-[130px]">
                {video.channel_title}
              </span>
              <span>•</span>
              <span>{formatDate(video.published_at)}</span>
            </div>

            {/* Aesthetic Purple Gradient TL;DR Chip */}
            <button
              onClick={handleTLDRClick}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-300 border ${
                tldrState === "expanded"
                  ? "bg-purple-950/80 border-purple-500/60 text-purple-200 shadow-sm shadow-purple-500/20"
                  : "bg-gradient-to-r from-purple-900/60 via-purple-800/40 to-indigo-900/60 border-purple-500/40 text-purple-200 hover:border-purple-400 hover:shadow-md hover:shadow-purple-500/20"
              }`}
            >
              <span className="text-[10px]">✨</span>
              <span>TL;DR</span>
              <span className="text-[9px] opacity-70">
                {tldrState === "expanded" ? "▲" : tldrState === "collapsed" ? "▼" : "✦"}
              </span>
            </button>
          </div>
        </div>

        {/* STATE 2: GENERATING STATE (PROGRESS BAR) */}
        {tldrState === "generating" && (
          <div className="mt-3 p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs animate-pulse">
            <div className="flex justify-between items-center text-purple-300 text-[11px] font-medium mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="animate-spin text-purple-400">✨</span>
                <span>Generating TL;DR...</span>
              </div>
              <span className="text-[10px] text-purple-400/80">{progress}%</span>
            </div>
            <p className="text-[10px] text-gray-400 mb-2">Extracting key insights from content via Hugging Face AI</p>
            <div className="w-full h-1 bg-purple-950 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* STATE 3: EXPANDED SUMMARY BOX */}
        {tldrState === "expanded" && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="mt-3 p-3.5 rounded-xl bg-[#141026] border border-purple-500/30 text-xs shadow-inner transition-all duration-300"
          >
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-2 mb-2.5">
              <div className="flex items-center gap-1.5 text-purple-300 font-semibold text-[11px] uppercase tracking-wider">
                <span>📌</span>
                <span>TL;DR SUMMARY</span>
              </div>
              <button
                onClick={() => setTldrState("collapsed")}
                className="text-gray-400 hover:text-white p-0.5 text-sm leading-none"
              >
                ✕
              </button>
            </div>

            <ul className="space-y-2 text-gray-300 text-[11px] leading-relaxed">
              {summary.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-purple-400 text-xs mt-0.5">✓</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            <div className="mt-3 pt-2 border-t border-purple-500/10 flex items-center justify-between text-[10px] text-gray-400">
              <span className="text-gray-500">Summary by AI • Just now</span>
              <div className="flex gap-2 text-gray-400">
                <button className="hover:text-purple-300 transition-colors">👍</button>
                <button className="hover:text-purple-300 transition-colors">👎</button>
              </div>
            </div>
          </div>
        )}

        {/* STATE 4: COLLAPSED SUMMARY STATE */}
        {tldrState === "collapsed" && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              setTldrState("expanded");
            }}
            className="mt-3 p-2.5 rounded-xl bg-purple-950/20 border border-purple-500/20 text-[11px] text-gray-300 flex items-center justify-between hover:border-purple-500/40 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-1.5 truncate pr-2">
              <span className="text-purple-400">📌</span>
              <span className="truncate text-gray-300">{summary[0] || "Summary generated..."}</span>
            </div>
            <span className="text-[9px] text-purple-400 whitespace-nowrap">View All</span>
          </div>
        )}

        {/* Tags */}
        {video.tags && video.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t border-white/5">
            {video.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="text-[10px] bg-white/5 text-gray-400 px-2 py-0.5 rounded-md border border-white/5"
              >
                #{tag}
              </span>
            ))}
            {video.tags.length > 3 && (
              <span className="text-[10px] text-gray-500 self-center">
                +{video.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
