const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

// Static bootstrap-contract checks: these deliberately do not connect to a DB.
const root = join(__dirname, '..');
const schema = readFileSync(join(root, 'database/supabase_cms_schema.sql'), 'utf8');
const guide = readFileSync(join(root, 'CMS_SETUP.md'), 'utf8');

test('fresh setup checks the confirmed owner before DDL and commits only after provisioning', () => {
  const begin = schema.indexOf('\nbegin;');
  const preflight = schema.indexOf('do $owner_preflight$');
  const createTable = schema.indexOf('create table');
  const seed = schema.indexOf('insert into cms_private.cms_admins');
  const postflight = schema.indexOf('do $owner_postflight$');
  const commit = schema.lastIndexOf('\ncommit;');
  assert.ok(begin >= 0 && begin < preflight && preflight < createTable);
  assert.ok(createTable < seed && seed < postflight && postflight < commit);
  for (const tag of ['owner_preflight', 'owner_postflight']) {
    const block = schema.split(`do $${tag}$`)[1].split(`$${tag}$;`)[0];
    assert.match(block, /email_confirmed_at is not null/);
    assert.match(block, /xiaodong@sflaser\.net/);
    assert.match(block, /<> 1 then\s+raise exception/);
  }
  assert.match(schema.slice(seed, postflight), /select id from auth\.users[\s\S]*email_confirmed_at is not null[\s\S]*on conflict \(user_id\) do nothing/);
});

test('setup guide requires owner creation before schema execution and verifies membership', () => {
  const createOwner = guide.indexOf('create the designated owner');
  const runSchema = guide.indexOf('`database/supabase_cms_schema.sql`');
  assert.ok(createOwner >= 0 && runSchema > createOwner);
  assert.match(guide, /both `email_confirmed` and `cms_admin` equal to `true`/);
  assert.match(guide, /If you previously ran the schema before creating the owner/);
  assert.match(guide, /Creating an Auth user alone does \*\*not\*\* grant CMS access/);
});
