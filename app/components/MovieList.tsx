import { Movie } from '../../types/movie';

interface MovieListProps {
  movies: Movie[];
  onGenreClick?: (genre: string) => void;
}

export default function MovieList({ movies, onGenreClick }: MovieListProps) {
  return (
    <div className="space-y-4">
      {movies.map((movie: Movie) => (
        <div key={movie.id} className="card hover:border-primary group transition-all duration-200">
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
                        onClick={() => onGenreClick?.(genre.trim())}
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
      ))}
    </div>
  );
} 