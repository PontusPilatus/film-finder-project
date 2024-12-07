# 🎬 Film Finder

A modern web application for discovering, rating, and tracking movies. Built with Next.js and Supabase.

## ✨ Features

- 🔍 Browse and search movies
- ⭐ Rate movies and track your ratings
- 🏷️ Filter movies by genre, year, and rating
- 📊 View community ratings and statistics
- 📌 Save movies to your watchlist
- 🎯 Get personalized movie recommendations
- 🌙 Beautiful dark mode UI with glass-morphism design

## 🚀 Tech Stack

- **Frontend**: Next.js 13 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication)
- **Styling**: Tailwind CSS with custom glass-morphism effects
- **Icons**: React Icons
- **Deployment**: Vercel (recommended)

## 🛠️ Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/yourusername/film-finder.git
cd film-finder
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📝 Database Schema

The application uses the following main tables in Supabase:
- `movies`: Movie information and metadata
- `ratings`: User ratings for movies
- `watchlist`: User's saved movies
- `users`: User profiles and preferences

## 🎨 UI Features

- Modern glass-morphism design
- Responsive layout for all devices
- Smooth animations and transitions
- Interactive rating system
- Custom select components
- Dynamic filtering and sorting