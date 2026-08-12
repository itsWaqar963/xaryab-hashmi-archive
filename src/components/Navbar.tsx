'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Podcasts', href: '/#archive' },
    { name: 'Videos', href: '/#archive' },
    { name: 'Playlists', href: '/#archive' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-[88px] ${
        isScrolled
          ? 'backdrop-blur-md bg-[#050505]/90 border-b border-white/5'
          : 'bg-[#050505]'
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-16 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center gap-4 group">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#A855F7] flex items-center justify-center shadow-lg shadow-[#8B5CF6]/20">
                <span className="text-white font-bold text-xl">Z</span>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] rounded-xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-white leading-tight">XARYAB HASHMI</h1>
              <p className="text-sm text-[#A1A1AA] font-medium tracking-wide leading-tight">KNOWLEDGE ARCHIVE</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm text-[#A1A1AA] hover:text-white transition-colors duration-200 font-medium"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Community Button */}
          <div className="hidden lg:block">
            <button
              onClick={() => window.open('https://whatsapp.com/channel/0029VbAwYQX4IBhIy9RScc1b', '_blank')}
              className="px-6 py-3 bg-[#8B5CF6] hover:bg-[#A855F7] rounded-xl text-sm font-medium text-white shadow-lg shadow-[#8B5CF6]/20 hover:shadow-[#8B5CF6]/30 transition-all duration-300"
            >
              Join Community
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#A1A1AA] hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-white/5">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-sm text-[#A1A1AA] hover:text-white transition-colors duration-200 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <button
                onClick={() => {
                  window.open('https://whatsapp.com/channel/0029VbAwYQX4IBhIy9RScc1b', '_blank');
                  setMobileMenuOpen(false);
                }}
                className="px-6 py-3 bg-[#8B5CF6] rounded-xl text-sm font-medium text-white"
              >
                Join Community
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}