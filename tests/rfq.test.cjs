'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { randomUUID } = require('node:crypto');
const root = path.resolve(__dirname, '..');
const analytics = fs.readFileSync(path.join(root, 'assets/js/analytics.js'), 'utf8');
const rfq = fs.readFileSync(path.join(root, 'assets/js/rfq.js'), 'utf8');
const pages = ['index.html', 'es/index.html', 'landing-eng.html', 'laser-support/es/index.html', 'sg/index.html', 'es/sg/index.html', 'sslaserservice.html', 'sg/laser-repair/index.html', 'es/sg/laser-repair/index.html', 'es/laser-support/index.html'];
const tracking = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'gbraid', 'wbraid'];
const metadata = ['inquiry_id', 'transaction_id', 'market', 'campaign_hint', 'source_page', 'submission_page', 'landing_page', 'referrer', 'first_landing_page', 'first_referrer', ...tracking, ...tracking.map(name => 'first_' + name)];
function attrs(tag) {
  const result = {};
  for (const match of tag.matchAll(/([\w-]+)="([^"]*)"/g)) result[match[1]] = match[2];
  return result;
}
function formHTML(page, visible = true) {
  const html = fs.readFileSync(path.join(root, page), 'utf8');
  return [...html.matchAll(/<form\b[^>]*>.*?<\/form>/gs)].map(match => match[0]).find(text => text.includes('class="rfq-form"') === visible);
}
class Element {
  constructor(attributes = {}, value = '') { this.attributes = attributes; this.value = value; this.textContent = ''; this.disabled = false; this.hidden = false; this.focused = false; }
  setAttribute(key, value) { this.attributes[key] = value; }
  getAttribute(key) { return this.attributes[key] || null; }
  focus() { this.focused = true; }
}
class Form {
  constructor(page) {
    const html = formHTML(page);
    this.attributes = attrs(html.slice(0, html.indexOf('>') + 1));
    this.fields = new Map(); this.dataset = {}; this.listeners = {};
    for (const match of html.matchAll(/<(?:input|select|textarea)\b[^>]*>/g)) {
      const attributes = attrs(match[0]);
      if (attributes.name) this.fields.set(attributes.name, new Element(attributes, attributes.value || ''));
    }
    this.fields.set('g-recaptcha-response', new Element({}, 'mock-valid-token'));
    this.button = new Element(); this.button.textContent = 'Send RFQ';
    this.status = new Element(); this.status.hidden = true;
    this.fields.get('full_name').value = 'Test Person';
    this.fields.get('email').value = 'test@example.test';
    this.fields.get('details').value = 'Test details remain in the form backend only.';
    this.valid = true;
  }
  getAttribute(name) { return this.attributes[name] || null; }
  hasAttribute(name) { return name in this.attributes; }
  querySelector(selector) {
    const name = /^\[name="([^"]+)"\]$/.exec(selector);
    if (name) return this.fields.get(name[1]) || null;
    if (selector === 'button[type="submit"]') return this.button;
    if (selector === '[data-rfq-status]') return this.status;
    return null;
  }
  reportValidity() { return this.valid; }
  addEventListener(name, callback) { (this.listeners[name] ||= []).push(callback); }
  async emit(name) { for (const callback of this.listeners[name] || []) await callback({ preventDefault() {} }); }
}
class MockFormData {
  constructor(form) {
    this.data = new Map([...form.fields].map(([name, field]) => [name, field.attributes.type === 'file' ? field.file || { size: 0, name: '' } : field.value]));
  }
  get(name) { return this.data.get(name) || null; }
  entries() { return this.data.entries(); }
}
function browser(options = {}) {
  const store = options.store || new Map();
  const url = new URL(options.url || 'https://www.sslaserservice.com/');
  const form = options.noForm ? null : new Form(options.page || 'index.html');
  if (options.prepare && form) options.prepare(form);
  const timers = [], redirects = [], requests = [], scripts = [], captchaResets = [];
  const receipt = options.receipt ? new Element() : null;
  const title = new Element(), detail = new Element();
  const document = {
    currentScript: { dataset: {} }, readyState: 'complete', referrer: options.referrer || '', documentElement: { lang: options.lang || 'en-US' },
    querySelectorAll(selector) { return selector === 'form.rfq-form' && form ? [form] : []; },
    querySelector(selector) { return selector === '[data-rfq-receipt]' ? receipt : selector === '[data-rfq-thanks-title]' ? title : selector === '[data-rfq-thanks-detail]' ? detail : null; },
    addEventListener() {}, createElement() { return {}; }, head: { appendChild(node) { scripts.push(node); } }
  };
  const sessionStorage = { getItem(key) { if (options.blockedStorage) throw Error('blocked'); return store.get(key) || null; }, setItem(key, value) { if (options.blockedStorage) throw Error('blocked'); store.set(key, value); }, removeItem(key) { if (options.blockedStorage) throw Error('blocked'); store.delete(key); } };
  const window = {
    location: { origin: url.origin, hostname: url.hostname, pathname: url.pathname, search: url.search, assign(value) { redirects.push(value); } },
    sessionStorage, crypto: { randomUUID }, AbortController, addEventListener() {},
    setTimeout(callback, delay) { const timer = { callback, delay, cleared: false }; timers.push(timer); return timer; },
    clearTimeout(timer) { if (timer) timer.cleared = true; },
    grecaptcha: { reset() { captchaResets.push(true); if (form) form.fields.get('g-recaptcha-response').value = ''; } },
    async fetch(target, init) { requests.push({ target, init }); return options.fetch ? options.fetch(target, init) : { ok: true, status: 200 }; }
  };
  const context = vm.createContext({ window, document, navigator: {}, URL, URLSearchParams, TextEncoder, FormData: MockFormData, Date, console });
  vm.runInContext(analytics, context, { filename: 'analytics.js' });
  if (options.brokenTracker) window.skyfireTrackEvent = function () { throw Error('blocked tracker'); };
  vm.runInContext(rfq, context, { filename: 'rfq.js' });
  return { window, document, form, store, requests, redirects, scripts, timers, receipt, title, detail, captchaResets,
    events() { return window.dataLayer.filter(entry => entry[0] === 'event').map(entry => ({ name: entry[1], params: entry[2] })); },
    config() { return window.dataLayer.find(entry => entry[0] === 'config')[2]; },
    runTimers() { timers.splice(0).filter(timer => !timer.cleared).forEach(timer => timer.callback()); }
  };
}

