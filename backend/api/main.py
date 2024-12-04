from fastapi import FastAPI, HTTPException
from .recommendations import recommender

app = FastAPI()

@app.get("/api/recommendations/{user_id}")
async def get_recommendations(user_id: int, n: int = 10):
    try:
        recommendations = recommender.get_recommendations(user_id, n)
        return {
            "recommendations": [
                {
                    "title": title,
                    "score": score
                } for title, score in recommendations
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 