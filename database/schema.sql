-- Extensions
create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- Tables
create table if not exists public.vendors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  phone text,
  website text,
  city text,
  created_at timestamptz not null default now()
);

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  title text not null,
  category text not null,
  description text,
  price_min numeric(10,2),
  price_max numeric(10,2),
  tags text[] not null default '{}',
  is_published boolean not null default false,
  views int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

-- Trigger or maintain updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end; $$ language plpgsql;

drop trigger if exists trg_listings_updated_at on public.listings;
create trigger trg_listings_updated_at
before update on public.listings
for each row execute function public.set_updated_at();

-- Indexes: search & filters
create index if not exists idx_listings_category on public.listings(category);
create index if not exists idx_listings_published on public.listings(is_published);
create index if not exists idx_listings_vendor on public.listings(vendor_id);
create index if not exists idx_listings_tags on public.listings using gin(tags);
create index if not exists idx_listings_trgm on public.listings using gin ((title || ' ' || coalesce(description,'')) gin_trgm_ops);