test('all ten form pages have matching static schemas, spam controls and one shared handler', () => {
  for (const page of pages) {
    const html = fs.readFileSync(path.join(root, page), 'utf8');
    for (const visible of [true, false]) {
      const form = formHTML(page, visible);
      const names = [...form.matchAll(/\bname="([^"]+)"/g)].map(match => match[1]);
      for (const field of metadata) assert.ok(names.includes(field), `${page} ${visible} missing ${field}`);
      assert.ok(form.includes('data-netlify="true"')); assert.ok(form.includes('netlify-honeypot="bot-field"')); assert.ok(form.includes('data-netlify-recaptcha="true"')); assert.ok(names.includes('form-name'));
      const inputs = names.slice(1); assert.equal(new Set(inputs).size, inputs.length, `${page}: duplicate input name`);
      if (visible) { assert.ok(form.includes('data-rfq-status')); assert.ok(form.includes('maxlength="10000"')); }
    }
    assert.equal((html.match(/src="\/assets\/js\/rfq\.js\?v=20260924-rfq1"/g) || []).length, 1);
    assert.ok(!html.includes("await fetch('/')"));
    assert.ok(!/each up to 8 MB|cada uno de hasta 8 MB/.test(html));
  }
});

test('sum of three individually small attachments is rejected before POST', async () => {
  const b = browser();
  for (const name of ['project_file', 'project_file_2', 'project_file_3']) b.form.fields.get(name).file = { name: 'test.pdf', size: 2500000 };
  await b.form.emit('submit');
  assert.equal(b.requests.length, 0); assert.equal(b.form.button.disabled, false);
  assert.equal(b.form.status.attributes.role, 'alert'); assert.equal(b.form.status.focused, true);
  assert.equal(b.events().at(-1).params.error_code, 'attachment_limit');
  assert.equal(b.captchaResets.length, 0);
});

test('exact decimal 7 MB attachment is accepted; unusually large text is included in the request estimate', async () => {
  const b = browser(); b.form.fields.get('project_file').file = { name: 'test.zip', size: 7000000 };
  await b.form.emit('submit'); assert.equal(b.requests.length, 1); assert.equal(b.events().at(-1).name, 'generate_lead');
  const large = browser(); large.form.fields.get('details').value = '漢'.repeat(2600000);
  await large.form.emit('submit'); assert.equal(large.requests.length, 0); assert.equal(large.events().at(-1).params.error_code, 'request_limit');
});

