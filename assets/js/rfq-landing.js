(function () {
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
  });
})();
