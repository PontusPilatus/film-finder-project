-- Clear existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.movies;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.movies;
DROP POLICY IF EXISTS "Enable update for movie owners" ON public.movies;
DROP POLICY IF EXISTS "Enable delete for movie owners" ON public.movies;

-- Create read-only policy for movies
CREATE POLICY "Enable read access for all users" ON public.movies
    FOR SELECT USING (true); 