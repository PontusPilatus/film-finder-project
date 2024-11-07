import { Recommendation } from '@types/recommendation';
import { supabase } from '@utils/supabase';

export async function getRecommendations(movieId: string): Promise<Recommendation[]> {
  const { data, error } = await supabase
    .from('recommendations')
    .select('*')
    .eq('movie_id', movieId);

  if (error) throw error;
  return data || [];
} 