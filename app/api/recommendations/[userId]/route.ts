import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

// Calculate similarity between two users based on their ratings
function calculateUserSimilarity(userRatings1: any[], userRatings2: any[]): number {
  const ratings1Map = new Map(userRatings1.map(r => [r.movie_id, r.rating]));
  const ratings2Map = new Map(userRatings2.map(r => [r.movie_id, r.rating]));

  // Find movies both users have rated
  const commonMovies = Array.from(ratings1Map.keys()).filter(movieId => ratings2Map.has(movieId));

  if (commonMovies.length === 0) return 0;

  // Calculate Pearson correlation
  const ratings1 = commonMovies.map(movieId => ratings1Map.get(movieId)!);
  const ratings2 = commonMovies.map(movieId => ratings2Map.get(movieId)!);

  const avg1 = ratings1.reduce((a, b) => a + b, 0) / ratings1.length;
  const avg2 = ratings2.reduce((a, b) => a + b, 0) / ratings2.length;

  let numerator = 0;
  let denominator1 = 0;
  let denominator2 = 0;

  for (let i = 0; i < ratings1.length; i++) {
    const diff1 = ratings1[i] - avg1;
    const diff2 = ratings2[i] - avg2;
    numerator += diff1 * diff2;
    denominator1 += diff1 * diff1;
    denominator2 += diff2 * diff2;
  }

  if (denominator1 === 0 || denominator2 === 0) return 0;
  return numerator / Math.sqrt(denominator1 * denominator2);
}

const MOVIE_QUERY = `
  movie_id,
  title,
  genres,
  ratings (
    rating
  ),
  genre_count
`;

// Normalize score to be between 0 and 5
function normalizeScore(score: number, min: number, max: number): number {
  if (max === min) return 3.5; // Default score if all scores are the same
  return ((score - min) / (max - min)) * 5;
}

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = parseInt(params.userId);
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Get target user's ratings
    const { data: userRatings, error: ratingsError } = await supabase
      .from('ratings')
      .select('movie_id, rating')
      .eq('user_id', userId);

    if (ratingsError) {
      console.error('Error fetching user ratings:', ratingsError);
      return NextResponse.json(
        { error: 'Database error', details: ratingsError.message },
        { status: 500 }
      );
    }

    // For new users or users with no ratings, return popular movies
    if (!userRatings || userRatings.length === 0) {
      const { data: movies, error: moviesError } = await supabase
        .from('movies')
        .select(MOVIE_QUERY);

      if (moviesError) {
        console.error('Error fetching movies:', moviesError);
        return NextResponse.json(
          { error: 'Database error', details: moviesError.message },
          { status: 500 }
        );
      }

      // Calculate popularity scores
      const recommendations = movies
        ?.map(movie => {
          const ratings = movie.ratings || [];
          const totalRatings = ratings.length;
          const averageRating = totalRatings > 0
            ? ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / totalRatings
            : 0;

          // Weighted score based on ratings count and average rating
          const score = (totalRatings * averageRating) / (totalRatings + 10);

          return {
            title: movie.title,
            score: Number(score.toFixed(2)),
            movieId: movie.movie_id,
            averageRating,
            totalRatings,
            genres: movie.genres?.split('|').map((g: string) => g.trim()) || []
          };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

      return NextResponse.json({
        recommendations,
        message: 'Popular movies (rate some movies to get personalized recommendations)'
      });
    }

    // Get all users' ratings for collaborative filtering
    const { data: allUserRatings, error: allRatingsError } = await supabase
      .from('ratings')
      .select('user_id, movie_id, rating');

    if (allRatingsError) {
      console.error('Error fetching all ratings:', allRatingsError);
      return NextResponse.json(
        { error: 'Database error', details: allRatingsError.message },
        { status: 500 }
      );
    }

    // Group ratings by user
    const userRatingsMap = new Map();
    allUserRatings?.forEach(rating => {
      if (!userRatingsMap.has(rating.user_id)) {
        userRatingsMap.set(rating.user_id, []);
      }
      userRatingsMap.get(rating.user_id).push(rating);
    });

    // Calculate similarities with other users
    const similarities: [number, number][] = []; // [userId, similarity]
    userRatingsMap.forEach((otherUserRatings, otherUserId) => {
      if (otherUserId !== userId) {
        const similarity = calculateUserSimilarity(userRatings, otherUserRatings);
        similarities.push([otherUserId, similarity]);
      }
    });

    // Sort by similarity and get top similar users
    const similarUsers = similarities
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .filter(([_, similarity]) => similarity > 0);

    // Get movies rated by similar users
    const ratedMovieIds = new Set(userRatings.map(r => r.movie_id));
    const movieScores = new Map<number, { score: number, count: number }>();

    similarUsers.forEach(([similarUserId, similarity]) => {
      const similarUserRatings = userRatingsMap.get(similarUserId);
      similarUserRatings.forEach((rating: any) => {
        if (!ratedMovieIds.has(rating.movie_id)) {
          if (!movieScores.has(rating.movie_id)) {
            movieScores.set(rating.movie_id, { score: 0, count: 0 });
          }
          const movieScore = movieScores.get(rating.movie_id)!;
          movieScore.score += rating.rating * similarity;
          movieScore.count += 1;
        }
      });
    });

    // Get movie details for recommendations
    const movieIds = Array.from(movieScores.keys());
    const { data: movies, error: moviesError } = await supabase
      .from('movies')
      .select(MOVIE_QUERY)
      .in('movie_id', movieIds);

    if (moviesError) {
      console.error('Error fetching movies:', moviesError);
      return NextResponse.json(
        { error: 'Database error', details: moviesError.message },
        { status: 500 }
      );
    }

    // Calculate final recommendations with improved scoring
    const rawScores = movies?.map(movie => {
      const ratings = movie.ratings || [];
      const totalRatings = ratings.length;
      const averageRating = totalRatings > 0
        ? ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / totalRatings
        : 0;

      const movieScore = movieScores.get(movie.movie_id)!;

      // Combine collaborative filtering score with average rating
      const collaborativeScore = movieScore.score / movieScore.count;
      const popularityWeight = Math.min(totalRatings / 100, 1); // Cap at 100 ratings
      const score = (collaborativeScore * 0.7) + (averageRating * 0.3 * popularityWeight);

      return {
        title: movie.title,
        rawScore: score,
        movieId: movie.movie_id,
        averageRating,
        totalRatings,
        genres: movie.genres?.split('|').map((g: string) => g.trim()) || []
      };
    }) || [];

    // Find min and max scores for normalization
    const scores = rawScores.map(m => m.rawScore);
    const minScore = Math.min(...scores);
    const maxScore = Math.max(...scores);

    // Normalize scores and sort
    const recommendations = rawScores
      .map(movie => ({
        ...movie,
        score: Number(normalizeScore(movie.rawScore, minScore, maxScore).toFixed(2))
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    return NextResponse.json({ recommendations });

  } catch (error) {
    console.error('Unexpected error in API route:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 