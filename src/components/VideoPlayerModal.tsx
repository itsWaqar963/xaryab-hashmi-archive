"use client";

import { useEffect } from "react";

interface VideoPlayerModalProps {
  youtubeId: string;
  title: string;
  onClose: () => void;
}

export default function VideoPlayerModal({
  youtubeId,
  title,
  onClose,
}: VideoPlayerModalProps) {
  const youtubeWatchUrl = `https://www.youtube.com/watch?v=${youtubeId}`;
  const embedUrl = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl rounded-2xl border border-[#2A2A2A] bg-[#121212] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 px-4 sm:px-5 py-3.5 border-b border-white/10">
          <h2 className="text-sm sm:text-base font-semibold text-white line-clamp-2 leading-snug pr-2">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close player"
            className="shrink-0 w-9 h-9 rounded-lg border border-white/10 text-gray-300 hover:text-white hover:border-white/25 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="relative aspect-video w-full bg-black">
          <iframe
            src={embedUrl}
            title={title}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3 px-4 sm:px-5 py-4 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl border border-[#2A2A2A] text-sm font-medium text-[#A0A0A0] hover:text-white hover:border-[#3A3A3A] transition-colors"
          >
            Close
          </button>
          <a
            href={youtubeWatchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#FF0000] hover:bg-[#e60000] text-sm font-medium text-white transition-colors"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-5.8ZM9.8 15.5v-7l6.3 3.5-6.3 3.5Z" />
            </svg>
            Open in YouTube
          </a>
        </div>
      </div>
    </div>
  );
}
