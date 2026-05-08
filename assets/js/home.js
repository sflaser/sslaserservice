(function () {
  const REVIEW_NOTES = [
    {
      target: '#home .container',
      label: '首屏定位',
      title: '这一屏的任务：10 秒内说清 SkyFire 做什么。',
      body: '这里主要表达三条主线：固体激光维修、定制光子项目、组件与备件供应。同时说明 SkyFire 是国际业务前台，而不是普通维修门店。'
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

    faqItems.forEach(function (item) {
      const trigger = item.querySelector('.faq-question');
      if (!trigger) return;

      trigger.addEventListener('click', function () {
        const isActive = item.classList.contains('active');

        faqItems.forEach(function (entry) {
          entry.classList.remove('active');
        });

        if (!isActive) {
          item.classList.add('active');
        }
      });
    });
  }

  function initRfqForm() {
    const rfqForm = document.querySelector('.rfq-form');
    if (!rfqForm) return;

    rfqForm.addEventListener('submit', async function (event) {
      event.preventDefault();

      const submitButton = rfqForm.querySelector('button[type="submit"]');
      const originalLabel = submitButton ? submitButton.textContent : '';

      try {
        if (submitButton) {
          submitButton.disabled = true;
          submitButton.textContent = 'Sending...';
        }

        const formData = new FormData(rfqForm);
        const file = formData.get('project_file');

        if (file instanceof File && file.size > 8 * 1024 * 1024) {
          throw new Error('Attached file exceeds 8 MB');
        }

        const response = await fetch('/', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('RFQ submission failed');
        }

        window.location.href = '/thanks.html';
      } catch (error) {
        console.error(error);

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
    const siteHeader = document.querySelector('header');
    const menuBtn = document.getElementById('mobile-menu-btn');
    const nav = document.getElementById('main-navigation');

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
      document.body.classList.remove('menu-open');

      if (siteHeader) {
        siteHeader.classList.remove('is-hidden');
      }
    };

    menuBtn.addEventListener('click', function () {
      const isOpen = nav.classList.toggle('is-open');
      menuBtn.classList.toggle('is-active', isOpen);
      menuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      document.body.classList.toggle('menu-open', isOpen);

      if (siteHeader) {
        siteHeader.classList.remove('is-hidden');
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
    initHeader();
    initVideoEmbeds();
    initReviewMode();
  });
})();
