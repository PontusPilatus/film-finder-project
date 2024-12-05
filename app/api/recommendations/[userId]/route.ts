import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import path from 'path';
import fs from 'fs';

// Initialize model components with null values
let modelComponents: {
  P: number[][],
  Q: number[][],
  bu: number[],
  bi: number[],
  mu: number,
  user_id_map: { [key: string]: number },
  movie_id_map: { [key: string]: number }
} | null = null;

// Try to load the model
try {
  console.log('Current working directory:', process.cwd());
  const modelPath = path.join(process.cwd(), 'app/data/model_components.json');
  console.log('Loading model from:', modelPath);

  const fileContents = fs.readFileSync(modelPath, 'utf8');
  modelComponents = JSON.parse(fileContents);

  console.log('Model loaded successfully:', {
    hasPArray: Array.isArray(modelComponents?.P),
    PLength: modelComponents?.P?.length,
    userMapSize: Object.keys(modelComponents?.user_id_map || {}).length,
    sampleUserIds: Object.keys(modelComponents?.user_id_map || {}).slice(0, 5),
    userMapStructure: typeof modelComponents?.user_id_map,
  });
} catch (error) {
  console.error('Error loading model:', error);
  modelComponents = null;
}

function predictWithSVD(userIdx: number, movieIdx: number) {
  if (!modelComponents) return null;
  const { P, Q, bu, bi, mu } = modelComponents;
  return mu + bu[userIdx] + bi[movieIdx] +
    P[userIdx].reduce((sum: number, val: number, i: number) => sum + val * Q[movieIdx][i], 0);
}

async function getGenreBasedRecommendations(
  userId: number,
  unratedMovies: any[],
  userRatings: any[]
) {
  // Get the movies this user has rated highly (4 or 5 stars)
  const highlyRated = userRatings.filter(r => r.rating >= 4);

  // If user hasn't rated anything highly yet, return popular movies
  if (highlyRated.length === 0) {
    return unratedMovies
      .map(movie => {
        const ratings = movie.ratings || [];
        const avgRating = ratings.length > 0
          ? ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / ratings.length
          : 0;

        // For popular movies, keep score between 1-5
        return {
          movieId: movie.movie_id,
          title: movie.title,
          score: Number(Math.min(5, Math.max(1, avgRating)).toFixed(2)),
          genres: movie.genres?.split('|').map((g: string) => g.trim()) || [],
          averageRating: avgRating,
          totalRatings: ratings.length
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }

  // Get genres from highly rated movies
  const { data: ratedMovies } = await supabase
    .from('movies')
    .select('genres')
    .in('movie_id', highlyRated.map(r => r.movie_id));

  // Create a map of genre preferences
  const genrePreferences = new Map<string, number>();
  ratedMovies?.forEach(movie => {
    const genres = movie.genres.split('|').map((g: string) => g.trim());
    genres.forEach((genre: string) => {
      genrePreferences.set(genre, (genrePreferences.get(genre) || 0) + 1);
    });
  });

  // Get the maximum genre count for normalization
  const maxGenreCount = Math.max(...Array.from(genrePreferences.values()));

  // Score unrated movies based on genre preferences
  return unratedMovies
    .map(movie => {
      const movieGenres = movie.genres.split('|').map((g: string) => g.trim());
      const ratings = movie.ratings || [];
      const avgRating = ratings.length > 0
        ? ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / ratings.length
        : 3; // Default rating if no ratings available

      // Calculate genre match score (0-1)
      let genreMatchCount = 0;
      movieGenres.forEach((genre: string) => {
        if (genrePreferences.has(genre)) {
          genreMatchCount += genrePreferences.get(genre)! / maxGenreCount;
        }
      });
      const genreScore = genreMatchCount / movieGenres.length; // Normalize by number of genres

      // Calculate final score (1-5 range)
      // Weight: 70% genre match, 30% average rating
      const weightedScore = (genreScore * 0.7 * 5) + (avgRating * 0.3);
      const finalScore = Math.min(5, Math.max(1, weightedScore));

      return {
        movieId: movie.movie_id,
        title: movie.title,
        score: Number(finalScore.toFixed(2)),
        genres: movieGenres,
        averageRating: avgRating,
        totalRatings: ratings.length
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = parseInt(params.userId);
    console.log('Processing request for user:', userId);

    // Get user's ratings
    const { data: userRatings, error: ratingsError } = await supabase
      .from('ratings')
      .select('movie_id, rating')
      .eq('user_id', userId);

    if (ratingsError) throw ratingsError;

    // Get all movies with their ratings
    const { data: movies, error: moviesError } = await supabase
      .from('movies')
      .select(`
        movie_id,
        title,
        genres,
        ratings (rating)
      `);

    if (moviesError) throw moviesError;

    // Filter out rated movies
    const ratedMovieIds = new Set(userRatings?.map(r => r.movie_id));
    const unratedMovies = movies?.filter(movie => !ratedMovieIds.has(movie.movie_id));

    // Check if we can use SVD model
    if (modelComponents && modelComponents.user_id_map[userId.toString()] !== undefined) {
      console.log('Using SVD model for user:', userId, {
        userIdx: modelComponents.user_id_map[userId.toString()],
        userMapKeys: Object.keys(modelComponents.user_id_map).slice(0, 5),
      });
      const userIdx = modelComponents.user_id_map[userId.toString()];

      const recommendations = unratedMovies
        ?.map(movie => {
          const movieIdx = modelComponents?.movie_id_map[movie.movie_id.toString()];
          if (movieIdx === undefined) return null;

          const svdScore = predictWithSVD(userIdx, movieIdx);
          if (svdScore === null) return null;

          const ratings = movie.ratings || [];
          const avgRating = ratings.length > 0
            ? ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / ratings.length
            : 0;

          return {
            movieId: movie.movie_id,
            title: movie.title,
            score: Number((svdScore * 0.8 + 1).toFixed(2)),
            genres: movie.genres?.split('|').map((g: string) => g.trim()) || [],
            averageRating: avgRating,
            totalRatings: ratings.length
          };
        })
        .filter((r): r is NonNullable<typeof r> => r !== null)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

      return NextResponse.json({ recommendations, method: 'SVD Model' });
    } else {
      console.log('New user detected, using genre-based recommendations');
      const recommendations = await getGenreBasedRecommendations(
        userId,
        unratedMovies || [],
        userRatings || []
      );

      return NextResponse.json({
        recommendations,
        method: userRatings?.length ? 'Genre-based' : 'Popularity-based'
      });
    }

  } catch (error) {
    console.error('Error in recommendations:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 