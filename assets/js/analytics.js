(function () {
  const scriptTag = document.currentScript;
  const loadDelay = Number(scriptTag?.dataset.loadDelay || 1200);

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  window.gtag('js', new Date());
  window.gtag('config', 'G-CDW4YR5MC5');
  window.gtag('config', 'AW-1125868950');

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

  const loadGoogleTag = function () {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://' + 'www.googletagmanager.com/gtag/js?id=G-CDW4YR5MC5';
    document.head.appendChild(script);
  };

  window.setTimeout(loadGoogleTag, loadDelay);
})();
