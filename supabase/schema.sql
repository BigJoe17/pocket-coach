-- Create a table for public profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  preferences jsonb DEFAULT '{}'::jsonb,

  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS)
-- See https://supabase.com/docs/guides/auth/row-level-security for more details.
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- CHAT SESSIONS
create table sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  coach_id text not null, -- 'focus', 'energy', 'clarity'
  title text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table sessions enable row level security;
create policy "Users can view own sessions." on sessions for select using (auth.uid() = user_id);
create policy "Users can insert own sessions." on sessions for insert with check (auth.uid() = user_id);
create policy "Users can update own sessions." on sessions for update using (auth.uid() = user_id);
create policy "Users can delete own sessions." on sessions for delete using (auth.uid() = user_id);

-- CHAT MESSAGES
create table messages (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references sessions on delete cascade not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table messages enable row level security;
create policy "Users can view messages of own sessions." on messages 
    for select using (exists (select 1 from sessions where id = messages.session_id and user_id = auth.uid()));
create policy "Users can insert messages to own sessions." on messages 
    for insert with check (exists (select 1 from sessions where id = messages.session_id and user_id = auth.uid()));

-- SAVED ITEMS
create table saved_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  type text not null, -- 'message', 'session', 'note'
  content jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table saved_items enable row level security;
create policy "Users can crude own saved items." on saved_items for all using (auth.uid() = user_id);

-- Function to handle new user signup
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- CUSTOM COACHES
create table custom_coaches (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  subtitle text,
  tone text,
  emoji text,
  system_prompt text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table custom_coaches enable row level security;

create policy "Users can CRUD own custom coaches." on custom_coaches
  for all using (auth.uid() = user_id);
