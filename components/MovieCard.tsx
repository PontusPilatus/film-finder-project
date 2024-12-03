import React from 'react';
import { Movie } from '@types/movie';
import Link from 'next/link';
import Image from 'next/image';

interface MovieCardProps {
  movie: Movie;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  return (
    <Link href={`/movies/${movie.id}`} className="movie-card block">
      <div className="relative h-[400px] rounded-lg overflow-hidden bg-secondary-color">
        <div className="absolute inset-0">
          {movie.posterPath ? (
            <Image
              src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
              alt={movie.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-secondary-color">
              <span className="text-gray-500">No image available</span>
            </div>
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent">
          <div className="absolute bottom-0 p-4 text-white">
            <h3 className="text-xl font-bold mb-2">{movie.title}</h3>
            <p className="text-sm text-gray-300 line-clamp-2">
              {movie.overview}
            </p>
            <div className="movie-meta flex items-center gap-4 mt-2 text-sm">
              <span>{new Date(movie.releaseDate).getFullYear()}</span>
              <span className="flex items-center">
                <span className="text-yellow-400 mr-1">★</span>
                {movie.supabaseRatingAverage ? movie.supabaseRatingAverage.toFixed(1) : 'No ratings'}
              </span>
              <span className="text-sm text-gray-400">
                ({movie.totalRatings} {movie.totalRatings === 1 ? 'rating' : 'ratings'})
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard; 