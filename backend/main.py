from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
from pathlib import Path
import pickle

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Add your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model components and data
try:
    data_dir = Path("backend/data")
    
    # Load model components
    P = np.load(data_dir / "model_P.npy")
    Q = np.load(data_dir / "model_Q.npy")
    bu = np.load(data_dir / "model_bu.npy")
    bi = np.load(data_dir / "model_bi.npy")
    mu = np.load(data_dir / "model_mu.npy")[0]
    
    # Load mappings
    with open(data_dir / "user_id_map.pkl", "rb") as f:
        user_id_map = pickle.load(f)
    with open(data_dir / "movie_id_map.pkl", "rb") as f:
        movie_id_map = pickle.load(f)
        
    # Load movies data
    movies_df = pd.read_csv(data_dir / "processed/filtered_movies.csv")
    ratings_df = pd.read_csv(data_dir / "processed/filtered_ratings.csv")
    
except Exception as e:
    print(f"Error loading model components: {e}")
    raise

@app.get("/api/recommendations/{user_id}")
async def get_recommendations(user_id: int, n: int = 10):
    try:
        if user_id not in user_id_map:
            return {"recommendations": []}
        
        user_idx = user_id_map[user_id]
        
        # Get user's rated movies
        user_ratings = ratings_df[ratings_df["userId"] == user_id]
        rated_movie_ids = set(user_ratings["movieId"])
        
        # Get unrated movies
        all_movie_ids = set(movie_id_map.keys())
        unrated_movie_ids = list(all_movie_ids - rated_movie_ids)
        
        if not unrated_movie_ids:
            return {"recommendations": []}
        
        # Generate predictions
        predictions = []
        for movie_id in unrated_movie_ids:
            movie_idx = movie_id_map[movie_id]
            pred = mu + bu[user_idx] + bi[movie_idx] + np.dot(P[user_idx], Q[movie_idx].T)
            predictions.append((movie_id, float(pred)))
        
        # Sort and get top N recommendations
        predictions.sort(key=lambda x: x[1], reverse=True)
        top_n = predictions[:n]
        
        # Get movie details
        recommendations = []
        for movie_id, score in top_n:
            movie = movies_df[movies_df["movieId"] == movie_id].iloc[0]
            recommendations.append({
                "title": movie["title"],
                "score": score
            })
        
        return {"recommendations": recommendations}
        
    except Exception as e:
        print(f"Error generating recommendations: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 