DROP POLICY IF EXISTS "Anyone can join the Bergkamp25 waitlist" ON public.waitlist_entries;

CREATE POLICY "Anyone can join the Bergkamp25 waitlist"
ON public.waitlist_entries
FOR INSERT
TO anon, authenticated
WITH CHECK (
  char_length(trim(name)) BETWEEN 1 AND 100
  AND email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  AND char_length(trim(email)) BETWEEN 3 AND 255
  AND char_length(trim(country)) BETWEEN 2 AND 100
);