test('missing captcha and invalid native fields cannot post', async () => {
  const b = browser(); b.form.fields.get('g-recaptcha-response').value = '';
  await b.form.emit('submit'); assert.equal(b.requests.length, 0); assert.equal(b.events().at(-1).params.error_code, 'captcha_required');
  assert.equal(b.captchaResets.length, 0);
  b.form.valid = false; await b.form.emit('submit'); assert.equal(b.requests.length, 0);
});

test('parallel submissions make one request; only accepted request emits success and lead once', async () => {
  let resolve; const response = new Promise(done => { resolve = done; });
  const b = browser({ fetch: () => response });
  const pending = b.form.emit('submit'); await b.form.emit('submit');
  assert.equal(b.requests.length, 1); assert.equal(b.events().filter(event => event.name === 'generate_lead').length, 0);
  resolve({ ok: true }); await pending; await b.form.emit('submit'); b.runTimers();
  assert.equal(b.requests.length, 1); assert.equal(b.events().filter(event => event.name === 'generate_lead').length, 1);
  assert.deepEqual(b.redirects, ['/thanks.html']); assert.equal(b.form.button.disabled, true);
  assert.equal(b.requests[0].target, '/'); assert.equal(b.requests[0].init.method, 'POST'); assert.equal(b.requests[0].init.headers, undefined);
});

test('a stalled request times out at 60 seconds, preserves the inquiry and accepts a verified retry', async () => {
  let calls = 0;
  const b = browser({ fetch: () => ++calls === 1 ? new Promise(() => {}) : Promise.resolve({ ok: true }) });
  const id = b.form.fields.get('inquiry_id').value;
  const details = b.form.fields.get('details').value;
  const pending = b.form.emit('submit');
  const timer = b.timers.find(timer => timer.delay === 60000);
  assert.ok(timer); assert.equal(b.form.button.disabled, true);
  timer.callback(); await pending;
  assert.equal(timer.cleared, true); assert.equal(b.requests[0].init.signal.aborted, true);
  assert.equal(b.form.button.disabled, false); assert.equal(b.form.fields.get('inquiry_id').value, id); assert.equal(b.form.fields.get('details').value, details);
  assert.equal(b.captchaResets.length, 1); assert.equal(b.events().filter(event => event.name === 'generate_lead').length, 0);
  assert.match(b.form.status.textContent, /could not confirm/);
  b.form.fields.get('g-recaptcha-response').value = 'mock-token-after-timeout';
  await b.form.emit('submit');
  assert.equal(b.requests.length, 2); assert.equal(b.requests[1].init.body.get('inquiry_id'), id);
  assert.equal(b.events().filter(event => event.name === 'generate_lead').length, 1);
});

test('success, HTTP rejection and network rejection all clear their request timeout', async () => {
  for (const outcome of ['success', 'http', 'network']) {
    const b = browser({ fetch: async () => { if (outcome === 'network') throw Error('offline'); return { ok: outcome === 'success' }; } });
    await b.form.emit('submit');
    const timers = b.timers.filter(timer => timer.delay === 60000);
    assert.equal(timers.length, 1); assert.equal(timers[0].cleared, true, outcome);
    assert.equal(b.requests[0].init.signal.aborted, false, outcome);
  }
});

test('HTTP rejection and network failure retain entered fields and the ID for retry', async () => {
  for (const failure of ['http', 'network']) {
    let calls = 0;
    const b = browser({ fetch: async () => { calls++; if (calls > 1) return { ok: true }; if (failure === 'network') throw Error('offline'); return { ok: false, status: 413 }; } });
    const id = b.form.fields.get('inquiry_id').value;
    const details = b.form.fields.get('details').value;
    await b.form.emit('submit');
    assert.equal(b.events().filter(event => event.name === 'generate_lead').length, 0); assert.equal(b.form.button.disabled, false);
    assert.equal(b.form.fields.get('details').value, details); assert.equal(b.form.fields.get('inquiry_id').value, id);
    assert.equal(b.form.status.attributes.role, 'alert'); assert.ok(b.form.status.textContent.includes(id));
    assert.equal(b.captchaResets.length, 1); assert.equal(b.form.fields.get('g-recaptcha-response').value, '');
    // The consumed token cannot be sent again, even with an immediate click.
    await b.form.emit('submit'); assert.equal(b.requests.length, 1); assert.equal(b.captchaResets.length, 1);
    b.form.fields.get('g-recaptcha-response').value = 'mock-fresh-token';
    await b.form.emit('submit');
    assert.equal(b.requests[1].init.body.get('inquiry_id'), id); assert.equal(b.requests[1].init.body.get('transaction_id'), id);
    assert.equal(b.requests[1].init.body.get('g-recaptcha-response'), 'mock-fresh-token');
    const fresh = browser({ store: b.store }); assert.notEqual(fresh.form.fields.get('inquiry_id').value, id);
  }
});

