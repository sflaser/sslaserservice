-- Create blog posts table
create table if not exists public.blog_posts (
  id bigint generated always as identity primary key,
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null,
  cover_image_url text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create products table
create table if not exists public.products (
  id bigint generated always as identity primary key,
  name text not null,
  slug text not null unique,
  short_description text,
  description text,
  image_url text,
  brochure_url text,
  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'USD',
  purchase_url text not null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists public.products
  add column if not exists brochure_url text;

-- Trigger helper for updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_blog_posts_updated_at on public.blog_posts;
create trigger trg_blog_posts_updated_at
before update on public.blog_posts
for each row execute function public.set_updated_at();

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

-- Enable RLS
alter table public.blog_posts enable row level security;
alter table public.products enable row level security;

-- Public can only read published content
drop policy if exists blog_posts_public_read on public.blog_posts;
create policy blog_posts_public_read
on public.blog_posts
for select
to anon, authenticated
using (status = 'published');

drop policy if exists products_public_read on public.products;
create policy products_public_read
on public.products
for select
to anon, authenticated
using (status = 'published');

-- Authenticated users can manage content (admin users should be controlled in Supabase Auth)
drop policy if exists blog_posts_admin_all on public.blog_posts;
create policy blog_posts_admin_all
on public.blog_posts
for all
to authenticated
using (true)
with check (true);

drop policy if exists products_admin_all on public.products;
create policy products_admin_all
on public.products
for all
to authenticated
using (true)
with check (true);

-- Storage bucket for uploaded images
insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true)
on conflict (id) do nothing;

drop policy if exists site_assets_public_read on storage.objects;
create policy site_assets_public_read
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'site-assets');

drop policy if exists site_assets_auth_insert on storage.objects;
create policy site_assets_auth_insert
on storage.objects
for insert
to authenticated
with check (bucket_id = 'site-assets');

drop policy if exists site_assets_auth_update on storage.objects;
create policy site_assets_auth_update
on storage.objects
for update
to authenticated
using (bucket_id = 'site-assets')
with check (bucket_id = 'site-assets');

drop policy if exists site_assets_auth_delete on storage.objects;
create policy site_assets_auth_delete
on storage.objects
for delete
to authenticated
using (bucket_id = 'site-assets');
