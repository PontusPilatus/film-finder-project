'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiUser, FiStar, FiBookmark, FiThumbsUp, FiLogOut } from 'react-icons/fi';
import { supabase } from '../lib/supabase';

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  console.log('ProfileDropdown rendered, isOpen:', isOpen);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('Profile button clicked');
    setIsOpen(!isOpen);
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleClick}
        type="button"
        className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-blue-500/10 transition-colors"
      >
        <FiUser className="w-5 h-5" />
        <span>Profile</span>
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-48 rounded-lg bg-gray-900 border border-blue-500/10 shadow-lg overflow-hidden z-50"
          style={{ minWidth: '12rem' }}
        >
          <div className="py-1">
            <Link 
              href="/profile" 
              className="dropdown-item"
              onClick={() => setIsOpen(false)}
            >
              <FiUser className="w-4 h-4" />
              <span>Profile Settings</span>
            </Link>
            
            <Link 
              href="/ratings" 
              className="dropdown-item"
              onClick={() => setIsOpen(false)}
            >
              <FiStar className="w-4 h-4" />
              <span>My Ratings</span>
            </Link>
            
            <Link 
              href="/watchlist" 
              className="dropdown-item"
              onClick={() => setIsOpen(false)}
            >
              <FiBookmark className="w-4 h-4" />
              <span>Watchlist</span>
            </Link>
            
            <Link 
              href="/recommendations" 
              className="dropdown-item"
              onClick={() => setIsOpen(false)}
            >
              <FiThumbsUp className="w-4 h-4" />
              <span>Recommendations</span>
            </Link>
            
            <button
              onClick={handleSignOut}
              className="dropdown-item text-red-400 hover:bg-red-500/10 w-full text-left"
            >
              <FiLogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 