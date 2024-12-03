import React from 'react';
import { Movie } from '@types/movie';
import Link from 'next/link';
import Image from 'next/image';
import RatingComponent from './RatingComponent';

interface MovieCardProps {
  movie: Movie;
  onGenreClick?: (genre: string) => void;
  showDelete?: boolean;
  onRatingDelete?: () => void;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, onGenreClick, showDelete, onRatingDelete }) => {
  console.log('Movie ID:', movie.id);

  const genres = Array.isArray(movie.genres) 
    ? movie.genres 
    : movie.genres?.split('|') || [];

  return (
    <Link href={`/movies/${movie.id}`} className="movie-card block" onClick={(e) => {
      console.log('Card clicked, navigating to:', `/movies/${movie.id}`);
    }}>
      <div className="card hover:border-primary group transition-all duration-200">
        <div className="flex justify-between items-start">
          <div className="space-y-2 flex-grow">
            <h3 className="text-xl font-semibold text-gray-100 group-hover:text-primary transition-colors">
              {movie.title.replace(/\s*\(\d{4}\)$/, '')}
            </h3>
            <div className="flex items-center gap-2 text-sm">
              {movie.releaseDate && (
                <span className="text-gray-400">{movie.releaseDate}</span>
              )}
              {movie.genres && (
                <div className="flex flex-wrap gap-2">
                  {genres.map((genre, index) => (
                    <button
                      key={`${movie.id}-${genre}`}
                      onClick={(e) => {
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
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-gray-400">My Rating</span>
            <RatingComponent 
              movieId={movie.id}
              showDelete={showDelete}
              onRatingDelete={onRatingDelete}
            />
          </div>
          {movie.supabaseRatingAverage && typeof movie.supabaseRatingAverage === 'number' && (
            <div className="text-right">
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