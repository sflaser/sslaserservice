-- Remediate review Y1: authentication alone is not CMS authorization.
-- Preserve the confirmed owner without embedding generated user IDs.
do $$
begin
  if (select count(*) from auth.users where lower(email) = 'xiaodong@sflaser.net'
      and email_confirmed_at is not null) <> 1 then
    raise exception 'Expected exactly one confirmed CMS owner; no policies changed';
  end if;
end;
$$;

alter function public.set_updated_at() set search_path = '';

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
