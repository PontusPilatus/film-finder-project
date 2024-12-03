export interface Movie {
  id: number;
  title: string;
  overview?: string;
  releaseDate?: string;
  genres: string[] | string;  // Can be either an array of strings or a pipe-separated string
  supabaseRatingAverage?: number;
  totalRatings?: number;
  // ... other properties
} 