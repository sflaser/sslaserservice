-- Run as the database owner AFTER the CMS authorization migration.
-- Transaction-only RLS regression: no auth users, files, or notifications created.
-- Fixture content uses explicit negative IDs (no identity sequence advancement).
-- Storage entries are metadata only, under a unique reserved test name; no bytes
-- are uploaded. The transaction-local Storage delete flag lets us exercise RLS
-- rather than the platform's direct-SQL delete guard. ALL fixtures roll back.
-- Successful execution ends with the final status row AFTER ROLLBACK.
begin;
set local statement_timeout = '15s';
set local lock_timeout = '3s';
set local storage.allow_delete_query = 'true';
set local request.jwt.claim.sub = '';
set local request.jwt.claim.role = '';

do $$
declare owner_id uuid;
begin
  select id into strict owner_id from auth.users
  where lower(email) = 'xiaodong@sflaser.net' and email_confirmed_at is not null;
  if not exists(select 1 from cms_private.cms_admins where user_id = owner_id) then
    raise exception 'Confirmed owner has no CMS membership';
  end if;
  perform set_config('test.cms_owner_id', owner_id::text, true);
  if exists(select 1 from public.blog_posts where id in (-2026110801,-2026110802,-2026110803))
     or exists(select 1 from public.products where id in (-2026110801,-2026110802,-2026110803))
     or exists(select 1 from storage.objects where bucket_id='site-assets' and name like '__cms_rls_regression_20261108_%') then
    raise exception 'Reserved regression fixture identifiers already exist; stop without overwriting';
  end if;
  -- Fixtures are distinguishable from every existing content row.
  insert into public.blog_posts (id,title,slug,content,status) overriding system value values
    (-2026110801,'RLS test draft','__cms_rls_regression_20261108_draft','test','draft'),
    (-2026110802,'RLS test published','__cms_rls_regression_20261108_published','test','published');
  insert into public.products (id,name,slug,price_cents,purchase_url,status) overriding system value values
    (-2026110801,'RLS test draft','__cms_rls_regression_20261108_draft',0,'https://example.invalid','draft'),
    (-2026110802,'RLS test published','__cms_rls_regression_20261108_published',0,'https://example.invalid','published');
  insert into storage.objects (bucket_id,name) values ('site-assets','__cms_rls_regression_20261108_existing');
end $$;

set local role anon;
select set_config('request.jwt.claims','{"role":"anon"}',true);
do $$
begin
  if (select count(*) from public.blog_posts where id in (-2026110801,-2026110802)) <> 1 then
    raise exception 'Anonymous article visibility differs from published only';
  end if;
  if (select count(*) from public.products where id in (-2026110801,-2026110802)) <> 1 then
    raise exception 'Anonymous product visibility differs from published only';
  end if;
  if (select count(*) from storage.objects where bucket_id='site-assets' and name='__cms_rls_regression_20261108_existing') <> 1 then
    raise exception 'Anonymous public asset read was broken';
  end if;
  begin
    perform public.is_cms_admin();
    raise exception 'Anonymous caller can execute admin membership RPC';
  exception when insufficient_privilege then null; end;
  begin
    perform 1 from cms_private.cms_admins;
    raise exception 'Anonymous caller can access private membership table';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.blog_posts(id,title,slug,content,status) overriding system value
    values(-2026110803,'test','__cms_rls_regression_20261108_rejected','test','published');
    raise exception 'Anonymous caller inserted an article';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.products(id,name,slug,price_cents,purchase_url,status) overriding system value
    values(-2026110803,'test','__cms_rls_regression_20261108_rejected',0,'https://example.invalid','published');
    raise exception 'Anonymous caller inserted a product';
  exception when insufficient_privilege then null; end;
  begin
    insert into storage.objects(bucket_id,name) values('site-assets','__cms_rls_regression_20261108_rejected');
    raise exception 'Anonymous caller inserted asset metadata';
  exception when insufficient_privilege then null; end;
end $$;
reset role;

