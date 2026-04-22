CREATE TYPE public.waitlist_audience AS ENUM ('kid', 'parent', 'coach', 'club', 'brand', 'journalist');

CREATE TABLE public.waitlist_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL CHECK (char_length(trim(name)) BETWEEN 1 AND 100),
  email TEXT NOT NULL CHECK (char_length(trim(email)) BETWEEN 3 AND 255),
  country TEXT NOT NULL CHECK (char_length(trim(country)) BETWEEN 2 AND 100),
  audience public.waitlist_audience NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX waitlist_entries_email_unique_idx
ON public.waitlist_entries (lower(email));

ALTER TABLE public.waitlist_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can join the Bergkamp25 waitlist"
ON public.waitlist_entries
FOR INSERT
TO anon, authenticated
WITH CHECK (true);