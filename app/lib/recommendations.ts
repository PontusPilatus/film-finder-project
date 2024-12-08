import { supabase } from './supabaseClient'

export async function getGenreBasedRecommendations(
  userId: number,
  unratedMovies?: any[],
  userRatings?: any[]
) {
  if (!unratedMovies || !userRatings) {
    // Fetch the necessary data if not provided
    const { data: ratings } = await supabase
      .from('ratings')
      .select('*')
      .eq('user_id', userId);
    
    const { data: movies } = await supabase
      .from('movies')
      .select('*, ratings(*)');
    
    userRatings = ratings || [];
    unratedMovies = movies?.filter(movie => 
      !userRatings?.some(rating => rating.movie_id === movie.movie_id)
    ) || [];
  }

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

export async function getPopularityBasedRecommendations(
  userId: number,
  unratedMovies?: any[],
  userRatings?: any[]
) {
  if (!unratedMovies || !userRatings) {
    // Fetch the necessary data if not provided
    const { data: ratings } = await supabase
      .from('ratings')
      .select('*')
      .eq('user_id', userId);
    
    const { data: movies } = await supabase
      .from('movies')
      .select('*, ratings(*)');
    
    userRatings = ratings || [];
    unratedMovies = movies?.filter(movie => 
      !userRatings?.some(rating => rating.movie_id === movie.movie_id)
    ) || [];
  }

  // Get all users who have rated the same movies as our user
  const { data: similarUsers, error: similarUsersError } = await supabase
    .from('ratings')
    .select('user_id, movie_id, rating')
    .in('movie_id', userRatings.map(r => r.movie_id));

  if (similarUsersError) {
    console.error('Error fetching similar users:', similarUsersError);
    return [];
  }

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

    // Combine similarity and popularity scores
    const finalScore = similarityScore > 0
      ? (similarityScore * 0.7 + avgRating * 0.3)
      : avgRating;

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