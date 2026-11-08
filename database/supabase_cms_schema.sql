-- Run this entire file in the trusted Supabase SQL editor after creating and
-- confirming the designated owner in Auth. See CMS_SETUP.md.
-- Abort before changing schema/policies instead of silently seeding no owner.
begin;
do $owner_preflight$
begin
  if (select count(*) from auth.users
      where lower(email) = 'xiaodong@sflaser.net'
      and email_confirmed_at is not null) <> 1 then
    raise exception 'CMS setup requires exactly one confirmed Auth user for xiaodong@sflaser.net. Create and confirm that owner first, then rerun this entire file.';
  end if;
end;
$owner_preflight$;

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
set search_path = ''
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

-- CMS authorization is independent of public signup and user-editable metadata.
-- This schema is not exposed through the Data API. Clients can only read their
-- own membership, and cannot grant themselves (or anyone else) CMS access.
create schema if not exists cms_private;
revoke all on schema cms_private from public, anon;
grant usage on schema cms_private to authenticated, service_role;
create table if not exists cms_private.cms_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table cms_private.cms_admins enable row level security;
revoke all on table cms_private.cms_admins from public, anon, authenticated;
grant select on table cms_private.cms_admins to authenticated;
grant all on table cms_private.cms_admins to service_role;
drop policy if exists cms_admins_read_self on cms_private.cms_admins;
create policy cms_admins_read_self on cms_private.cms_admins
for select to authenticated using (user_id = (select auth.uid()));

create or replace function public.is_cms_admin()
returns boolean language sql stable security invoker set search_path = ''
as $$
  select exists (
    select 1 from cms_private.cms_admins where user_id = (select auth.uid())
  );
$$;
revoke all on function public.is_cms_admin() from public, anon;
grant execute on function public.is_cms_admin() to authenticated, service_role;

-- Preserve the existing, confirmed owner; never promote arbitrary signups.
insert into cms_private.cms_admins (user_id)
select id from auth.users
where lower(email) = 'xiaodong@sflaser.net' and email_confirmed_at is not null
on conflict (user_id) do nothing;

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

-- Only explicitly authorized CMS administrators may manage content.
drop policy if exists blog_posts_admin_all on public.blog_posts;
create policy blog_posts_admin_all
on public.blog_posts
for all
to authenticated
using ((select public.is_cms_admin()))
with check ((select public.is_cms_admin()));

drop policy if exists products_admin_all on public.products;
create policy products_admin_all
on public.products
for all
to authenticated
using ((select public.is_cms_admin()))
with check ((select public.is_cms_admin()));

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
with check (bucket_id = 'site-assets' and (select public.is_cms_admin()));

drop policy if exists site_assets_auth_update on storage.objects;
create policy site_assets_auth_update
on storage.objects
for update
to authenticated
using (bucket_id = 'site-assets' and (select public.is_cms_admin()))
with check (bucket_id = 'site-assets' and (select public.is_cms_admin()));

drop policy if exists site_assets_auth_delete on storage.objects;
create policy site_assets_auth_delete
on storage.objects
for delete
to authenticated
using (bucket_id = 'site-assets' and (select public.is_cms_admin()));

-- Fail the whole bootstrap if the trusted owner was not provisioned.
do $owner_postflight$
begin
  if (select count(*) from cms_private.cms_admins a
      join auth.users u on u.id = a.user_id
      where lower(u.email) = 'xiaodong@sflaser.net'
      and u.email_confirmed_at is not null) <> 1 then
    raise exception 'CMS owner provisioning failed; all setup changes have been rolled back.';
  end if;
end;
$owner_postflight$;
commit;
