'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import { useRouter } from 'next/navigation';
import ProfileDropdown from '@/app/components/ProfileDropdown';
import { FiHome, FiFilm, FiInfo, FiMenu, FiX } from 'react-icons/fi';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function checkUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    } catch (error) {
      console.error('Error checking user:', error);
    }
  }

  return (
    <nav className="relative z-50">
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>

      <div className="container-wrapper relative py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link 
              href="/" 
              className="flex items-center gap-3 text-2xl sm:text-3xl font-bold group"
            >
              <div className="relative w-8 sm:w-10 h-6 sm:h-7 flex items-start justify-center">
                {/* Main board */}
                <div className="absolute inset-[3px] bg-gradient-to-br from-blue-500/90 to-blue-700/90 rounded-b-[2px] shadow-sm"></div>
                {/* Clapper top */}
                <div className="absolute inset-x-[3px] top-[1px] -translate-y-[60%] h-[30%] bg-gradient-to-br from-blue-400/90 to-blue-600/90 
                              origin-bottom-left transform -rotate-8 group-hover:-rotate-[20deg] transition-all duration-500 ease-out">
                  {/* Stripes */}
                  <div className="absolute inset-0 flex justify-around items-center px-[2px]">
                    <div className="w-px h-[65%] bg-white/50"></div>
                    <div className="w-px h-[65%] bg-white/50"></div>
                    <div className="w-px h-[65%] bg-white/50"></div>
                    <div className="w-px h-[65%] bg-white/50"></div>
                    <div className="w-px h-[65%] bg-white/50"></div>
                    <div className="w-px h-[65%] bg-white/50"></div>
                  </div>
                </div>
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 
                         hover:from-blue-300 hover:via-blue-400 hover:to-blue-500 transition-all duration-300">
                Film Finder
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              <Link 
                href="/" 
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-300 hover:text-white 
                           hover:bg-white/[0.05] transition-all duration-300"
              >
                <FiHome className="w-4 h-4" />
                <span>Home</span>
              </Link>
              <Link 
                href="/movies" 
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-300 hover:text-white 
                           hover:bg-white/[0.05] transition-all duration-300"
              >
                <FiFilm className="w-4 h-4" />
                <span>Movies</span>
              </Link>
              <Link 
                href="/about" 
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-300 hover:text-white 
                           hover:bg-white/[0.05] transition-all duration-300"
              >
                <FiInfo className="w-4 h-4" />
                <span>About</span>
              </Link>
            </div>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <ProfileDropdown />
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="px-4 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/[0.05] 
                             transition-all duration-300"
                >
                  Login
                </Link>
                <Link 
                  href="/register" 
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 
                             hover:from-blue-600 hover:to-blue-700 text-white transition-all duration-300 
                             shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-white/[0.05] transition-all duration-300"
          >
            {isMobileMenuOpen ? (
              <FiX className="w-6 h-6 text-gray-300" />
            ) : (
              <FiMenu className="w-6 h-6 text-gray-300" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-[#0f172a] shadow-xl border-b border-white/5 
                        py-4 animate-in slide-in-from-top-2 backdrop-blur-xl">
            <div className="space-y-2 px-4">
              <Link 
                href="/" 
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-gray-300 hover:text-white 
                           hover:bg-white/[0.05] transition-all duration-300 w-full"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FiHome className="w-5 h-5" />
                <span>Home</span>
              </Link>
              <Link 
                href="/movies" 
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-gray-300 hover:text-white 
                           hover:bg-white/[0.05] transition-all duration-300 w-full"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FiFilm className="w-5 h-5" />
                <span>Movies</span>
              </Link>
              <Link 
                href="/about" 
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-gray-300 hover:text-white 
                           hover:bg-white/[0.05] transition-all duration-300 w-full"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FiInfo className="w-5 h-5" />
                <span>About</span>
              </Link>

              {/* Mobile Auth Buttons */}
              <div className="pt-4 mt-2 border-t border-white/10 space-y-2">
                {isLoggedIn ? (
                  <>
                    <Link 
                      href="/profile" 
                      className="flex items-center gap-2 px-4 py-3 rounded-xl text-gray-300 hover:text-white 
                                hover:bg-white/[0.05] transition-all duration-300 w-full"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link 
                      href="/watchlist" 
                      className="flex items-center gap-2 px-4 py-3 rounded-xl text-gray-300 hover:text-white 
                                hover:bg-white/[0.05] transition-all duration-300 w-full"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Watchlist
                    </Link>
                    <Link 
                      href="/ratings" 
                      className="flex items-center gap-2 px-4 py-3 rounded-xl text-gray-300 hover:text-white 
                                hover:bg-white/[0.05] transition-all duration-300 w-full"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Ratings
                    </Link>
                    <Link 
                      href="/recommendations" 
                      className="flex items-center gap-2 px-4 py-3 rounded-xl text-gray-300 hover:text-white 
                                hover:bg-white/[0.05] transition-all duration-300 w-full"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Recommendations
                    </Link>
                    <button
                      onClick={async (e) => {
                        e.preventDefault();
                        await supabase.auth.signOut();
                        setIsMobileMenuOpen(false);
                        router.push('/');
                      }}
                      className="flex items-center gap-2 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 
                                hover:bg-red-500/10 transition-all duration-300 w-full"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      href="/login" 
                      className="flex items-center justify-center px-4 py-3 rounded-xl text-gray-300 
                                hover:text-white hover:bg-white/[0.05] transition-all duration-300 w-full"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link 
                      href="/register" 
                      className="flex items-center justify-center px-4 py-3 rounded-xl bg-gradient-to-r 
                                from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white 
                                transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 w-full"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 