test('pending ID survives reload without storing customer fields', async () => {
  const first = browser(); const second = browser({ store: first.store });
  assert.equal(first.form.fields.get('inquiry_id').value, second.form.fields.get('inquiry_id').value);
  assert.ok(!JSON.stringify([...first.store]).includes('test@example.test'));
});

test('blocked storage keeps accepted submission on page, no failure or repeat post', async () => {
  const b = browser({ blockedStorage: true });
  await b.form.emit('submit'); b.runTimers(); await b.form.emit('submit');
  assert.equal(b.requests.length, 1); assert.equal(b.redirects.length, 0); assert.equal(b.form.button.disabled, true);
  assert.equal(b.form.status.attributes.role, 'status'); assert.match(b.form.status.textContent, /^Request submitted\./); assert.match(b.form.status.textContent, /rfq-/);
  assert.equal(b.events().filter(event => event.name === 'generate_lead').length, 1); assert.equal(b.events().filter(event => event.name === 'rfq_submit_error').length, 0);
});

test('tracker exceptions cannot change an accepted form into a failed form', async () => {
  const b = browser({ brokenTracker: true }); await b.form.emit('submit'); b.runTimers();
  assert.equal(b.requests.length, 1); assert.equal(b.form.status.attributes.role, 'status'); assert.equal(b.form.button.disabled, true); assert.equal(b.redirects.length, 1);
});

test('model prefill is editable; external source_page and action cannot redirect or reflect HTML', async () => {
  const b = browser({ url: 'https://www.sslaserservice.com/?model=%3Cimg%20src%3Dx%3E&brand=KLA&inquiry_type=repair&source_page=https%3A%2F%2Fevil.example%2F' });
  assert.equal(b.form.fields.get('model').value, '<img src=x>'); assert.equal(b.form.fields.get('brand').value, 'KLA'); assert.equal(b.form.fields.get('inquiry_type').value, 'repair');
  assert.equal(b.form.fields.get('source_page').value, '/');
  b.form.fields.get('model').value = 'SP5 revised'; b.form.attributes.action = 'https://evil.example/thanks.html';
  await b.form.emit('submit'); b.runTimers();
  assert.equal(b.requests[0].init.body.get('model'), 'SP5 revised'); assert.deepEqual(b.redirects, ['/thanks.html']);
});

test('first touch and current tagged touch survive internal navigation and are sent only in form fields', () => {
  const first = browser({ noForm: true, url: 'https://www.sslaserservice.com/laser-repair/?utm_source=google&utm_medium=cpc&utm_campaign=Search_SSL_Repair_SG_v1&gclid=test-click-id', referrer: 'https://www.google.com/search?q=private-query' });
  const second = browser({ noForm: true, store: first.store, url: 'https://www.sslaserservice.com/eng?utm_source=linkedin&utm_medium=social&utm_campaign=repair_global_v1' });
  const last = browser({ store: second.store, url: 'https://www.sslaserservice.com/?model=SP5&brand=KLA&source_page=%2Flaser-repair%2Fsemiconductor-manufacturing%2Fkla%2Fsp5%2F', referrer: 'https://www.sslaserservice.com/eng?private=x' });
  assert.equal(last.form.fields.get('first_utm_source').value, 'google'); assert.equal(last.form.fields.get('utm_source').value, 'linkedin');
  assert.equal(last.form.fields.get('first_gclid').value, 'test-click-id'); assert.equal(last.form.fields.get('gclid').value, '');
  assert.equal(last.form.fields.get('first_landing_page').value, '/laser-repair/'); assert.equal(last.form.fields.get('landing_page').value, '/eng');
  assert.equal(last.form.fields.get('source_page').value, '/laser-repair/semiconductor-manufacturing/kla/sp5/'); assert.equal(last.form.fields.get('submission_page').value, '/');
  assert.equal(last.form.fields.get('first_referrer').value, 'https://www.google.com/search');
  assert.ok(!JSON.stringify(last.window.dataLayer).includes('test-click-id')); assert.ok(!JSON.stringify(last.window.dataLayer).includes('private-query'));
});

