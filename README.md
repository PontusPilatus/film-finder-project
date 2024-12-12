# 🎬 Film Finder

A modern web application for discovering, rating, and tracking movies. Built with Next.js and Supabase, featuring an AI-powered recommendation system.

🌐 **Live Demo**: [https://film-finder-project.vercel.app](https://film-finder-project.vercel.app)

## ✨ Features

- 🔍 Browse and search movies
- ⭐ Rate movies and track your ratings
- 🏷️ Filter movies by genre, year, and rating
- 📊 View community ratings and statistics
- 📌 Save movies to your watchlist
- 🎯 Get personalized movie recommendations using hybrid AI model
- 🌙 Beautiful dark mode UI with glass-morphism design
- 🤖 Advanced recommendation system using SVD and content-based filtering
- 🆕 Smart handling of cold-start problem for new users

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 13 (App Router)
- **Language**: TypeScript
- **UI Library**: React 18
- **Styling**: Tailwind CSS with custom glass-morphism effects
- **Icons**: React Icons, HeroIcons

### Backend & Data
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **ML Libraries**: TensorFlow.js, NumPy, Scikit-learn, Pandas
- **API**: REST API with Next.js API routes

### Deployment
- **Hosting**: Vercel
- **Database Hosting**: Supabase Cloud
- **CI/CD**: Vercel's GitHub Integration

## 🛠 System Architecture

The application uses the following main components:
- `movies`: Movie information and metadata storage
- `ratings`: User rating system and tracking
- `watchlist`: Personal movie collection management
- `users`: User profiles and preferences
- `recommendations`: Hybrid recommendation system combining collaborative and content-based filtering

## 🎨 UI Features

- Modern glass-morphism design
- Responsive layout for all devices
- Smooth animations and transitions
- Interactive rating system
- Custom select components
- Dynamic filtering and sorting

## 🚀 Implementation Details

The recommendation system implements:
- SVD (Singular Value Decomposition) for collaborative filtering
- Content-based filtering using movie metadata
- Hybrid approach combining both methods
- Cold-start handling for new users
- Real-time rating updates and recommendations