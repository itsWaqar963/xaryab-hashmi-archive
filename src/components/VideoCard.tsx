"use client";

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

export default function VideoCard({ video, onPlay, formatDate }: VideoCardProps) {
  const displayTitle = video.custom_title || video.title;

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

        {/* External Badge (if applicable) */}
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

          <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
            <span className="font-medium text-gray-300 truncate max-w-[150px]">
              {video.channel_title}
            </span>
            <span>•</span>
            <span>{formatDate(video.published_at)}</span>
          </div>
        </div>

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