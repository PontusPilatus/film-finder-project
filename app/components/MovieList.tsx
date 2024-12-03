import { Movie } from '../../types/movie';
import MovieCard from './MovieCard';

interface MovieListProps {
  movies: Movie[];
  onGenreClick?: (genre: string) => void;
  showDelete?: boolean;
  onRatingDelete?: () => void;
}

export default function MovieList({ 
  movies, 
  onGenreClick,
  showDelete,
  onRatingDelete 
}: MovieListProps) {
  return (
    <div className="space-y-4">
      {movies.map((movie: Movie) => (
        <MovieCard 
          key={movie.id}
          movie={movie} 
          onGenreClick={onGenreClick}
          showDelete={showDelete}
          onRatingDelete={onRatingDelete}
        />
      ))}
    </div>
  );
} 