set local role authenticated;
-- This is a database-local role simulation, not an actual JWT or new auth user.
-- Forged admin-looking metadata must not confer membership.
select set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-000000000001","role":"authenticated","user_metadata":{"role":"admin"},"app_metadata":{"cms_admin":true}}',true);
do $$
declare affected integer;
begin
  if public.is_cms_admin() then raise exception 'Unlisted authenticated user became admin'; end if;
  if exists(select 1 from cms_private.cms_admins) then raise exception 'Unlisted user can enumerate memberships'; end if;
  if (select count(*) from public.blog_posts where id in (-2026110801,-2026110802)) <> 1
    or (select count(*) from public.products where id in (-2026110801,-2026110802)) <> 1 then
    raise exception 'Unlisted user can read draft content or cannot read published content';
  end if;
  begin
    insert into public.blog_posts(id,title,slug,content,status) overriding system value
    values(-2026110803,'test','__cms_rls_regression_20261108_rejected','test','published');
    raise exception 'Unlisted user inserted an article';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.products(id,name,slug,price_cents,purchase_url,status) overriding system value
    values(-2026110803,'test','__cms_rls_regression_20261108_rejected',0,'https://example.invalid','published');
    raise exception 'Unlisted user inserted a product';
  exception when insufficient_privilege then null; end;
  update public.blog_posts set title='unauthorized' where id in (-2026110801,-2026110802);
  get diagnostics affected=row_count;
  if affected<>0 then raise exception 'Unlisted user updated articles'; end if;
  delete from public.blog_posts where id in (-2026110801,-2026110802);
  get diagnostics affected=row_count;
  if affected<>0 then raise exception 'Unlisted user deleted articles'; end if;
  update public.products set name='unauthorized' where id in (-2026110801,-2026110802);
  get diagnostics affected=row_count;
  if affected<>0 then raise exception 'Unlisted user updated products'; end if;
  delete from public.products where id in (-2026110801,-2026110802);
  get diagnostics affected=row_count;
  if affected<>0 then raise exception 'Unlisted user deleted products'; end if;
  begin
    insert into storage.objects(bucket_id,name) values('site-assets','__cms_rls_regression_20261108_rejected');
    raise exception 'Unlisted user inserted asset metadata';
  exception when insufficient_privilege then null; end;
  update storage.objects set metadata='{"unauthorized":true}' where bucket_id='site-assets' and name='__cms_rls_regression_20261108_existing';
  get diagnostics affected=row_count;
  if affected<>0 then raise exception 'Unlisted user updated asset metadata'; end if;
  delete from storage.objects where bucket_id='site-assets' and name='__cms_rls_regression_20261108_existing';
  get diagnostics affected=row_count;
  if affected<>0 then raise exception 'Unlisted user deleted asset metadata'; end if;
  begin
    insert into cms_private.cms_admins(user_id) values (auth.uid());
    raise exception 'Unlisted user granted self CMS access';
  exception when insufficient_privilege then null; end;
end $$;
reset role;

select set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('test.cms_owner_id'),'role','authenticated')::text,true);
set local role authenticated;
do $$
declare affected integer;
begin
  if not public.is_cms_admin() then raise exception 'Confirmed owner lost CMS access'; end if;
  if (select count(*) from cms_private.cms_admins) <> 1 then raise exception 'Owner membership self-read failed'; end if;
  if (select count(*) from public.blog_posts where id in (-2026110801,-2026110802)) <> 2
    or (select count(*) from public.products where id in (-2026110801,-2026110802)) <> 2 then
    raise exception 'Owner cannot read draft content';
  end if;
  insert into public.blog_posts(id,title,slug,content,status) overriding system value
    values(-2026110803,'test','__cms_rls_regression_20261108_owner','test','draft');
  update public.blog_posts set title='owner edit' where id=-2026110803;
  get diagnostics affected=row_count;
  if affected<>1 then raise exception 'Owner article update failed'; end if;
  delete from public.blog_posts where id=-2026110803;
  get diagnostics affected=row_count;
  if affected<>1 then raise exception 'Owner article delete failed'; end if;
  insert into public.products(id,name,slug,price_cents,purchase_url,status) overriding system value
    values(-2026110803,'test','__cms_rls_regression_20261108_owner',0,'https://example.invalid','draft');
  update public.products set name='owner edit' where id=-2026110803;
  get diagnostics affected=row_count;
  if affected<>1 then raise exception 'Owner product update failed'; end if;
  delete from public.products where id=-2026110803;
  get diagnostics affected=row_count;
  if affected<>1 then raise exception 'Owner product delete failed'; end if;
  insert into storage.objects(bucket_id,name) values('site-assets','__cms_rls_regression_20261108_owner');
  update storage.objects set metadata='{"test":true}' where bucket_id='site-assets' and name='__cms_rls_regression_20261108_owner';
  get diagnostics affected=row_count;
  if affected<>1 then raise exception 'Owner asset update failed'; end if;
  delete from storage.objects where bucket_id='site-assets' and name='__cms_rls_regression_20261108_owner';
  get diagnostics affected=row_count;
  if affected<>1 then raise exception 'Owner asset delete failed'; end if;
  -- Content admin does not mean permission to grant/revoke administrators.
  begin
    delete from cms_private.cms_admins where user_id=auth.uid();
    raise exception 'Authenticated content admin can change membership';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
-- Revocation must take effect without refreshing any JWT claims. This delete is
-- uncommitted and is rolled back below, so the real owner's membership persists.
delete from cms_private.cms_admins where user_id=current_setting('test.cms_owner_id')::uuid;
set local role authenticated;
do $$
begin
  if public.is_cms_admin() then raise exception 'Revoked membership still authorizes stale session'; end if;
end $$;
reset role;
rollback;

-- After rollback: no content or storage metadata fixture may remain.
do $$
begin
  if exists(select 1 from public.blog_posts where id in (-2026110801,-2026110802,-2026110803))
    or exists(select 1 from public.products where id in (-2026110801,-2026110802,-2026110803))
    or exists(select 1 from storage.objects where bucket_id='site-assets' and name like '__cms_rls_regression_20261108_%') then
    raise exception 'Regression fixtures were not fully rolled back';
  end if;
end $$;
select 'PASS: anon published reads; unlisted user denied CMS/storage writes and membership; owner CRUD preserved; all fixtures rolled back' as cms_rls_regression;
