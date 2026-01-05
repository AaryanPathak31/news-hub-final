-- Drop existing policy if it exists to clean up
drop policy if exists "Categories are viewable by everyone" on public.categories;
drop policy if exists "Enable read access for all users" on public.categories;

-- Create a fresh, permissive read policy
create policy "Categories are viewable by everyone" on public.categories
  for select using (true);

-- Ensure RLS is enabled (it should be, but good to double check)
alter table public.categories enable row level security;
