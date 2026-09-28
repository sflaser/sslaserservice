(function () {
  'use strict';
  const MAX_ATTACHMENT_BYTES = 7000000;
  // Netlify limits the entire multipart request to 8 MB. Leave at least 0.5 MB
  // beyond this conservative text + file + multipart estimate.
  const MAX_REQUEST_BYTES = 7500000;
  const REQUEST_TIMEOUT_MS = 60000;
  const idPattern = /^rfq-[a-z0-9-]{12,80}$/;
  const memoryIds = Object.create(null);
  const copy = {
    en: {
      sending: 'Sending…',
      sent: 'Request submitted. Opening the confirmation page…',
      submitted: 'Request submitted.',
      attachments: 'The files total more than 7 MB. Choose smaller files, or submit without attachments and email them to sales3@sflaser.net.',
      request: 'The request is too large. Shorten the details or remove an attachment, then try again.',
      captcha: 'Please complete the verification before sending.',
      failed: 'We could not confirm your submission. Your entries are still here. Complete the verification again before retrying, or email sales3@sflaser.net with this reference: ',
      reference: 'Request reference: ',
      thanks: 'Your request was submitted.',
      thanksDetail: 'Keep the reference below for follow-up. If you send supporting files by email, include this reference so the team can match them to your request.',
      unknown: 'Need to send an inquiry?',
      unknownDetail: 'Use the inquiry form to send your request. Visiting this page does not submit a form.'
    },
    es: {
      sending: 'Enviando…',
      sent: 'Solicitud enviada. Abriendo la confirmación…',
      submitted: 'Solicitud enviada.',
      attachments: 'Los archivos suman más de 7 MB. Elija archivos más pequeños o envíe el formulario sin adjuntos y mándelos a sales3@sflaser.net.',
      request: 'La solicitud es demasiado grande. Acorte los detalles o quite un archivo e inténtelo de nuevo.',
      captcha: 'Complete la verificación antes de enviar.',
      failed: 'No pudimos confirmar el envío. Sus datos siguen aquí. Complete de nuevo la verificación antes de reintentar, o escriba a sales3@sflaser.net con esta referencia: ',
      reference: 'Referencia de la solicitud: ',
      thanks: 'Su solicitud fue enviada.',
      thanksDetail: 'Conserve la referencia para el seguimiento. Si envía archivos por correo, incluya esta referencia para que el equipo pueda vincularlos con su solicitud.',
      unknown: '¿Necesita enviar una consulta?',
      unknownDetail: 'Use el formulario para enviar su solicitud. Visitar esta página no envía un formulario.'
    }
  };
  const language = (document.documentElement.lang || '').startsWith('es') ? 'es' : 'en';
  const messages = copy[language];
  function storageGet(key) { try { return window.sessionStorage.getItem(key); } catch (_) { return null; } }
  function storageSet(key, value) {
    try {
      window.sessionStorage.setItem(key, value);
      return window.sessionStorage.getItem(key) === value;
    } catch (_) { return false; }
  }
  function storageRemove(key) { try { window.sessionStorage.removeItem(key); } catch (_) {} }
  function newId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') return 'rfq-' + window.crypto.randomUUID();
    return 'rfq-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 14);
  }
  function getId(key) {
    const existing = memoryIds[key] || storageGet(key);
    const id = idPattern.test(existing || '') ? existing : newId();
    memoryIds[key] = id;
    storageSet(key, id);
    return id;
  }
  function cleanText(value, limit) { return typeof value === 'string' ? value.replace(/[\u0000-\u001f\u007f]/g, '').slice(0, limit) : ''; }
  function sourcePath(value) {
    try {
      if (!value || !/^(\/|https?:\/\/)/i.test(value)) return '';
      const url = new URL(value, window.location.origin);
      return url.origin === window.location.origin && !url.username && !url.password ? cleanText(url.pathname, 512) : '';
    } catch (_) { return ''; }
  }
  function field(form, name) { return form.querySelector('[name="' + name + '"]'); }
  function setField(form, name, value) {
    const input = field(form, name);
    if (input) input.value = value;
  }
  function attributionFields() {
    if (window.SkyfireAttribution && typeof window.SkyfireAttribution.getFields === 'function') {
      try { return window.SkyfireAttribution.getFields(); } catch (_) {}
    }
    // A blocked analytics file must not prevent a valid RFQ from being sent.
    const params = new URLSearchParams(window.location.search);
    const path = sourcePath(window.location.pathname) || '/';
    const fields = { first_landing_page: path, landing_page: path, submission_page: path, source_page: sourcePath(params.get('source_page')) || sourcePath(document.referrer) || path, first_referrer: '', referrer: '' };
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'gbraid', 'wbraid'].forEach(function (name) {
      fields[name] = cleanText(params.get(name), name.startsWith('utm_') ? 200 : 512);
      fields['first_' + name] = fields[name];
    });
    return fields;
  }
  function fillMetadata(form, id) {
    const fields = attributionFields();
    Object.keys(fields).forEach(function (name) { setField(form, name, fields[name]); });
    setField(form, 'inquiry_id', id);
    setField(form, 'transaction_id', id);
  }
  function prefill(form) {
    const params = new URLSearchParams(window.location.search);
    ['model', 'brand'].forEach(function (name) {
      const input = field(form, name);
      if (input && !input.value) input.value = cleanText(params.get(name), name === 'model' ? 160 : 120);
    });
    const inquiry = field(form, 'inquiry_type');
    const type = params.get('inquiry_type');
    if (inquiry && !inquiry.value && ['repair', 'custom_build', 'components', 'technical_sales'].includes(type)) inquiry.value = type;
  }
  function track(name, params) {
    // Analytics and browser extensions are optional; they cannot change the
    // outcome of the Netlify request or cause an accepted form to be retried.
    try { if (typeof window.skyfireTrackEvent === 'function') window.skyfireTrackEvent(name, params); } catch (_) {}
  }
  function context(form, id) {
    return {
      form_name: form.getAttribute('name'),
      market: (field(form, 'market') || {}).value || 'Global',
      inquiry_type: (field(form, 'inquiry_type') || {}).value || '',
      timeline: (field(form, 'timeline') || {}).value || '',
      inquiry_id: id
    };
  }
  function requestSize(formData) {
    const encoder = new TextEncoder();
    let attachments = 0;
    let estimate = 4096;
    let count = 0;
    for (const [name, value] of formData.entries()) {
      estimate += 1024 + encoder.encode(name).length;
      if (typeof value !== 'string') {
        attachments += value.size;
        estimate += value.size + encoder.encode(value.name || '').length;
        if (value.name || value.size) count += 1;
      } else {
        estimate += encoder.encode(value).length;
      }
    }
    return { attachments: attachments, estimate: estimate, count: count };
  }
  function status(form, message, error) {
    const region = form.querySelector('[data-rfq-status]');
    if (!region) return;
    region.hidden = false;
    region.setAttribute('role', error ? 'alert' : 'status');
    region.setAttribute('aria-live', error ? 'assertive' : 'polite');
    region.textContent = message;
    if (error) region.focus();
  }
  function thanksPath(form) {
    // Never redirect to a reflected query parameter or an external form action.
    const fallback = language === 'es' ? '/es/thanks.html' : '/thanks.html';
    try {
      const url = new URL(form.getAttribute('action') || fallback, window.location.origin);
      if (url.origin === window.location.origin && ['/thanks', '/thanks.html', '/es/thanks.html'].includes(url.pathname)) return url.pathname;
    } catch (_) {}
    return fallback;
  }
  async function postForm(formData) {
    const controller = typeof window.AbortController === 'function' ? new window.AbortController() : null;
    let timer;
    try {
      const timeout = new Promise(function (_, reject) {
        timer = window.setTimeout(function () {
          // Aborting cannot prove the server did not accept the request.
          // Race the timeout as well, so even an unresponsive fetch is bounded.
          try { if (controller) controller.abort(); } catch (_) {}
          reject(new Error('RFQ response not confirmed before timeout'));
        }, REQUEST_TIMEOUT_MS);
      });
      const options = { method: 'POST', body: formData };
      if (controller) options.signal = controller.signal;
      return await Promise.race([window.fetch('/', options), timeout]);
    } finally {
      window.clearTimeout(timer);
    }
  }
  function initForm(form) {
    if (form.dataset.rfqInitialized) return;
    form.dataset.rfqInitialized = 'true';
    const idKey = 'skyfire-pending-' + form.getAttribute('name');
    const id = getId(idKey);
    let inFlight = false;
    let accepted = false;
    let started = false;
    const button = form.querySelector('button[type="submit"]');
    const originalLabel = button ? button.textContent : '';
    fillMetadata(form, id);
    prefill(form);
    form.addEventListener('input', function () {
      if (!started) { started = true; track('rfq_form_start', context(form, id)); }
    });
    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      if (inFlight || accepted) return;
      if (typeof form.reportValidity === 'function' && !form.reportValidity()) return;
      inFlight = true;
      if (button) { button.disabled = true; button.textContent = messages.sending; }
      let formData;
      let size;
      let errorCode = '';
      try {
        fillMetadata(form, id);
        formData = new FormData(form);
        size = requestSize(formData);
        if (size.attachments > MAX_ATTACHMENT_BYTES) errorCode = 'attachment_limit';
        else if (size.estimate > MAX_REQUEST_BYTES) errorCode = 'request_limit';
        else if (form.hasAttribute('data-netlify-recaptcha') && !String(formData.get('g-recaptcha-response') || '').trim()) errorCode = 'captcha_required';
      } catch (_) { errorCode = 'form_error'; }
      if (!errorCode) {
        track('rfq_submit_attempt', Object.assign(context(form, id), { attachment_count: size.count }));
        status(form, messages.sending, false);
        try {
          const response = await postForm(formData);
          if (!response.ok) errorCode = 'http_error';
          else accepted = true;
        } catch (_) { errorCode = 'network_error'; }
      }
      if (!accepted) {
        inFlight = false;
        if (errorCode === 'http_error' || errorCode === 'network_error') {
          // A POST may consume the single-use token even if its response is
          // lost. Preserve the inquiry, but require a fresh challenge for retry.
          const captcha = field(form, 'g-recaptcha-response');
          if (captcha) captcha.value = '';
          try {
            if (window.grecaptcha && typeof window.grecaptcha.reset === 'function') window.grecaptcha.reset();
          } catch (_) {}
        }
        const message = errorCode === 'attachment_limit' ? messages.attachments : errorCode === 'request_limit' ? messages.request : errorCode === 'captcha_required' ? messages.captcha : messages.failed + id;
        status(form, message, true);
        track('rfq_submit_error', Object.assign(context(form, id), { error_code: errorCode }));
        if (button) { button.disabled = false; button.textContent = originalLabel; }
        return;
      }
      // This boundary means HTTP acceptance only, not a qualified lead, a
      // completed repair evaluation, or confirmation that email was delivered.
      // Everything after acceptance is deliberately outside the request catch.
      delete memoryIds[idKey];
      storageRemove(idKey);
      const receiptSaved = storageSet('skyfire-rfq-receipt', JSON.stringify({ id: id, acceptedAt: Date.now() }));
      status(form, (receiptSaved ? messages.sent : messages.submitted) + ' ' + messages.reference + id, false);
      const eventContext = Object.assign(context(form, id), { attachment_count: size.count });
      track('rfq_submit_success', eventContext);
      track('generate_lead', eventContext);
      // With blocked storage, keep the unambiguous success and reference on
      // screen. Do not send the user to a page that cannot verify this receipt.
      if (receiptSaved) window.setTimeout(function () { window.location.assign(thanksPath(form)); }, 250);
    });
  }
  function initReceipt() {
    const reference = document.querySelector('[data-rfq-receipt]');
    if (!reference) return;
    let receipt = null;
    try { receipt = JSON.parse(storageGet('skyfire-rfq-receipt') || 'null'); } catch (_) {}
    const valid = receipt && idPattern.test(receipt.id) && Number.isFinite(receipt.acceptedAt) && Date.now() - receipt.acceptedAt >= 0 && Date.now() - receipt.acceptedAt < 24 * 60 * 60 * 1000;
    reference.textContent = valid ? messages.reference + receipt.id : '';
    reference.hidden = !valid;
    // No events here: refreshes and direct thank-you visits are never leads.
    const title = document.querySelector('[data-rfq-thanks-title]');
    const detail = document.querySelector('[data-rfq-thanks-detail]');
    if (title) title.textContent = valid ? messages.thanks : messages.unknown;
    if (detail) detail.textContent = valid ? messages.thanksDetail : messages.unknownDetail;
  }
  function init() {
    document.querySelectorAll('form.rfq-form').forEach(initForm);
    initReceipt();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
