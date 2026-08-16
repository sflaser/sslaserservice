(function () {
  const REVIEW_NOTES = [
    {
      target: '#home .container',
      label: '首屏定位',
      title: '这一屏的任务：让客户按手里的标签进入服务路径。',
      body: '这里把首页从普通介绍改成导向入口：客户不需要先判断维修、替换还是配件，只要从应用、OEM、型号或照片开始。'
    },
    {
      target: '#platform-finder',
      label: '路径筛选',
      title: '这一块把“我该点哪里”变成可操作的筛选。',
      body: '客户可以按应用、OEM、型号或组件关键词筛选常见服务路线，再把选中的路线带入 RFQ 表单。'
    },
    {
      target: '#services .container',
      label: '服务主线',
      title: '这里固定网站的三大服务方向。',
      body: '建议长期保持为：固体激光维修、定制激光/项目协作、组件与备件供应。审稿时重点看是否有服务边界写得太宽或不准确。'
    },
    {
      target: '#products .container',
      label: '平台熟悉度',
      title: '这一块不是商城目录，而是已接触平台/系统家族的熟悉度证明。',
      body: '作用是帮助客户判断：自己的型号是否属于你们熟悉的系统家族，从而决定是否值得发起技术评估。'
    },
    {
      target: '#why-us .container',
      label: '关于 SkyFire',
      title: '这一块承载的是方案 A：业务范围 + 商业模式 + 合作方式。',
      body: '这里更适合吸收那篇“大而全”的长文内容，用来解释 SkyFire 为什么是商业前台、技术深度来自哪里，以及哪些内容适合公开。'
    },
    {
      target: '#store .container',
      label: '产品与备件',
      title: '这里是产品承接入口，不是普通电商列表。',
      body: '重点要让客户理解：有些产品可以直接买，有些要先询价，有些则属于定制讨论。'
    },
    {
      target: '#blog .container',
      label: '精选资源',
      title: '首页只放精选 3 条，完整内容不应该继续堆在首页。',
      body: '这一块的目标，是建立专业感、帮助 SEO、提升 RFQ 质量，而不是把首页拖成博客门户。'
    },
    {
      target: '#contact .container',
      label: 'RFQ 转化区',
      title: '这里是网站最重要的转化入口。',
      body: '郑老师主要看表单字段是否对技术判断真正有帮助，哪些字段必须保留，哪些字段可以简化。现在也支持客户直接上传图片、日志和 PDF。'
    },
    {
      target: 'footer .container',
      label: '页脚收尾',
      title: '页脚的作用是把网站收成一个平台入口，而不是普通公司站收尾。',
      body: '这里应该强调 SkyFire 作为国际业务承接前台的角色，同时保留清晰的联系路径。'
    }
  ];

  function isSpanishPage() {
    const lang = (document.documentElement.getAttribute('lang') || '').toLowerCase();
    return lang.startsWith('es') || window.location.pathname.indexOf('/es') === 0;
  }

  function createImagePlaceholder() {
    const placeholder = document.createElement('div');
    placeholder.className = 'image-placeholder';
    placeholder.innerHTML = [
      '<div class="icon">🖼️</div>',
      '<div>Image unavailable</div>',
      '<small style="margin-top: 4px; opacity: 0.7;">Please refresh or try again later.</small>',
    ].join('');
    return placeholder;
  }

  function replaceBrokenImage(img) {
    const parent = img.parentNode;

    if (!parent || parent.dataset.imageFallbackApplied === 'true') {
      return;
    }

    parent.dataset.imageFallbackApplied = 'true';
    parent.classList.remove('image-loading');
    parent.replaceChild(createImagePlaceholder(), img);
  }

  function bindImageStates() {
    document.querySelectorAll('img').forEach(function (img) {
      const parent = img.parentElement;
      if (parent) {
        parent.classList.add('image-loading');
      }

      const markLoaded = function () {
        img.classList.add('loaded');
        if (parent) {
          parent.classList.remove('image-loading');
        }
      };

      img.addEventListener('load', markLoaded, { once: true });
      img.addEventListener('error', function () {
        replaceBrokenImage(img);
      }, { once: true });

      if (img.complete && img.naturalWidth > 0) {
        markLoaded();
      }
    });
  }

  function initFaq() {
    const faqItems = Array.from(document.querySelectorAll('.faq-item'));

    const setExpanded = function (item, expanded) {
      const trigger = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');
      if (!trigger || !answer) return;

      item.classList.toggle('active', expanded);
      trigger.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      answer.hidden = !expanded;
    };

    faqItems.forEach(function (item, index) {
      const trigger = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');
      if (!trigger || !answer) return;

      const triggerId = trigger.id || `faq-question-${index + 1}`;
      const answerId = answer.id || `faq-answer-${index + 1}`;
      trigger.id = triggerId;
      answer.id = answerId;
      trigger.setAttribute('aria-controls', answerId);
      answer.setAttribute('aria-labelledby', triggerId);
      answer.setAttribute('role', 'region');
      setExpanded(item, item.classList.contains('active'));

      trigger.addEventListener('click', function () {
        const isActive = item.classList.contains('active');

        faqItems.forEach(function (entry) {
          setExpanded(entry, false);
        });

        if (!isActive) {
          setExpanded(item, true);
        }
      });
    });
  }

  function initRfqForm() {
    const rfqForm = document.querySelector('.rfq-form');
    if (!rfqForm) return;

    const isSpanish = isSpanishPage();
    const formCopy = isSpanish
      ? {
        sending: 'Enviando...',
        thanksPath: '/es/thanks.html',
        fileError: 'El archivo adjunto supera 8 MB. Cargue un archivo más pequeño o envíelo por correo a sales3@sflaser.net después de enviar el RFQ.',
        submitError: 'No se pudo enviar la solicitud. Inténtelo de nuevo o escriba directamente a sales3@sflaser.net.',
      }
      : {
        sending: 'Sending...',
        thanksPath: '/thanks.html',
        fileError: 'The attached file is larger than 8 MB. Please upload a smaller file or email it to sales3@sflaser.net after submitting the RFQ.',
        submitError: 'Submission failed. Please try again or email sales3@sflaser.net directly.',
      };

    rfqForm.addEventListener('submit', async function (event) {
      event.preventDefault();

      const submitButton = rfqForm.querySelector('button[type="submit"]');
      const originalLabel = submitButton ? submitButton.textContent : '';

      try {
        if (submitButton) {
          submitButton.disabled = true;
          submitButton.textContent = formCopy.sending;
        }

        const maxFileSize = 8 * 1024 * 1024;
        const files = Array.from(rfqForm.querySelectorAll('input[type="file"]'))
          .flatMap(function (input) {
            return Array.from(input.files || []);
          });
        const oversizedFile = files.find(function (file) {
          return file.size > maxFileSize;
        });

        if (oversizedFile) {
          throw new Error('Attached file exceeds 8 MB');
        }

        const formData = new FormData(rfqForm);
        const response = await fetch('/', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('RFQ submission failed');
        }

        window.location.href = rfqForm.getAttribute('action') || formCopy.thanksPath;
      } catch (error) {
        console.error(error);

        if (error && error.message === 'Attached file exceeds 8 MB') {
          alert(formCopy.fileError);
        } else {
          alert(formCopy.submitError);
        }

        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = originalLabel;
        }
      }
    });
  }

  function initPlatformFinder() {
    const finder = document.querySelector('.platform-finder');
    const routeSection = document.querySelector('.finder-route-section');
    const cards = Array.from(document.querySelectorAll('[data-route-card]'));

    if (!finder || !routeSection || !cards.length) return;

    const isSpanish = isSpanishPage();
    const tabCopy = isSpanish
      ? {
        application: {
          title: '¿Qué describe mejor su sistema?',
          helper: 'Elija primero el contexto de operación. El modelo exacto, las fotos y los síntomas pueden venir después.',
          placeholder: 'Buscar por sistema, modelo, OEM o palabra clave',
        },
        oem: {
          title: '¿Qué fabricante o nombre de plataforma aparece en la etiqueta?',
          helper: 'KLA, Applied Materials, Coherent, Lumibird y etiquetas similares son suficientes para empezar.',
          placeholder: 'Pruebe KLA, Applied Materials, Coherent, Lumibird...',
        },
        model: {
          title: 'Empiece por el modelo o la familia de producto.',
          helper: 'Una etiqueta parcial es suficiente. Puede agregar fotos en el formulario RFQ si no está seguro.',
          placeholder: 'Pruebe Puma 9150, Centurion, Verdi V18, LC CB5...',
        },
        component: {
          title: '¿Qué ruta de componente es la más cercana?',
          helper: 'Óptica, electrónica, fuentes, módulos y repuestos heredados pueden empezar aquí.',
          placeholder: 'Buscar óptica, fuente, módulo, repuesto, log...',
        },
      }
      : {
        application: {
          title: 'What best describes your system?',
          helper: 'Choose the operating context first. Exact model, photos, and symptoms can come later.',
          placeholder: 'Search by system name, model, OEM, or keyword',
        },
        oem: {
          title: 'Which manufacturer or platform name do you see?',
          helper: 'KLA, Applied Materials, Coherent, Lumibird, and similar labels all work.',
          placeholder: 'Try KLA, Applied Materials, Coherent, Lumibird...',
        },
        model: {
          title: 'Start with the model or product family.',
          helper: 'Partial labels are enough. Add photos later in the RFQ form if you are unsure.',
          placeholder: 'Try Puma 9150, Centurion, Verdi V18, LC CB5...',
        },
        component: {
          title: 'Which component path is closest?',
          helper: 'Optics, electronics, sources, modules, and legacy parts can start here.',
          placeholder: 'Search optics, source, module, spare part, log...',
        },
      };
    const countCopy = isSpanish
      ? {
        all: 'Mostrando rutas de servicio comunes.',
        matched: function (visibleCount) {
          return `Mostrando ${visibleCount} ${visibleCount === 1 ? 'ruta de servicio coincidente' : 'rutas de servicio coincidentes'}.`;
        },
        basis: 'Buscador de ruta de servicio',
        detailsPrefix: 'Ruta de servicio seleccionada',
        detailsPrompt: 'Síntomas actuales / etiquetas visibles / fotos adjuntas',
      }
      : {
        all: 'Showing common service routes.',
        matched: function (visibleCount) {
          return `Showing ${visibleCount} matched service ${visibleCount === 1 ? 'route' : 'routes'}.`;
        },
        basis: 'Platform Finder',
        detailsPrefix: 'Selected service route',
        detailsPrompt: 'Current symptoms / visible labels / attached photos',
      };

    const title = finder.querySelector('[data-finder-title]');
    const helper = finder.querySelector('[data-finder-helper]');
    const search = finder.querySelector('[data-finder-search]');
    const manufacturer = finder.querySelector('[data-finder-manufacturer]');
    const count = document.querySelector('[data-finder-count]');
    const empty = document.querySelector('[data-finder-empty]');
    const appButtons = Array.from(finder.querySelectorAll('[data-application-filter]'));
    let activeApplication = '';

    const updateRoutes = function () {
      const query = search ? search.value.trim().toLowerCase() : '';
      const selectedManufacturer = manufacturer ? manufacturer.value : 'all';
      let visibleCount = 0;

      cards.forEach(function (card) {
        const searchable = [
          card.dataset.keywords || '',
          card.dataset.application || '',
          card.dataset.manufacturer || '',
          card.textContent || '',
        ].join(' ').toLowerCase();
        const matchesApplication = !activeApplication || card.dataset.application === activeApplication;
        const matchesManufacturer = selectedManufacturer === 'all' || card.dataset.manufacturer === selectedManufacturer;
        const matchesQuery = !query || searchable.includes(query);
        const isVisible = matchesApplication && matchesManufacturer && matchesQuery;

        card.hidden = !isVisible;
        if (isVisible) visibleCount += 1;
      });

      if (count) {
        count.textContent = visibleCount === cards.length
          ? countCopy.all
          : countCopy.matched(visibleCount);
      }

      if (empty) {
        empty.hidden = visibleCount !== 0;
      }
    };

    finder.querySelectorAll('[data-finder-tab]').forEach(function (button) {
      button.addEventListener('click', function () {
        const tab = button.dataset.finderTab || 'application';
        const copy = tabCopy[tab] || tabCopy.application;

        finder.querySelectorAll('[data-finder-tab]').forEach(function (entry) {
          const isActive = entry === button;
          entry.classList.toggle('is-active', isActive);
          entry.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });

        if (title) title.textContent = copy.title;
        if (helper) helper.textContent = copy.helper;
        if (search) search.placeholder = copy.placeholder;
      });
    });

    appButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        const nextApplication = button.dataset.applicationFilter || '';
        activeApplication = activeApplication === nextApplication ? '' : nextApplication;

        appButtons.forEach(function (entry) {
          const isActive = entry.dataset.applicationFilter === activeApplication;
          entry.classList.toggle('is-active', isActive);
          entry.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });

        updateRoutes();
      });
    });

    if (search) {
      search.addEventListener('input', updateRoutes);
    }

    if (manufacturer) {
      manufacturer.addEventListener('change', updateRoutes);
    }

    const submit = finder.querySelector('[data-finder-submit]');
    if (submit) {
      submit.addEventListener('click', function () {
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const routeTitle = routeSection.querySelector('h2');
        routeSection.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });

        if (routeTitle) {
          routeTitle.setAttribute('tabindex', '-1');
          window.setTimeout(function () {
            routeTitle.focus({ preventScroll: true });
          }, reduceMotion ? 0 : 350);
        }
      });
    }

    document.querySelectorAll('[data-rfq-preset]').forEach(function (link) {
      link.addEventListener('click', function () {
        const form = document.querySelector('.rfq-form');
        if (!form) return;

        const inquiry = form.querySelector('[name="inquiry_type"]');
        const brand = form.querySelector('[name="brand"]');
        const model = form.querySelector('[name="model"]');
        const application = form.querySelector('[name="application"]');
        const route = form.querySelector('[name="finder_route"]');
        const basis = form.querySelector('[name="routing_basis"]');
        const details = form.querySelector('[name="details"]');

        if (inquiry && link.dataset.inquiryType) inquiry.value = link.dataset.inquiryType;
        if (brand && link.dataset.brandName) brand.value = link.dataset.brandName;
        if (model && link.dataset.modelName) model.value = link.dataset.modelName;
        if (application && link.dataset.applicationName) application.value = link.dataset.applicationName;
        if (route) route.value = link.dataset.routeName || '';
        if (basis) basis.value = countCopy.basis;

        if (details && !details.value.trim()) {
          details.value = `${countCopy.detailsPrefix}: ${link.dataset.routeName || 'Not sure'}\n${countCopy.detailsPrompt}:\n`;
        }
      });
    });

    appButtons.forEach(function (button) {
      button.setAttribute('aria-pressed', 'false');
    });

    updateRoutes();
  }

  function initHeader() {
    const siteHeader = document.querySelector('header');
    const menuBtn = document.getElementById('mobile-menu-btn');
    const nav = document.getElementById('main-navigation');
    const menuCaption = menuBtn ? menuBtn.querySelector('.menu-caption') : null;

    if (siteHeader) {
      let lastScrollY = window.scrollY;

      const toggleHeaderState = function () {
        const currentScrollY = window.scrollY;
        const menuOpen = document.body.classList.contains('menu-open');

        if (currentScrollY > 24) {
          siteHeader.classList.add('is-scrolled');
        } else {
          siteHeader.classList.remove('is-scrolled');
        }

        if (menuOpen || currentScrollY < 80 || currentScrollY < lastScrollY - 6) {
          siteHeader.classList.remove('is-hidden');
        } else if (currentScrollY > lastScrollY + 6) {
          siteHeader.classList.add('is-hidden');
        }

        lastScrollY = currentScrollY;
      };

      toggleHeaderState();
      window.addEventListener('scroll', toggleHeaderState, { passive: true });
    }

    if (!menuBtn || !nav) {
      return;
    }

    const closeMenu = function () {
      nav.classList.remove('is-open');
      menuBtn.classList.remove('is-active');
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.setAttribute('aria-label', 'Open navigation');
      if (menuCaption) menuCaption.textContent = 'Menu';
      document.body.classList.remove('menu-open');

      if (siteHeader) {
        siteHeader.classList.remove('is-hidden');
      }
    };

    menuBtn.addEventListener('click', function () {
      const isOpen = nav.classList.toggle('is-open');
      menuBtn.classList.toggle('is-active', isOpen);
      menuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      menuBtn.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
      if (menuCaption) menuCaption.textContent = isOpen ? 'Close' : 'Menu';
      document.body.classList.toggle('menu-open', isOpen);

      if (siteHeader) {
        siteHeader.classList.remove('is-hidden');
      }

      if (isOpen) {
        const firstLink = nav.querySelector('a');
        if (firstLink) {
          window.setTimeout(function () {
            firstLink.focus();
          }, 0);
        }
      }
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
        menuBtn.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) {
        closeMenu();
      }
    });
  }

  function initVideoEmbeds() {
    document.querySelectorAll('.video-load-button[data-youtube-id]').forEach(function (button) {
      button.addEventListener('click', function () {
        const videoId = button.dataset.youtubeId;
        const frame = button.closest('.video-proof-frame');

        if (!videoId || !frame) {
          return;
        }

        const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1`;
        iframe.title = 'SkyFire solid-state laser service video';
        iframe.loading = 'lazy';
        iframe.referrerPolicy = 'strict-origin-when-cross-origin';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        iframe.allowFullscreen = true;

        frame.textContent = '';
        frame.appendChild(iframe);
      }, { once: true });
    });
  }

  function initHeroSystemMap() {
    const map = document.querySelector('.hero-system-map');
    const stage = map ? map.querySelector('.hero-coverage-stage') : null;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!map || !stage || reduceMotion || !window.matchMedia('(pointer: fine)').matches) return;

    map.addEventListener('pointermove', function (event) {
      const rect = map.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      stage.style.setProperty('--hero-map-y', `${x * 5}deg`);
      stage.style.setProperty('--hero-map-x', `${y * -4}deg`);
    }, { passive: true });

    map.addEventListener('pointerleave', function () {
      stage.style.setProperty('--hero-map-y', '0deg');
      stage.style.setProperty('--hero-map-x', '0deg');
    });
  }

  function initReviewMode() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('review') !== 'zh') return;

    const reviewStyle = document.createElement('style');
    reviewStyle.textContent = `
      body.review-zh-active .review-zh-banner {
        position: fixed;
        right: 20px;
        bottom: 20px;
        z-index: 10002;
        width: min(360px, calc(100vw - 32px));
        background: rgba(22, 22, 22, 0.94);
        color: #f8f5ef;
        border-radius: 20px;
        padding: 16px 18px;
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.24);
        backdrop-filter: blur(18px);
      }

      body.review-zh-active .review-zh-banner h3 {
        margin: 0 0 8px;
        font-size: 18px;
        line-height: 1.2;
        color: #ffffff;
      }

      body.review-zh-active .review-zh-banner p {
        margin: 0;
        font-size: 13px;
        line-height: 1.7;
        color: rgba(248, 245, 239, 0.84);
      }

      body.review-zh-active .review-zh-banner a {
        color: #ff9a1f;
        text-decoration: none;
        font-weight: 600;
      }

      body.review-zh-active .review-zh-note {
        margin: 0 0 24px;
        padding: 18px 20px;
        border-radius: 18px;
        background: linear-gradient(135deg, rgba(255, 154, 31, 0.14), rgba(255, 154, 31, 0.06));
        border: 1px solid rgba(255, 154, 31, 0.24);
        box-shadow: 0 18px 40px rgba(28, 27, 24, 0.08);
      }

      body.review-zh-active .review-zh-note-label {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 6px 10px;
        border-radius: 999px;
        background: rgba(255, 154, 31, 0.16);
        color: #9f4e16;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      body.review-zh-active .review-zh-note h3 {
        margin: 12px 0 8px;
        color: #191816;
        font-size: 24px;
        line-height: 1.28;
      }

      body.review-zh-active .review-zh-note p {
        margin: 0;
        color: #554d44;
        font-size: 16px;
        line-height: 1.8;
        max-width: 980px;
      }

      @media (max-width: 900px) {
        body.review-zh-active .review-zh-banner {
          left: 16px;
          right: 16px;
          bottom: 16px;
          width: auto;
        }

        body.review-zh-active .review-zh-note {
          margin-bottom: 18px;
          padding: 16px;
          border-radius: 16px;
        }

        body.review-zh-active .review-zh-note h3 {
          font-size: 20px;
        }

        body.review-zh-active .review-zh-note p {
          font-size: 15px;
          line-height: 1.75;
        }
      }
    `;

    document.head.appendChild(reviewStyle);
    document.body.classList.add('review-zh-active');

    const normalUrl = new URL(window.location.href);
    normalUrl.searchParams.delete('review');

    const banner = document.createElement('aside');
    banner.className = 'review-zh-banner';
    banner.innerHTML = `
      <h3>中文审稿模式已开启</h3>
      <p>这个模式只用于内部审稿。每个首页区块上方都会出现中文说明，方便直接看当前英文在表达什么。<br><a href="${normalUrl.toString()}">打开正常版本</a></p>
    `;
    document.body.appendChild(banner);

    REVIEW_NOTES.forEach(function (note) {
      const target = document.querySelector(note.target);
      if (!target) return;

      const card = document.createElement('div');
      card.className = 'review-zh-note';
      card.innerHTML = `
        <span class="review-zh-note-label">${note.label}</span>
        <h3>${note.title}</h3>
        <p>${note.body}</p>
      `;

      target.insertBefore(card, target.firstChild);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    bindImageStates();
    initFaq();
    initRfqForm();
    initPlatformFinder();
    initHeader();
    initVideoEmbeds();
    initHeroSystemMap();
    initReviewMode();
  });
})();
