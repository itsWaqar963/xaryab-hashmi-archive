'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AboutPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setSubmitted(false), 4000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white selection:bg-purple-500 selection:text-white">
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
          <Link href="/">Home</Link>
          <Link href="/#archive">Videos</Link>
          <Link href="/about" className="active">About</Link>
        </nav>

        <a
          href="https://whatsapp.com/channel/0029VbAwYQX4IBhIy9RScc1b"
          target="_blank"
          rel="noopener noreferrer"
          className="community-button"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
            <path d="M16 21v-1.5a4.5 4.5 0 0 0-4.5-4.5h-3A4.5 4.5 0 0 0 4 19.5V21" />
            <circle cx="10" cy="7" r="3.5" />
            <path d="M17 11a3 3 0 1 0 0-6" />
            <path d="M17 14.5a4.5 4.5 0 0 1 3 4.2V21" />
          </svg>
          Join Community
        </a>
      </header>

      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* HERO / BIOGRAPHY SECTION */}
        <section className="mb-20 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-mono uppercase tracking-wider mb-6">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            ABOUT THE ARCHIVE & SPEAKER
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-500 bg-clip-text text-transparent">
            Exploring Philosophy, Spirituality & Metaphysics
          </h1>

          <p className="text-lg sm:text-xl text-gray-300 leading-relaxed font-light">
            Xaryab Hashmi is an intellectual, thinker, and speaker focused on bridging ancient wisdom with contemporary human consciousness. This digital archive serves as a centralized platform for all lectures, discussions, podcasts, and deep reflections.
          </p>
        </section>

        {/* CORE MISSION CARDS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-purple-500/40 transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 mb-4 font-bold text-lg">01</div>
            <h3 className="text-xl font-bold mb-2">Deep Philosophy</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Unpacking existential questions, moral frameworks, and the nature of reality through intellectual dialogue.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-purple-500/40 transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 mb-4 font-bold text-lg">02</div>
            <h3 className="text-xl font-bold mb-2">Spiritual Knowledge</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Exploring metaphysical dimensions, inner self-realization, and traditional Islamic spiritual philosophy.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-purple-500/40 transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 mb-4 font-bold text-lg">03</div>
            <h3 className="text-xl font-bold mb-2">Open Dialogue</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Engaging in podcasts and public discussions to cultivate critical thinking and community awareness.
            </p>
          </div>
        </section>

        {/* MERGED CONTACT SECTION */}
        <section className="pt-12 border-t border-white/10">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Get in Touch & Connect</h2>
            <p className="text-gray-400 text-sm sm:text-base">
              Reach out for podcast invitations, collaborations, or join our community networks directly.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Contact Form */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
              <h3 className="text-2xl font-bold text-white mb-6">Send a Message</h3>
              
              {submitted && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm font-medium">
                  ✓ Thank you for your message! We&apos;ll get back to you soon.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-sm"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-sm"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-2">Subject</label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-[#121118] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-sm"
                  >
                    <option value="">Select a subject</option>
                    <option value="podcast-invitation">Podcast Invitation</option>
                    <option value="collaboration">Intellectual Collaboration</option>
                    <option value="inquiry">General Inquiry</option>
                    <option value="feedback">Feedback</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-2">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-sm resize-none"
                    placeholder="Your message..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl text-sm font-semibold text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all duration-300 cursor-pointer"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Direct Connect Links */}
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">Direct Community Access</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  Join official communication channels for direct updates, live stream announcements, and community discussions.
                </p>
              </div>

              <div className="space-y-4">
                <a
                  href="https://whatsapp.com/channel/0029VbAwYQX4IBhIy9RScc1b"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-green-500/40 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-green-600/20 rounded-xl flex items-center justify-center group-hover:bg-green-600/30 transition-colors">
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">WhatsApp Channel</h4>
                      <p className="text-xs text-gray-400">Join for updates and exclusive broadcasts</p>
                    </div>
                  </div>
                </a>

                <a
                  href="https://chat.whatsapp.com/KMvwE31A22GBHOKvQUQD0V"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-green-500/40 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-green-700/20 rounded-xl flex items-center justify-center group-hover:bg-green-700/30 transition-colors">
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">WhatsApp Discussion Group</h4>
                      <p className="text-xs text-gray-400">Participate in community dialogues</p>
                    </div>
                  </div>
                </a>

                <a
                  href="https://linktr.ee/JourneyTowardsKarbala"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-purple-500/40 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-purple-600/20 rounded-xl flex items-center justify-center group-hover:bg-purple-600/30 transition-colors">
                      <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18 3H6c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Linktree Social Hub</h4>
                      <p className="text-xs text-gray-400">All social profiles in one single link</p>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}