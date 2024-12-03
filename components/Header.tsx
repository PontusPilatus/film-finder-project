'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FiMenu, FiX, FiUser } from 'react-icons/fi';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="header-content h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600">
            Film Finder
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          <Link href="/" className="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-all">
            Home
          </Link>
          <Link href="/movies" className="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-all">
            Movies
          </Link>
          <Link href="/about" className="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-all">
            About
          </Link>
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          <Link 
            href="/profile" 
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white transition-all"
          >
            <FiUser className="w-4 h-4" />
            <span className="hidden sm:inline">Profile</span>
          </Link>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <FiX className="w-5 h-5 text-gray-300" />
            ) : (
              <FiMenu className="w-5 h-5 text-gray-300" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[var(--header-bg)] border-b border-white/10 animate-fadeIn">
          <nav className="flex flex-col py-2">
            <Link 
              href="/" 
              className="px-6 py-3 text-gray-300 hover:text-white hover:bg-white/5 transition-all"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/movies" 
              className="px-6 py-3 text-gray-300 hover:text-white hover:bg-white/5 transition-all"
              onClick={() => setIsMenuOpen(false)}
            >
              Movies
            </Link>
            <Link 
              href="/about" 
              className="px-6 py-3 text-gray-300 hover:text-white hover:bg-white/5 transition-all"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header; 