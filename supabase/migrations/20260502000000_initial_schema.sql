-- user_profiles
create table public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  subscription_tier text not null default 'base' check (subscription_tier in ('base', 'plus', 'pro')),
  monthly_donation_budget numeric not null default 2.50,
  monthly_donated numeric not null default 0,
  budget_reset_at timestamptz not null default (date_trunc('month', now()) + interval '1 month'),
  streak integer not null default 0,
  total_sparks_earned integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.user_profiles enable row level security;
create policy "Users can read own profile" on public.user_profiles for select using (auth.uid() = id);
create policy "Users can insert own profile" on public.user_profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.user_profiles for update using (auth.uid() = id);

-- builds
create table public.builds (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  cause_id text not null,
  cause_name text not null,
  charity text not null,
  started_at timestamptz not null,
  completed_at timestamptz not null,
  grid_col integer not null,
  grid_row integer not null,
  created_at timestamptz not null default now()
);

alter table public.builds enable row level security;
create policy "Users can read own builds" on public.builds for select using (auth.uid() = user_id);
create policy "Users can insert own builds" on public.builds for insert with check (auth.uid() = user_id);

-- donations
create table public.donations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  build_id text not null references public.builds(id),
  cause_id text not null,
  cause_name text not null,
  charity text not null,
  amount_usd numeric not null,
  spark_cost integer not null,
  funded boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.donations enable row level security;
create policy "Users can read own donations" on public.donations for select using (auth.uid() = user_id);
create policy "Users can insert own donations" on public.donations for insert with check (auth.uid() = user_id);
