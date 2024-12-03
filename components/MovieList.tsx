import React from 'react';
import { Movie } from '../types/movie';
import MovieCard from './MovieCard';

interface MovieListProps {
  movies: Movie[];
  title?: string;
  onGenreClick?: (genre: string) => void;
}

const MovieList: React.FC<MovieListProps> = ({ movies, title, onGenreClick }) => {
  if (movies.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-400">No movies found</p>
      </div>
    );
  }

  return (
    <section className="movie-list-section">
      {title && (
        <h2 className="text-2xl font-bold mb-6">{title}</h2>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </section>
  );
};

export default MovieList; 