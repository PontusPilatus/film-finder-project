import React from 'react';
import Link from 'next/link';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold">Film Finder</span>
          </Link>
          <div className="nav-links space-x-6">
            <Link href="/movies" className="hover:text-accent-color transition-colors">
              Browse
            </Link>
            <Link href="/watchlist" className="hover:text-accent-color transition-colors">
              Watchlist
            </Link>
            <Link href="/recommendations" className="hover:text-accent-color transition-colors">
              Recommendations
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header; 