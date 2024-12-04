'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiChevronDown } from 'react-icons/fi';
import { supabase } from '../lib/supabase';

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSignOut = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await supabase.auth.signOut();
      setIsOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
  };

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-all"
      >
        <span>Account</span>
        <FiChevronDown className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-48 rounded-lg bg-[#0f172a] border border-white/10 shadow-lg z-[100]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="py-2">
            <Link
              href="/profile"
              className="block px-4 py-2 text-gray-300 hover:bg-blue-500/10 hover:text-white transition-colors"
              onClick={handleLinkClick}
            >
              Profile
            </Link>
            <Link
              href="/watchlist"
              className="block px-4 py-2 text-gray-300 hover:bg-blue-500/10 hover:text-white transition-colors"
              onClick={handleLinkClick}
            >
              Watchlist
            </Link>
            <Link
              href="/ratings"
              className="block px-4 py-2 text-gray-300 hover:bg-blue-500/10 hover:text-white transition-colors"
              onClick={handleLinkClick}
            >
              Ratings
            </Link>
            <Link
              href="/recommendations"
              className="block px-4 py-2 text-gray-300 hover:bg-blue-500/10 hover:text-white transition-colors"
              onClick={handleLinkClick}
            >
              Recommendations
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full text-left px-4 py-2 text-gray-300 hover:bg-blue-500/10 hover:text-white transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 