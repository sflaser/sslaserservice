(function () {
  'use strict';
  const scriptTag = document.currentScript;
  const primaryMeasurementId = 'G-4E0E1RLWN4';
  const production = ['www.sslaserservice.com', 'sslaserservice.com'].includes(window.location.hostname);
  const trackingFields = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'gbraid', 'wbraid'];
  const storageKey = 'skyfire-attribution-v1';

  // Attribution stays in the form backend. Never pass these values to GA events.
  function cleanText(value, limit) {
    return typeof value === 'string' ? value.replace(/[\u0000-\u001f\u007f]/g, '').slice(0, limit) : '';
  }
  function sourcePath(value) {
    try {
      if (!value || !/^(\/|https?:\/\/)/i.test(value)) return '';
      const url = new URL(value, window.location.origin);
      if (url.origin !== window.location.origin || url.username || url.password) return '';
      return cleanText(url.pathname, 512);
    } catch (_) { return ''; }
  }
  function referrerURL(value) {
    try {
      const url = new URL(value);
      return /^https?:$/.test(url.protocol) ? cleanText(url.origin + url.pathname, 512) : '';
    } catch (_) { return ''; }
  }
  function sanitizeTouch(value) {
    if (!value || typeof value !== 'object') return null;
    const result = { landing_page: sourcePath(value.landing_page), referrer: referrerURL(value.referrer) };
    if (!result.landing_page) return null;
    trackingFields.forEach(function (key) {
      result[key] = cleanText(value[key], key.startsWith('utm_') ? 200 : 512);
    });
    return result;
  }
  function readAttribution() {
    try { return JSON.parse(window.sessionStorage.getItem(storageKey) || 'null'); } catch (_) { return null; }
  }
  const params = new URLSearchParams(window.location.search);
  const touch = { landing_page: sourcePath(window.location.pathname) || '/', referrer: referrerURL(document.referrer) };
  trackingFields.forEach(function (key) { touch[key] = cleanText(params.get(key), key.startsWith('utm_') ? 200 : 512); });
  const saved = readAttribution();
  const first = sanitizeTouch(saved && saved.first) || touch;
  const previous = sanitizeTouch(saved && saved.current);
  const hasCampaign = trackingFields.some(function (key) { return !!touch[key]; });
  const externalReferrer = touch.referrer && !sourcePath(touch.referrer);
  const current = !previous || hasCampaign || externalReferrer ? touch : previous;
  try { window.sessionStorage.setItem(storageKey, JSON.stringify({ first: first, current: current })); } catch (_) {}

  window.SkyfireAttribution = {
    sourcePath: sourcePath,
    getFields: function () {
      const fields = {
        first_landing_page: first.landing_page,
        first_referrer: first.referrer,
        landing_page: current.landing_page,
        referrer: current.referrer,
        submission_page: sourcePath(window.location.pathname) || '/',
        source_page: sourcePath(params.get('source_page')) || sourcePath(document.referrer) || sourcePath(window.location.pathname) || '/'
      };
      trackingFields.forEach(function (key) {
        fields[key] = current[key] || '';
        fields['first_' + key] = first[key] || '';
      });
      return fields;
    }
  };

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  const safePageLocation = window.location.origin + window.location.pathname;
  const safeCampaign = {};
  const campaignSource = (params.get('utm_source') || '').toLowerCase();
  const campaignMedium = (params.get('utm_medium') || '').toLowerCase();
  const knownSources = ['google', 'bing', 'linkedin', 'facebook', 'instagram', 'youtube', 'wechat', 'newsletter', 'partner', 'email', 'baidu', 'duckduckgo'];
  const knownMedia = ['organic', 'cpc', 'ppc', 'paid_search', 'paid_social', 'social', 'email', 'referral', 'display', 'video', 'qr'];
  if (knownSources.includes(campaignSource) && knownMedia.includes(campaignMedium)) {
    safeCampaign.campaign_source = campaignSource;
    safeCampaign.campaign_medium = campaignMedium;
    const name = (params.get('utm_campaign') || '').toLowerCase();
    // Campaigns use controlled business tokens, never customer/person names.
    const token = /^(search|ssl|laser|repair|service|brand|content|newsletter|partner|social|video|semiconductor|kla|sp5|sp2|puma|9150|verdi|v18|sg|us|uk|eu|en|es|global|q[1-4]|v\d{1,2}|20\d{2}(?:\d{2})?)$/;
    if (name.length <= 100 && /^[a-z0-9]+(?:[_-][a-z0-9]+)+$/.test(name) && name.split(/[_-]/).every(function (part) { return token.test(part); })) safeCampaign.campaign_name = name;
  }
  // Referrer origin is enough for GA; no query, fragment, or user-entered URL.
  let safeReferrer = '';
  try { safeReferrer = new URL(document.referrer).origin; } catch (_) {}
  const allowedEvents = new Set(['rfq_form_start', 'rfq_submit_attempt', 'rfq_submit_error', 'rfq_submit_success', 'generate_lead', 'rfq_cta_click', 'contact_click']);
  const enumFields = {
    form_name: ['rfq', 'rfq_sg'],
    market: ['Global', 'SG'],
    inquiry_type: ['repair', 'custom_build', 'components', 'technical_sales'],
    timeline: ['urgent', '1_week', '1_month', 'planning'],
    error_code: ['attachment_limit', 'request_limit', 'captcha_required', 'http_error', 'network_error', 'form_error'],
    contact_method: ['email', 'phone', 'whatsapp']
  };
  window.skyfireTrackEvent = function (eventName, values) {
    if (!allowedEvents.has(eventName)) return false;
    const safe = { send_to: primaryMeasurementId, page_location: safePageLocation, page_referrer: safeReferrer };
    const input = values && typeof values === 'object' ? values : {};
    Object.keys(enumFields).forEach(function (key) {
      if (enumFields[key].includes(input[key])) safe[key] = input[key];
    });
    if (/^rfq-[a-z0-9-]{12,80}$/.test(input.inquiry_id || '')) safe.inquiry_id = input.inquiry_id;
    if (Number.isInteger(input.attachment_count) && input.attachment_count >= 0 && input.attachment_count <= 3) safe.attachment_count = input.attachment_count;
    // Only known fields above can leave the page. Names, emails, model text,
    // details, UTM values, click IDs, error messages and arbitrary send_to cannot.
    window.gtag('event', eventName, safe);
    return true;
  };

  if (!window.dataLayer.some(function (entry) { return entry && entry[0] === 'js'; })) window.gtag('js', new Date());
  if (!window.dataLayer.some(function (entry) { return entry && entry[0] === 'config' && entry[1] === primaryMeasurementId; })) {
    window.gtag('config', primaryMeasurementId, Object.assign({ page_location: safePageLocation, page_referrer: safeReferrer }, safeCampaign));
  }
  // Ads account IDs in the old pages disagree. No Ads config or conversion is
  // emitted until the owner confirms the account and conversion action.
  // Thank-you page views never create a lead or conversion event.

  window.addEventListener('load', function () {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.getRegistrations().then(function (registrations) {
      registrations.forEach(function (registration) { registration.unregister(); });
    }).catch(function () {});
    if (window.caches && window.caches.keys) {
      window.caches.keys().then(function (names) {
        return Promise.all(names.filter(function (name) { return name.indexOf('skyfire-') === 0; }).map(function (name) { return window.caches.delete(name); }));
      }).catch(function () {});
    }
  }, { once: true });

  // Keep a local dataLayer on previews for inspection, without loading Google.
  if (production) {
    window.setTimeout(function () {
      if (document.querySelector('script[src*="googletagmanager.com/gtag/js?id="]')) return;
      const tag = document.createElement('script');
      tag.async = true;
      tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(primaryMeasurementId);
      document.head.appendChild(tag);
    }, Number(scriptTag && scriptTag.dataset.loadDelay) || 1200);
  }
})();
