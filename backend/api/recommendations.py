import numpy as np
import pickle
from pathlib import Path
from typing import List, Tuple

class MovieRecommender:
    def __init__(self):
        # Load model components
        data_dir = Path("backend/data")
        self.P = np.load(data_dir / "model_P.npy")
        self.Q = np.load(data_dir / "model_Q.npy")
        self.bu = np.load(data_dir / "model_bu.npy")
        self.bi = np.load(data_dir / "model_bi.npy")
        self.mu = np.load(data_dir / "model_mu.npy")[0]
        
        # Load mappings
        with open(data_dir / "user_id_map.pkl", "rb") as f:
            self.user_id_map = pickle.load(f)
        with open(data_dir / "movie_id_map.pkl", "rb") as f:
            self.movie_id_map = pickle.load(f)
            
        # Load movies dataframe
        self.movies_df = pd.read_csv(data_dir / "processed/filtered_movies.csv")

    def get_recommendations(
        self, 
        user_id: int, 
        n: int = 10,
        min_ratings: int = 5
    ) -> List[Tuple[str, float]]:
        """Get movie recommendations for a user"""
        try:
            if user_id not in self.user_id_map:
                return []
            
            user_idx = self.user_id_map[user_id]
            
            # Get unrated movies
            user_ratings = np.zeros(len(self.movie_id_map))
            rated_movies = self.ratings_df[self.ratings_df["userId"] == user_id]["movieId"]
            for movie_id in rated_movies:
                if movie_id in self.movie_id_map:
                    user_ratings[self.movie_id_map[movie_id]] = 1
                    
            unrated_movies = np.where(user_ratings == 0)[0]
            
            if len(unrated_movies) == 0:
                return []
                
            # Generate predictions
            predictions = []
            for movie_idx in unrated_movies:
                pred = self.mu + self.bu[user_idx] + self.bi[movie_idx] + \
                       np.dot(self.P[user_idx], self.Q[movie_idx].T)
                predictions.append(pred)
                
            # Scale predictions to 1-5 range
            predictions = np.array(predictions)
            min_pred, max_pred = predictions.min(), predictions.max()
            scaled_predictions = 1 + (predictions - min_pred) * 4 / (max_pred - min_pred)
            
            # Get top recommendations
            top_n = np.argsort(scaled_predictions)[::-1][:n]
            
            recommendations = []
            for i in top_n:
                movie_idx = unrated_movies[i]
                movie_id = {v: k for k, v in self.movie_id_map.items()}[movie_idx]
                movie_title = self.movies_df[self.movies_df["movieId"] == movie_id]["title"].iloc[0]
                recommendations.append((movie_title, float(scaled_predictions[i])))
                
            return recommendations
            
        except Exception as e:
            print(f"Error generating recommendations: {e}")
            return []

# Create singleton instance
recommender = MovieRecommender() 