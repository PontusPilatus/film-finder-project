'use client'
import Link from 'next/link';
import { FiFilm, FiSmile, FiHeart, FiSearch, FiStar, FiBookmark } from 'react-icons/fi';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-background-dark/5 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-background-dark/10 to-transparent animate-pulse-slow"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
        
        <div className="relative container-wrapper">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              <span className="hero-text inline-block">
                Your Next Movie
              </span>
              <span className="hero-text inline-block mt-2">
                Awaits You
              </span>
            </h1>
            <p className="text-xl text-gray-300/90 mb-8 max-w-xl mx-auto">
              Your personal companion for finding and tracking the perfect films for every moment
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/movies" className="btn-primary group">
                Start Exploring
                <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <Link href="/about" className="btn-secondary">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container-wrapper -mt-8 relative z-10 mb-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:gap-5">
          {[
            {
              icon: FiSearch,
              title: 'Smart Search',
              description: 'Find movies with advanced filtering'
            },
            {
              icon: FiStar,
              title: 'Rate Movies',
              description: 'Share your ratings and reviews'
            },
            {
              icon: FiBookmark,
              title: 'Watchlist',
              description: 'Save movies to watch later'
            },
            {
              icon: FiFilm,
              title: 'Discover',
              description: 'Get AI-powered recommendations'
            }
          ].map((feature, index) => (
            <div 
              key={feature.title}
              className="glass-card group p-6 hover:bg-white/[0.03] transition-all duration-300 fade-in-up"
              style={{ animationDelay: `${(index + 1) * 150}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 
                              flex items-center justify-center group-hover:scale-110 transition-all duration-300 hover-glow">
                  <feature.icon className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-100 group-hover:text-blue-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 group-hover:text-gray-300 transition-colors mt-1">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="container-wrapper py-16 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/20 to-transparent opacity-40"></div>
        <div className="relative text-center space-y-12">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold hero-text">
              Explore Movies By Genre
            </h2>
            <p className="text-xl text-gray-300/90 max-w-2xl mx-auto">
              Discover films across every genre, from timeless classics to modern masterpieces
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { 
                name: 'Action & Adventure', 
                icon: FiFilm, 
                genres: ['Action', 'Adventure'],
                description: 'Epic adventures and thrilling sequences',
                sortBy: 'rating_desc'
              },
              { 
                name: 'Drama & Romance', 
                icon: FiHeart, 
                genres: ['Drama', 'Romance'],
                description: 'Moving stories that touch the heart',
                sortBy: 'rating_desc'
              },
              { 
                name: 'Sci-Fi & Fantasy', 
                icon: FiSmile, 
                genres: ['Science Fiction', 'Fantasy'],
                description: 'Journey to incredible new worlds',
                sortBy: 'rating_desc'
              }
            ].map(({ name, icon: Icon, genres, description, sortBy }, index) => (
              <Link 
                href={{
                  pathname: '/movies',
                  query: {
                    genres: genres.join(','),
                    sortBy: sortBy
                  }
                }}
                key={name} 
                className="glass-card group p-8 hover:scale-[1.02] transition-all duration-300 fade-in-up"
                style={{ animationDelay: `${(index + 1) * 150}ms` }}
              >
                <div className="relative space-y-6">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 
                                flex items-center justify-center group-hover:scale-110 transition-transform duration-300 hover-glow">
                    <Icon className="w-8 h-8 text-blue-400 group-hover:text-blue-300 transition-colors" />
                  </div>
                  <div className="text-2xl font-bold text-gray-100 group-hover:text-blue-400 transition-colors">
                    {name}
                  </div>
                  <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                    {description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
} 