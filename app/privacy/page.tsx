'use client';

import { FiShield } from 'react-icons/fi';

export default function Privacy() {
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
              <span className="hero-text inline-block leading-tight">
                Privacy Policy
              </span>
            </h1>
            <p className="text-xl text-gray-300/90 mb-8 max-w-xl mx-auto">
              How we handle and protect your data
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="container-wrapper -mt-8 relative z-10 mb-16">
        <div className="max-w-3xl mx-auto">
          <div className="glass-card p-8 shadow-[0_8px_32px_rgba(0,0,0,0.24)] space-y-8">
            {/* Introduction */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 
                            flex items-center justify-center flex-shrink-0">
                <FiShield className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-100 mb-2">Introduction</h2>
                <p className="text-gray-300 leading-relaxed">
                  At Film Finder, we take your privacy seriously. This Privacy Policy explains how we collect, 
                  use, and protect your personal information when you use our service.
                </p>
              </div>
            </div>

            {/* Information We Collect */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-100">Information We Collect</h3>
              <div className="space-y-2 text-gray-300">
                <p>We collect the following types of information:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Email address and account information when you register</li>
                  <li>Movie ratings and preferences you provide</li>
                  <li>Viewing history and interactions with the platform</li>
                  <li>Technical information about your device and how you use our service</li>
                </ul>
              </div>
            </div>

            {/* How We Use Your Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-100">How We Use Your Information</h3>
              <div className="space-y-2 text-gray-300">
                <p>We use your information to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide personalized movie recommendations</li>
                  <li>Improve our service and user experience</li>
                  <li>Send important updates about our service</li>
                  <li>Protect against fraud and unauthorized access</li>
                </ul>
              </div>
            </div>

            {/* Data Security */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-100">Data Security</h3>
              <p className="text-gray-300 leading-relaxed">
                We implement appropriate security measures to protect your personal information. 
                This includes encryption, secure servers, and regular security audits.
              </p>
            </div>

            {/* Your Rights */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-100">Your Rights</h3>
              <div className="space-y-2 text-gray-300">
                <p>You have the right to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate information</li>
                  <li>Request deletion of your information</li>
                  <li>Opt-out of marketing communications</li>
                </ul>
              </div>
            </div>

            {/* Last Updated */}
            <div className="pt-4 border-t border-white/5">
              <p className="text-sm text-gray-400">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 