test('GA preserves approved campaign attribution without URL query, name, email, free text or Ads destinations', () => {
  const b = browser({ url: 'https://www.sslaserservice.com/?utm_source=google&utm_medium=cpc&utm_campaign=Search_SSL_Repair_SG_v1&email=private%40example.test&model=private' });
  assert.equal(b.config().campaign_source, 'google'); assert.equal(b.config().campaign_medium, 'cpc'); assert.equal(b.config().campaign_name, 'search_ssl_repair_sg_v1'); assert.equal(b.config().page_location, 'https://www.sslaserservice.com/');
  b.window.skyfireTrackEvent('rfq_submit_attempt', { form_name: 'rfq', email: 'private@example.test', model: 'private', source_page: 'https://evil.example/?private=x', error_message: 'PII', send_to: 'AW-bogus', inquiry_type: 'repair', inquiry_id: b.form.fields.get('inquiry_id').value });
  const event = b.events().at(-1); assert.equal(event.params.send_to, 'G-4E0E1RLWN4'); assert.equal(event.params.email, undefined); assert.equal(event.params.model, undefined); assert.equal(event.params.error_message, undefined);
  assert.ok(!JSON.stringify(b.window.dataLayer).includes('private')); assert.ok(!JSON.stringify(b.window.dataLayer).includes('AW-'));
  const bad = browser({ url: 'https://www.sslaserservice.com/?utm_source=private%40example.test&utm_medium=email&utm_campaign=John%20Smith' });
  assert.equal(bad.config().campaign_source, undefined); assert.equal(bad.config().campaign_name, undefined);
  const badName = browser({ url: 'https://www.sslaserservice.com/?utm_source=google&utm_medium=cpc&utm_campaign=John_Smith' });
  assert.equal(badName.config().campaign_source, 'google'); assert.equal(badName.config().campaign_name, undefined);
});

test('preview and localhost keep only local queue; production loads one GA script', () => {
  for (const url of ['http://localhost:8888/', 'https://draft--sslaserservice.netlify.app/']) {
    const b = browser({ url }); b.runTimers(); assert.equal(b.scripts.length, 0); assert.equal(b.window.dataLayer.filter(entry => entry[0] === 'config').length, 1);
  }
  const b = browser(); b.runTimers(); assert.equal(b.scripts.length, 1); assert.ok(b.scripts[0].src.endsWith('G-4E0E1RLWN4'));
});

test('direct and refreshed thank-you pages never emit lead or Ads conversion', async () => {
  const direct = browser({ noForm: true, receipt: true, url: 'https://www.sslaserservice.com/thanks.html' });
  assert.equal(direct.events().length, 0); assert.equal(direct.title.textContent, 'Need to send an inquiry?');
  const submitted = browser(); await submitted.form.emit('submit');
  for (let refresh = 0; refresh < 2; refresh++) {
    const thanks = browser({ noForm: true, receipt: true, store: submitted.store, url: 'https://www.sslaserservice.com/thanks.html' });
    assert.equal(thanks.events().length, 0); assert.match(thanks.receipt.textContent, /rfq-/); assert.equal(thanks.title.textContent, 'Your request was submitted.');
  }
});

test('all live form variants submit using their own schema and language-specific confirmation', async () => {
  for (const page of pages) {
    const spanish = page.startsWith('es/') || page.startsWith('laser-support/es/');
    const b = browser({ page, lang: spanish ? 'es' : 'en' });
    await b.form.emit('submit'); b.runTimers();
    assert.equal(b.requests.length, 1, page); assert.equal(b.events().filter(event => event.name === 'generate_lead').length, 1, page);
    assert.equal(b.requests[0].init.body.get('form-name'), page.includes('sg/') ? 'rfq_sg' : 'rfq');
    assert.equal(b.redirects[0], spanish ? '/es/thanks.html' : '/thanks.html');
  }
});
