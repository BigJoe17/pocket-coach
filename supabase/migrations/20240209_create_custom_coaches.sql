-- CUSTOM COACHES TABLE
create table if not exists custom_coaches (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  subtitle text,
  tone text,
  emoji text,
  system_prompt text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ENABLE ROW LEVEL SECURITY
alter table custom_coaches enable row level security;

-- ALLOW USERS TO MANAGE THEIR OWN COACHES
-- Note: Check if policy exists before creating to avoid errors if re-run, 
-- but straightforward creation is usually fine for one-off via dashboard.
create policy "Users can CRUD own custom coaches." on custom_coaches
  for all using (auth.uid() = user_id);
