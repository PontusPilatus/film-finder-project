'use client';

import { 
  FiTarget, 
  FiSearch, 
  FiStar, 
  FiMail, 
  FiLinkedin, 
  FiGithub, 
  FiCode, 
  FiCpu, 
  FiDatabase, 
  FiLayers 
} from 'react-icons/fi';

export default function About() {
  const features = [
    {
      icon: FiTarget,
      title: 'Curated Selection',
      description: 'Carefully selected movies across all genres and eras'
    },
    {
      icon: FiSearch,
      title: 'Smart Search',
      description: "Advanced filtering to find exactly what you're looking for"
    },
    {
      icon: FiStar,
      title: 'Personalized',
      description: 'Recommendations tailored to your taste'
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Create Account",
      description: "Sign up for free to start your movie journey"
    },
    {
      number: "02",
      title: "Rate Movies",
      description: "Rate movies you've watched to improve recommendations"
    },
    {
      number: "03",
      title: "Get Recommendations",
      description: "Receive personalized movie suggestions"
    },
    {
      number: "04",
      title: "Discover",
      description: "Explore new films and expand your horizons"
    }
  ];

  const techStack = [
    { icon: FiCode, label: "Next.js" },
    { icon: FiDatabase, label: "PostgreSQL" },
    { icon: FiCpu, label: "AI Models" },
    { icon: FiLayers, label: "TailwindCSS" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-background-dark/5 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-background-dark/10 to-transparent animate-pulse-slow"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>

        <div className="relative container-wrapper">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="hero-text inline-block">
                About Film Finder
              </span>
            </h1>
            <p className="text-xl text-gray-300/90 mb-8 max-w-xl mx-auto">
              Your trusted companion in discovering the world of cinema
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="container-wrapper -mt-8 relative z-10 mb-16">
        <div className="glass-card p-8 shadow-[0_8px_32px_rgba(0,0,0,0.24)]">
          <h2 className="text-3xl font-bold hero-text mb-6">
            Our Mission
          </h2>
          <p className="text-gray-300/90 leading-relaxed text-lg">
            Film Finder was created with a simple goal: to help movie enthusiasts discover and explore
            the vast world of cinema. We believe that everyone deserves to find films that move,
            inspire, and entertain them. Using advanced AI technology and comprehensive movie data,
            we provide personalized recommendations that go beyond the obvious choices.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="container-wrapper py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="glass-card group p-8 hover:bg-white/[0.03] transition-all duration-300 fade-in-up"
              style={{ animationDelay: `${(index + 1) * 150}ms` }}
            >
              <div className="space-y-6 text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 
                              flex items-center justify-center group-hover:scale-110 transition-all duration-300 hover-glow">
                  <feature.icon className="w-8 h-8 text-blue-400 group-hover:text-blue-300 transition-colors" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-100 group-hover:text-blue-400 transition-colors mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container-wrapper py-16 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/20 to-transparent opacity-40"></div>
        <div className="relative space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold hero-text">
              How It Works
            </h2>
            <p className="text-xl text-gray-300/90 max-w-2xl mx-auto">
              Get started with Film Finder in four simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className="glass-card p-8 group hover:bg-white/[0.03] transition-all duration-300 fade-in-up"
                style={{ animationDelay: `${(index + 1) * 150}ms` }}
              >
                <div className="space-y-4">
                  <div className="text-6xl font-bold bg-gradient-to-r from-blue-400/20 to-blue-600/20 
                                group-hover:from-blue-400/30 group-hover:to-blue-600/30 
                                bg-clip-text text-transparent transition-colors">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-bold text-gray-100 group-hover:text-blue-400 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="container-wrapper py-16">
        <div className="glass-card p-8 space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold hero-text">
              Built With Modern Tech
            </h2>
            <p className="text-gray-300/90">
              Powered by the latest technologies for the best experience
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {techStack.map((tech, index) => (
              <div 
                key={index} 
                className="glass-card group p-6 hover:bg-white/[0.03] transition-all duration-300 fade-in-up"
                style={{ animationDelay: `${(index + 1) * 150}ms` }}
              >
                <div className="space-y-4 text-center">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 
                                flex items-center justify-center group-hover:scale-110 transition-all duration-300 hover-glow">
                    <tech.icon className="w-6 h-6 text-blue-400 group-hover:text-blue-300 transition-colors" />
                  </div>
                  <p className="text-gray-300 font-medium group-hover:text-blue-400 transition-colors">{tech.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Developer Section */}
      <section className="container-wrapper py-16">
        <div className="glass-card p-8">
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold hero-text mb-4">
                Meet the Developer
              </h2>
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className="w-32 h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-500 
                            flex items-center justify-center shadow-lg shadow-blue-500/25">
                <span className="text-4xl font-bold text-white">PP</span>
              </div>
              <div className="space-y-4 text-center md:text-left flex-grow">
                <h3 className="text-2xl font-bold text-gray-100">Pontus Paulsson</h3>
                <p className="text-xl text-gray-300/90">Full Stack Developer</p>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <a
                    href="https://www.linkedin.com/in/paulssonpontus/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-card group px-4 py-2 hover:bg-white/[0.03] transition-all duration-300 
                             inline-flex items-center gap-2 hover:scale-105"
                  >
                    <FiLinkedin className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
                    <span className="text-gray-300 group-hover:text-white transition-colors">Connect on LinkedIn</span>
                  </a>
                  <a
                    href="https://github.com/PontusPilatus"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-card group px-4 py-2 hover:bg-white/[0.03] transition-all duration-300 
                             inline-flex items-center gap-2 hover:scale-105"
                  >
                    <FiGithub className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
                    <span className="text-gray-300 group-hover:text-white transition-colors">View GitHub</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}