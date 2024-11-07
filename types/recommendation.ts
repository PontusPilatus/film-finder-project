export interface Recommendation {
  movieId: string;
  score: number;
  similarMovies: string[];
} 