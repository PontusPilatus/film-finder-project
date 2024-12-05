import { supabase } from './lib/supabase';

export async function checkTables() {
  console.log('Checking Supabase tables structure...');

  // Check ratings table
  console.log('\nChecking ratings table:');
  const { data: ratings, error: ratingsError } = await supabase
    .from('ratings')
    .select('*')
    .limit(1);
  
  if (ratingsError) {
    console.error('Error fetching ratings:', ratingsError);
  } else {
    console.log('Ratings sample:', ratings);
  }

  // Check movies table
  console.log('\nChecking movies table:');
  const { data: movies, error: moviesError } = await supabase
    .from('movies')
    .select('*')
    .limit(1);
  
  if (moviesError) {
    console.error('Error fetching movies:', moviesError);
  } else {
    console.log('Movies sample:', movies);
  }

  // Check users table
  console.log('\nChecking users table:');
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
    .limit(1);
  
  if (usersError) {
    console.error('Error fetching users:', usersError);
  } else {
    console.log('Users sample:', users);
  }

  // Check relationships
  console.log('\nChecking relationships:');
  const { data: movieWithRatings, error: relError } = await supabase
    .from('movies')
    .select(`
      movie_id,
      title,
      ratings (
        rating_id,
        user_id,
        rating
      )
    `)
    .limit(1);

  if (relError) {
    console.error('Error checking relationships:', relError);
  } else {
    console.log('Movie with ratings:', movieWithRatings);
  }
} 