import React, { useState, useEffect } from 'react';
import { Movie } from '../types/movie';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '../app/lib/supabase';

interface MovieCardProps {
  movie: Movie;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

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
              {movie.supabaseRatingAverage && (
                <span className="flex items-center">
                  <span className="text-yellow-400 mr-1">★</span>
                  {movie.supabaseRatingAverage.toFixed(1)}
                  <span className="text-xs text-gray-400 ml-1">
                    ({movie.totalRatings})
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard; 