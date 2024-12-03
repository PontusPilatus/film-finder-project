import { Movie } from '../../types/movie';
import MovieCard from './MovieCard';

interface MovieListProps {
  movies: Movie[];
  onGenreClick?: (genre: string) => void;
}

export default function MovieList({ movies, onGenreClick }: MovieListProps) {
  console.log('Movies in MovieList:', movies);

  return (
    <div className="space-y-4">
      {movies.map((movie: Movie) => (
        <MovieCard 
          key={movie.id} 
          movie={movie} 
          onGenreClick={onGenreClick}
        />
      ))}
    </div>
  );
} 