-- Policies for users table
CREATE POLICY "Enable read access for all users" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING ((auth.uid())::text::int8 = id)
    WITH CHECK ((auth.uid())::text::int8 = id);

CREATE POLICY "Enable insert for authenticated users" ON public.users
    FOR INSERT WITH CHECK ((auth.uid())::text::int8 = id); 