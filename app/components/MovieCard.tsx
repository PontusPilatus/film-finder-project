'use client'
import React, { useState, useEffect } from 'react';
import { Movie } from '../../types/movie';
import Link from 'next/link';
import RatingComponent from './RatingComponent';
import { supabase } from '../lib/supabase';
import { FiBookmark, FiCheck } from 'react-icons/fi';

interface MovieCardProps {
  movie: Movie;
  onGenreClick?: (genre: string) => void;
  showDelete?: boolean;
  onRatingDelete?: (movieId: string) => void;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, onGenreClick, showDelete, onRatingDelete }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);

      if (session?.user) {
        const { data, error } = await supabase
          .from('users')
          .select('user_id')
          .eq('email', session.user.email)
          .single();

        if (!error && data) {
          setUserId(data.user_id);
        }
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsLoggedIn(!!session);
      if (session?.user) {
        const { data } = await supabase
          .from('users')
          .select('user_id')
          .eq('email', session.user.email)
          .single();

        if (data) {
          setUserId(data.user_id);
        }
      } else {
        setUserId(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (userId) {
      checkWatchlistStatus();
    }
  }, [userId, movie.id]);

  const checkWatchlistStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('watchlist')
        .select('*')
        .eq('user_id', userId)
        .eq('movie_id', movie.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking watchlist status:', error);
      }

      setIsInWatchlist(!!data);
    } catch (error) {
      console.error('Error checking watchlist status:', error);
    }
  };

  const handleWatchlistClick = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    if (!isLoggedIn || !userId || isLoading) return;

    try {
      setIsLoading(true);

      if (isInWatchlist) {
        const { error } = await supabase
          .from('watchlist')
          .delete()
          .eq('user_id', userId)
          .eq('movie_id', movie.id);

        if (error) throw error;
        setIsInWatchlist(false);
      } else {
        const { error } = await supabase
          .from('watchlist')
          .insert([
            {
              user_id: userId,
              movie_id: parseInt(movie.id)
            }
          ]);

        if (error) throw error;
        setIsInWatchlist(true);
      }
    } catch (error) {
      console.error('Error updating watchlist:', error);
      alert('Failed to update watchlist. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRatingDelete = () => {
    if (onRatingDelete) {
      onRatingDelete(movie.id);
    }
  };

  const genres: string[] = Array.isArray(movie.genres)
    ? movie.genres
    : (movie.genres as string)?.split('|') || [];

  return (
    <Link href={`/movies/${movie.id}`} className="movie-card block relative">
      <div className="card hover:border-primary group transition-all duration-200">
        <div className="flex justify-between items-start">
          <div className="space-y-2 flex-grow">
            <h3 className="text-xl font-semibold text-gray-100 group-hover:text-primary transition-colors">
              {movie.title.replace(/\s*\(\d{4}\)$/, '')}
            </h3>
            <div className="space-y-2">
              {movie.releaseDate && (
                <div className="text-sm text-gray-400">
                  <span className="text-gray-500">Released:</span> {movie.releaseDate}
                </div>
              )}
              {movie.genres && (
                <div className="flex flex-wrap gap-2">
                  {genres.map((genre: string, index: number) => (
                    <button
                      key={`${movie.id}-${genre}`}
                      onClick={(e: React.MouseEvent) => {
                        e.preventDefault();
                        onGenreClick?.(genre.trim());
                      }}
                      className="px-2 py-1 text-xs rounded-full bg-blue-900/50 text-blue-200 
                               hover:bg-blue-800 transition-colors cursor-pointer"
                    >
                      {genre.trim()}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {movie.overview && (
              <p className="text-gray-300 line-clamp-2">
                {movie.overview}
              </p>
            )}
          </div>

          {/* Watchlist Button */}
          {isLoggedIn && (
            <button
              onClick={(e) => {
                e.preventDefault();
                handleWatchlistClick(e);
              }}
              className={`ml-4 p-2 rounded-full transition-all duration-200 ${isInWatchlist
                  ? 'bg-blue-500 text-white'
                  : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white'
                }`}
              disabled={isLoading}
              title={isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
            >
              {isInWatchlist ? (
                <FiCheck className="w-5 h-5" />
              ) : (
                <FiBookmark className="w-5 h-5" />
              )}
            </button>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          {isLoggedIn && (
            <div className="flex flex-col gap-1">
              <span className="text-sm text-gray-400">My Rating</span>
              <RatingComponent
                movieId={movie.id}
                showDelete={showDelete}
                onRatingDelete={handleRatingDelete}
              />
            </div>
          )}
          {movie.supabaseRatingAverage && typeof movie.supabaseRatingAverage === 'number' && (
            <div className={`text-right ${!isLoggedIn ? 'ml-auto' : ''}`}>
              <div className="text-sm text-gray-400">Average Rating</div>
              <div className="text-xl font-bold text-primary">
                {movie.supabaseRatingAverage.toFixed(1)}
                <span className="text-sm text-gray-400 ml-1">
                  ({movie.totalRatings} {movie.totalRatings === 1 ? 'rating' : 'ratings'})
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default MovieCard; 