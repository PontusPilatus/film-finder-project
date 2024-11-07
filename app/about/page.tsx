export default function About() {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-100">About Film Finder</h1>
        <p className="text-xl text-gray-300">
          Your trusted companion in discovering the world of cinema
        </p>
      </div>

      {/* Mission Section */}
      <div className="card">
        <h2 className="text-2xl font-semibold mb-4 text-gray-100">Our Mission</h2>
        <p className="text-gray-300 leading-relaxed">
          Film Finder was created with a simple goal: to help movie enthusiasts discover and explore 
          the vast world of cinema. We believe that everyone deserves to find films that move, 
          inspire, and entertain them.
        </p>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="text-primary text-4xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold mb-2 text-gray-100">Curated Selection</h3>
          <p className="text-gray-300">
            Carefully selected movies across all genres and eras
          </p>
        </div>

        <div className="card text-center">
          <div className="text-primary text-4xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2 text-gray-100">Smart Search</h3>
          <p className="text-gray-300">
            Advanced filtering to find exactly what you're looking for
          </p>
        </div>

        <div className="card text-center">
          <div className="text-primary text-4xl mb-4">💫</div>
          <h3 className="text-xl font-semibold mb-2 text-gray-100">Personalized</h3>
          <p className="text-gray-300">
            Recommendations tailored to your taste
          </p>
        </div>
      </div>

      {/* Developer Section */}
      <div className="card">
        <h2 className="text-2xl font-semibold mb-6 text-gray-100">Meet the Developer</h2>
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 bg-gray-700 rounded-full"></div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-100">Pontus Paulsson</h3>
            <p className="text-gray-300">Full Stack Developer</p>
            <a 
              href="https://www.linkedin.com/in/paulssonpontus/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-primary hover:text-primary-dark transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <span>Connect on LinkedIn</span>
            </a>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="card text-center">
        <h2 className="text-2xl font-semibold mb-4 text-gray-100">Get in Touch</h2>
        <p className="text-gray-300 mb-6">
          Have questions or suggestions? I'd love to hear from you!
        </p>
        <a 
          href="mailto:contact@filmfinder.com" 
          className="btn-primary inline-block"
        >
          Contact Me
        </a>
      </div>
    </div>
  )
} 