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
                  title: 'Discover',
                  description: 'Find new movies across all genres'
                },
                {
                  icon: FiStar,
                  title: 'Rate & Review',
                  description: 'Share your movie experiences'
                },
                {
                  icon: FiBookmark,
                  title: 'Track',
                  description: 'Build your personal watchlist'
                },
                {
                  icon: FiFilm,
                  title: 'Explore',
                  description: 'Get personalized recommendations'
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
              Popular Categories
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Explore our curated collection of movies across different genres
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Action', icon: FiFilm, description: 'Epic adventures and thrilling moments' },
              { name: 'Comedy', icon: FiSmile, description: 'Laugh-out-loud entertainment' },
              { name: 'Drama', icon: FiHeart, description: 'Compelling stories that move you' }
            ].map(({ name, icon: Icon, description }) => (
              <div key={name} className="card group cursor-pointer">
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
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
} 