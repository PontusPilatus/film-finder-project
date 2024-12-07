'use client'
import Link from 'next/link';
import { FiFilm, FiSmile, FiHeart, FiSearch, FiStar, FiBookmark } from 'react-icons/fi';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pb-12 overflow-hidden">
        <div className="absolute inset-0 hero-gradient opacity-40"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-background-dark/5 to-transparent"></div>
        
        <div className="relative container-wrapper">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center pt-8 sm:pt-12 md:pt-16">
            {/* Left Column - Text Content */}
            <div className="space-y-6 text-center lg:text-left fade-in-up">
              <div className="space-y-3">
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-100">
                  Discover Your Next
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600 block mt-2">
                    Favorite Movie
                  </span>
                </h1>
                <p className="text-lg text-gray-300">
                  Your personal companion for finding and tracking the perfect films for every moment
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link href="/movies" className="btn-primary">
                  Start Exploring
                </Link>
                <Link href="/about" className="btn-secondary">
                  Learn More
                </Link>
              </div>
            </div>

            {/* Right Column - Feature Cards */}
            <div className="grid gap-3 sm:grid-cols-2 lg:gap-4 fade-in-up animation-delay-150">
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
              ].map((feature) => (
                <div 
                  key={feature.title}
                  className="card group p-4 backdrop-blur-sm bg-white/5 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <feature.icon className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-100 group-hover:text-blue-400 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container-wrapper py-16">
        <div className="text-center space-y-12">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
              Explore Movies By Genre
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
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
            ].map(({ name, icon: Icon, genres, description, sortBy }) => (
              <Link 
                href={{
                  pathname: '/movies',
                  query: {
                    genres: genres.join(','),
                    sortBy: sortBy
                  }
                }}
                key={name} 
                className="card group hover:scale-[1.02] transition-transform"
              >
                <div className="relative space-y-4">
                  <div className="w-12 h-12 mx-auto rounded-full bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="text-2xl font-semibold text-gray-100 group-hover:text-blue-400 transition-colors text-center">
                    {name}
                  </div>
                  <p className="text-gray-400 text-center">
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