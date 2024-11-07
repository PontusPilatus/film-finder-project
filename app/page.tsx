import Link from 'next/link';

export default function Home() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-8 py-16">
        <h1 className="text-5xl font-bold text-gray-100">
          Welcome to <span className="text-primary">Film Finder</span>
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Discover, explore, and keep track of your favorite movies. Your perfect movie night is just a click away.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/movies" className="btn-primary">
            Browse Movies
          </Link>
          <Link 
            href="/about" 
            className="px-4 py-2 border border-gray-700 text-gray-300 rounded-lg hover:border-primary hover:text-primary transition-colors duration-200"
          >
            Learn More
          </Link>
        </div>
      </div>

      {/* Featured Section */}
      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-center text-gray-100">Featured Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['Action', 'Comedy', 'Drama'].map((category) => (
            <div key={category} className="card text-center group cursor-pointer">
              <div className="text-2xl font-semibold text-gray-100 group-hover:text-primary transition-colors">
                {category}
              </div>
              <p className="text-gray-400 mt-2">
                Explore the best {category.toLowerCase()} films
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 