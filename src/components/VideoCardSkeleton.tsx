export default function VideoCardSkeleton() {
  return (
    <div className="space-y-4 bg-[#0A090F] border border-white/5 p-3 rounded-xl">
      <div className="relative aspect-video bg-white/5 rounded-lg overflow-hidden animate-pulse" />
      <div className="space-y-2">
        <div className="h-4 bg-white/5 rounded-md animate-pulse" />
        <div className="h-4 bg-white/5 rounded-md w-3/4 animate-pulse" />
        <div className="flex items-center gap-2 pt-2">
          <div className="h-3 bg-white/5 rounded-md w-20 animate-pulse" />
          <div className="h-3 bg-white/5 rounded-md w-16 animate-pulse" />
        </div>
      </div>
    </div>
  );
}