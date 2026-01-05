-- Allow users to read their own role
create policy "Users can read own role" on public.user_roles
  for select using (auth.uid() = user_id);

-- Also allow the automation/service role to do everything
create policy "Service role full access" on public.user_roles
  for all using ( auth.role() = 'service_role' );
