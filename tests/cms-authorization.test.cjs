const { test } = require('node:test');
const assert = require('node:assert/strict');
const { handler } = require('../netlify/functions/notify-blog-published.js');

test('notification endpoint requires current CMS membership before any webhook', async () => {
  const originalFetch = global.fetch;
  const saved = { ...process.env };
  process.env.SUPABASE_URL = 'https://cms.example.test';
  process.env.SUPABASE_ANON_KEY = 'public-test-key';
  process.env.DINGTALK_WEBHOOK_URL = 'https://webhook.example.test';
  delete process.env.WECOM_WEBHOOK_URL;
  const calls = [];
  try {
    for (const [ok, membership] of [[true, false], [false, true], [true, 'true'], [true, { role: 'admin' }]]) {
      global.fetch = async (url, options) => {
        calls.push({ url, options });
        assert.equal(url, 'https://cms.example.test/rest/v1/rpc/is_cms_admin');
        assert.equal(options.headers.Authorization, 'Bearer dummy-session');
        return { ok, json: async () => membership };
      };
      const result = await handler({ httpMethod: 'POST', headers: { authorization: 'Bearer dummy-session' }, body: JSON.stringify({ status: 'published', slug: 'example', title: 'Example' }) });
      assert.equal(result.statusCode, 401);
    }
    global.fetch = async (url) => {
      assert.equal(url, 'https://cms.example.test/rest/v1/rpc/is_cms_admin');
      return { ok: true, json: async () => true };
    };
    // Draft processing proves access is granted without sending any message.
    const allowed = await handler({ httpMethod: 'POST', headers: { authorization: 'Bearer dummy-session' }, body: '{"status":"draft"}' });
    assert.equal(allowed.statusCode, 200);
    assert.equal(JSON.parse(allowed.body).sent, false);
    global.fetch = async () => { throw new Error('No request expected without a token'); };
    const missing = await handler({ httpMethod: 'POST', headers: {}, body: '{}' });
    assert.equal(missing.statusCode, 401);
    assert.equal(calls.length, 4);
  } finally {
    global.fetch = originalFetch;
    for (const key of ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'DINGTALK_WEBHOOK_URL', 'WECOM_WEBHOOK_URL']) {
      if (saved[key] === undefined) delete process.env[key]; else process.env[key] = saved[key];
    }
  }
});
