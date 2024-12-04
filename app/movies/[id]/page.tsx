'use client'
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Movie, MovieDetails } from '../../../types/movie';
import MovieList from '../../components/MovieList';
import RatingComponent from '../../components/RatingComponent';

export default function MovieDetailsPage({ params }: { params: { id: string } }) {
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [relatedMovies, setRelatedMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetchMovieDetails();
  }, [params.id]);

  async function fetchMovieDetails() {
    try {
      setLoading(true);
      
      // Fetch movie details with its ratings
      const { data: movieData, error } = await supabase
        .from('movies')
        .select(`
          *,
          ratings:ratings(rating)
        `)
        .eq('movie_id', params.id)
        .single();

      if (error) throw error;
      if (!movieData) return;

      // Calculate rating statistics
      const ratings = movieData.ratings || [];
      const totalRatings = ratings.length;
      const ratingSum = ratings.reduce((sum: number, r: any) => sum + r.rating, 0);
      const ratingAverage = totalRatings > 0 ? Math.round((ratingSum / totalRatings) * 10) / 10 : null;

      // Transform movie data
      const movieDetails: MovieDetails = {
        id: movieData.movie_id.toString(),
        title: movieData.title,
        overview: movieData.overview,
        posterPath: movieData.poster_path || '',
        releaseDate: movieData.year?.toString() || '',
        voteAverage: ratingAverage || 0,
        runtime: movieData.runtime || 0,
        genres: movieData.genres?.split('|') || [],
        budget: movieData.budget || 0,
        revenue: movieData.revenue || 0,
        supabaseRatingAverage: ratingAverage,
        totalRatings
      };

      setMovie(movieDetails);

      // Fetch related movies based on genres
      if (movieData.genres) {
        const genres = movieData.genres.split('|');
        const movieYear = movieData.year;
        console.log('Looking for movies with genres:', genres);
        
        const { data: relatedData, error: relatedError } = await supabase
          .from('movies')
          .select(`
            *,
            ratings:ratings(rating)
          `)
          .neq('movie_id', params.id)
          // Match any of the genres
          .or(genres.map((genre: string) => `genres.ilike.%${genre.trim()}%`).join(','))
          // Get movies within 10 years range
          .gte('year', movieYear - 10)
          .lte('year', movieYear + 10)
          .limit(20); // Get more movies initially for better filtering

        if (relatedError) {
          console.error('Error fetching related movies:', relatedError);
        }

        if (relatedData) {
          // Score and sort movies by genre similarity
          const scoredMovies = relatedData.map(movie => {
            const movieGenres = movie.genres?.split('|') || [];
            // Count how many genres match
            const matchingGenres = genres.filter((g: string) => 
              movieGenres.some((mg: string) => mg.trim().toLowerCase() === g.trim().toLowerCase())
            ).length;
            
            return {
              movie,
              score: matchingGenres
            };
          });

          // Sort by score (most matching genres first) and take top 4
          const topRelated = scoredMovies
            .sort((a, b) => b.score - a.score)
            .slice(0, 4)
            .map(({ movie }) => movie);

          const transformedRelated = topRelated.map(movie => {
            // Calculate average rating from all ratings
            const ratings = movie.ratings || [];
            const totalRatings = ratings.length;
            const ratingAverage = totalRatings > 0 
              ? Math.round((ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / totalRatings) * 10) / 10 
              : null;

            return {
              id: movie.movie_id.toString(),
              title: movie.title,
              overview: movie.overview,
              posterPath: movie.poster_path || '',
              releaseDate: movie.year?.toString() || '',
              voteAverage: 0,
              genres: movie.genres?.split('|') || [],
              supabaseRatingAverage: ratingAverage,
              totalRatings
            };
          });

          console.log('Transformed related movies:', transformedRelated);
          setRelatedMovies(transformedRelated);
        }
      }

    } catch (error) {
      console.error('Error fetching movie details:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-gray-400">Loading movie details...</div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-gray-400">Movie not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6">
      <div className="space-y-6">
        {/* Movie Details Section */}
        <div className="bg-secondary-color rounded-lg p-4">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Poster */}
            <div className="w-full md:w-1/4">
              {movie.posterPath ? (
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
                  alt={movie.title}
                  className="w-full rounded-lg"
                />
              ) : (
                <div className="w-full aspect-[2/3] bg-gray-800 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">No image available</span>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex-grow space-y-3">
              <h1 className="text-2xl font-bold text-gray-100">
                {movie.title.replace(/\s*\(\d{4}\)$/, '')}
              </h1>
              
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <span>{movie.releaseDate}</span>
                {movie.runtime > 0 && (
                  <span>• {movie.runtime} min</span>
                )}
              </div>

              {movie.genres.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {movie.genres.map(genre => (
                    <span
                      key={genre}
                      className="px-2 py-0.5 bg-blue-900/50 text-blue-200 rounded-full text-xs"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-6">
                {isLoggedIn && (
                  <div>
                    <span className="text-sm text-gray-400">My Rating</span>
                    <RatingComponent 
                      movieId={movie.id}
                      onRatingSubmit={async () => {
                        await fetchMovieDetails();
                      }}
                      onRatingDelete={async () => {
                        await fetchMovieDetails();
                      }}
                      showDelete={false}
                    />
                  </div>
                )}
                {movie.supabaseRatingAverage !== null && (
                  <div>
                    <div className="text-xs text-gray-400">Average Rating</div>
                    <div className="text-lg font-bold text-primary">
                      {movie.supabaseRatingAverage.toFixed(1)}
                      <span className="text-xs text-gray-400 ml-1">
                        ({movie.totalRatings})
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {movie.overview && (
                <div className="space-y-1">
                  <h2 className="text-sm font-semibold text-gray-400">Overview</h2>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {movie.overview}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Movies Section */}
        {relatedMovies.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-gray-100">Related Movies</h2>
            <MovieList movies={relatedMovies} />
          </div>
        )}
      </div>
    </div>
  );
} 