-- Add secondary_category column to articles table
ALTER TABLE public.articles
ADD COLUMN IF NOT EXISTS secondary_category text;

-- (Optional) If we wanted to validate values:
-- ALTER TABLE public.articles ADD CONSTRAINT check_sec_category CHECK (secondary_category IN ('world', 'india', ...));
