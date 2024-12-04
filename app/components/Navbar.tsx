'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import { useRouter } from 'next/navigation';
import ProfileDropdown from '@/app/components/ProfileDropdown';

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
    <header className="bg-background-dark/80 backdrop-blur-lg border-b border-white/10 relative z-50">
      <div className="container-wrapper py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600">
              Film Finder
            </Link>
            
            <nav className="hidden md:flex items-center gap-6">
              <Link 
                href="/" 
                className="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-all"
              >
                Home
              </Link>
              <Link 
                href="/movies" 
                className="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-all"
              >
                Movies
              </Link>
              <Link 
                href="/about" 
                className="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-all"
              >
                About Us
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <ProfileDropdown />
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                >
                  Login
                </Link>
                <Link 
                  href="/signup" 
                  className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-all"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 