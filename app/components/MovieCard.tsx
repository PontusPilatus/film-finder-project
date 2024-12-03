import React from 'react';
import { Movie } from '@types/movie';
import Link from 'next/link';
import Image from 'next/image';

interface MovieCardProps {
  movie: Movie;
  onGenreClick?: (genre: string) => void;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, onGenreClick }) => {
  console.log('Movie ID:', movie.id);

  return (
    <Link href={`/movies/${movie.id}`} className="movie-card block" onClick={(e) => {
      console.log('Card clicked, navigating to:', `/movies/${movie.id}`);
    }}>
      <div className="card hover:border-primary group transition-all duration-200">
        <div className="flex justify-between items-start">
          <div className="space-y-2 flex-grow">
            <h3 className="text-xl font-semibold text-gray-100 group-hover:text-primary transition-colors">
              {movie.title}
            </h3>
            <div className="flex items-center gap-2 text-sm">
              {movie.releaseDate && (
                <span className="text-gray-400">{movie.releaseDate}</span>
              )}
              {movie.genres && (
                <div className="flex flex-wrap gap-2">
                  {movie.genres.split('|').map((genre, index) => (
                    <button
                      key={`${movie.id}-${genre}`}
                      onClick={(e) => {
                        e.preventDefault(); // Prevent navigation
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
          {movie.supabaseRatingAverage && typeof movie.supabaseRatingAverage === 'number' && (
            <div className="text-right ml-4">
              <div className="text-2xl font-bold text-primary">
                {movie.supabaseRatingAverage.toFixed(1)}
              </div>
              <div className="text-sm text-gray-400">
                {movie.totalRatings} ratings
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default MovieCard; 