'use client'
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check auth state on mount and auth changes
    supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
    });

    // Initial auth check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-background-light border-b border-gray-700 shadow-lg sticky top-0 z-50">
        <div className="container-wrapper py-4">
          <nav className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-primary hover:text-primary-dark transition-colors">
              Film Finder
            </Link>
            
            <ul className="flex items-center space-x-8">
              <li>
                <Link 
                  href="/" 
                  className="text-gray-300 hover:text-primary font-medium transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  href="/movies" 
                  className="text-gray-300 hover:text-primary font-medium transition-colors"
                >
                  Movies
                </Link>
              </li>
              <li>
                <Link 
                  href="/about" 
                  className="text-gray-300 hover:text-primary font-medium transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                {isLoggedIn ? (
                  <Link 
                    href="/profile" 
                    className="btn-primary"
                  >
                    Profile
                  </Link>
                ) : (
                  <Link 
                    href="/login" 
                    className="btn-primary"
                  >
                    Sign In
                  </Link>
                )}
              </li>
            </ul>
          </nav>
        </div>
      </header>
      
      <main className="container-wrapper py-8">
        {children}
      </main>
      
      <footer className="bg-background-light border-t border-gray-700">
        <div className="container-wrapper py-6 text-center text-gray-400">
          <p>© 2024 Film Finder. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
} 