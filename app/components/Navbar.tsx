'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import ProfileDropdown from './ProfileDropdown';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    console.log('Navbar useEffect running');
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', !!session);
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function checkUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('User check result:', !!user, user?.email);
      setIsLoggedIn(!!user);
    } catch (error) {
      console.error('Error checking user:', error);
    }
  }

  console.log('Navbar rendering, isLoggedIn:', isLoggedIn);

  return (
    <header className="header">
      <div className="header-content">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold text-white">
            MovieMatch
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/explore" className="nav-link">
              Explore
            </Link>
            <Link href="/search" className="nav-link">
              Search
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              {console.log('About to render ProfileDropdown')}
              <ProfileDropdown />
            </>
          ) : (
            <>
              <Link href="/login" className="nav-link">
                Login
              </Link>
              <Link href="/signup" className="btn-primary">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
} 