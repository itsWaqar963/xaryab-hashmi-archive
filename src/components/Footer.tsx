import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-[#030305] mt-20 relative z-20">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-16 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#A855F7] flex items-center justify-center font-bold text-white">
                Z
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Xaryab Hashmi</h3>
                <p className="text-xs text-gray-400">Knowledge Archive</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              A curated digital archive of lectures, podcasts, and intellectual explorations.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Navigation</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><Link href="/" className="hover:text-white">Home</Link></li>
              <li><a href="#archive" className="hover:text-white">Videos</a></li>
              <li><Link href="/about" className="hover:text-white">About</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Channels</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><a href="https://www.youtube.com/@JourneyTowardsKarbala" target="_blank" rel="noreferrer" className="hover:text-white">Journey Towards Karbala</a></li>
              <li><a href="https://www.youtube.com/@TheGreyLounge" target="_blank" rel="noreferrer" className="hover:text-white">The Grey Lounge</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Community</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><a href="https://whatsapp.com/channel/0029VbAwYQX4IBhIy9RScc1b" target="_blank" rel="noreferrer" className="hover:text-white">WhatsApp Channel</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/5 text-center sm:text-left flex flex-col sm:flex-row justify-between text-xs text-gray-500">
          <p>© {currentYear} Xaryab Hashmi Knowledge Archive.</p>
        </div>
      </div>
    </footer>
  );
}