import { FiTarget, FiSearch, FiStar, FiMail, FiLinkedin } from 'react-icons/fi';

export default function About() {
  return (
    <div className="min-h-screen space-y-24">
      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 hero-gradient opacity-30"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-background-dark/5 to-transparent"></div>
        
        <div className="relative container-wrapper text-center space-y-6">
          <h1 className="hero-text">About Film Finder</h1>
          <p className="hero-subtitle">
            Your trusted companion in discovering the world of cinema
          </p>
        </div>

        <div className="absolute -bottom-48 left-0 right-0 h-96 bg-gradient-to-t from-[#0a1929] to-transparent pointer-events-none"></div>
      </section>

      {/* Mission Section */}
      <section className="container-wrapper max-w-4xl">
        <div className="card backdrop-blur-lg">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600 mb-6">
            Our Mission
          </h2>
          <p className="text-gray-300 leading-relaxed text-lg">
            Film Finder was created with a simple goal: to help movie enthusiasts discover and explore 
            the vast world of cinema. We believe that everyone deserves to find films that move, 
            inspire, and entertain them.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="container-wrapper max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card group cursor-pointer">
            <div className="relative space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FiTarget className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-100 group-hover:text-blue-400 transition-colors text-center">
                Curated Selection
              </h3>
              <p className="text-gray-400 text-center">
                Carefully selected movies across all genres and eras
              </p>
            </div>
          </div>

          <div className="card group cursor-pointer">
            <div className="relative space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FiSearch className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-100 group-hover:text-blue-400 transition-colors text-center">
                Smart Search
              </h3>
              <p className="text-gray-400 text-center">
                Advanced filtering to find exactly what you're looking for
              </p>
            </div>
          </div>

          <div className="card group cursor-pointer">
            <div className="relative space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FiStar className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-100 group-hover:text-blue-400 transition-colors text-center">
                Personalized
              </h3>
              <p className="text-gray-400 text-center">
                Recommendations tailored to your taste
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Developer Section */}
      <section className="container-wrapper max-w-4xl">
        <div className="card backdrop-blur-lg">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600 mb-8">
            Meet the Developer
          </h2>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <span className="text-4xl">PP</span>
            </div>
            <div className="space-y-4 text-center md:text-left">
              <h3 className="text-2xl font-semibold text-gray-100">Pontus Paulsson</h3>
              <p className="text-gray-300 text-lg">Full Stack Developer</p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <a 
                  href="https://www.linkedin.com/in/paulssonpontus/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all duration-200"
                >
                  <FiLinkedin className="w-5 h-5" />
                  <span>Connect on LinkedIn</span>
                </a>
                <a 
                  href="mailto:contact@filmfinder.com"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all duration-200"
                >
                  <FiMail className="w-5 h-5" />
                  <span>Send Email</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 