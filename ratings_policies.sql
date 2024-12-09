-- Enable RLS on ratings table
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Policies for ratings table
CREATE POLICY "Enable read access for all users" ON public.ratings
    FOR SELECT USING (true);

CREATE POLICY "Enable users to add their own ratings" ON public.ratings
    FOR INSERT WITH CHECK ((auth.uid())::text::int8 = user_id);

CREATE POLICY "Enable users to update their own ratings" ON public.ratings
    FOR UPDATE USING ((auth.uid())::text::int8 = user_id)
    WITH CHECK ((auth.uid())::text::int8 = user_id);

CREATE POLICY "Enable users to delete their own ratings" ON public.ratings
    FOR DELETE USING ((auth.uid())::text::int8 = user_id); 