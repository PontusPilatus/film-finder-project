export interface Recommendation {
  movieId: number;
  title: string;
  score: number;
  genres?: string[];
  averageRating?: number;
  totalRatings?: number;
} 