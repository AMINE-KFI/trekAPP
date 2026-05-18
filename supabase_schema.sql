-- 1. TABLE DES PROFILS (Préfrences, Nom, Thème, etc.)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  theme text default 'automatic',
  weight_unit text default 'kg',
  categories jsonb default '["Abri", "Sommeil", "Cuisine", "Vêtement", "Hygiène", "Consommable", "Neutre"]'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS (Row Level Security) pour profiles
alter table public.profiles enable row level security;

create policy "Les utilisateurs peuvent voir leur profil" on public.profiles
  for select using (auth.uid() = id);

create policy "Les utilisateurs peuvent modifier leur profil" on public.profiles
  for update using (auth.uid() = id);

create policy "Les utilisateurs peuvent insérer leur profil" on public.profiles
  for insert with check (auth.uid() = id);


-- 2. TRIGGER D'INSCRIPTION AUTOMATIQUE DE PROFIL
-- Crée automatiquement une ligne dans public.profiles dès qu'un compte est créé
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 3. TABLE DES ÉQUIPEMENTS (Items)
create table if not exists public.items (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  weight text,
  category text,
  is_consumable boolean default false,
  brand text,
  tech_info text,
  image_uri text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS pour items (Chaque utilisateur ne voit/modifie que ses objets)
alter table public.items enable row level security;

create policy "Les utilisateurs peuvent voir leurs objets" on public.items
  for select using (auth.uid() = user_id);

create policy "Les utilisateurs peuvent insérer leurs objets" on public.items
  for insert with check (auth.uid() = user_id);

create policy "Les utilisateurs peuvent modifier leurs objets" on public.items
  for update using (auth.uid() = user_id);

create policy "Les utilisateurs peuvent supprimer leurs objets" on public.items
  for delete using (auth.uid() = user_id);


-- 4. TABLE DES SACS À DOS (Packs)
create table if not exists public.packs (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  items jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS pour packs
alter table public.packs enable row level security;

create policy "Les utilisateurs peuvent voir leurs sacs" on public.packs
  for select using (auth.uid() = user_id);

create policy "Les utilisateurs peuvent insérer leurs sacs" on public.packs
  for insert with check (auth.uid() = user_id);

create policy "Les utilisateurs peuvent modifier leurs sacs" on public.packs
  for update using (auth.uid() = user_id);

create policy "Les utilisateurs peuvent supprimer leurs sacs" on public.packs
  for delete using (auth.uid() = user_id);


-- 5. TABLE DES SORTIES (Treks)
create table if not exists public.treks (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  date text,
  pack_id text,
  checklist_items jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS pour treks
alter table public.treks enable row level security;

create policy "Les utilisateurs peuvent voir leurs treks" on public.treks
  for select using (auth.uid() = user_id);

create policy "Les utilisateurs peuvent insérer leurs treks" on public.treks
  for insert with check (auth.uid() = user_id);

create policy "Les utilisateurs peuvent modifier leurs treks" on public.treks
  for update using (auth.uid() = user_id);

create policy "Les utilisateurs peuvent supprimer leurs treks" on public.treks
  for delete using (auth.uid() = user_id);
