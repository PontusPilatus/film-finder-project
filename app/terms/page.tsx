'use client';

import { FiFileText } from 'react-icons/fi';

export default function Terms() {
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
                Terms of Service
              </span>
            </h1>
            <p className="text-xl text-gray-300/90 mb-8 max-w-xl mx-auto">
              Guidelines for using Film Finder
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
                <FiFileText className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-100 mb-2">Agreement to Terms</h2>
                <p className="text-gray-300 leading-relaxed">
                  By accessing or using Film Finder, you agree to be bound by these Terms of Service. 
                  If you disagree with any part of these terms, you may not access the service.
                </p>
              </div>
            </div>

            {/* Account Terms */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-100">Account Terms</h3>
              <div className="space-y-2 text-gray-300">
                <p>When creating an account, you agree to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the security of your account</li>
                  <li>Not share your account credentials</li>
                  <li>Notify us of any unauthorized use</li>
                </ul>
              </div>
            </div>

            {/* Acceptable Use */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-100">Acceptable Use</h3>
              <div className="space-y-2 text-gray-300">
                <p>You agree not to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Use the service for any illegal purposes</li>
                  <li>Post or transmit harmful or malicious content</li>
                  <li>Attempt to gain unauthorized access</li>
                  <li>Interfere with or disrupt the service</li>
                </ul>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-100">Content and Reviews</h3>
              <p className="text-gray-300 leading-relaxed">
                By posting ratings, reviews, or other content, you grant Film Finder a non-exclusive, 
                worldwide, royalty-free license to use, modify, and display that content. You are 
                responsible for any content you post and must have the right to share it.
              </p>
            </div>

            {/* Service Modifications */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-100">Service Modifications</h3>
              <p className="text-gray-300 leading-relaxed">
                We reserve the right to modify, suspend, or discontinue any part of the service 
                at any time. We may also update these terms by posting a new version, and your 
                continued use of the service constitutes acceptance of any changes.
              </p>
            </div>

            {/* Limitation of Liability */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-100">Limitation of Liability</h3>
              <p className="text-gray-300 leading-relaxed">
                Film Finder is provided "as is" without warranties of any kind. We are not liable 
                for any damages arising from your use of the service or any content posted by users.
              </p>
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