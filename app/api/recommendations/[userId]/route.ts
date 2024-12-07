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
    const popularMovies = unratedMovies
      .map(movie => {
        const ratings = movie.ratings || [];
        const avgRating = ratings.length > 0
          ? ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / ratings.length
          : 0;

        return {
          movieId: movie.movie_id,
          title: movie.title,
          score: Number(Math.min(5, Math.max(1, avgRating)).toFixed(2)),
          genres: movie.genres?.split('|').map((g: string) => g.trim()) || [],
          averageRating: Number(avgRating.toFixed(2)),
          totalRatings: ratings.length
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    return popularMovies;
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
  const movieScores = unratedMovies.map(movie => {
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
      averageRating: Number(avgRating.toFixed(2)),
      totalRatings: ratings.length
    };
  });

  return movieScores
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

async function getPopularityBasedRecommendations(
  userId: number,
  unratedMovies: any[],
  userRatings: any[]
) {
  console.log('\n==== Calculating Popularity-Based Recommendations ====');
  console.log('Current user ratings:', userRatings.map(r => ({
    movieId: r.movie_id,
    rating: r.rating
  })));

  // Get all users who have rated the same movies as our user
  const { data: similarUsers, error: similarUsersError } = await supabase
    .from('ratings')
    .select('user_id, movie_id, rating')
    .in('movie_id', userRatings.map(r => r.movie_id));

  if (similarUsersError) {
    console.error('Error fetching similar users:', similarUsersError);
    return [];
  }

  console.log('Found ratings from similar users:', similarUsers?.length || 0);

  // Create a map of user similarities
  const userSimilarities = new Map<number, number>();
  const userRatingsMap = new Map(userRatings.map(r => [r.movie_id, r.rating]));

  // Group ratings by user
  const userRatingGroups = new Map<number, Map<number, number>>();
  similarUsers?.forEach(rating => {
    if (rating.user_id !== userId) {
      if (!userRatingGroups.has(rating.user_id)) {
        userRatingGroups.set(rating.user_id, new Map());
      }
      userRatingGroups.get(rating.user_id)!.set(rating.movie_id, rating.rating);
    }
  });

  // Calculate similarity scores with other users
  userRatingGroups.forEach((otherUserRatings, otherUserId) => {
    let similarity = 0;
    let commonMovies = 0;

    userRatingsMap.forEach((rating, movieId) => {
      if (otherUserRatings.has(movieId)) {
        commonMovies++;
        // Simple similarity: how close are their ratings
        const ratingDiff = Math.abs(rating - otherUserRatings.get(movieId)!);
        similarity += 1 - (ratingDiff / 4); // Normalize to 0-1 range
      }
    });

    if (commonMovies > 0) {
      userSimilarities.set(otherUserId, similarity / commonMovies);
    }
  });

  console.log('User similarities calculated:',
    Array.from(userSimilarities.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([userId, score]) => ({ userId, score: score.toFixed(2) }))
  );

  // Score unrated movies based on similar users' ratings
  const movieScores = unratedMovies.map(movie => {
    const ratings = movie.ratings || [];
    let weightedSum = 0;
    let weightSum = 0;

    // Get all ratings for this movie
    const movieRatings = similarUsers?.filter(r => r.movie_id === movie.movie_id) || [];

    movieRatings.forEach(rating => {
      const userSimilarity = userSimilarities.get(rating.user_id) || 0;
      if (userSimilarity > 0) {
        weightedSum += rating.rating * userSimilarity;
        weightSum += userSimilarity;
      }
    });

    // Calculate predicted score
    const similarityScore = weightSum > 0 ? weightedSum / weightSum : 0;

    // Calculate popularity score
    const avgRating = ratings.length > 0
      ? ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / ratings.length
      : 0;
    const popularityWeight = Math.min(1, ratings.length / 100); // Cap at 100 ratings

    // Combine similarity and popularity scores
    const finalScore = similarityScore > 0
      ? (similarityScore * 0.7 + avgRating * 0.3)
      : avgRating;

    console.log('\nScoring movie:', {
      title: movie.title,
      similarityScore: Number(similarityScore.toFixed(2)),
      avgRating: Number(avgRating.toFixed(2)),
      totalRatings: ratings.length,
      finalScore: Number(finalScore.toFixed(2))
    });

    return {
      movieId: movie.movie_id,
      title: movie.title,
      score: Number(Math.min(5, Math.max(1, finalScore)).toFixed(2)),
      genres: movie.genres?.split('|').map((g: string) => g.trim()) || [],
      averageRating: Number(avgRating.toFixed(2)),
      totalRatings: ratings.length
    };
  });

  return movieScores
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = parseInt(params.userId);
    console.log('\n==== Starting Recommendation Request ====');
    console.log('Processing request for user:', userId);

    // Get user's ratings using admin client
    const { data: userRatings, error: ratingsError } = await supabase
      .from('ratings')
      .select('movie_id, rating')
      .eq('user_id', userId);

    if (ratingsError) {
      console.error('Error fetching user ratings:', ratingsError);
      throw ratingsError;
    }

    console.log('User ratings found:', userRatings?.length || 0);
    console.log('Sample of user ratings:', userRatings?.slice(0, 3));

    // Get all movies with their ratings using admin client
    const { data: movies, error: moviesError } = await supabase
      .from('movies')
      .select(`
        movie_id,
        title,
        genres,
        ratings (rating)
      `);

    if (moviesError) {
      console.error('Error fetching movies:', moviesError);
      throw moviesError;
    }

    console.log('Total movies fetched:', movies?.length || 0);

    // Filter out rated movies
    const ratedMovieIds = new Set(userRatings?.map(r => r.movie_id));
    const unratedMovies = movies?.filter(movie => !ratedMovieIds.has(movie.movie_id));
    console.log('Unrated movies available:', unratedMovies?.length || 0);

    // Check if we can use SVD model
    if (modelComponents && modelComponents.user_id_map[userId.toString()] !== undefined) {
      console.log('Using SVD model for user:', userId);
      console.log('User index in model:', modelComponents.user_id_map[userId.toString()]);
      const userIdx = modelComponents.user_id_map[userId.toString()];

      const recommendations = unratedMovies
        ?.map(movie => {
          const movieIdx = modelComponents?.movie_id_map[movie.movie_id.toString()];
          console.log('\nProcessing movie:', {
            title: movie.title,
            movieId: movie.movie_id,
            movieIdx,
            ratings: movie.ratings?.length || 0
          });

          if (movieIdx === undefined) {
            console.log('Movie not found in SVD model');
            return null;
          }

          const svdScore = predictWithSVD(userIdx, movieIdx);
          const ratings = movie.ratings || [];
          const avgRating = ratings.length > 0
            ? ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / ratings.length
            : 0;

          console.log('Prediction details:', {
            rawSvdScore: svdScore,
            adjustedScore: svdScore ? Number((svdScore * 0.8 + 1).toFixed(2)) : null,
            avgRating: Number(avgRating.toFixed(2)),
            totalRatings: ratings.length
          });

          if (svdScore === null) {
            console.log('Failed to get SVD prediction');
            return null;
          }

          return {
            movieId: movie.movie_id,
            title: movie.title,
            score: Number((svdScore * 0.8 + 1).toFixed(2)),
            genres: movie.genres?.split('|').map((g: string) => g.trim()) || [],
            averageRating: Number(avgRating.toFixed(2)),
            totalRatings: ratings.length
          };
        })
        .filter((r): r is NonNullable<typeof r> => r !== null)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

      console.log('\nFinal top 10 recommendations:',
        recommendations?.map(r => ({
          title: r.title,
          score: r.score,
          avgRating: r.averageRating,
          totalRatings: r.totalRatings
        }))
      );

      return NextResponse.json({ recommendations, method: 'SVD Model' });
    } else {
      console.log('\n==== Using Genre/Popularity-Based Recommendations ====');
      console.log('User not found in SVD model, falling back to alternative recommendations');

      const recommendations = await getGenreBasedRecommendations(
        userId,
        unratedMovies || [],
        userRatings || []
      );

      console.log('\n==== Final Recommendations ====');
      console.log('Method:', userRatings?.length ? 'Genre-based' : 'Popularity-based');
      console.log('Number of recommendations:', recommendations.length);
      console.log('Top 5 recommendations:', recommendations.slice(0, 5).map(r => ({
        title: r.title,
        score: r.score,
        averageRating: r.averageRating,
        totalRatings: r.totalRatings,
        genres: r.genres
      })));

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