'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import { useRouter } from 'next/navigation';
import ProfileDropdown from '@/app/components/ProfileDropdown';
import { FiHome, FiFilm, FiInfo } from 'react-icons/fi';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
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
              className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 
                         hover:from-blue-300 hover:via-blue-400 hover:to-blue-500 transition-all duration-300"
            >
              Film Finder
            </Link>

            {/* Navigation */}
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

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
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
        </div>
      </div>
    </nav>
  );
} 