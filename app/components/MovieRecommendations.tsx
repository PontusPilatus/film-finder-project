'use client';

import { useState, useEffect } from 'react';

interface Recommendation {
  title: string;
  score: number;
}

export default function MovieRecommendations({ userId }: { userId: number }) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/recommendations/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch recommendations');
        const data = await response.json();
        setRecommendations(data.recommendations);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load recommendations');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 text-center p-4">
        {error}
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="text-gray-400 text-center p-8">
        No recommendations available. Try rating more movies!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {recommendations.map((rec, index) => (
        <div 
          key={index} 
          className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-4 hover:bg-blue-500/10 transition-all duration-200"
        >
          <h3 className="text-lg font-semibold text-gray-100 mb-2">
            {rec.title}
          </h3>
          <p className="text-gray-400">
            Recommendation Score: {rec.score.toFixed(2)}
          </p>
        </div>
      ))}
    </div>
  );
} 