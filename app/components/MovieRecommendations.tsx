'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiBookmark, FiCheck, FiZap, FiStar, FiTrendingUp } from 'react-icons/fi';
import { supabase } from '../lib/supabase';
import RatingComponent from './RatingComponent';

interface Recommendation {
  title: string;
  score: number;
  movieId: number;
  averageRating?: number;
  totalRatings?: number;
  genres?: string[];
}

interface ApiResponse {
  recommendations: Recommendation[];
  method: string;
  error?: string;
}

export default function MovieRecommendations({ userId }: { userId: number }) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [method, setMethod] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [watchlist, setWatchlist] = useState<Set<number>>(new Set());

  useEffect(() => {
    // Fetch watchlist status for all movies
    const fetchWatchlist = async () => {
      const { data, error } = await supabase
        .from('watchlist')
        .select('movie_id')
        .eq('user_id', userId);

      if (!error && data) {
        setWatchlist(new Set(data.map(item => item.movie_id)));
      }
    };

    if (userId) {
      fetchWatchlist();
    }
  }, [userId]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/recommendations/${userId}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.statusText}`);
        }

        const data: ApiResponse = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }

        setRecommendations(data.recommendations || []);
        setMethod(data.method);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError(err instanceof Error ? err.message : 'Failed to load recommendations');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchRecommendations();
    }
  }, [userId]);

  const handleWatchlistClick = async (e: React.MouseEvent, movieId: number) => {
    e.preventDefault();

    try {
      if (watchlist.has(movieId)) {
        // Remove from watchlist
        const { error } = await supabase
          .from('watchlist')
          .delete()
          .eq('user_id', userId)
          .eq('movie_id', movieId);

        if (error) throw error;
        setWatchlist(prev => {
          const next = new Set(prev);
          next.delete(movieId);
          return next;
        });
      } else {
        // Add to watchlist
        const { error } = await supabase
          .from('watchlist')
          .insert([{ user_id: userId, movie_id: movieId }]);

        if (error) throw error;
        setWatchlist(prev => {
          const next = new Set(prev);
          next.add(movieId);
          return next;
        });
      }
    } catch (error) {
      console.error('Error updating watchlist:', error);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-blue-400 border-t-transparent"></div>
        <p className="text-gray-400 animate-pulse text-lg">Finding the perfect movies for you...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 space-y-6">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-red-500/10 to-red-600/10 
                      flex items-center justify-center">
          <FiZap className="w-10 h-10 text-red-400/50" />
        </div>
        <div className="space-y-2">
          <p className="text-xl text-red-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl 
                     hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg shadow-red-500/25"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-16 space-y-6">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 
                      flex items-center justify-center">
          <FiStar className="w-10 h-10 text-blue-400/50" />
        </div>
        <div className="space-y-2">
          <p className="text-xl text-gray-400">No recommendations yet</p>
          <p className="text-gray-500">Rate more movies to get personalized recommendations!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {recommendations.map((movie, index) => (
        <Link
          key={movie.movieId}
          href={`/movies/${movie.movieId}`}
          className="block"
        >
          <div className="glass-card group hover:bg-white/[0.03] transition-all duration-300">
            {/* Top Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border-b border-white/5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 
                            flex items-center justify-center group-hover:scale-110 transition-all duration-300 hover-glow">
                <span className="text-blue-400 font-bold text-lg">{index + 1}</span>
              </div>
              <div className="flex-grow">
                <h3 className="text-xl font-semibold text-gray-100 group-hover:text-blue-400 transition-colors">
                  {movie.title}
                </h3>
                {movie.genres && movie.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {movie.genres.slice(0, 3).map((genre: string) => (
                      <span
                        key={`${movie.movieId}-${genre}`}
                        className="text-sm text-blue-300/80"
                      >
                        {genre.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={(e) => handleWatchlistClick(e, movie.movieId)}
                className={`flex-shrink-0 w-10 h-10 rounded-xl transition-all duration-300 
                          flex items-center justify-center group-hover:scale-110 ${
                  watchlist.has(movie.movieId)
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-blue-400 hover:text-blue-300'
                }`}
                title={watchlist.has(movie.movieId) ? "Remove from watchlist" : "Add to watchlist"}
              >
                {watchlist.has(movie.movieId) ? (
                  <FiCheck className="w-5 h-5" />
                ) : (
                  <FiBookmark className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/5">
              {/* Rating */}
              <div className="p-4">
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                  <FiStar className="w-4 h-4" />
                  <span>My Rating</span>
                </div>
                <RatingComponent movieId={movie.movieId.toString()} />
              </div>

              {/* Score */}
              <div className="p-4">
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                  <FiTrendingUp className="w-4 h-4" />
                  <span>Match Score</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-grow h-2 bg-blue-500/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 
                               group-hover:from-blue-400 group-hover:to-blue-500"
                      style={{ width: `${(movie.score / 5) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-blue-400 font-medium min-w-[3ch]">{movie.score.toFixed(1)}</span>
                </div>
              </div>

              {/* Average Rating */}
              {movie.averageRating && (
                <div className="p-4">
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                    <FiZap className="w-4 h-4" />
                    <span>Average Rating</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-blue-400">
                      {movie.averageRating.toFixed(1)}
                    </span>
                    <span className="text-sm text-gray-400 whitespace-nowrap">
                      ({movie.totalRatings} {movie.totalRatings === 1 ? 'rating' : 'ratings'})
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Link>
      ))}

      <div className="glass-card p-4 text-center">
        <p className="text-gray-400">
          Rate more movies to get even better recommendations!
        </p>
      </div>
    </div>
  );
} 