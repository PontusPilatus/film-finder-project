import React from 'react';
import Link from 'next/link';
import { FiGithub, FiTwitter, FiMail, FiHeart } from 'react-icons/fi';

const Footer: React.FC = () => {
  return (
    <footer className="mt-auto relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/20 to-blue-950/40"></div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>

      <div className="relative container-wrapper py-16">
        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* About Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-100">About</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Film Finder helps you discover and track movies you'll love, 
              powered by advanced AI recommendations.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-100">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/movies" 
                  className="text-gray-400 hover:text-blue-400 transition-colors duration-200 text-sm flex items-center gap-2"
                >
                  Browse Movies
                </Link>
              </li>
              <li>
                <Link 
                  href="/recommendations" 
                  className="text-gray-400 hover:text-blue-400 transition-colors duration-200 text-sm flex items-center gap-2"
                >
                  Recommendations
                </Link>
              </li>
              <li>
                <Link 
                  href="/about" 
                  className="text-gray-400 hover:text-blue-400 transition-colors duration-200 text-sm flex items-center gap-2"
                >
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-100">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/privacy" 
                  className="text-gray-400 hover:text-blue-400 transition-colors duration-200 text-sm flex items-center gap-2"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  href="/terms" 
                  className="text-gray-400 hover:text-blue-400 transition-colors duration-200 text-sm flex items-center gap-2"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-100">Connect</h3>
            <div className="flex gap-4">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 
                          flex items-center justify-center hover:scale-110 transition-all duration-300 hover-glow"
              >
                <FiGithub className="w-5 h-5 text-blue-400" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 
                          flex items-center justify-center hover:scale-110 transition-all duration-300 hover-glow"
              >
                <FiTwitter className="w-5 h-5 text-blue-400" />
              </a>
              <a 
                href="mailto:contact@filmfinder.com"
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 
                          flex items-center justify-center hover:scale-110 transition-all duration-300 hover-glow"
              >
                <FiMail className="w-5 h-5 text-blue-400" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-white/5">
          <p className="text-center text-gray-400 text-sm flex items-center justify-center gap-2">
            Made with <FiHeart className="w-4 h-4 text-red-400" /> by Film Finder © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 