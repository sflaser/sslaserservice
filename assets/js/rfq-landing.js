(function () {
  const TRACKING_FIELDS = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
    'gclid',
    'gbraid',
    'wbraid'
  ];

  function fillAttributionFields(form) {
    const params = new URLSearchParams(window.location.search);

    TRACKING_FIELDS.forEach(function (fieldName) {
      const input = form.querySelector(`[name="${fieldName}"]`);
      if (!input) return;
      input.value = params.get(fieldName) || '';
    });

    const sourcePage = form.querySelector('[name="source_page"]');
    if (sourcePage) {
      sourcePage.value = window.location.pathname;
    }

    const transactionId = form.querySelector('[name="transaction_id"]');
    if (transactionId && !transactionId.value) {
      transactionId.value = `rfq-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    }
  }

  function getFormContext(form) {
    const formData = new FormData(form);
    return {
      form_name: form.getAttribute('name') || formData.get('form-name') || 'rfq',
      market: formData.get('market') || form.dataset.market || '',
      landing_page: formData.get('landing_page') || window.location.pathname,
      campaign_hint: formData.get('campaign_hint') || '',
      inquiry_type: formData.get('inquiry_type') || '',
      timeline: formData.get('timeline') || ''
    };
  }

  function track(eventName, params) {
    if (typeof window.skyfireTrackEvent === 'function') {
      window.skyfireTrackEvent(eventName, params || {});
    }
  }

  function initRfqForm(form) {
    fillAttributionFields(form);

    form.addEventListener('submit', async function (event) {
      event.preventDefault();

      const submitButton = form.querySelector('button[type="submit"]');
      const originalLabel = submitButton ? submitButton.textContent : '';
      const context = getFormContext(form);

      try {
        if (submitButton) {
          submitButton.disabled = true;
          submitButton.textContent = 'Sending...';
        }

        fillAttributionFields(form);

        const formData = new FormData(form);
        const file = formData.get('project_file');

        if (file instanceof File && file.size > 8 * 1024 * 1024) {
          throw new Error('Attached file exceeds 8 MB');
        }

        track('rfq_submit_attempt', context);

        const response = await fetch('/', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error('RFQ submission failed');
        }

        track('rfq_submit_success', context);

        window.setTimeout(function () {
          window.location.href = form.getAttribute('action') || '/thanks.html';
        }, 160);
      } catch (error) {
        console.error(error);
        track('rfq_submit_error', Object.assign({}, context, {
          error_message: error && error.message ? error.message : 'unknown'
        }));

        if (error && error.message === 'Attached file exceeds 8 MB') {
          alert('The attached file is larger than 8 MB. Please upload a smaller file or email it to sales3@sflaser.net after submitting the RFQ.');
        } else {
          alert('Submission failed. Please try again or email sales3@sflaser.net directly.');
        }

        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = originalLabel;
        }
      }
    });
  }

  function initHeader() {
    const menuBtn = document.querySelector('[data-mobile-menu-button]');
    const nav = document.querySelector('[data-mobile-nav]');

    if (!menuBtn || !nav) return;

    const closeMenu = function () {
      nav.classList.remove('is-open');
      menuBtn.classList.remove('is-active');
      menuBtn.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
    };

    menuBtn.addEventListener('click', function () {
      const isOpen = nav.classList.toggle('is-open');
      menuBtn.classList.toggle('is-active', isOpen);
      menuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      document.body.classList.toggle('menu-open', isOpen);
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('click', function (event) {
      if (!nav.classList.contains('is-open')) return;
      if (nav.contains(event.target) || menuBtn.contains(event.target)) return;
      closeMenu();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        closeMenu();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 980) {
        closeMenu();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initHeader();
    document.querySelectorAll('form[data-rfq-form]').forEach(initRfqForm);
  });
})();
