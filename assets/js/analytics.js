(function () {
  const scriptTag = document.currentScript;
  const loadDelay = Number(scriptTag?.dataset.loadDelay || 1200);

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  const defaultConfigIds = ['G-CDW4YR5MC5', 'AW-1125868950'];
  const extraConfigIds = (scriptTag?.dataset.configIds || '')
    .split(',')
    .map(function (id) {
      return id.trim();
    })
    .filter(Boolean);
  const configIds = Array.from(new Set(defaultConfigIds.concat(extraConfigIds)));

  window.gtag('js', new Date());
  configIds.forEach(function (id) {
    window.gtag('config', id);
  });

  if (scriptTag?.dataset.conversionSendTo) {
    if (scriptTag.dataset.conversionConfig) {
      window.gtag('config', scriptTag.dataset.conversionConfig);
    }

    window.gtag('event', 'conversion', {
      send_to: scriptTag.dataset.conversionSendTo,
      value: Number(scriptTag.dataset.conversionValue || 1),
      currency: scriptTag.dataset.conversionCurrency || 'USD',
      transaction_id: scriptTag.dataset.transactionId || '',
    });
  }

  const removeLegacyServiceWorker = function () {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    navigator.serviceWorker.getRegistrations()
      .then(function (registrations) {
        registrations.forEach(function (registration) {
          registration.unregister();
        });
      })
      .catch(function () {});

    if (window.caches?.keys) {
      window.caches.keys()
        .then(function (cacheNames) {
          return Promise.all(
            cacheNames
              .filter(function (cacheName) {
                return cacheName.indexOf('skyfire-') === 0;
              })
              .map(function (cacheName) {
                return window.caches.delete(cacheName);
              })
          );
        })
        .catch(function () {});
    }
  };

  window.addEventListener('load', removeLegacyServiceWorker, { once: true });

  const loadGoogleTag = function () {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://' + 'www.googletagmanager.com/gtag/js?id=G-CDW4YR5MC5';
    document.head.appendChild(script);
  };

  window.setTimeout(loadGoogleTag, loadDelay);
})();
