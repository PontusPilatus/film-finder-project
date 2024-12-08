import { Movie } from '../types/movie';
import MovieCard from './MovieCard';

interface MovieListProps {
  movies: Movie[];
  onGenreClick?: (genre: string) => void;
  showDelete?: boolean;
  onRatingDelete?: () => void;
  onDelete?: (movieId: string) => void;
}

export default function MovieList({ 
  movies, 
  onGenreClick,
  showDelete,
  onRatingDelete,
  onDelete
}: MovieListProps) {
  return (
    <div className="grid gap-6">
      {movies.map((movie: Movie, index: number) => (
        <div 
          key={movie.movie_id}
          className="fade-in-up"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <MovieCard 
            movie={movie} 
            onGenreClick={onGenreClick}
            showDelete={showDelete}
            onRatingDelete={onRatingDelete}
            onDelete={onDelete}
          />
        </div>
      ))}
    </div>
  );
} 